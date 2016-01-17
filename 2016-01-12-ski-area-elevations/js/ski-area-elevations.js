function skiAreaElevationsPlot() {
    var width = 550;
    var height = 400;
    var margin = {'top': 30, 'left': 30, 'bottom': 30, 'right': 40};
    
    function chart(selection) {
        selection.each(function(data) {
            // Select the svg element, if it exists.
            var svg = d3.select(this).selectAll("svg").data([data]);


            // Otherwise, create the skeletal chart.
            var gEnter = svg.enter().append("svg").append("g");

            svg.attr('width', width)
            .attr('height', height);

            var zoom = d3.behavior.zoom()
                .on("zoom", draw);

            data = Object.keys(data).map(function(key){
                    return data[key];
            }).sort(function(a,b) {
                return b.max_elev - a.max_elev; 
            });

            svg.insert("rect", "g")
            .attr("class", "pane")
            .attr("width", width)
            .attr("height", height)
            .attr('pointer-events', 'all')
            .call(zoom);

            var yScale = d3.scale.linear()
            .domain([0, d3.max(data.map(function(d) { return d.max_elev; }))])
            .range([height - margin.top - margin.bottom, 0]);

            data.map(function(d) { 
                d.area = +d.area + 1.8;
                d.cumarea = Math.log(d.area); 
            });

            var widthScale = d3.scale.linear()
            .domain([0, Math.log(d3.max(data.map(function(d) { return d.area; })))])
            .range([1, 10]);


            var cumWidths = data.reduce(function(r, a) {
                if (r.length > 0)
                    a.cumarea += r[r.length - 1] + 2;

                r.push(+a.cumarea);
                return r;
                }, []);

            var xScale = d3.scale.linear()
            .domain([0, cumWidths[cumWidths.length - 1]])
            .range([0, width - margin.left - margin.right]);
                console.log('cumWidths:', cumWidths);

            zoom.x(xScale).scaleExtent([1,data.length / 30])
            .xExtent([0, cumWidths[cumWidths.length-1]]);

            var gMain = gEnter.append('g')
            .attr('transform', 'translate(' + margin.left + ',' + margin.top + ')');

            gMain.append("clipPath")
            .attr("id", "clip")
            .append("rect")
            .attr("x", 0)
            .attr("y", 0)
            .attr("width", width - margin.left - margin.right)
            .attr("height", height - margin.top - margin.bottom);

            function skiAreaMouseover(d) {
                console.log('mouseover');
                gMain.select('#n-' + d.uid)
                .attr('visibility', 'visible');
            }

            function skiAreaMouseout(d) {
                gMain.select('#n-' + d.uid)
                .attr('visibility', 'hidden');
            }

            // the rectangle showing each rect
            gMain.selectAll('.resort-rect')
            .data(data)
            .enter()
            .append('rect')
            .classed('resort-rect', true)
            .attr("clip-path", "url(#clip)")
            .on('mouseover', skiAreaMouseover)
            .on('mouseout', skiAreaMouseout);

            // the name of each resort
            gMain.selectAll('.resort-name')
            .data(data)
            .enter()
            .append('text')
            .classed('resort-name', true)
            .attr('id', function(d) { return 'n-' + d.uid; })
            .attr("clip-path", "url(#clip)")
            .attr('visibility', 'hidden')
            .text(function(d) { return d.name; });

            var gYAxis = svg.append("g")
            .attr("class", "y axis")
            .attr("transform", "translate(" + (width - margin.right) + "," + margin.top + ")");

            var yAxis = d3.svg.axis()
            .scale(yScale)
            .orient("right")
            .tickSize(-(width - margin.left - margin.right))
            .tickPadding(6);

            gYAxis.call(yAxis);

            draw();

            function draw() {
                function scaledX(d,i) {
                    return xScale(cumWidths[i]) - (xScale(Math.log(d.area)) - xScale(0));
                }

                function rectWidth(d,i) {
                    return xScale(Math.log(d.area)) - xScale(0); 
                }

                gMain.selectAll('.resort-rect')
                .attr('x', scaledX)
                .attr('y', function(d) { return yScale(d.max_elev); })
                .attr('width', rectWidth)
                .attr('height', function(d) { return yScale(d.min_elev) - yScale(d.max_elev);  })
                .classed('resort-rect', true);

                gMain.selectAll('.resort-name')
                .attr('x', function(d,i) { return scaledX(d,i) + rectWidth(d,i) / 2; })
                .attr('y', function(d) { return yScale(d.max_elev) - 10; });
            }
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
