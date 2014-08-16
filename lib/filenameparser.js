module.exports = function(fn) {
    var parts = fn.split(/\/+/g);
    while(parts.length > 0) {
        var f = parts.pop().match(/(.+)\W([0-9]{4})\W/);
        if(f) {
            var title = f[1].replace(/\W+/g, ' ');
            var year = parseInt(f[2]);
            
            if(title && year) {
                return {
                    title: title,
                    year: year
                };
            }
        }
    }
}