define(["d3", "graphics", "visuGenerics"], function(d3, graphics, visuGenerics) {

    var ParamspaceVisu = function(elementId, visu) {
        this.elementId = elementId;
        this.visu = visu;
        this.svgObject;
        this.xAxisScale;
        this.yAxisScale;
        this.xAxis;
        this.yAxis;
        this.drawnXAxis;
        this.drawnYAxis;
        this.paramdot;
    }
    
    ParamspaceVisu.prototype.setSvg = function() {
        this.svgObject = graphics.getSvg(this.elementId);
    }

    ParamspaceVisu.prototype.init = function() {
        this.setSvg();
        this.updateAxisScales();
        this.draw();
    }

    ParamspaceVisu.prototype.updateAxisScales = function() {
        this.xAxisScale = d3.scale.linear()
            .domain([-2, 2])
            .range([0, this.svgObject.width]);
        this.yAxisScale = d3.scale.linear()
            .domain([-2, 2])
            .range([this.svgObject.height, 0]);
    }

    ParamspaceVisu.prototype.cleanUp = function() {
        try {
            this.svgObject.svgHandle.remove();
        } catch(e) {
        }
        this.svgObject = {};
    }

    ParamspaceVisu.prototype.draw = function(shouldPlotPath) {
        this.drawAxis();
        this.drawParamdot();
        this.drawGradient();
        this.drawBty();
        if ( typeof shouldPlotPath != 'undefined' && shouldPlotPath) 
            this.drawPath();
    }
    
    ParamspaceVisu.prototype.drawPath = function() {
        var self = this;
        var betas = this.visu.betaPath(); 

        var circleGroup = this.svgObject.svgContainer
            .append("g")
                .attr("class","circles")
            
        circleGroup.selectAll("circle")
            .data(betas)
            .enter()
            .append("circle")
                .attr("cx", function(d) {
                    return self.xAxisScale(d.b0);
                })
                .attr("cy", function(d) {
                    return self.yAxisScale(d.b1); 
                })
                .attr("r", 5)

        var pathGroup = this.svgObject.svgContainer
            .append("g")
                .attr("class","regressionline")

        pathGroup.append("path")
            .attr("d",this.d3line(betas))
            .style("fill","none")
    }

    ParamspaceVisu.prototype.d3line = d3.svg.line()
        .x(function(d) { return this.xAxisScale(d.b0) })
        .y(function(d) { return this.yAxisScale(d.b1) })
        .interpolate("linear")

    ParamspaceVisu.prototype.drawGradient = function() {
        var self = this;
        var start = this.visu.parameters()
        var grad = this.visu.gradient();
        var end = {
            b0: start.b0 - grad.b0,
            b1: start.b1 - grad.b1
        };
        var linedata = [start, end];

        var gradientgroup = this.svgObject.svgContainer
            .append("g")
                .attr("class","regressionline")
        gradientgroup.append("path")
                .attr("d", this.d3line(linedata))
    }

    ParamspaceVisu.prototype.drawParamdot = function() {
        var params = this.visu.parameters();
        this.svgObject.svgContainer
            .append("g")
                .attr("class","circles")
            .append("circle")
                .attr("cx",this.xAxisScale(params.b0))
                .attr("cy",this.yAxisScale(params.b1))
                .attr("r",5);
    }

    ParamspaceVisu.prototype.update = function(shouldPlotPath) {
        this.cleanUp();
        this.setSvg();
        this.draw(shouldPlotPath);
    }

    ParamspaceVisu.prototype.drawAxis = function() {
        this.xAxis = d3.svg.axis().scale(this.xAxisScale)
            .orient("bottom")
            .outerTickSize(3)
            .tickPadding(10)

        this.yAxis = d3.svg.axis().scale(this.yAxisScale)
            .orient("left")
            .tickPadding(10)
            .outerTickSize(3)

        this.drawnXAxis = this.svgObject.svgContainer
            .append("g")
            .attr("class","axis")
            .attr("transform", "translate(0," + this.svgObject.height*1 + ")")
            .call(this.xAxis)

        this.drawnYAxis = this.svgObject.svgContainer
            .append("g")
            .attr("class","axis")
            .attr("transform","translate(0,0)")
            .call(this.yAxis)
    }

    ParamspaceVisu.prototype.drawBty = visuGenerics.drawBty;

    return {
        ParamspaceVisu: ParamspaceVisu
    }
})
