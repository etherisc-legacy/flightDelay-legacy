/**
 * Deployment script for FlightDelay
 *
 * @author Christoph Mussenbrock
 * @description Deploy FlightDelayController
 * @copyright (c) 2017 etherisc GmbH
 *
 */
const log = require('../util/logger');

const FlightDelayNewPolicy = artifacts.require('FlightDelayNewPolicy.sol');
const FlightDelayController = artifacts.require('FlightDelayController.sol');

module.exports = (deployer) => {

    log.info('Deploy FlightDelayNewPolicy contract');
    log.info('FlightDelayController.address: ', FlightDelayController.address);

    return deployer.deploy(FlightDelayNewPolicy, FlightDelayController.address);

};
