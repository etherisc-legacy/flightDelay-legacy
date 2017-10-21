/**
 * Deployment script for FlightDelay
 *
 * @author Christoph Mussenbrock
 * @description Deploy FlightDelayController
 * @copyright (c) 2017 etherisc GmbH
 *
 */
const log = require('../util/logger');

const FlightDelayPayout = artifacts.require('FlightDelayPayout.sol');

module.exports = (deployer, network, accounts) => {

    log.info('Deploy FlightDelayPayout contract');

    return deployer.deploy(FlightDelayPayout);

};
