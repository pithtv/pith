module.exports = function (grunt) {

    grunt.initConfig({
        manifest: {
            generate: {
                options: {
                    basePath: 'webui/',
                    verbose: true,
                    hash: true,
                    timestamp: false
                },
                src: [
                    '*/*.css',
                    '*/*.js',
                    '*/*.html',
                    '*/*.svg',
                    'index.html'
                ],
                dest: 'webui/manifest.appcache'
            }
        }
    });

    grunt.loadNpmTasks("grunt-manifest");

};
