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
const FlightDelayController = artifacts.require('FlightDelayController.sol');

module.exports = (deployer) => {

    log.info('Deploy FlightDelayUnderwrite contract');
    log.info('FlightDelayController.address: ', FlightDelayController.address);

    return deployer.deploy(FlightDelayUnderwrite, FlightDelayController.address);

};
