define(["d3"], function(d3) {
    var Plot = function() {
        this.drawBty = function() {
            this.bty = this.svgObject.svgContainer
                .append("rect")
                    .attr("x",0)
                    .attr("y",0)
                    .attr("width", this.svgObject.width)
                    .attr("height", this.svgObject.height)
                    .style("stroke","black")
                    .style("stroke-width",1)
                    .style("fill","none")
        }

        this.d3line = d3.svg.line()
            .x(function(d) { return this.xAxisScale(d.b0) })
            .y(function(d) { return this.yAxisScale(d.b1) })
            .interpolate("linear");

        this.abline = function(a, b) {
            var points = 100;
            var xs = new Array(points);
            var xdom = this.xAxisScale.domain();
            var xlen = xdom[1] - xdom[0];
            var step = xlen/points;
            var ydom = this.yAxisScale.domain();
            for (var i = 0; i < points; i++) {
                xs[i] = xdom[0] + i * step;
            }
            var res = xs.map( function(x) { 
                return {
                    b0: x,
                    b1: a + b * x
                }
            })
            return res.filter( function(d) {
                return d.b1 > ydom[0] && d.b1 < ydom[1];
            });
        }
    };

    return {
        Plot: Plot 
    }
})
