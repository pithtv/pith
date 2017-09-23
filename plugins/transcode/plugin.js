function transcode(req, res, next) {

}

module.exports = {
    init(opts) {
        opts.pith.route.use("transcode", transcode);
    }
};