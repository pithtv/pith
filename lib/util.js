module.exports = {
    assign: function (target, sources) {
        for (var x = 1; x < arguments.length; x++) {
            var source = arguments[x];
            var keys = Object.getOwnPropertyNames(source);
            for (var y = 0, l = keys.length; y < l; y++) {
                var key = keys[y];
                var sourceValue = source[key];
                if (sourceValue !== null && sourceValue !== undefined && typeof sourceValue == 'object' && !Array.isArray(sourceValue)) {
                    target[key] = this.assign(target[key] || {}, sourceValue);
                } else {
                    target[key] = sourceValue;
                }
            }
        }
        return target;
    },

    wrapToPromise(func) {
        return new Promise((resolve, reject) => {
            func((err, result) => {
                if(err) reject(err);
                else resolve(result);
            });
        });
    }
};