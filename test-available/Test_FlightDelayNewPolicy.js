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
  //'#30', // flightNumber == '30'	// empty result
  //'#31', // flightNumber == '31'  // invalid result
  //'#32', // flightNumber == '32'	// too few observations
  '#41', // flightNumber == '41'	// premium too low
  '#42', // flightNumber == '42'	// premium too high
  //'#43', // flightNumber == '43'	// invalid DepartureYearMonthDay
  '#44', // flightNumber == '44'	// invalid DepartureTime
  '#45', // flightNumber == '45'	// invalid ArrivalTime
];


let lf = undefined;
let EventsSeen = [];

const FlightDelayAccessController = artifacts.require('FlightDelayAccessController');
const FlightDelayController = artifacts.require('FlightDelayController');
const FlightDelayDatabase = artifacts.require('FlightDelayDatabase');
const FlightDelayLedger = artifacts.require('FlightDelayLedger');
const FlightDelayNewPolicy = artifacts.require('FlightDelayNewPolicy');
const FlightDelayUnderwrite = artifacts.require('FlightDelayUnderwrite');
const FlightDelayPayout = artifacts.require('FlightDelayPayout');

contract('FlightDelayNewPolicy', (accounts) => {

  var EE = new EventEmitter();
  var timeout = undefined;
  var EventsSeen = [];

  var eventsHappened = function (events) {
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

  lf = new logformatter(web3);

  var context = {
    logger: lf,
    web3: web3,
    eventsHappened: eventsHappened,
    lastState: undefined,
    accounts: accounts,
  };

  var testOne = function (args) {

    it(args.shouldDoSomething, function () {


      var allEvents = [];
      var flightNumber = args.flightNumber;
      var instances = {};

      var logWatcher = function (contract) {

        var allEv = contract.allEvents();
        allEvents.push(allEv);
        allEv.watch(function (err, log) {

          EventsSeen.push(log);
          if (lf.formatLog(contract.abi, log)) EE.emit('logEvent', log);

        });
      };

      var cleanup = function (message, success) {
        lf.logLine('Cleanup; success: ', success + ' / ' + message, 'info');
        for (var elem in allEvents) {
          allEvents[elem].stopWatching();
        }
        clearTimeout(timeout);
        EE.removeAllListeners('logEvent');
        assert(success, message);
      };

      lf.reset();
      lf.emptyLine(10, 'verbose');
      lf.logLine('Testing', args.shouldDoSomething, 'info');
      EventsSeen = [];

      return FlightDelayAccessController.deployed()
        .then(function (instance) {
          instances.AC = instance;
          logWatcher(instance);
          return FlightDelayDatabase.deployed();
        })
        .then(function (instance) {
          instances.DB = instance;
          logWatcher(instance);
          return FlightDelayLedger.deployed();
        })
        .then(function (instance) {
          instances.LG = instance;
          logWatcher(instance);
          return FlightDelayNewPolicy.deployed();
        })
        .then(function (instance) {
          instances.NP = instance;
          logWatcher(instance);
          return FlightDelayUnderwrite.deployed();
        })
        .then(function (instance) {
          instances.UW = instance;
          logWatcher(instance);
          return FlightDelayPayout.deployed();
        })
        .then(function (instance) {

          instances.PY = instance;
          logWatcher(instance);

          lf.emptyLine(5, 'verbose');

          lf.logLine('AccessController Address: ', instances.AC.address, 'verbose');
          lf.logLine('Database         Address: ', instances.DB.address, 'verbose');
          lf.logLine('Ledger           Address: ', instances.LG.address, 'verbose');
          lf.logLine('NewPolicy        Address: ', instances.NP.address, 'verbose');
          lf.logLine('Underwrite       Address: ', instances.UW.address, 'verbose');
          lf.logLine('Payout           Address: ', instances.PY.address, 'verbose');

          var flight = args.flight();

          return instances.NP.newPolicy(
            flight.carrierFlightNumber,
            flight.departureYearMonthDay,
            flight.departureTime,
            flight.arrivalTime,
            args.tx(context)
          );
        }).then(function (tx) {
          return new Promise(function (resolve, reject) {

            timeout = setTimeout(args.timeoutHandler(resolve, reject, context), args.timeout_value);
            EE.on('logEvent', args.logHandler(resolve, reject, context));

          });
        }).then(function (result) {
          return cleanup(result, true);
        }).catch(function (error) {
          return cleanup(error, false);
        });
    });
  };

  for (const index in doTests) {
    testOne(testSuite.find(function (testDef) {
      return testDef.testId === doTests[index];
    }));
  }

}); // contract
