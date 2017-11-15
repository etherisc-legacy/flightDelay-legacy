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
    let database;

    log.info('Set limitations');

    return FlightDelayDatabase.deployed()
        .then((_d) => { database = _d; return Promise.resolve(); })
        // Setup valid origin airports
        .then(() => database.addOrigin('"ZRH"', { from: accounts[1], }))
        .then(() => database.addOrigin('"SFO"', { from: accounts[1], }))
        .then(() => database.addOrigin('"SJC"', { from: accounts[1], }))
        .then(() => database.addOrigin('"OAK"', { from: accounts[1], }))
        // Setup valid destination airports
        .then(() => database.addDestination('"ZRH"', { from: accounts[1], }))
        .then(() => database.addDestination('"SFO"', { from: accounts[1], }))
        .then(() => database.addDestination('"SJC"', { from: accounts[1], }))
        .then(() => database.addDestination('"OAK"', { from: accounts[1], }))
        // Setup min and max departure timestamps
        .then(() => database.setMinDepartureLim(1510704000, { from: accounts[1], }))
        .then(() => database.setMaxDepartureLim(1512950399, { from: accounts[1], }));
};
