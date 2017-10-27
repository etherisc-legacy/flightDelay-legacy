/**
 * Deployment script for FlightDelay
 *
 * @author Christoph Mussenbrock
 * @description Deploy FlightDelayController
 * @copyright (c) 2017 etherisc GmbH
 *
 */
const log = require('../util/logger');

const FlightDelayUnderwrite = artifacts.require('FlightDelayUnderwrite.sol');

module.exports = (deployer) => {

    log.info('Deploy FlightDelayUnderwrite contract');

    return deployer.deploy(FlightDelayUnderwrite, '0xf5c3086d42cb2857ad5f52c134fc3e698e8e9edd');

};
