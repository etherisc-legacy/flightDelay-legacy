/**
 * Deployment script for FlightDelay
 *
 * @author Christoph Mussenbrock
 * @description Deploy FlightDelayController
 * @copyright (c) 2017 etherisc GmbH
 *
 */
const log = require('../util/logger');

const FlightDelayController = artifacts.require('FlightDelayController.sol');

module.exports = (deployer, network, accounts) => {

    log.info('Deploy FlightDelayController contract');

    return deployer.deploy(FlightDelayController);

};
