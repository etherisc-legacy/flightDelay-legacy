/**
 * Unit tests for FlightDelayNewPolicy
 *
 * @author Christoph Mussenbrock
 * @description t.b.d
 * @copyright (c) 2017 etherisc GmbH
 *
 */

const logformatter = require('./logformatter.js');
const EventEmitter = require('events');
const testSuite = require('./FlightDelayNewPolicy_Suite.js');

const doTests = [
  '#20', // flightNumber == '20'  // no delay
  '#21', // flightNumber == '21'  // 15-29 min. delay
  '#22', // flightNumber == '22'  // 30-44 min. delay
  '#23', // flightNumber == '23'  // >= 45 min. delay
  '#24', // flightNumber == '24'  // cancelled
  '#25', // flightNumber == '25'  // diverted
  '#26', // flightNumber == '26'  // never landing
  '#27', // flightNumber == '27'  // invalid status
  '#30', // flightNumber == '30'	// empty result
  '#31', // flightNumber == '31'  // invalid result
  '#32', // flightNumber == '32'	// too few observations
  '#41', // flightNumber == '41'	// premium too low
  '#42', // flightNumber == '42'	// premium too high
  '#43', // flightNumber == '43'	// invalid DepartureYearMonthDay
  '#44', // flightNumber == '44'	// invalid DepartureTime
  '#45', // flightNumber == '45'	// invalid ArrivalTime
  '#20',
];

const logger = new logformatter(web3);
const EventsSeen = [];

const FlightDelayAccessController = artifacts.require('FlightDelayAccessController');
const FlightDelayController = artifacts.require('FlightDelayController');
const FlightDelayDatabase = artifacts.require('FlightDelayDatabase');
const FlightDelayLedger = artifacts.require('FlightDelayLedger');
const FlightDelayNewPolicy = artifacts.require('FlightDelayNewPolicy');
const FlightDelayUnderwrite = artifacts.require('FlightDelayUnderwrite');
const FlightDelayPayout = artifacts.require('FlightDelayPayout');

contract('FlightDelayNewPolicy', (accounts) => {

  const EE = new EventEmitter();
  let timeout;

  const eventsHappened = function (events) {
    for (var ev in events) {
      //console.log('Search: ', events[ev].event);
      var ef = EventsSeen.find(function (elem) {
        //console.log('Compare with: ', elem.event);
        if (elem.event !== events[ev].event) {
          //console.log('Not found.(1)');
          return false;
        }
        //console.log('Found: ', elem.event);
        if (events[ev].args != undefined) {
          if (elem.args == undefined) {
            //console.log('args nicht vorhanden');
            return false;
          }
          //console.log('Compare args: ', elem.args, events[ev].args);
          for (var arg in events[ev].args) {
            //console.log('>>', arg, elem.args[arg], events[ev].args[arg]);
            if (elem.args[arg] !== events[ev].args[arg]) {
              //console.log('args stimmen nicht überein', elem.args[arg], events[ev].args[arg]);
              return false;
            }
          }
        }
        return true;

      });

      if (ef == undefined) {
        //console.log('Not found.(2)');
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

  const testOne = function (args) {
    it(args.shouldDoSomething, () => {
      const allEvents = [];
      const instances = {};

      const logWatcher = function (contract) {

        var allEv = contract.allEvents();
        allEvents.push(allEv);
        allEv.watch(function (err, log) {

          EventsSeen.push(log);
          if (logger.formatLog(contract.abi, log)) EE.emit('logEvent', log);

        });
      };

      const cleanup = function (message, success) {
        logger.logLine('Cleanup; success: ', success + ' / ' + message, 'info');
        for (var elem in allEvents) {
          allEvents[elem].stopWatching();
        }
        clearTimeout(timeout);
        EE.removeAllListeners('logEvent');
        assert(success, message);
      };

      logger.reset();
      logger.emptyLine(10, 'verbose');
      logger.logLine('Testing', args.shouldDoSomething, 'info');
      EventsSeen.length = 0;

      return FlightDelayAccessController.deployed()
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
          timeout = setTimeout(args.timeoutHandler(resolve, reject, context), args.timeout_value);
          EE.on('logEvent', args.logHandler(resolve, reject, context));
        }))
        .then(result => cleanup(result, true))
        .catch(error => cleanup(error, false));
    });
  };

  doTests.forEach((key, i) => testOne(testSuite.find(testDef => testDef.testId === doTests[i])));
}); // contract
