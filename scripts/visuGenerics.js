define([], function() {
    var drawBty = function() {
        var self = this;
        self.bty = self.svgObject.svgContainer
            .append("rect")
                .attr("x",0)
                .attr("y",0)
                .attr("width", self.svgObject.width)
                .attr("height", self.svgObject.height)
                .style("stroke","black")
                .style("stroke-width",1)
                .style("fill","none")
    }

    return {
        drawBty: drawBty
    }
})
