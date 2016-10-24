define(["d3"], function(d3) {
    var ButtonHandler = function(elementId, checkboxValues, visu) {
        this.rootElement = d3.select(elementId)
            .append("div")
            .attr("class","row")
        this.visu = visu;
        this.squareButton;
        this.optimalButton;
        this.checkboxValues = checkboxValues;
    }

    ButtonHandler.prototype.draw = function() {
        var self = this;
        self.drawSquare();
        self.drawBtn("Optimoi suora", "optimalButtonCallback");
        self.drawBtn("Alkuun", "emptyButtonCallback");
    }

    ButtonHandler.prototype.drawBtn = function(name, callbackName) {
        var self = this;
        var btn = self.rootElement
            .append("div")
            .attr("class","col-md-3")
            .append("button")
                .attr("class","btn btn-default")
                .attr("aria-label","Left Align")
            .text(name)
            .on("click", function() {
                (self.visu[callbackName])();
            });
    }


    ButtonHandler.prototype.drawSquare = function() {
        var self = this;
        var boxy = self.rootElement
            .append("div")
            .attr("class","col-md-4")
            .selectAll("label").data(self.checkboxValues).enter()
            .append("div")
                .attr("class","checkbox")
        var input = boxy.append("input")
            .attr("type", "checkbox")
            .attr("name", function(d) { return d.value })
            .attr("value", function(d) { return d.value })
            .on("click", function() { 
                var box = d3.select(this);
                var value = box.property("value")
                var checked = box.property("checked")
                self.visu.btnCallback(value, checked) 
            })
        boxy.append("label")
            .text(function(d) { return d.selite })
        self.squareButton = boxy;
        input.property("checked", true);
    }

    return {
        ButtonHandler: ButtonHandler
    }
})
