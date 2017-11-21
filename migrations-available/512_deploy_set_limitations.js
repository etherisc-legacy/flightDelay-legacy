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

    log.info('Set limitations');

    deployer.then(async () => {

        const database = await FlightDelayDatabase.deployed();

        // Setup valid origin airports
        log.info('Add origin ZRH');
        database.addOrigin('"ZRH"');
        log.info('Add origin SFO');
        database.addOrigin('"SFO"');
        log.info('Add origin SJC');
        database.addOrigin('"SJC"');
        log.info('Add origin OAK');
        database.addOrigin('"OAK"');

        // Setup valid destination airports
        log.info('Add origin ZRH');
        database.addDestination('"ZRH"');
        log.info('Add origin SFO');
        database.addDestination('"SFO"');
        log.info('Add origin SJC');
        database.addDestination('"SJC"');
        log.info('Add origin OAK');
        database.addDestination('"OAK"');

        // Setup min and max departure timestamps
        log.info('setMinDepartureLim');
        database.setMinDepartureLim(1510704000); // 15.11.2017 12:00AM
        log.info('setMaxDepartureLim');
        database.setMaxDepartureLim(1512950399); // 10.12.2017 11:59PM
    });
};
