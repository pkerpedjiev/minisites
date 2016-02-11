"use strict"

let width = 550;
let height = 400;

var svg = d3.select('body')
.append('svg')
.attr('width', width)
.attr('height', height);

function distancesRMSD(ipDistances1, ipDistances2 ) {
    let sum = 0;
    for (let i = 0; i < ipDistances1.length; i++)
        sum += (ipDistances1[i] - ipDistances2[i]) * 
            (ipDistances1[i] - ipDistances2[i]);

    sum /= ipDistances1.length;
    console.log('sum:', sum);

    return Math.sqrt(sum);

}

function closestPoint(pathNode, point) {
    // Taken from:
    // https://gist.github.com/mbostock/8027637
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
    let lettersArray = [
        "m -1522.7429,478.70148 c -1.125,0.25 -1.625,0.25 -2.25,0.25 -3.625,0 -5.625,-1.875 -5.625,-5.125 l 0,-38.5 c 0,-11.625 -8.5,-17.875 -24.625,-17.875 -9.5,0 -17.375,2.75 -21.75,7.625 -3,3.375 -4.25,7.125 -4.5,13.625 l 10.5,0 c 0.875,-8 5.625,-11.625 15.375,-11.625 9.375,0 14.625,3.5 14.625,9.75 l 0,2.75 c 0,4.375 -2.625,6.25 -10.875,7.25 -14.75,1.875 -17,2.375 -21,4 -7.625,3.125 -11.5,9 -11.5,17.5 0,11.875 8.25,19.375 21.5,19.375 8.25,0 14.875,-2.875 22.25,-9.625 0.75,6.625 4,9.625 10.75,9.625 2.125,0 3.75,-0.25 7.125,-1.125 l 0,-7.875 z m -18.25,-14.5 c 0,3.5 -1,5.625 -4.125,8.5 -4.25,3.875 -9.375,5.875 -15.5,5.875 -8.125,0 -12.875,-3.875 -12.875,-10.5 0,-6.875 4.625,-10.375 15.75,-12 11,-1.5 13.25,-2 16.75,-3.625 l 0,11.75 z",
        "m -1484.5709,402.27292 0,91.125 9.375,0 0,-8.375 c 5,7.625 11.625,11.25 20.75,11.25 17.25,0 28.5,-14.125 28.5,-35.875 0,-21.25 -10.75,-34.375 -28,-34.375 -9,0 -15.375,3.375 -20.25,10.75 l 0,-34.5 -10.375,0 z m 28.625,33.5 c 11.625,0 19.125,10.125 19.125,25.75 0,14.875 -7.75,25 -19.125,25 -11,0 -18.25,-10 -18.25,-25.375 0,-15.375 7.25,-25.375 18.25,-25.375 z",
        "m -1332.7739,449.89792 c -0.5,-6.375 -1.875,-10.5 -4.375,-14.125 -4.5,-6.125 -12.375,-9.75 -21.5,-9.75 -17.625,0 -29.125,14 -29.125,35.75 0,21.125 11.25,34.5 29,34.5 15.625,0 25.5,-9.375 26.75,-25.375 l -10.5,0 c -1.75,10.5 -7.125,15.75 -16,15.75 -11.5,0 -18.375,-9.375 -18.375,-24.875 0,-16.375 6.75,-26.125 18.125,-26.125 8.75,0 14.25,5.125 15.5,14.25 l 10.5,0 z",
        "m -1235.2269,402.27292 -10.375,0 0,33.875 c -4.375,-6.625 -11.375,-10.125 -20.125,-10.125 -17,0 -28.125,13.625 -28.125,34.5 0,22.125 10.875,35.75 28.5,35.75 9,0 15.25,-3.375 20.875,-11.5 l 0,8.625 9.25,0 0,-91.125 z m -28.75,33.5 c 11.25,0 18.375,10 18.375,25.625 0,15.125 -7.25,25.125 -18.25,25.125 -11.5,0 -19.125,-10.125 -19.125,-25.375 0,-15.25 7.625,-25.375 19,-25.375 z",
        "m -1137.9299,464.14792 c 0,-10 -0.75,-16 -2.625,-20.875 -4.25,-10.75 -14.25,-17.25 -26.5,-17.25 -18.25,0 -30,14 -30,35.5 0,21.5 11.375,34.75 29.75,34.75 15,0 25.375,-8.5 28,-22.75 l -10.5,0 c -2.875,8.625 -8.75,13.125 -17.125,13.125 -6.625,0 -12.25,-3 -15.75,-8.5 -2.5,-3.75 -3.375,-7.5 -3.5,-14 l 48.25,0 z m -48,-8.5 c 0.875,-12.125 8.25,-20 18.75,-20 10.25,0 18.125,8.5 18.125,19.25 0,0.25 0,0.5 -0.125,0.75 l -36.75,0 z",
        "m -1069.7579,430.77292 -10.875,0 0,-10.25 c 0,-4.375 2.5,-6.625 7.25,-6.625 0.875,0 1.25,0 3.625,0.125 l 0,-8.625 c -2.375,-0.5 -3.75,-0.625 -5.875,-0.625 -9.625,0 -15.375,5.5 -15.375,14.875 l 0,11.125 -8.75,0 0,8.5 8.75,0 0,57 10.375,0 0,-57 10.875,0 0,-8.5 z",
        "m -983.71094,403.52292 0,9.5 c -5.25,-7.75 -11.625,-11.375 -19.99996,-11.375 -16.625,0 -27.875,14.5 -27.875,35.75 0,10.75 2.875,19.5 8.25,25.75 4.875,5.5 11.875,8.75 18.75,8.75 8.24996,0 13.99996,-3.5 19.87496,-11.75 l 0,3.375 c 0,8.875 -1.125,14.25 -3.75,17.875 -2.75,3.875 -8.125,6.125 -14.49996,6.125 -4.75,0 -9,-1.25 -11.875,-3.5 -2.375,-1.875 -3.375,-3.625 -4,-7.5 l -10.625,0 c 1.125,12.375 10.75,19.75 26.125,19.75 9.74996,0 18.12496,-3.125 22.37496,-8.375 5,-6 6.875,-14.25 6.875,-29.625 l 0,-54.75 -9.625,0 z m -18.87496,7.75 c 11.24996,0 17.87496,9.5 17.87496,25.875 0,15.625 -6.75,25.125 -17.74996,25.125 -11.375,0 -18.25,-9.625 -18.25,-25.5 0,-15.75 7,-25.5 18.125,-25.5 z",
        "m -935.91394,405.14792 0,91.125 10.375,0 0,-36.125 c 0,-13.375 7,-22.125 17.75,-22.125 3.375,0 6.75,1.125 9.25,3 3,2.125 4.25,5.25 4.25,9.875 l 0,45.375 10.375,0 0,-49.5 c 0,-11 -7.875,-17.875 -20.625,-17.875 -9.25,0 -14.875,2.875 -21,10.875 l 0,-34.625 -10.375,0 z",
        "m -835.24194,430.77292 -10.375,0 0,65.5 10.375,0 0,-65.5 z m 0,-25.625 -10.5,0 0,13.125 10.5,0 0,-13.125 z",
        "m -786.06995,403.52292 0,75 c 0,6.5 -2.125,8.625 -8.5,8.625 -0.375,0 -0.375,0 -2.5,-0.125 l 0,8.875 c 1.25,0.25 1.875,0.375 3.5,0.375 11.75,0 17.875,-4.75 17.875,-13.625 l 0,-79.125 -10.375,0 z m 10.375,-25.625 -10.375,0 0,13.125 10.375,0 0,-13.125 z",
        "m -685.41071,448.86221 c -0.5,-6.375 -1.875,-10.5 -4.375,-14.125 -4.5,-6.125 -12.375,-9.75 -21.5,-9.75 -17.625,0 -29.125,14 -29.125,35.75 0,21.125 11.25,34.5 29,34.5 15.625,0 25.5,-9.375 26.75,-25.375 l -10.5,0 c -1.75,10.5 -7.125,15.75 -16,15.75 -11.5,0 -18.375,-9.375 -18.375,-24.875 0,-16.375 6.75,-26.125 18.125,-26.125 8.75,0 14.25,5.125 15.5,14.25 l 10.5,0 z"
    ]

    var minBounds = {x: 10000, y: 10000};
    var maxBounds = {x: -10000, y: -10000};

    var margin = {left: 20, right: 20, top: 20, bottom: 100 }

    var gMain = svg.append('g')
    .attr('transform', `translate(${margin.left}, ${margin.top})`); 

    var gLetters = gMain.append('g')
    var gPoints = gMain.append('g');
    var lettersPoss = [];
    for (let i = 0; i < lettersArray.length; i++)
        lettersPoss.push(i)

    gLetters.selectAll('.path')
    .data(lettersArray)
    .enter()
    .append('g')
    .classed('letter-g', true)
    .append('path')
    .classed('letter', true)
    .attr('d', d => { return d; })

    let bounds = gLetters.node().getBoundingClientRect();
    let bounds1 = gLetters.node().getBBox();

    console.log("gLetters.data().length", gLetters.data().length);
    console.log('lettersArray.length', lettersArray.length);
    var histXPosScale = d3.scale.ordinal()
    .domain(lettersPoss)
    .rangeRoundBands([0, width - margin.left - margin.right], 0.2);

    console.log('histXPosScale.domain', histXPosScale.domain(), histXPosScale(0));
    console.log('histXPosScale.range', histXPosScale.range(), histXPosScale(0));
    console.log('histXPosScale.domain', histXPosScale.domain(), histXPosScale(1));

    let allIPDistances = [];

    gLetters.selectAll('.letter-g')
    .each(function(d, i) {
        console.log('sampling i:', i);
        // sample points inside the bounding box of the letter
        let bbox1 = this.getBoundingClientRect();
        let bbox = this.getBBox();

        let toSample = 200;
        let points = [];
        let closeEnough = 0;

        while (closeEnough < toSample) {
            let newPoint =  [bbox.x + Math.random() * bbox.width,
                             bbox.y + Math.random() * bbox.height]
            var distance = closestPoint(d3.select(this).select('path').node(), newPoint);

            if (distance.distance < 2) {
                points.push({'point': newPoint, 'distance': distance.distance});
                closeEnough += 1;
            }
        }

        /*
        let colorScale = d3.scale.linear()
        .domain(d3.extent(points.map(p => { return p.distance })))
        .range(['blue', 'white'])
        */

        d3.select(this).selectAll('.sample-point')
        .data(points)
        .enter()
        .append('circle')
        .classed('sample-point', true)
        .attr('cx', d => { return d.point[0]; })
        .attr('cy', d => { return d.point[1]; })
        .attr('r', 3)
        //.attr('fill', d => { return colorScale(d.distance); });

        // calculate the distances between different sampled points
        let interPointDistances = [];
        points.map((p1,i) => {
            points.map((p2,j) => {
                if (i <= j)
                    return;

                let d1 = (p1.point[0] - p2.point[0])
                let d2 = (p1.point[1] - p2.point[1])
                interPointDistances.push( Math.sqrt(d1 * d1 + d2 * d2));
            });
        });

        interPointDistances.sort((a,b) => { return +a - (+b); });
        allIPDistances.push(interPointDistances);

        // create a histogram of the sampled point distances
        let xScale = d3.scale.linear()
        .domain([0, 120])//d3.max(histData, d => { return d.x; })])
        .range([0, histXPosScale.rangeBand()]);

        let histData = d3.layout.histogram()
            .bins(xScale.ticks(20)) 
            (interPointDistances);

        let gHist = gMain.append('g')
        .attr('transform', `translate(${margin.left + histXPosScale(i) }, 
                                      ${height - margin.bottom - margin.top})`)
        let histHeight = margin.bottom - 20;

        let yScale = d3.scale.linear()
        .domain([0, d3.max(histData, d => { return d.y; })])
        .range([histHeight, 0]);

        let bar = gHist.selectAll('.bar')
        .data(histData)
        .enter()
        .append('g')
        .classed('bar', true)
        .attr('transform', d => { return `translate(${xScale(d.x)}, 
                                                    ${yScale(d.y)})`; });

        bar.append('rect')
        .attr('x', 1)
        .attr('width', xScale(histData[0].dx) - 1)
        .attr('height', d => { return histHeight - yScale(d.y); })

        let xAxis = d3.svg.axis()
        .scale(xScale)
        .orient("bottom")
        .tickFormat((d,i) => {
            return '';
            if (i % 2 == 0)
                return '';
            else
                return d;
        });

        gHist.append('g')
        .attr('class', 'x axis')
        .attr('transform', `translate(0,${histHeight})`)
        .call(xAxis);
    });


    gLetters.attr('transform', d => {
        var scaleFactor = (width - margin.left - margin.right) / bounds.width;

        return(`scale(${scaleFactor}), translate(${(width / scaleFactor - bounds.width + margin.left) / 2 - bounds.left},
                          ${(height - bounds.height) / 2 - bounds.top})`);
    });

    let ssds = [];
    var maxSsd = 0;

    for (let i = 0; i < allIPDistances.length; i++) {
        let distancesForThisLetter = [];

        for (let j = 0; j < allIPDistances.length; j++) {
            var ssd = distancesRMSD(allIPDistances[i], allIPDistances[j]);
            distancesForThisLetter.push(ssd);

            if (ssd > maxSsd)
                maxSsd = ssd;
        }

        ssds.push(distancesForThisLetter);
    }

    console.log('ssds:', ssds);

    function showDistanceHeatmap() {
        let width = 200;
        let height = 200;

        let margin = {'top': 40, 'bottom': 20, 'left': 40, 'right': 20}

        let svg = d3.select('#distance-heatmap')
        .append('svg')
        .attr('width', width)
        .attr('height', height);

        let gMain = svg.append('g')
        .attr('transform', `translate(${margin.left}, ${margin.top})`)

        let xScale = d3.scale.ordinal()
        .domain(lettersPoss)
        .rangeRoundBands([0, width - margin.left - margin.right], 0.1);

        let yScale = d3.scale.ordinal()
        .domain(lettersPoss)
        .rangeRoundBands([0, height - margin.top - margin.bottom], 0.1);

        let colorScale = d3.scale.linear()
        .domain([0, maxSsd])
        .range(['white', 'blue']);

        console.log('lettersPoss:', lettersPoss);

        let xAxis = d3.svg.axis()
        .scale(xScale)
        .orient("top")

        let yAxis = d3.svg.axis()
        .scale(yScale)
        .orient('left')

        gMain.selectAll('.heatmap-rows')
        .data(ssds)
        .enter()
        .append('g')
        .each(function(d,i) {
            console.log('i:', i);
            d3.select(this)
            .selectAll('.heatmap-cell')
            .data(d)
            .enter()
            .append('rect')
            .attr('x', (e,j) => { return xScale(i); })
            .attr('y', (e,j) => { return yScale(j); })
            .attr('width', xScale.rangeBand())
            .attr('height', yScale.rangeBand())
            .attr('fill', (e) => { return colorScale(e); });
        });

        gMain.append('g')
        .attr('class', 'x axis')
        .call(xAxis);

        gMain.append('g')
        .attr('class', 'y axis')
        .call(yAxis);
    };

    showDistanceHeatmap();
});
