define(["d3", "graphics", "visuGenerics"], function(d3, graphics, visuGenerics) {

    var ParamspaceVisu = function(elementId, visu) {
        visuGenerics.Plot.call(this);
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
        this.drawData();
    }
    
    ParamspaceVisu.prototype.drawPath = function() {
        var self = this;
        var betas = this.visu.betaPath(); 

        var circleGroup = this.svgObject.svgContainer
            .append("g")
                .attr("class","gradientcircles")
            
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
                .attr("class","gradientpath")

        pathGroup.append("path")
            .attr("d",this.d3line(betas))
            .style("fill","none")
    }

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
                .attr("class","gradientpath")
        gradientgroup.append("path")
                .attr("d", this.d3line(linedata))
    }

    ParamspaceVisu.prototype.drawParamdot = function() {
        var params = this.visu.parameters();
        this.svgObject.svgContainer
            .append("g")
                .attr("class","gradientcircles")
            .append("circle")
                .attr("cx",this.xAxisScale(params.b0))
                .attr("cy",this.yAxisScale(params.b1))
                .attr("r",5);
    }

    var seq = function(start, end, n) {
        var length = end - start;
        var by = length/(n - 1)
        var res = new Array(n);
        for (i = 0; i < n; i++) {
            res[i] = start + i * by;
        }
        return res;
    }

    var zip = function(a, b) {
        var n = a.length;
        var res = new Array(n)
        for (var i = 0; i < n; i++) {
            res[i] = [a[i],b[i]];
        }
        return res;
    }

    var grid = function(a,b) {
        var n = a.length*b.length;
        var res = new Array(n);
        for (var i = 0; i < a.length; i++) {
            for (var j = 0; j < b.length; j++) {
                res[ i + j * a.length ] = [a[i], b[j] ];
            }
        }
        return res;
    }

    var swap = function(a, i, j) {
        var tmp = a[i];
        a[i] = a[j];
        a[j] = tmp;
    }

    /* index of nearest neighbor of x, ignoring first k data points */
    var linearSearchForIndex = function(data, x, k, dist) {
        if (typeof k === 'undefined')
            k = 0;
        var nearest = k;
        var smallestDistance = dist(x, data[k])
        for (var i = k + 1; i < data.length; i++) {
            var distance = dist(x, data[i]); 
            if (distance < smallestDistance) {
                nearest = i;
                smallestDistance = distance;
            }
        }
        return nearest;
    }

    var nnSort = function(a, dist) {
        for (var i = 0; i < a.length - 1; i++) {
            swap( a, i+1, linearSearchForIndex(a, a[i], i + 1, dist));
        }
    }
    
    var paramdist = function(x,y) {
        return (x.b0 - y.b0)*(x.b0 - y.b0) + (x.b1 - y.b1)*(x.b1 - y.b1);
    }

    /* naive implementation like this doesnt really work out in interactive use, pity */
    ParamspaceVisu.prototype.drawContours = function() {
        var self = this;
        var xdom = this.xAxisScale.domain();
        var ydom = this.yAxisScale.domain();
        var pointsOnAxis = 150;
        var ruudukko = grid(
            seq(xdom[0],xdom[1], pointsOnAxis),
            seq(ydom[0],ydom[1], pointsOnAxis)
        ).map(function(d) { 
            return {
                b0: d[0],
                b1: d[1],
                value: self.visu.target(d)
            };
        })
        var contour = ruudukko.filter( function(d) {
            return Math.abs(d.value - 0.25) < 0.0025
        })
        nnSort(contour, paramdist);
        var gradientgroup = this.svgObject.svgContainer
            .append("g")
                .attr("class","gradientpath")
        gradientgroup.append("path")
            .attr("d", this.d3line(contour))
                                        
    }

    ParamspaceVisu.prototype.drawData = function() {
        var self = this;
        var gradientgroup = this.svgObject.svgContainer
            .append("g")
                .attr("class","regressionline")       

        var points = this.visu.filtered.map( function(d) {
            return {
                a: d[self.visu.yname]/d[self.visu.xname],
                b: -(1/d[self.visu.xname])
            };
        }); 
        points.forEach( function(d) {
            var linedata = self.abline(d.a, d.b);
            gradientgroup.append("path")
                .attr("d", self.d3line(linedata))
        })
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

    return {
        ParamspaceVisu: ParamspaceVisu
    }
})
