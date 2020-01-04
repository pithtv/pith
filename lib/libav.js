const spawn = require('child_process').spawn;

class AVConv {
    constructor(file) {
        this._opts = [];
        if(file) {
            this.input(file);
        }
    }

    options() {
        for(let x=0; x<arguments.length;x++) {
            this._opts.push(arguments[x]);
        }
        return this;
    }

    input(file) {
        return this.options("-i", file);
    }

    format(format) {
        return this.options("-f", format);
    }

    seekInput(time) {
        return this.inputOptions(["-ss", time]);
    }

    seekOutput(time) {
        return this.outputOptions(["-ss", time]);
    }

    duration(duration) {
        return this.options("-t", duration);
    }

    vframes(number) {
        return this.options("-vframes", number);
    }

    noAudio() {
        return this.options("-an");
    }

    audioCodec(codec) {
        return this.options("-acodec", codec);
    }

    videoCodec(codec) {
        return this.options("-vcodec", codec);
    }

    inputOptions(opts) {
        this._opts = opts.concat(this._opts);
        return this;
    }

    outputOptions(opts) {
        return this.options.apply(this, opts);
    }

    pipe(recipient) {
        const stream = this.stream();
        stream.pipe(recipient);
    }

    stream() {
        this.options("pipe:1");
        const child = spawn("avconv", this._opts, {stdio: ['ignore', 'pipe', 2]});
        return child.stdout;
    }
}

module.exports = {
    AVConv: AVConv
};
