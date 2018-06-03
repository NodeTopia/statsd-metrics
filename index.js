const dgram = require('dgram');

class Metrics {
    constructor(config) {
        this.config = config;
        this.prefix = config.prefix || '';
        this.socket = dgram.createSocket(config.type || 'udp4');
        this.timmer = setInterval(this.flush.bind(this), config.flush || 1000)
        this.metrics = '';
    }

    close() {
        clearInterval(this.timmer)
        this.flush();
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

    timing(stat, val) {
        if (this.prefix === '') {
            this.append(`${stat}:${val}|ms\n`)
        } else {
            this.append(`${this.prefix}.${stat}:${val}|ms\n`)
        }
    }

    increment(stat, val) {
        if (this.prefix === '') {
            this.append(`${stat}:${val || 1}|c\n`)
        } else {
            this.append(`${this.prefix}.${stat}:${val || 1}|c\n`)
        }
    }

    inc(stat, val) {
        this.increment(stat, val)
    }

    decrement(stat, val) {
        if (this.prefix === '') {
            this.append(`${stat}:${-val || -1}|c\n`)
        } else {
            this.append(`${this.prefix}.${stat}:${-val || -1}|c\n`)
        }
    }

    dec(stat, val) {
        this.decrement(stat, val)
    }

    histogram(stat, val) {
        if (this.prefix === '') {
            this.append(`${stat}:${val}|h\n`)
        } else {
            this.append(`${this.prefix}.${stat}:${val}|h\n`)
        }
    }

    gauge(stat, val) {
        if (this.prefix === '') {
            this.append(`${stat}:${val}|g\n`)
        } else {
            this.append(`${this.prefix}.${stat}:${val}|g\n`)
        }
    }
}

module.exports = Metrics;