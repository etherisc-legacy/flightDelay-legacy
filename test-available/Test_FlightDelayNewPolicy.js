/**
 * Unit tests for FlightDelayNewPolicy
 *
 * @author Christoph Mussenbrock
 * @description t.b.d
 * @copyright (c) 2017 etherisc GmbH
 *
 */

const Logformatter = require('./logformatter.js');
const EventEmitter = require('events');
const testSuite = require('./FlightDelayNewPolicy_Suite.js');
// const log = require('../util/logger');

const doTests = [
    '#20', // flightNumber == '20'  // no delay
    '#21', // flightNumber == '21'  // 15-29 min. delay
    '#22', // flightNumber == '22'  // 30-44 min. delay
    '#23', // flightNumber == '23'  // >= 45 min. delay
    '#24', // flightNumber == '24'  // cancelled
    '#25', // flightNumber == '25'  // diverted
    '#26', // flightNumber == '26'  // never landing
    '#27', // flightNumber == '27'  // invalid status
    '#30', // flightNumber == '30'  // empty result
    '#31', // flightNumber == '31'  // invalid result
    '#32', // flightNumber == '32'  // too few observations
    '#41', // flightNumber == '41'  // premium too low
    '#42', // flightNumber == '42'  // premium too high
    // '#43', // flightNumber == '43'    // invalid DepartureYearMonthDay
    '#44', // flightNumber == '44'  // invalid DepartureTime
    '#45', // flightNumber == '45'  // invalid ArrivalTime
];

const logger = new Logformatter(web3);
const EventsSeen = [];

const FlightDelayController = artifacts.require('FlightDelayController');
const FlightDelayAccessController = artifacts.require('FlightDelayAccessController');
const FlightDelayDatabase = artifacts.require('FlightDelayDatabase');
const FlightDelayLedger = artifacts.require('FlightDelayLedger');
const FlightDelayNewPolicy = artifacts.require('FlightDelayNewPolicy');
const FlightDelayUnderwrite = artifacts.require('FlightDelayUnderwrite');
const FlightDelayPayout = artifacts.require('FlightDelayPayout');

contract('FlightDelayNewPolicy', (accounts) => {
    const EE = new EventEmitter();
    let timeout;

    const eventsHappened = (events) => {
        for (let ev = 0; ev < events.length; ev += 1) {
            // log('Search: ', events[ev].event);
            const ef = EventsSeen.find((elem) => {
                // log('Compare with: ', elem.event);
                if (elem.event !== events[ev].event) {
                    // log('Not found.(1)');
                    return false;
                }
                // log('Found: ', elem.event);
                if (events[ev].args) {
                    if (!elem.args) {
                        // log('args nicht vorhanden');
                        return false;
                    }
                    // log('Compare args: ', elem.args, events[ev].args);
                    const args = Object.keys(events[ev].args);
                    for (let i = 0; i < args.length; i += 1) {
                        // log('>>', arg, elem.args[arg], events[ev].args[arg]);
                        if (elem.args[args[i]] !== events[ev].args[args[i]]) {
                            // log('args: no match', elem.args[arg], events[ev].args[arg]);
                            return false;
                        }
                    }
                }
                return true;
            });

            if (!ef) {
                // log('Not found.(2)');
                return false;
            }
        }
        return true;
    };

    const context = {
        logger,
        web3,
        eventsHappened,
        lastState: undefined,
        accounts,
    };

    const testOne = (args) => {
        it(args.shouldDoSomething, () => {
            const allEvents = [];
            const instances = {};

            const logWatcher = (contract) => {
                const allEv = contract.allEvents();
                allEvents.push(allEv);
                allEv.watch((err, log) => {
                    EventsSeen.push(log);
                    if (logger.formatLog(contract.abi, log)) EE.emit('logEvent', log);
                });
            };

            const cleanup = (message, success) => {
                logger.logLine('Cleanup; success: ', `${success} / ${message}`, 'info');
                allEvents.forEach(elem => elem.stopWatching());
                clearTimeout(timeout);
                EE.removeAllListeners('logEvent');
                assert(success, message);
            };

            logger.reset();
            logger.emptyLine(10, 'verbose');
            logger.logLine('Testing', args.shouldDoSomething, 'info');
            EventsSeen.length = 0;

            return FlightDelayController.deployed()
                .then((instance) => {
                    instances.CT = instance;
                    logWatcher(instance);
                    return FlightDelayAccessController.deployed();
                })
                .then((instance) => {
                    instances.AC = instance;
                    logWatcher(instance);
                    return FlightDelayDatabase.deployed();
                })
                .then((instance) => {
                    instances.DB = instance;
                    logWatcher(instance);
                    return FlightDelayLedger.deployed();
                })
                .then((instance) => {
                    instances.LG = instance;
                    logWatcher(instance);
                    return FlightDelayNewPolicy.deployed();
                })
                .then((instance) => {
                    instances.NP = instance;
                    logWatcher(instance);
                    return FlightDelayUnderwrite.deployed();
                })
                .then((instance) => {
                    instances.UW = instance;
                    logWatcher(instance);
                    return FlightDelayPayout.deployed();
                })
                .then((instance) => {
                    instances.PY = instance;
                    logWatcher(instance);

                    logger.emptyLine(5, 'verbose');

                    logger.logLine('Controller       Address: ', instances.CT.address, 'verbose');
                    logger.logLine('AccessController Address: ', instances.AC.address, 'verbose');
                    logger.logLine('Database         Address: ', instances.DB.address, 'verbose');
                    logger.logLine('Ledger           Address: ', instances.LG.address, 'verbose');
                    logger.logLine('NewPolicy        Address: ', instances.NP.address, 'verbose');
                    logger.logLine('Underwrite       Address: ', instances.UW.address, 'verbose');
                    logger.logLine('Payout           Address: ', instances.PY.address, 'verbose');

                    const flight = args.flight();

                    return instances.NP.newPolicy(
                        flight.carrierFlightNumber,
                        flight.departureYearMonthDay,
                        flight.departureTime,
                        flight.arrivalTime,
                        args.tx(context)
                    );
                })
                .then(() => new Promise((resolve, reject) => {
                    timeout = setTimeout(
                        args.timeoutHandler(resolve, reject, context),
                        args.timeout_value
                    );
                    EE.on('logEvent', args.logHandler(resolve, reject, context));
                }))
                .then(result => cleanup(result, true))
                .catch(error => cleanup(error, false));
        });
    };

    doTests.forEach((key, i) => testOne(testSuite.find(testDef => testDef.testId === doTests[i])));
}); // contract
