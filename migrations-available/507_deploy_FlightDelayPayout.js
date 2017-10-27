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

module.exports = (deployer) => {

    log.info('Deploy FlightDelayPayout contract');

    return deployer.deploy(FlightDelayPayout, '0xf5c3086d42cb2857ad5f52c134fc3e698e8e9edd');

};
