var settings = {
    containers: [
    {
        channel: 'files',
        containerId: 'Movies HD',
        oneFolderPerMovie: true
    }
    ],
    
    scanInterval: 30 * 60 * 1000
};

function MoviesChannel(pithApp) {
    this.pithApp = pithApp;
    this.movies = pithApp.db.collection("movies");
}

MoviesChannel.prototype = {
    scan: function() {
        var channel = this;
        
        settings.containers.forEach(function(container) {
            var channelInstance = channel.pithApp.getChannelInstance(container.channel);
            
            function listContents(containerId) {
                channelInstance.listContents(container.containerId, function(contents) {
                    contents.forEach(function(item) {
                       if(item.type == 'directory') {
                           listContents(item.id);
                       } else if(item.playable) {
                           
                       }
                    });
                });
            }
        });
        this.pithApp.getChannelInstance;
    }
};

module.exports.plugin = function() {
    return {
        init: function(opts) {
            opts.pith.registerChannel({
                id: 'movies',
                title: 'Movies',
                type: 'channel',
                init: function(opts) {
                    return new MoviesChannel(opts.pith);
                },
                sequence: 1
            });
        }
    };
};