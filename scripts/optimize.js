define([], function() {
    var stepsize = function(betak_0, betak_1, derivative) { 
        var sk = betak_1.add(betak_0.scale(-1));
        var yk = derivative(betak_1).add(derivative(betak_0).scale(-1))
        var nomin = (sk.transpose().multiply(sk)).values[0][0];
        var denom = (sk.transpose().multiply(yk)).values[0][0];
        var res = nomin/denom;
        var fallback = 0.00000001; 
        if (isNaN(res)) 
            return fallback;
        return Math.max(res, fallback);
    };
    var gradientDescent = function(target, derivative, initial, maxIter) {
        var betak_0 = initial.copy();
        var betak_1 = betak_0.add(derivative(betak_0).scale(0.00001*(-1)));
        var i = 0;
        var betas = "";
        while (i++ < maxIter) {
            var mu = stepsize(betak_0, betak_1, derivative);
            betak_0 = betak_1;
            betak_1 = betak_1.add(derivative(betak_1).scale(mu*(-1)));
            if (Math.abs(target(betak_0) - target(betak_1)) < 0.00001) {
                console.log("took " + i + " iterations")
                return betak_1;
            }
        } 
        console.log("took " + i + " iterations")
        return betak_1;
    } 
    return {
        gradientDescent: gradientDescent
    }
})
