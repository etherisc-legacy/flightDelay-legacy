/**
 * Log Formatter for FlightDelay
 */

const winston = require('winston');

let logHash = [];

module.exports = function logformatter(web3) {
    this.web3 = web3;
    this.allEvents = [];

    this.padRight = (s, len) =>
        (s + Array(len).join(' ')).slice(0, len);

    this.reset = () => {
        logHash = [];
    };

    this.logger = new (winston.Logger)({
        transports: [
            new (winston.transports.Console)({
                level: 'info',
            }),
            new (winston.transports.File)({
                filename: 'ContractLogs.log',
                json: false,
                level: 'verbose',
                timestamp: () => new Date(Date.now()).toISOString(),
                formatter: options => `${options.timestamp()} ${this.padRight(options.level.toUpperCase(), 10)} ${(options.message ? options.message : '')}${(options.meta && Object.keys(options.meta).length ? `\n\t${JSON.stringify(options.meta)}` : '')}`,
            }),
        ],
    });


    this.formatType = (value, name, type) => {
        if (type.slice(0, 4) === 'uint') {
            if (name.slice(0, 3) === 'eth') {
                return web3.fromWei(value, 'ether').toNumber().toFixed(2);
            } else if (name.slice(0, 4) === 'time') {
                return new Date(value.toNumber() * 1000).toISOString();
            }
            return value.toNumber();
        } else if (type.slice(0, 3) === 'int') {
            return value.toNumber();
        } else if (type === 'bytes32') {
            if (name.slice(0, 3) === 'hex') {
                return value;
            }
            return web3.toUtf8(value);
        }
        return value;
    };

    this.logLine = (key, value, level) =>
        this.logger.log(level || 'info', `${this.padRight(key, 30)}: `, value);

    this.emptyLine = (count, level) => {
        for (let i = 0; i < count; i += 1) {
            this.logger.log(level || 'info', '');
        }
    };

    this.hrule = level =>
        this.logger.log(level || 'info', Array(80).join('-'));

    this.formatLog = (abi, log) => {
        const hash = web3.sha3(log.transactionHash + log.logIndex + log.blockNumber + log.event);
        if (logHash.indexOf(hash) !== -1) {
            this.logLine('Double', log.event, 'verbose');
            return false;
        }

        logHash.push(hash);

        this.hrule('verbose');
        this.logLine('Event', log.event, 'info');
        this.logLine('TxHash', log.transactionHash, 'verbose');
        this.logLine('LogIndex', log.logIndex, 'verbose');
        this.logLine('Block', log.blockNumber, 'verbose');
        this.logLine('Address', log.address, 'verbose');
        this.hrule('verbose');

        const logDescriptor = abi.find(abiElement => abiElement.name === log.event);
        if (typeof logDescriptor !== 'undefined') {
            for (let i = 0; i < logDescriptor.inputs.length; i += 1) {
                const input = logDescriptor.inputs[i];
                const key = input.name;
                const value = log.args[key];
                const type = input.type;
                this.logLine(key, this.formatType(value, key, type), 'verbose');
            }
        } else {
            this.logLine('OtherEvent', JSON.stringify(log.args), 'verbose');
        }

        return true;
    };
};
