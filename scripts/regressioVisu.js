define(["button","pallo", "lm", "paramspacevis"], function(button, pallo, lm, paramspacevis) {
    var RegressioVisu = function(palloElementId, paramElementId) {
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
        this.filtered = this.data;
        this.xname = "raha";
        this.yname = "joku";
        this.modelDegree = 1;
        this.filtered = this.data;
        this.model = new lm.Ols(self.filtered, self.yname, self.xname, self.modelDegree);
        this.buttonHandler = new button.ButtonHandler(palloElementId, self.btns, self);
        this.pallovisu = new pallo.Pallo(palloElementId, "raha", "joku", this);
        this.paramspaceVisu = new paramspacevis.ParamspaceVisu(paramElementId, this);
        console.log(this.pallovisu);
    }
    RegressioVisu.prototype.init = function() {
        this.buttonHandler.draw();
        this.pallovisu.init();
        this.paramspaceVisu.init();
        this.addKeyListener();
    };  
    
    RegressioVisu.prototype.update = function(shouldPlotPath) {
        this.pallovisu.update();
        this.paramspaceVisu.update(shouldPlotPath);
    }

    RegressioVisu.prototype.betaPath = function() {
        return this.model.betaPath.map( function(d) {
            var vals = d.values;
            return {
                b0: vals[0][0],
                b1: vals[1][0]
            };
        });
    }

    RegressioVisu.prototype.optimalButtonCallback = function() {
        this.updateModel(this.model.beta);
        this.update(true); 
    };

    RegressioVisu.prototype.emptyButtonCallback = function() {
        this.restoreData();
        this.updateModel();
        this.update(); 
    }

    RegressioVisu.prototype.updateModel = function(startingPoint) {
        var self = this;
        self.model = new lm.Ols(self.filtered, self.yname, self.xname, 1, startingPoint);
    }

    RegressioVisu.prototype.btnCallback = function(value, checked) {
        if (value == "squares") {
            if (!checked)
                this.pallovisu.removeSquares();
            else
                this.pallovisu.addSquares();
        }
    }

    RegressioVisu.prototype.prediction = function(x) {
        return this.model.predict(x);
    }

    RegressioVisu.prototype.parameters = function() {
        var vals = this.model.beta.values;
        return {
            b0: vals[0][0], 
            b1: vals[1][0]
        };
    }

    RegressioVisu.prototype.printModel = function() {
        return this.model.toString();
    }

    RegressioVisu.prototype.printSS = function() {
        return Math.round(1000*this.model.totalSumOfSquares())/1000;
    }

    RegressioVisu.prototype.numPrediction = function(x) {
        return this.model.predictNumeric(x);
    }
    
    RegressioVisu.prototype.getFiltered = function() {
        return this.filtered;
    }

    RegressioVisu.prototype.restoreData = function() {
        this.filtered = this.data;
    }

    RegressioVisu.prototype.addDatapoint = function(d) {
        this.filtered = this.filtered.concat([d]);
        this.update();
    }

    RegressioVisu.prototype.removeDatapoint = function(i) {
        this.filtered = this.filtered.slice(0,i).concat(this.filtered.slice(i+1,this.filtered.length));
        this.update();
    }

    RegressioVisu.prototype.addKeyListener = function() {
        var self = this;
        d3.select("body")
            .on("keydown", function() {
                if (self.modelDegree == 1) {
                    var keycode = d3.event.keyCode;
                    if (keycode === 87) {
                        self.model.incrementBeta1(0.1);
                    } else if (keycode === 83) {
                        self.model.incrementBeta1(-0.1);
                    } else if (keycode === 68) {
                        self.model.incrementBeta0(0.1);
                    } else if (keycode === 65) {
                        self.model.incrementBeta0(-0.1);
                    }
                    self.update();
                }
            })
    }

    
    RegressioVisu.prototype.gradient = function() {
        var vals = this.model.derivative(this.model.beta).values;
        return {
            b0: vals[0][0], 
            b1: vals[1][0]
        };
    }

    return {
        RegressioVisu: RegressioVisu
    }
})
