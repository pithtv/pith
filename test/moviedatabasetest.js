var nodeunit = require('nodeunit');
var fs = require("fs");

var targetdb = process.cwd() + "/test.db";
var Tingodb = require("tingodb")();
var db;
var moviedb;

module.exports = {
    setUp: function(callback) {
        if(!fs.existsSync(targetdb)) {
            fs.mkdirSync(targetdb);
        }
        
        db = new Tingodb.Db(targetdb, {});
        db.dropDatabase(callback);
        moviedb = require("../plugins/movies/database.js")(db);
    },
    
    "Test actor getting": function(test) {
        var id;
        // test insert
        moviedb.getPerson("Newman, Paul", "actor", function(err, result) {
            test.equals("Newman, Paul", result.name);
            test.ok(result.actor);
            test.ok(!result.director);
            id = result._id.id;
            
            // test fetch of existing person
            moviedb.getPerson("Newman, Paul", "director", function(err, result) {
                test.ok(result.director);
                test.ok(result.actor);
                test.equals("Newman, Paul", result.name);
                test.equals(id, result._id.id);
                
                // test if previous fetch correctly stored director flag
                moviedb.getPerson("Newman, Paul", "producer", function(err, result) {
                    test.ok(result.director);
                    test.ok(result.actor);
                    test.ok(result.producer);
                    test.equals("Newman, Paul", result.name);
                    test.equals(id, result._id.id);
                    test.done();
                });
            });
        });
    }    
};