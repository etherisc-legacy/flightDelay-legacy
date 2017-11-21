/**
 * Deployment script for FlightDelay
 *
 * @author Christoph Mussenbrock
 * @description Deploy FlightDelayController
 * @copyright (c) 2017 etherisc GmbH
 *
 */
const log = require('../util/logger');

const FlightDelayDatabase = artifacts.require('FlightDelayDatabase.sol');
const FlightDelayController = artifacts.require('FlightDelayController.sol');

module.exports = (deployer, network, accounts) => {

    log.info('Deploy FlightDelayDatabase contract');
    log.info('FlightDelayController.address: ', FlightDelayController.address);

    return deployer.deploy(FlightDelayDatabase, FlightDelayController.address);

};
