define(["d3", "graphics"], function(d3, graphics) {

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
        console.log(this);
        this.draw();
    }

    ParamspaceVisu.prototype.updateAxisScales = function() {
        this.xAxisScale = d3.scale.linear()
            .domain([-5, 5])
            .range([0, this.svgObject.width]);
        this.yAxisScale = d3.scale.linear()
            .domain([-5, 5])
            .range([this.svgObject.height, 0]);
    }

    ParamspaceVisu.prototype.cleanUp = function() {
        try {
            this.svgObject.svgHandle.remove();
        } catch(e) {
        }
        this.svgObject = {};
    }

    ParamspaceVisu.prototype.draw = function() {
        this.drawAxis();
        this.drawParamdot();
    }

    ParamspaceVisu.prototype.drawParamdot = function() {
        var params = this.visu.parameters();
        this.svgObject.svgContainer
            .append("circle")
                .attr("cx",this.xAxisScale(params.b0))
                .attr("cy",this.yAxisScale(params.b1))
                .attr("r",5)
                .style("fill","red");
    }

    ParamspaceVisu.prototype.update = function() {
        this.cleanUp();
        this.setSvg();
        this.draw();
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
            .attr("transform", "translate(0," + this.svgObject.height/2 + ")")
            .call(this.xAxis)

        this.drawnYAxis = this.svgObject.svgContainer
            .append("g")
            .attr("class","axis")
            .attr("transform","translate(" + this.svgObject.width/2 + ",0)")
            .call(this.yAxis)
    }
    return {
        ParamspaceVisu: ParamspaceVisu
    }
})
