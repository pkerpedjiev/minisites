"use strict"

let width = 550;
let height = 400;

var svg = d3.select('body')
.append('svg')
.attr('width', width)
.attr('height', height);

function closestPoint(pathNode, point) {
    var pathLength = pathNode.getTotalLength(),
    precision = pathLength / pathNode.pathSegList.numberOfItems * .125,
    best,
    bestLength,
    bestDistance = Infinity;
    // linear scan for coarse approximation
    for (var scan, scanLength = 0, scanDistance; scanLength <= pathLength; scanLength += precision) {
        if ((scanDistance = distance2(scan = pathNode.getPointAtLength(scanLength))) < bestDistance) {
            best = scan, bestLength = scanLength, bestDistance = scanDistance;
        }
    }
    // binary search for precise estimate
    precision *= .5;
    while (precision > .5) {
        var before,
        after,
        beforeLength,
        afterLength,
        beforeDistance,
        afterDistance;
        if ((beforeLength = bestLength - precision) >= 0 && (beforeDistance = distance2(before = pathNode.getPointAtLength(beforeLength))) < bestDistance) {
            best = before, bestLength = beforeLength, bestDistance = beforeDistance;
        } else if ((afterLength = bestLength + precision) <= pathLength && (afterDistance = distance2(after = pathNode.getPointAtLength(afterLength))) < bestDistance) {
            best = after, bestLength = afterLength, bestDistance = afterDistance;
        } else {
            precision *= .5;
        }
    }
    best = [best.x, best.y];
    best.distance = Math.sqrt(bestDistance);
    return best;
    function distance2(p) {
        var dx = p.x - point[0],
        dy = p.y - point[1];
        return dx * dx + dy * dy;
    }
}

d3.xml('img/alphabet_shortened.svg', "application/xml", function(xml) {
    var gLetters = xml.getElementById("letters");

    //var dA = "m 0,0 -2.064,0 0,-3.456 -1.992,0 0,3.456 -1.704,0 0,1.632 1.704,0 0,9.504 c 0,1.272 0.864,1.992 2.424,1.992 0.48,0 0.96,-0.048 1.632,-0.168 l 0,-1.68 c -0.264,0.072 -0.576,0.096 -0.96,0.096 -0.864,0 -1.104,-0.24 -1.104,-1.128 l 0,-8.616 2.064,0 0,-1.632 z";
    var dA ="m -1255.1286,94.314338 c -1.62,0.36 -2.34,0.36 -3.24,0.36 -5.22,0 -8.1,-2.7 -8.1,-7.38 l 0,-55.44 c 0,-16.74 -12.24,-25.7399996 -35.46,-25.7399996 -13.68,0 -25.02,3.9599996 -31.32,10.9799996 -4.32,4.86 -6.12,10.26 -6.48,19.62 l 15.12,0 c 1.26,-11.52 8.1,-16.74 22.14,-16.74 13.5,0 21.06,5.04 21.06,14.04 l 0,3.96 c 0,6.3 -3.78,9 -15.66,10.44 -21.24,2.7 -24.48,3.42 -30.24,5.76 -10.98,4.5 -16.56,12.96 -16.56,25.2 0,17.1 11.88,27.900002 30.96,27.900002 11.88,0 21.42,-4.14 32.04,-13.860002 1.08,9.540002 5.76,13.860002 15.48,13.860002 3.06,0 5.4,-0.36 10.26,-1.62 l 0,-11.340002 z m -26.28,-20.88 c 0,5.04 -1.44,8.1 -5.94,12.24 -6.12,5.58 -13.5,8.46 -22.32,8.46 -11.7,0 -18.54,-5.58 -18.54,-15.12 0,-9.9 6.66,-14.94 22.68,-17.28 15.84,-2.16 19.08,-2.88 24.12,-5.22 l 0,16.92 z";
    var dI ="m -1037.6429,18.399337 -14.94,0 0,94.320003 14.94,0 0,-94.320003 z m 0,-36.9 -15.12,0 0,18.90000046 15.12,0 0,-18.90000046 z";

    var minBounds = {x: 10000, y: 10000};
    var maxBounds = {x: -10000, y: -10000};

    var gMain = svg.append('g'); 
    var gLetters = gMain.append('g')
    var gPoints = gMain.append('g');

    gLetters.selectAll('.path')
    .data([dA,dI])
    .enter()
    .append('path')
    .classed('letter', true)
    .attr('d', d => { return d; })

    let bounds = gLetters.node().getBoundingClientRect();

    gLetters.selectAll('.letter')
    .each(function(d) {
        // sample points inside the bounding box of the letter
        let bbox = this.getBoundingClientRect();

        let toSample = 10;
        let points = [];
        for (let i = 0; i < toSample; i++) {
            let newPoint =  [bbox.left + Math.random() * bbox.width,
                             bbox.top + Math.random() * bbox.height]
            var distance = closestPoint(this, newPoint);
        }

        console.log('points:', points);

        console.log('bbox:', bbox);
    });

    gLetters.attr('transform', d => {
        return(`translate(${(width - bounds.width) / 2 - bounds.left},
                          ${(height - bounds.height) / 2 - bounds.top})`);
    });

});
