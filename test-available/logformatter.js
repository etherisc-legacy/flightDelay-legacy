/**
 * Log Formatter for FlightDelay
 */

/* eslint no-console: 0 */

const winston = require('winston');
let logHash = [];

module.exports = function (web3) {
  this.web3 = web3;
  this.allEvents = [];

  this.padRight = function (s, len) {
    return (s + Array(len).join(' ')).slice(0, len);
  };

  this.reset = function () {
    logHash = [];
  };

  this.logger = new (winston.Logger)({
    transports: [
      new (winston.transports.Console)({
        level: 'info'
      }),
      new (winston.transports.File)({
        filename: 'ContractLogs.log',
        json: false,
        level: 'verbose',
        timestamp: function () {
          return new Date(Date.now()).toISOString();
        },
        formatter: options => options.timestamp() + ' ' + this.padRight(options.level.toUpperCase(), 10) + ' ' + (options.message ? options.message : '') + (options.meta && Object.keys(options.meta).length ? '\n\t' + JSON.stringify(options.meta) : ''),
      })
    ]
  });


  this.formatType = function (value, name, type) {
    if (type.slice(0, 4) == 'uint') {
      if (name.slice(0, 3) == 'eth')
        return web3.fromWei(value, 'ether').toNumber().toFixed(2);
      else if (name.slice(0, 4) == 'time')
        return new Date(value.toNumber() * 1000).toISOString();
      else
        return value.toNumber();

    } else if (type.slice(0, 3) == 'int') {
      return value.toNumber();

    } else if (type == 'bytes32') {

      if (name.slice(0, 3) == 'hex')
        return value;
      else
        return web3.toUtf8(value);

    } else return value;
  };

  this.logLine = function (key, value, level) {
    if (typeof level == 'undefined') level = 'info';
    this.logger.log(level, this.padRight(key, 30) + ': ', value);
  };

  this.emptyLine = function (count, level) {
    if (typeof level == 'undefined') level = 'info';
    for (var i = 0; i < count; i++) this.logger.log(level, '');
  };

  this.hrule = function (level) {
    if (typeof level == 'undefined') level = 'info';
    this.logger.log(level, Array(80).join('-'));
  };

  this.formatLog = function (abi, log) {

    var hash = web3.sha3(log.transactionHash + log.logIndex + log.blockNumber + log.event);
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

    var log_descriptor = abi.find(function (abi_element) {
      return abi_element.name == log.event;
    });
    if (typeof log_descriptor !== 'undefined') {
      for (var i in log_descriptor.inputs) {
        var input = log_descriptor.inputs[i];
        var key = input.name;
        var value = log.args[key];
        var type = input.type;
        this.logLine(key, this.formatType(value, key, type), 'verbose');
      }
    } else {
      this.logLine('OtherEvent', JSON.stringify(log.args), 'verbose');
    }

    return true;
  };
};
