define(["d3"], function(d3) {
    var ButtonHandler = function(elementId, checkboxValues, visu) {
        this.rootElement = d3.select(elementId);
        this.visu = visu;
        this.squareButton;
        this.checkboxValues = checkboxValues;
    }

    ButtonHandler.prototype.draw = function() {
        var self = this;
        var boxy = self.rootElement
            .selectAll("label").data(self.checkboxValues).enter()
            .append("div")
                .attr("class","checkbox")
        boxy.append("input")
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
    }

    return {
        ButtonHandler: ButtonHandler
    }
})
