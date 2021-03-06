define(["linalg", "optimize"], function(linalg, optimize) {
    var Ols = function(data, yname, xname, degree, initial) {
        var self = this;
        self.data = data;
        self.yname = yname;
        self.xname = xname;
        self.degree = degree;
        var x = linalg.onedimensionalDataToRowMatrixWithPolyBasis(self.data, self.xname, self.degree);
        var y = new linalg.RowMatrix(self.data.map( function(d) { return [d[self.yname]] }));
        if (typeof initial === 'undefined') {
            initial = new Array(self.degree+1);
            for (i = 0; i <= self.degree; i++) {
                initial[i] = [5];
            };
            initial = new linalg.RowMatrix(initial);
        }
        self.derivative = function(beta) {
            var xtx = x.transpose().multiply(x)
            var constfactor = x.transpose().multiply(y).scale(-1)
            return constfactor.add(xtx.multiply(beta)); 
        }
        self.target = function(beta) {
            var preds = x.multiply(beta).add(y.scale(-1))
            return (preds.transpose().multiply(preds)).values[0][0];
        }
        self.betaPath = optimize.gradientDescent(self.target, self.derivative, initial, 300);
        self.beta = self.betaPath[self.betaPath.length-1];
    }

    Ols.prototype.predict = function(d) {
        var self = this;
        var dm = linalg.onedimensionalDataToRowMatrixWithPolyBasis([d], self.xname, self.degree); 
        return dm.multiply(self.beta).values[0][0];
    }

    Ols.prototype.targetNumeric = function(a) {
        var beta = new linalg.RowMatrix([
            [a[0]],[a[1]]
        ]);
        return this.target(beta);
    }

    Ols.prototype.predictNumeric = function(x) {
        var self = this;
        var d = {};
        d[self.xname] = x;
        return self.predict(d);
    }


    Ols.prototype.incrementBeta1 = function(x) {
        var self = this;
        self.beta.values[1][0] += x;
    }

    Ols.prototype.incrementBeta0 = function(x) {
        var self = this;
        self.beta.values[0][0] += x;
    }

    Ols.prototype.totalSumOfSquares = function() {
        var self = this;
        return self.target(self.beta);
    }
    Ols.prototype.toString = function() {
        var self = this;
        var res = "y = ";
        for (i = 0; i < self.degree; i++) {
            res += Math.round(100*self.beta.values[self.degree-i][0])/100 + "*x^" + (i+1) + " + ";
        }
        res += Math.round(100*self.beta.values[0][0])/100;
        return res;
    }
    return {
        Ols: Ols
    };            
})
