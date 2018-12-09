const entities = require('entities');


function toXml(args) {
    if (typeof args === 'object') {
        return Object.entries(args).filter(([key, value]) => value !== undefined).map(([key, value]) => {
            if(Array.isArray(value)) {
                return value.map(v => `<${key}>${toXml(v)}</${key}>`).join('');
            }
            return `<${key}>${toXml(value)}</${key}>`;
        }).join('');
    } else if (typeof args === 'string') {
        return entities.encodeXML(args);
    } else {
        return args.toString();
    }
}

module.exports = {
    assign: function (target, sources) {
        for (let x = 1; x < arguments.length; x++) {
            const source = arguments[x];
            const keys = Object.getOwnPropertyNames(source);
            for (let y = 0, l = keys.length; y < l; y++) {
                const key = keys[y];
                const sourceValue = source[key];
                if (sourceValue !== null && sourceValue !== undefined && typeof sourceValue == 'object' && !Array.isArray(sourceValue)) {
                    target[key] = this.assign(target[key] || {}, sourceValue);
                } else {
                    target[key] = sourceValue;
                }
            }
        }
        return target;
    },

    parseDate(string) {
        if (!string) return string;
        return new Date(Date.parse(string));
    },

    toXml
};