/**
 * Deployment script for FlightDelay
 *
 * @author Christoph Mussenbrock
 * @description Deploy FlightDelayController
 * @copyright (c) 2017 etherisc GmbH
 *
 */
const log = require('../util/logger');

const FlightDelayLedger = artifacts.require('FlightDelayLedger.sol');
const FlightDelayController = artifacts.require('FlightDelayController.sol');

module.exports = (deployer, network, accounts) => {

    log.info('Deploy FlightDelayLedger contract');
    log.info('FlightDelayController.address: ', FlightDelayController.address);

    return deployer.deploy(FlightDelayLedger, FlightDelayController.address);

};
