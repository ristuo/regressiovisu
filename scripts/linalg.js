define([], function() {
    var RowMatrix = function(values) {
        this.values = values;
        this.nrows = values.length;
        this.ncols = values[0].length;
    }

    RowMatrix.prototype.copy = function() {
        return new RowMatrix(this.values);
    }

    RowMatrix.prototype.transpose = function() {
        var nrows = this.ncols;
        var ncols = this.nrows;
        var values = new Array(nrows);
        for (i = 0; i < nrows; i++) {
            values[i] = new Array(ncols);
            for (j = 0; j < ncols; j++) 
                values[i][j] = this.values[j][i];
        }
        return new RowMatrix(values);
    }
    
    RowMatrix.prototype.normalize = function() {
        var colMeans = new Array(this.ncols);
        for (j = 0; j < this.ncols; j++) {
            var sum = 0;
            for (i = 0; i < this.nrows; i++) {
                sum += this.values[i][j];
            }
            colMeans[j] = sum/this.nrows;
        }

        var colSds = new Array(this.ncols);
        for (j = 0; j < this.ncols; j++) {
            var sum = 0;
            for (i = 0; i < this.nrows; i++) {
                var d = this.values[i][j] - colMeans[j]
                sum += d*d 
            }
            colSds[j] = sum/(this.nrows-1);
        }

        var res = new Array(this.rows);
        for (i = 0; i < this.nrows; i++) {
            res[i] = new Array(this.ncols);
            for (j = 0; j < this.ncols; j++) {
                res[i][j] = (this.values[i][j] - colMeans[j]) / colSds[j] 
            }
        }
        for (i = 0; i < this.nrows; i++)
            res[i][0] = 1;
        return new RowMatrix(res);
    }

    RowMatrix.prototype.toString = function() {
        res = "";
        for (i = 0; i < this.nrows; i++) {
            res += "[";
            var j = 0;
            while (j < this.ncols - 1) {
                res += this.values[i][j] + ","
                j++;
            }
            res += this.values[i][j] + "]\n";
        }
        return res;
    }

    RowMatrix.prototype.scale = function(c) {
        var values = new Array(this.nrows);
        for (i = 0; i < this.nrows; i++) {
            values[i] = new Array(this.ncols);
            for (j = 0; j < this.ncols; j++) {
                values[i][j] = this.values[i][j]*c;
            }
        }
        return new RowMatrix(values);
    }

    RowMatrix.prototype.add = function(b) {
        if (b.ncols != this.ncols)
            throw "Different number of columns in adding, " + b.ncols + " != " + this.ncols;
        if (b.nrows != this.nrows)
            throw "Different number of rows in adding, " + b.nrows + " != " + this.nrows;
       
        var values = new Array(this.nrows); 
        for (i = 0; i < this.nrows; i++) {
            values[i] = new Array(this.ncols);
            for (j = 0; j < this.ncols; j++) {
                values[i][j] = this.values[i][j] + b.values[i][j];
            }
        }
        return new RowMatrix(values);
    }

    RowMatrix.prototype.multiply = function(bmatrix) {
        if (bmatrix.nrows != this.ncols) {
            throw "Incompatible dimensions, " + bmatrix.nrows + " != " + this.ncols;
        }
        var resultNRows = this.nrows; 
        var resultNCols = bmatrix.ncols;
        var resvals = new Array(resultNRows);
        var a = this.values;
        var b = bmatrix.values;
        for (i = 0; i < resultNRows; i++) {
            resvals[i] = new Array(resultNCols);
            for (j = 0; j < resultNCols; j++) {
                var sum = 0;
                for (k = 0; k < bmatrix.nrows; k++) {
                    sum += a[i][k] * b[k][j];
                }
                resvals[i][j] = sum;
            }
        }
        return new RowMatrix(resvals);
    }

    var dataToRowMatrix = function(data, names) {
        var values = data.map(function(d) {
            var res = new Array(names.length);
            for (i = 0; i < names.length; i++) {
                res[i] = d[names[i]];
            }
            return res;
        });
        return new this.RowMatrix(values);
    };

    var dataToRowMatrixWithOnes = function(data, names) {
        var values = data.map(function(d) {
            var res = new Array(names.length + 1);
            res[0] = 1;
            for (i = 0; i < names.length; i++) {
                res[i + 1] = d[names[i]];
            }
            return res;
        });
        return new this.RowMatrix(values);
    };

    var onedimensionalDataToRowMatrixWithPolyBasis = function(data, name, degree) {
        var values = data.map(function(d) {
            var x = d[name];
            var res = new Array(1 + degree);
            for (i = 0; i <= degree; i++) {
                res[i] = Math.pow(x,i);
            }
            return res;
        })
        return new this.RowMatrix(values);
    };

    return {
        RowMatrix: RowMatrix,
        dataToRowMatrix: dataToRowMatrix,
        dataToRowMatrixWithOnes: dataToRowMatrixWithOnes,
        onedimensionalDataToRowMatrixWithPolyBasis: onedimensionalDataToRowMatrixWithPolyBasis
    }
})
