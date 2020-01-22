const test = require('ava');
const util = require('../src/lib/util');

test("Test assign", function (test) {
    var target = {
        a: 1,
        b: {
            c: 2,
            d: 3,
            e: [4, 5]
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
});

test("Test XML", function (test) {
    test.is('<xbmc:artwork type="fanart">http://1</xbmc:artwork><xbmc:artwork type="poster">http://2</xbmc:artwork><xbmc:userrating>0</xbmc:userrating><xbmc:dateadded>2009-03-19</xbmc:dateadded><somethingelse><test>1</test></somethingelse>', util.toXml({
        "xbmc:artwork": [
            {
                _attribs: {type: 'fanart'},
                _value: "http://1"
            },
            {
                _attribs: {type: 'poster'},
                _value: "http://2"
            }
        ],
        "xbmc:userrating": 0,
        "xbmc:dateadded": "2009-03-19",
        "somethingelse": {
            test: 1
        },
        "ignored": undefined
    }));
});
