"use strict";

function goombaPlot() {
    var width = 550;
    var height = 400;
    var margin = {'top': 30, 'left': 30, 'bottom': 30, 'right': 40};
    
    function chart(selection) {
        selection.each(function(data) {
            console.log('data:', data);
            // Select the svg element, if it exists.
            var svg = d3.select(this).selectAll("svg").data([data]);

            // Otherwise, create the skeletal chart.
            var gEnter = svg.enter().append("svg").append("g");

            svg.attr('width', width)
            .attr('height', height);

            // Get the names of the chromosomes
            let chromosomes = Array.from(new Set(data.map((d) => { return d.chr; })));
            let chromosomeLengths = chromosomes.map((d) => {
                let lengths = data.filter((e) => { return e.chr == d;  })
                                .map((e) => {return +e.end; })
                return {"name": d,
                        "length": d3.max(lengths)
                        }});

            // order them according to the maximum start position
            // of all genes
            let chromosomesInOrder = chromosomeLengths
                .sort((a,b) => { return b.length - a.length; })
                .map((d) => { return d.name; });

            console.log('chromosomesInOrder:', chromosomesInOrder);

            var yScale = d3.scale.ordinal()
            .domain(chromosomesInOrder)
            .rangeRoundBands([0, height - margin.top - margin.bottom]);

            console.log('chromosomes', chromosomes);
            console.log('chromosomeLengths', chromosomeLengths);
        });
    }

    chart.width = function(_) {
        if (!arguments.length) return width;
        width = _;
        return chart;
    };

    chart.height = function(_) {
        if (!arguments.length) return height;
        height = _;
        return chart;
    };

    return chart;
}
