define(["d3", "graphics", "lm"], function(d3, graphics, lm) {
    var Pallo = function(elementId, data, xname, yname) {
        var self = this;
        this.xname = xname;
        this.yname = yname;
        this.data = data;
        this.filtered = data;
        this.elementId = elementId;
        this.shouldDrawSquares = true;
        this.modelDegree = 1;
        this.xAxisScale;
        this.yAxisScale;
        this.model;
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

    Pallo.prototype.updateDegree = function(degree) {
        var self = this; 
        self.modelDegree = degree;
        self.update();
    }

    Pallo.prototype.updateMappings = function() {
        var self = this;
        self.updateModel();
        self.updateAxisScales();
    }

    Pallo.prototype.updateModel = function() {
        var self = this;
        self.model = new lm.Ols(self.filtered, self.yname, self.xname, self.modelDegree);
    }

    Pallo.prototype.addKeyListener = function() {
        var self = this;
        d3.select("body")
            .on("keydown", function() {
                if (self.modelDegree == 1) {
                    var keycode = d3.event.keyCode;
                    if (keycode === 38) {
                        self.model.incrementBeta1(0.1);
                    } else if (keycode === 40) {
                        self.model.incrementBeta1(-0.1);
                    } else if (keycode === 37) {
                        self.model.incrementBeta0(0.1);
                    } else if (keycode === 39) {
                        self.model.incrementBeta0(-0.1);
                    }
                    self.cleanUp();
                    self.updateSvg();
                    self.draw();
                }
            })
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
            .innerTickSize(-self.svgObject.height);

        self.yAxis = d3.svg.axis().scale(self.yAxisScale)
            .orient("left")
            .tickPadding(10)
            .outerTickSize(0)
            .innerTickSize(-self.svgObject.width);

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
            .text(function() { return "Regressiomalli " + self.model.toString() + ", neliösumma: " + Math.round(1000*self.model.totalSumOfSquares())/1000})
    }

    Pallo.prototype.setSvg = function() {
        var self = this;
        self.svgObject = graphics.getSvg(self.elementId);
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
                self.filtered = self.filtered.concat([newobs]);
                self.update();
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
                .data(self.filtered).enter()
                .append("rect")
                    .attr("x", function(d,i) {
                        var dist = d[self.yname] - self.model.predict(d);
                        if (dist > 0) 
                            return self.xAxisScale(d[self.xname] - dist);
                        return self.xAxisScale(d[self.xname]);
                    })
                    .attr("y", function(d) {
                        var dist = d[self.yname] - self.model.predict(d);
                        if (dist > 0) {
                            return self.yAxisScale(d[self.yname]);
                        }
                        return self.yAxisScale(self.model.predict(d)); 
                    })
                    .attr("width", function(d) {
                        var dist = Math.abs(d[self.yname] - self.model.predict(d));
                        return self.xAxisScale(dist);
                    })
                    .attr("height", function(d) {
                        var dist = Math.abs(d[self.yname] - self.model.predict(d));
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
                    y: self.model.predictNumeric(x)
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
                .data(self.filtered)

            self.circles.exit().remove();

            self.circles.enter().append("circle") 
                .attr("cx", function(d){return self.xAxisScale(d[self.xname])} )
                .attr("cy", function(d){return self.yAxisScale(d[self.yname])} )
                .attr("r", 5)
                .on("click", function(d, i) {
                    if (self.filtered.length == 2)
                        return;
                    self.filtered = self.filtered.slice(0,i).concat(self.filtered.slice(i+1,self.filtered.length));
                    self.update();
                })

        }

        Pallo.prototype.drawBty = function() {
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

        Pallo.prototype.update = function() {
            var self = this;
            self.updateSvg();
            self.updateMappings();
            self.draw(); 
        }

        Pallo.prototype.init = function() {
            var self = this;
            self.setSvg();
            self.updateMappings();
            self.draw();
            self.addKeyListener();
        }

        Pallo.prototype.draw = function() {
            var self = this;
            self.drawAxis();
            self.setDataUpdateRectangle();
            self.drawBty();
            self.drawRegressionLine();
            if (self.shouldDrawSquares) {
                self.drawSquares();
            }
            self.drawCircles();
            self.drawBottomLegend();
        }

        Pallo.prototype.empty = function() {
            this.filtered = this.data;
            this.update();
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
