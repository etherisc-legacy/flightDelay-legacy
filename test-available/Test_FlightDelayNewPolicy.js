/**
 * Unit tests for FlightDelayNewPolicy
 *
 * @author Christoph Mussenbrock
 * @description t.b.d
 * @copyright (c) 2017 etherisc GmbH
 * 
 */

/* eslint no-undef: 0 */
/* eslint no-unused-vars: 0 */
/* eslint no-console: 0 */

var logformatter = require('./logformatter.js');
var lf = undefined;
var EventEmitter = require('events');

var FlightDelayAccessController = artifacts.require('FlightDelayAccessController');
var FlightDelayController = artifacts.require('FlightDelayController');
var FlightDelayDatabase = artifacts.require('FlightDelayDatabase');
var FlightDelayLedger = artifacts.require('FlightDelayLedger');
var FlightDelayNewPolicy = artifacts.require('FlightDelayNewPolicy');
var FlightDelayUnderwrite = artifacts.require('FlightDelayUnderwrite');
var FlightDelayPayout = artifacts.require('FlightDelayPayout');

contract('FlightDelayNewPolicy', function(accounts) {

	var EE = new EventEmitter();
	var lastState = undefined;
	var timeout = undefined;
	var shouldDoSomething = '';

	var testone = function(args) {

		return (function() {

			if (lf == undefined) lf = new logformatter(web3);

			var allEvents = [];
			var flightNumber = args.flightNumber;
			var instances = {};

			var logWatcher = function(contract) {

				var allEv = contract.allEvents();
				allEvents.push(allEv);
				allEv.watch(function(err, log) {

					if (lf.formatLog(contract.abi, log)) EE.emit('logEvent', log);

				});
			};


			var cleanup = function(message, success) {
				lf.logLine('Cleanup', message, 'info');
				for (var elem in allEvents) {
					allEvents[elem].stopWatching();
				}
				clearTimeout(timeout);
				EE.removeAllListeners('logEvent');
				return success;
			};

			lf.reset();
			lf.logLine('Testing', args.shouldDoSomething, 'info');

			return FlightDelayAccessController.deployed()
				.then(function(instance) {
					instances.AC = instance;
					logWatcher(instance);
					return FlightDelayDatabase.deployed();
				})
				.then(function(instance) {
					instances.DB = instance;
					logWatcher(instance);
					return FlightDelayLedger.deployed();
				})
				.then(function(instance) {
					instances.LG = instance;
					logWatcher(instance);
					return FlightDelayNewPolicy.deployed();
				})
				.then(function(instance) {
					instances.NP = instance;
					logWatcher(instance);
					return FlightDelayUnderwrite.deployed();
				})
				.then(function(instance) {
					instances.UW = instance;
					logWatcher(instance);
					return FlightDelayPayout.deployed();
				})
				.then(function(instance) {

					instances.PY = instance;
					logWatcher(instance);

					lf.emptyLine(10, 'verbose');

					lf.logLine('AccessController Address: ', instances.AC.address, 'verbose');
					lf.logLine('Database         Address: ', instances.DB.address, 'verbose');
					lf.logLine('Ledger           Address: ', instances.LG.address, 'verbose');
					lf.logLine('NewPolicy        Address: ', instances.NP.address, 'verbose');
					lf.logLine('Underwrite       Address: ', instances.UW.address, 'verbose');
					lf.logLine('Payout           Address: ', instances.PY.address, 'verbose');

					/* API-Test mockup:
					flightNumber == '20'  // no delay
					flightNumber == '21'  // 15-29 min. delay
					flightNumber == '22'  // 30-44 min. delay
					flightNumber == '23'  // >= 45 min. delay
					flightNumber == '24'  // cancelled
					flightNumber == '25'  // diverted
					flightNumber == '26'  // never landing
					flightNumber == '27'  // invalid status
					flightNumber == '30'	// empty result
					flightNumber == '31'  // invalid result
					flightNumber == '32'	// too few observations
					*/

					var now = new Date(Date.now());
					var carrierFlightNumber = 'AF/' + flightNumber;
					var departureYearMonthDay = '/dep/' + now.toISOString().replace(/\-/g, '/').slice(0, 10);

					var departureTime = now.valueOf() / 1000 + 60;
					var arrivalTime = now.valueOf() / 1000 + 90; // departureTime + 60; // * 60 * 24;

					return instances.NP.newPolicy(
						carrierFlightNumber,
						departureYearMonthDay,
						departureTime,
						arrivalTime, {
							from: accounts[3],
							gas: 4700000,
							value: web3.toWei(1234, 'finney')
						}
					);

				}).then(function(tx) {
					return new Promise(function(resolve, reject) {

						timeout = setTimeout(args.timeoutHandler(resolve, reject), args.timeout_value);
						EE.on('logEvent', args.logHandler(resolve, reject));

					});
				}).then(function(result) {
					return cleanup(result, true);
				}).catch(function(error) {
					return cleanup(error, false);
				});
		});

	};

	/*
	
		Here are the testcases.

	 */
	shouldDoSomething = 'should process #20 - flight <15 min delay (no payout)';
	it(shouldDoSomething, testone({
		flightNumber: '20',
		shouldDoSomething: shouldDoSomething,
		timeoutHandler: function(reject, resolve) {
			return (function() {
				lf.logLine('running into timeout', '', 'info');
				reject('Shit! we got stuck.');
			});
		},
		timeout_value: 50000,
		logHandler: function(reject, resolve) {

			return (function (log) {
				if (log.event == 'LOG_SetState') {
					lastState = web3.toUtf8(log.args._stateMessage);
					lf.logLine('SetState', lastState, 'info');
				}
				if (lastState == 'Expired - no delay!') {
					resolve('Hurray - ' + lastState);
				}

			});
		}
	}));


	shouldDoSomething = 'should process #21 - flight > 15 <= 30min. delay';
	it(shouldDoSomething, testone({
		flightNumber: '21',
		shouldDoSomething: shouldDoSomething,
		timeoutHandler: function(reject, resolve) {
			return (function() {
				lf.logLine('running into timeout', '', 'info');
				reject('Shit! we got stuck.');
			});
		},
		timeout_value: 50000,
		logHandler: function(reject, resolve) {

			return (function (log) {
				if (log.event == 'LOG_SetState') {
					lastState = web3.toUtf8(log.args._stateMessage);
					lf.logLine('SetState', lastState, 'info');
				}
				if (log.event == 'LOG_SendFunds') {
					if (lastState == 'Payout successful!') {
						resolve('Hurray - ' + lastState);
					} else {
						reject('Wrong State for payout');
					}
				}
			});
		}
	}));

	shouldDoSomething = 'should process #22 - flight > 30 <= 45 delay';
	it(shouldDoSomething, testone({
		flightNumber: '22',
		shouldDoSomething: shouldDoSomething,
		timeoutHandler: function(reject, resolve) {
			return (function() {
				lf.logLine('running into timeout', '', 'info');
				reject('Shit! we got stuck.');
			});
		},
		timeout_value: 50000,
		logHandler: function(reject, resolve) {

			return (function (log) {
				if (log.event == 'LOG_SetState') {
					lastState = web3.toUtf8(log.args._stateMessage);
					lf.logLine('SetState', lastState, 'info');
				}
				if (log.event == 'LOG_SendFunds') {
					if (lastState == 'Payout successful!') {
						resolve('Hurray - ' + lastState);
					} else {
						reject('Wrong State for payout');
					}
				}
			});
		}
	}));

	shouldDoSomething = 'should process #23 - flight > 30 <= 45min. delay';
	it(shouldDoSomething, testone({
		flightNumber: '23',
		shouldDoSomething: shouldDoSomething,
		timeoutHandler: function(reject, resolve) {
			return (function() {
				lf.logLine('running into timeout', '', 'info');
				reject('Shit! we got stuck.');
			});
		},
		timeout_value: 50000,
		logHandler: function(reject, resolve) {

			return (function (log) {
				if (log.event == 'LOG_SetState') {
					lastState = web3.toUtf8(log.args._stateMessage);
					lf.logLine('SetState', lastState, 'info');
				}
				if (log.event == 'LOG_SendFunds') {
					if (lastState == 'Payout successful!') {
						resolve('Hurray - ' + lastState);
					} else {
						reject('Wrong State for payout');
					}
				}
			});
		}
	}));

	shouldDoSomething = 'should process #24 - flight cancelled';
	it(shouldDoSomething, testone({
		flightNumber: '24',
		shouldDoSomething: shouldDoSomething,
		timeoutHandler: function(reject, resolve) {
			return (function() {
				reject('Shit! we got stuck.');
			});
		},
		timeout_value: 50000,
		logHandler: function(reject, resolve) {

			return (function (log) {
				if (log.event == 'LOG_SetState') {
					lastState = web3.toUtf8(log.args._stateMessage);
					lf.logLine('SetState', lastState, 'info');
				}
				if (log.event == 'LOG_SendFunds') {
					if (lastState == 'Payout successful!') {
						resolve('Hurray - ' + lastState );
					} else {
						reject('Wrong State for payout');
					}
				}
			});
		}
	}));

	shouldDoSomething = 'should process #25 - flight diverted';
	it(shouldDoSomething, testone({
		flightNumber: '25',
		shouldDoSomething: shouldDoSomething,
		timeoutHandler: function(reject, resolve) {
			return (function() {
				reject('Shit! we got stuck.');
			});
		},
		timeout_value: 50000,
		logHandler: function(reject, resolve) {

			return (function (log) {
				if (log.event == 'LOG_SetState') {
					lastState = web3.toUtf8(log.args._stateMessage);
					lf.logLine('SetState', lastState, 'info');
				}
				if (log.event == 'LOG_SendFunds') {
					if (lastState == 'Payout successful!') {
						resolve('Hurray - ' + lastState);
					} else {
						reject('Wrong State for payout');
					}
				}
			});
		}
	}));

	shouldDoSomething = 'should process #26 - flight never landing.should go on Manual payout.';
	it(shouldDoSomething, testone({
		flightNumber: '26',
		shouldDoSomething: shouldDoSomething,
		timeoutHandler: function(reject, resolve) {
			return (function() {
				resolve('OK - #26 should run in timeout, Manual payout.');
			});
		},
		timeout_value: 50000,
		logHandler: function(reject, resolve) {

			return (function (log) {
				if (log.event == 'LOG_SetState') {
					lastState = web3.toUtf8(log.args._stateMessage);
					lf.logLine('SetState', lastState, 'info');
				} else if (log.event == 'LOG_SendFunds') {
					reject('#26 should never payout.');
				}
			});
		}
	}));

	shouldDoSomething = 'should process #27 - invalid status from oracle';
	it(shouldDoSomething, testone({
		flightNumber: '27',
		shouldDoSomething: shouldDoSomething,
		timeoutHandler: function(reject, resolve) {
			return (function() {
				resolve('OK - #27 should run in timeout, Manual payout.');
			});
		},
		timeout_value: 50000,
		logHandler: function(reject, resolve) {

			return (function (log) {
				if (log.event == 'LOG_SetState') {
					lastState = web3.toUtf8(log.args._stateMessage);
					lf.logLine('SetState', lastState, 'info');
				} else if (log.event == 'LOG_SendFunds') {
					reject('#27 should never payout.');
				} else if (log.event == 'LOG_PolicyDeclined') {
					resolve('Hurray - ' + lastState);
				}
			});
		}
	}));

	shouldDoSomething = 'should process #30 - empty result from oracle';
	it(shouldDoSomething, testone({
		flightNumber: '30',
		shouldDoSomething: shouldDoSomething,
		timeoutHandler: function(reject, resolve) {
			return (function() {
				reject('Shit! we got stuck.');
			});
		},
		timeout_value: 50000,
		logHandler: function(reject, resolve) {

			return (function (log) {
				if (log.event == 'LOG_SetState') {
					lastState = web3.toUtf8(log.args._stateMessage);
					lf.logLine('SetState', lastState, 'info');
				} else if (log.event == 'LOG_SendFunds') {
					reject('#27 should never payout.');
				} else if (log.event == 'LOG_PolicyDeclined') {
					resolve('Hurray - ' + lastState);
				}
			});
		}
	}));

	shouldDoSomething = 'should process #31 - invalid result from oracle';
	it(shouldDoSomething, testone({
		flightNumber: '31',
		shouldDoSomething: shouldDoSomething,
		timeoutHandler: function(reject, resolve) {
			return (function() {
				reject('Shit! we got stuck.');
			});
		},
		timeout_value: 50000,
		logHandler: function(reject, resolve) {

			return (function (log) {
				if (log.event == 'LOG_SetState') {
					lastState = web3.toUtf8(log.args._stateMessage);
					lf.logLine('SetState', lastState, 'info');
				} else if (log.event == 'LOG_SendFunds') {
					reject('#27 should never payout.');
				} else if (log.event == 'LOG_PolicyDeclined') {
					resolve('Hurray - ' + lastState);
				}
			});
		}
	}));

	shouldDoSomething = 'should process #32 - too few observations';
	it(shouldDoSomething, testone({
		flightNumber: '32',
		shouldDoSomething: shouldDoSomething,
		timeoutHandler: function(reject, resolve) {
			return (function() {
				reject('Shit! we got stuck.');
			});
		},
		timeout_value: 50000,
		logHandler: function(reject, resolve) {

			return (function (log) {
				if (log.event == 'LOG_SetState') {
					lastState = web3.toUtf8(log.args._stateMessage);
					lf.logLine('SetState', lastState, 'info');
				} else if (log.event == 'LOG_SendFunds') {
					reject('#27 should never payout.');
				} else if (log.event == 'LOG_PolicyDeclined') {
					resolve('Hurray - ' + lastState);
				}
			});
		}
	}));



}); // contract