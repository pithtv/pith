var nodeunit = require('nodeunit');
var util = require('../lib/util');

module.exports = {
    "Test assign": function(test) {
        var target = {
            a: 1,
            b: {
                c: 2,
                d: 3,
                e: [4,5]
            }
        };

        var source = {
            a: 6,
            b: {
                c: 7,
                e: [9]
            },
            f: {
                d: 8
            }
        };

        util.assign(target, source);

        test.deepEqual(
            {
                a: 6,
                b: {
                    c: 7,
                    d: 3,
                    e: [9]
                },
                f: {
                    d: 8
                }
            },
            target
        );

        test.done();
    }
};