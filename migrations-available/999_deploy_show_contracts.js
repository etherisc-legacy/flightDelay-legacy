/**
 * Deployment script for FlightDelay
 *
 * @author Christoph Mussenbrock
 * @description Deploy FlightDelayController
 * @copyright (c) 2017 etherisc GmbH
 *
 */
const truffle = require('../truffle.js');
const log = require('../util/logger');

const FlightDelayAddressResolver = artifacts.require('FlightDelayAddressResolver.sol');
const FlightDelayController = artifacts.require('FlightDelayController.sol');
const FlightDelayAccessController = artifacts.require('FlightDelayAccessController.sol');
const FlightDelayDatabase = artifacts.require('FlightDelayDatabase.sol');
const FlightDelayLedger = artifacts.require('FlightDelayLedger.sol');
const FlightDelayNewPolicy = artifacts.require('FlightDelayNewPolicy.sol');
const FlightDelayUnderwrite = artifacts.require('FlightDelayUnderwrite.sol');
const FlightDelayPayout = artifacts.require('FlightDelayPayout.sol');


module.exports = (deployer, network, accounts) => {

    console.log('FlightDelayAddressResolver', FlightDelayAddressResolver.address);
    console.log('FlightDelayController', FlightDelayController.address);
    console.log('FlightDelayAccessController', FlightDelayAccessController.address);
    console.log('FlightDelayDatabase', FlightDelayDatabase.address);
    console.log('FlightDelayLedger', FlightDelayLedger.address);
    console.log('FlightDelayNewPolicy', FlightDelayNewPolicy.address);
    console.log('FlightDelayUnderwrite', FlightDelayUnderwrite.address);
    console.log('FlightDelayNewPayout', FlightDelayPayout.address);

};
