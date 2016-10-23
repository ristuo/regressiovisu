define(["button","pallo"], function(button, pallo) {
    var RegressioVisu = function(elementId) {
        var self = this;
        this.data = [
            {
                raha: 0.8,
                joku: 0.95 
            },
            {
                raha: 0.4,
                joku: 0.7
            },
            {
                raha: 0.5,
                joku: 0.3
            },
            {
                raha: 0.6,
                joku: 0.75
            }
        ];
        this.btns = [
            {
                value: "squares", 
                selite: "Piirrä neliövirheet"
            }
        ];
        this.buttonHandler = new button.ButtonHandler(elementId, self.btns, self);
        this.pallovisu = new pallo.Pallo(elementId, this.data, "raha", "joku");
    }
    RegressioVisu.prototype.init = function() {
        this.buttonHandler.draw();
        this.pallovisu.init();
    };  
    RegressioVisu.prototype.btnCallback = function(value, checked) {
        if (value == "squares") {
            if (!checked)
                this.pallovisu.removeSquares();
            else
                this.pallovisu.addSquares();
        }
    }
    return {
        RegressioVisu: RegressioVisu
    }
})
