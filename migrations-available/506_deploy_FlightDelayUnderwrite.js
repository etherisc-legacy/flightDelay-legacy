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

module.exports = (deployer, network, accounts) => {

    log.info('Deploy FlightDelayUnderwrite contract');

    return deployer.deploy(FlightDelayUnderwrite);

};
