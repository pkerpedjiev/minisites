from pyspark import SparkConf, SparkContext
conf = (SparkConf()
        .setMaster("local")
        .setAppName("My app")
        .set("spark.executor.memory", "1g"))
sc = SparkContext(conf = conf)

import csv
import itertools as it
import json
import os.path as op
import re
import sys
from optparse import OptionParser

def get_faster_segment(segment1, segment2):
    if int(segment1['speed']) > int(segment2['speed']):
        to_return = segment1
    else:
        to_return = segment2

    #print "segment1:", segment1, "segment2:", segment2

    for seg in it.chain(segment1['lines'], segment2['lines']):
        to_return['lines'].add(seg)

    return to_return

def table_to_string(table, sep='\t'):
    return u"\n".join([sep.join(map(unicode, t)) for t in table]).encode('utf-8')

def cities_to_geojson(cities):
    '''
    Convert a list of city tuples (name, lat, lon, count) to a GeoJSON object.
    '''
    gj = {'type': 'FeatureCollection',
            'features': []}

    for city in cities:
        gj['features'] += [{'type': 'Feature',
                            'geometry': { 'type': 'Point',
                                          'coordinates': [city[1], city[2]] },
                            'properties': {'name': city[0],
                                           'width': city[3],
                                           'lines': [re.sub(r' \[.*?\]', '', l) for l in city[4]]}}]
    return json.dumps(gj, indent=2, ensure_ascii=False)

def city_pairs_to_geojson(city_pairs):
    '''
    Convert a list of inter-city sections to a geojson file.
    '''
    gj = {'type': 'FeatureCollection',
            'features': []}

    for cp in city_pairs:
        if int(cp[1]['speed']) < 0 or int(cp[1]['speed']) > 300:
            print >>sys.stderr, "Excessive speed:", cp
            continue

        gj['features'] += [{'type': 'Feature',
                            'geometry': { 'type': 'LineString',
                                          'coordinates': [[cp[1]['from_lon'], cp[1]['from_lat']],
                                                          [cp[1]['to_lon'], cp[1]['to_lat']]]
                                                          },
                            'properties': {
                                'name': u"{} :: {}".format(cp[1]['from'], cp[1]['to']),
                                           'speed': int(cp[1]['speed']),
                                           'lines': [re.sub(r' \[.*?\]', '', l) for l in list(cp[1]['lines'])]
                                           }}]
    return json.dumps(gj, indent=2, ensure_ascii=False)

def consolidate_cities(city1, city2):
    city1['ices'].add(city2['jname'])
    return city1

def segments_to_city_pairs(filename, headers, output_dir='data'):
    '''
    Condense a list of segments:

    BUS 343 216	Geltwil, Isenbergschwil	Geltwil, Schulhaus	15	0	2015-04-13 10:11:00+02:00	0:01:00	47.247051	8.334276	47.249721	8.328433
    '''
    headers = sc.textFile(headers).map(lambda x: x.split('\t')).take(1)[0] + ['lines']
    data = sc.textFile(filename).map(lambda x: dict(zip(headers, x.split('\t') + [set([x.split('\t')[0]])])))

    all_sections = data.map(lambda x: (tuple(sorted([x['from'], x['to']])), x))
    all_sections_reduced = all_sections.reduceByKey(get_faster_segment)

    all_cities = data.flatMap(lambda x: [((x['from'], x['from_lat'], x['from_lon']), {'jname': x['jname'], 'ices': set([x['jname']])}), 
        ((x['to'], x['to_lat'], x['to_lon']), {'jname': x['jname'], 'ices': set([x['jname']])})])

    count_all_cities = all_cities.reduceByKey(consolidate_cities).collect()
    def funky_key(x):
        return len(x[1]['ices'])

    sorted_all_cities = sorted(count_all_cities, key=funky_key)

    with open(op.join(output_dir, 'city_counts.json'), 'w') as f:
        # s[0] contains the key or city name, lat, long
        # s[1] contains the number of ices that go through it
        f.write(cities_to_geojson([list(s[0]) + [len(s[1]['ices'])] + [list(s[1]['ices'])] for s in sorted_all_cities]).encode('utf-8'))


    '''
    collected = all_sections_reduced.map(lambda x: [x[1]['jname'], x[1]['from'], x[1]['to'],
                                        x[1]['speed'], x[1]['dist'], x[1]['time_from'],
                                        x[1]['elapsed_time'], x[1]['from_lat'], x[1]['from_lon'],
                                        x[1]['to_lat'], x[1]['to_lon']]) \
                        .collect()
    '''

    with open(op.join(output_dir, 'city_pairs.json'), 'w') as f:
        f.write(city_pairs_to_geojson(all_sections_reduced.collect()).encode('utf-8'))


def main():
    usage = """
    python segements_to_city_pairs.py segments.tsv

    Condense a list of train segments to sections between cities.
    """
    num_args= 1
    parser = OptionParser(usage=usage)

    #parser.add_option('-o', '--options', dest='some_option', default='yo', help="Place holder for a real option", type='str')
    #parser.add_option('-u', '--useless', dest='uselesss', default=False, action='store_true', help='Another useless option')
    parser.add_option('', '--headers', dest='headers', default='segments/segment_headers.tsv',
            help='file pointing to the headers of data file', type=str)

    (options, args) = parser.parse_args()

    if len(args) < num_args:
        parser.print_help()
        sys.exit(1)

    city_pairs = segments_to_city_pairs(args[0], headers=options.headers)

if __name__ == '__main__':
    main()
