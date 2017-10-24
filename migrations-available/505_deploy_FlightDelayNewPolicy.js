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

module.exports = (deployer) => {

    log.info('Deploy FlightDelayNewPolicy contract');

    return deployer.deploy(FlightDelayNewPolicy, '0xf5c3086d42cb2857ad5f52c134fc3e698e8e9edd');

};
