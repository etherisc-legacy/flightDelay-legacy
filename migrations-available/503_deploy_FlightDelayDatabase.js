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

module.exports = (deployer, network, accounts) => {

    log.info('Deploy FlightDelayDatabase contract');

    return deployer.deploy(FlightDelayDatabase);

};
