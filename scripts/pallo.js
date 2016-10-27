define(["d3", "graphics", "lm", "visuGenerics"], function(d3, graphics, lm, visuGenerics) {
    var Pallo = function(elementId, xname, yname, visu) {
        visuGenerics.Plot.call(this);
        this.xname = xname;
        this.yname = yname;
        this.elementId = elementId;
        this.shouldDrawSquares = true;
        this.visu = visu;
        this.xAxisScale;
        this.yAxisScale;
        this.svgObject;
        this.squares;
        this.circles;
        this.squares;
        this.dataUpdateRectangle;
        this.drawnXAxis;
        this.drawnYAxis;
        this.bty;
        this.xAxis;
        this.yAxis;
        this.bottomLegend;
    }

    Pallo.prototype.updateMappings = function() {
        var self = this;
        self.visu.updateModel();
    }

    Pallo.prototype.updateAxisScales = function() {
        var self = this;
        self.xAxisScale = d3.scale.linear()
            .domain([0, 1])
            .range([0, self.svgObject.width]);
        self.yAxisScale = d3.scale.linear()
            .domain([0, 1])
            .range([self.svgObject.height, 0]);
    }

    Pallo.prototype.drawAxis = function() {
        var self = this;

        self.xAxis = d3.svg.axis().scale(self.xAxisScale)
            .orient("bottom")
            .outerTickSize(0)
            .tickPadding(10)

        self.yAxis = d3.svg.axis().scale(self.yAxisScale)
            .orient("left")
            .tickPadding(10)
            .outerTickSize(0)

        self.drawnXAxis = self.svgObject.svgContainer
            .append("g")
            .attr("class","axis")
            .attr("transform", "translate(0," + self.svgObject.height + ")")
            .call(self.xAxis)

        self.drawnYAxis = self.svgObject.svgContainer
            .append("g")
            .attr("class","axis")
            .call(self.yAxis)
    }

    Pallo.prototype.removeSquares = function() {
        var self = this;
        self.shouldDrawSquares=false;
        try {
            self.squares.remove();
            self.squares = {};
        } catch(e) {
        }
    }

    Pallo.prototype.drawBottomLegend = function() {
        var self = this;
        self.bottomLegend = self.svgObject.svgContainer
            .append("text")
            .attr("x", 0)
            .attr("y", self.svgObject.height + 40)
            .text(function() { return "Regressiomalli " + self.visu.printModel() + ", neliösumma: " + self.visu.printSS()})
    }

    Pallo.prototype.setSvg = function() {
        var self = this;
        self.svgObject = graphics.getSvg(self.elementId);
        self.updateAxisScales();
    }

    Pallo.prototype.updateSvg = function() {
        var self = this;
        self.cleanUp();
        self.setSvg();
    }

    Pallo.prototype.setDataUpdateRectangle = function() {
        var self = this;
        self.dataUpdateRectangle = self.svgObject.svgContainer.append("rect")
            .attr("x",0)
            .attr("y",0)
            .attr("width", self.svgObject.width)
            .attr("height", self.svgObject.height)
            .style("fill","white")
            .style("opacity",0)
            .on("click", function() {
                var mousePos = d3.mouse(this);
                var x = self.xAxisScale.invert(mousePos[0]);
                var y = self.yAxisScale.invert(mousePos[1]);
                var newobs = {};
                newobs[self.xname] = x;
                newobs[self.yname] = y;
                self.visu.addDatapoint(newobs);
            })
    }

    Pallo.prototype.addSquares = function() {
        var self = this;
        self.shouldDrawSquares=true;
        self.drawSquares();
    }

    Pallo.prototype.drawSquares = function() {
        var self = this;

        self.squares = self.svgObject.svgContainer
            .append("g")
                .attr("class","squares")
                .selectAll("rect")
                .data(self.visu.getFiltered()).enter()
                .append("rect")
                    .attr("x", function(d,i) {
                        var dist = d[self.yname] - self.visu.prediction(d);
                        if (dist > 0) 
                            return self.xAxisScale(d[self.xname] - dist);
                        return self.xAxisScale(d[self.xname]);
                    })
                    .attr("y", function(d) {
                        var dist = d[self.yname] - self.visu.prediction(d);
                        if (dist > 0) {
                            return self.yAxisScale(d[self.yname]);
                        }
                        return self.yAxisScale(self.visu.prediction(d)); 
                    })
                    .attr("width", function(d) {
                        var dist = Math.abs(d[self.yname] - self.visu.prediction(d));
                        return self.xAxisScale(dist);
                    })
                    .attr("height", function(d) {
                        var dist = Math.abs(d[self.yname] - self.visu.prediction(d));
                        return self.svgObject.height - self.yAxisScale(dist);
                    })
        }

        Pallo.prototype.drawRegressionLine = function() {
            var self = this;
            var lineFunc = d3.svg.line()
                .x( function(d) { return self.xAxisScale(d.x) })
                .y( function(d) { return self.yAxisScale(d.y) })
                .interpolate("linear");

            var xs = new Array(100);
            for (i = 0; i < 100; i++) 
                xs[i] = i/100;

            var predictions = xs.map(function(x) { 
                return {
                    x: x, 
                    y: self.visu.numPrediction(x)
                } 
            }).filter(function(d) {
                return d.y < 1 && d.x < 1 && d.y > 0 && d.x > 0;
            });
            var regressionLine = self.svgObject.svgContainer
                .append("g")
                .attr("class","regressionline")
                .append("path")
                    .attr("d", lineFunc(predictions))
                    .attr("fill","none")
        }

        Pallo.prototype.drawCircles = function() {
            var self = this;
            self.circles = self.svgObject.svgContainer
                .append("g").attr("class", "circles")
                .selectAll("circle")
                .data(self.visu.getFiltered())

            self.circles.exit().remove();

            self.circles.enter().append("circle") 
                .attr("cx", function(d){return self.xAxisScale(d[self.xname])} )
                .attr("cy", function(d){return self.yAxisScale(d[self.yname])} )
                .attr("r", 5)
                .on("click", function(d, i) {
                    if (self.visu.getFiltered().length == 2)
                        return;
                    self.visu.removeDatapoint(i);
                })

        }

        Pallo.prototype.drawBty = visuGenerics.drawBty;

        Pallo.prototype.update = function() {
            var self = this;
            self.updateSvg();
            self.draw(); 
        }

        Pallo.prototype.init = function() {
            var self = this;
            self.setSvg();
            self.draw();
        }

        Pallo.prototype.draw = function() {
            var self = this;
            if (self.shouldDrawSquares) {
                self.drawSquares();
            }
            self.drawAxis();
            self.setDataUpdateRectangle();
            self.drawBty();
            self.drawRegressionLine();
            self.drawCircles();
            self.drawBottomLegend();
        }

        Pallo.prototype.cleanUp = function() {
            var self = this;
            try {
                self.svgObject.svgHandle.remove();
            } catch(e) {
            }
            self.svgObject = {};
        }

    return {
        Pallo: Pallo
    };
})
