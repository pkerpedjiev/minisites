#!/usr/bin/python

import json
import sys
from optparse import OptionParser

def filter_n_largest_features(geojson, n):
    '''
    Get the n largest features from a geojson file

    @param geojson: A geojson structure containing a number of features
    @param n: The number of features to return
    @return: The n largest features
    '''
    geojson['features'].sort(key=lambda x: -x['properties']['area_sqkm'])
    return geojson['features'][:n]
    
def main():
    usage = """
    python filter_ten_largest_urban_areas.py geojson.json num
    """
    num_args= 2
    parser = OptionParser(usage=usage)

    #parser.add_option('-o', '--options', dest='some_option', default='yo', help="Place holder for a real option", type='str')
    #parser.add_option('-u', '--useless', dest='uselesss', default=False, action='store_true', help='Another useless option')

    (options, args) = parser.parse_args()

    if len(args) < num_args:
        parser.print_help()
        sys.exit(1)

    if args[0] == '-':
        f = sys.stdin
    else:
        f = open(args[0], 'r')

    urban_areas_json = json.load(f)

    largest_features = filter_n_largest_features(urban_areas_json, int(args[1]))
    urban_areas_json['features'] = largest_features
    print json.dumps(urban_areas_json)

if __name__ == '__main__':
    main()

