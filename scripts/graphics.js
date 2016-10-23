define(["d3"], function(d3) {
    return {
        getSvg: function(elementId) {
            var svgWidth = 600;
            var svgHeight = 575;
            var margin = {top: 25, left: 50, right: 50, bottom: 50};
            var width = svgWidth - (margin.left + margin.right);
            var height = svgHeight - (margin.top + margin.bottom);

            var svgHandle = d3.select(elementId).append("svg")
                .attr("width",svgWidth)
                .attr("height",svgHeight);
            var svgContainer = svgHandle.append("g")
                .attr("transform","translate(" + margin.left + "," + margin.top + ")");
            return {
                svgContainer: svgContainer,
                svgHandle: svgHandle,
                width: width,
                height: height
            };
        }
    }
})
