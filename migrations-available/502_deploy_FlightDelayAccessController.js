/**
 * Deployment script for FlightDelay
 *
 * @author Christoph Mussenbrock
 * @description Deploy FlightDelayController
 * @copyright (c) 2017 etherisc GmbH
 *
 */
const log = require('../util/logger');

const FlightDelayAccessController = artifacts.require('FlightDelayAccessController.sol');
const FlightDelayController = artifacts.require('FlightDelayController.sol');

module.exports = (deployer, network, accounts) => {

    log.info('Deploy FlightDelayAccessController contract');
    log.info('FlightDelayController.address: ', FlightDelayController.address);

    return deployer.deploy(FlightDelayAccessController, FlightDelayController.address);

};
