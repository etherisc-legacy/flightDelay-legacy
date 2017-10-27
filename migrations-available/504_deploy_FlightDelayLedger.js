/**
 * Deployment script for FlightDelay
 *
 * @author Christoph Mussenbrock
 * @description Deploy FlightDelayController
 * @copyright (c) 2017 etherisc GmbH
 *
 */
const log = require('../util/logger');

const FlightDelayLedger = artifacts.require('FlightDelayLedger.sol');

module.exports = (deployer, network, accounts) => {

    log.info('Deploy FlightDelayLedger contract');

    return deployer.deploy(FlightDelayLedger);

};
