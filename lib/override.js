module.exports = function(object, override) {
    var $super = {};
    for(var x in object) {
        if(typeof object[x] === 'function') {
            $super[x] = object[x].bind(object);
        }
    }

    var overrides = override.apply(object, [$super, object]);

    for(var x in overrides) {
        object[x] = overrides[x];
    }

    return object;
};