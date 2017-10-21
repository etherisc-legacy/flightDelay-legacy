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

module.exports = (deployer, network, accounts) => {

    log.info('Deploy FlightDelayNewPolicy contract');

    return deployer.deploy(FlightDelayNewPolicy);

};
