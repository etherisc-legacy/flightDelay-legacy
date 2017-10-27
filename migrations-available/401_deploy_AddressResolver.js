/**
 * Deployment script for FlightDelay
 * (only Addressresolver)
 * @author Christoph Mussenbrock
 * @description Deploy FlightDelayController
 * @copyright (c) 2017 etherisc GmbH
 *
 */
const truffle = require('../truffle.js');
const log = require('../util/logger');
const fs = require('fs');

const FlightDelayAddressResolver = artifacts.require('FlightDelayAddressResolver.sol');

module.exports = (deployer, network, accounts) => {
    log.info('Deploy FlightDelayAddressResolver contract');

    return deployer
    // Deploy contracts
        .deploy(FlightDelayAddressResolver)

        .then(() => {
            log.info(`Deployer: ${accounts[0]}`);
            log.info(`FD.Owner: ${accounts[1]}`);
            log.info(`FD.AddressResolver: ${FlightDelayAddressResolver.address}`);
        })

        .then(() => {
            truffle.networks[network].addressResolver = FlightDelayAddressResolver.address;
            fs.writeFile('../truffle.js', `module.exports = ${JSON.stringify(truffle, null, 4)} ;`);
        });
};
