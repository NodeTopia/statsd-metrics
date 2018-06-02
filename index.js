const dgram = require('dgram');

class Metrics {
    constructor(config) {
        this.config = config;
        this.socket = dgram.createSocket(config.type || 'udp4');
        this.timmer = setInterval(this.flush.bind(this), config.flush || 1000)
        this.metrics = '';
    }

    close() {
        this.flush();
        clearInterval(this.timmer)
    }

    flush() {
        if (this.metrics.length === 0) {
            return;
        }
        let buf = Buffer.from(this.metrics, 'utf8');
        this.socket.send(buf, 0, buf.length, this.config.port, this.config.host);
        this.metrics = '';
    }

    append(string) {
        if (Buffer.byteLength(this.metrics, 'utf8') > (this.config.packet || 1432)) {
            this.flush();
        } else if (Buffer.byteLength(this.metrics + string, 'utf8') > (this.config.packet || 1432)) {
            this.flush();
        }
        this.metrics += string;
    }

    add(name, fn) {
        this[name] = fn.bind(this);
    }

}

module.exports = Metrics;