#!/usr/bin/python

import itertools as it
import json
import math
import numpy as np
import os.path as op
import random
import scipy.misc
import sys
import argparse

def rmsd(array1, array2):
    """Calculate the RMSD between the values in array1 and array2

    :array1: A vector of numbers.
    :array2: A vector of number.
    :returns: A number corresponding to the RMSD between the values
    """
    total = 0
    for n1, n2 in zip(array1, array2):
        total += (n1 - n2) ** 2
    total /= len(array1)

    return math.sqrt(total)

def stochastically_sampled_distance(color_array, num_points=10, threshold=2):
    """Calculate the stochastically_sampled_distance for this color array:

    1. Pick num_points points that correspond to value over threshold
    :color_array: A 2D array containing color values
    :num_points: The number of points to sample that correspond to a color
                 with a value greater than 'threshold'
    :threshold: The minimum color value to be considered for sampling
    :returns: A 1D (num_points * num_points / 2) array containing all
              all of the inter sampled-point distances
    """
    '''
    # Display the arrays we are comparing
    for row in color_array:
        print " ".join(map("{:3d}".format, row))
    print "------------------ threshold:", threshold
    '''
    rows, cols = np.where(color_array > threshold)
    indeces = zip(rows, cols)

    points = [random.choice(indeces) for i in xrange(num_points)]

    def dist(p1, p2):
        '''
        The distance between two points

        :p1: Index of point1
        :p2: Index of point2
        :return: Euclidean distance between these two indeces
        '''
        return math.sqrt((p1[0] - p2[0]) ** 2 + (p1[1] - p2[1]) ** 2)

    dists = []
    for p1, p2 in it.combinations(points, r=2):
        dists += [dist(p1,p2)]

    return sorted(dists)

def main():
    parser = argparse.ArgumentParser(description="Conver png images to greyscale color arrays")

    parser.add_argument('png_file', nargs='+')
    parser.add_argument('-n', '--num-points', type=int, default=10,
                        help='The number of points to sample')
    parser.add_argument('-r', '--resolution', type=int, default=20,
                        help="The resolution at which the image should be gridded")
    parser.add_argument('-t', '--threshold', type=int,  default=10,
                        help="The threshold above which to consider a pixel suitable for sampling")
    #parser.add_argument('-o', '--options', default='yo',
    #					 help="Some option", type='str')
    #parser.add_argument('-u', '--useless', action='store_true', 
    #					 help='Another useless option')

    args = parser.parse_args()

    grayscale_array_distances = {}
    for png_file in args.png_file:
        filename = op.splitext(op.basename(png_file))[0]
        array = scipy.misc.imresize(scipy.misc.imread(png_file, True), (args.resolution,
            args.resolution) )

        grayscale_array_distances[filename] = stochastically_sampled_distance(array,
                num_points=args.num_points, threshold=args.threshold)

    for key1, key2 in it.combinations(sorted(grayscale_array_distances.keys()), r=2):
        #print grayscale_array_distances[key1]
        #print grayscale_array_distances[key2]
        print "{} | {}: {}:".format(key1, key2, rmsd(grayscale_array_distances[key1],
                                                     grayscale_array_distances[key2]))

if __name__ == "__main__":
    main()
