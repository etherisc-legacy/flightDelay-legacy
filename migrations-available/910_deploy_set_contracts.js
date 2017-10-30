/**
 * Deployment script for FlightDelay
 *
 * @author Christoph Mussenbrock
 * @description Deploy FlightDelayController
 * @copyright (c) 2017 etherisc GmbH
 *
 */

// const FlightDelayAddressResolver = artifacts.require('FlightDelayAddressResolver.sol');
const FlightDelayController = artifacts.require('FlightDelayController.sol');
// const FlightDelayNewPolicy = artifacts.require('FlightDelayNewPolicy.sol');
const FlightDelayUnderwrite = artifacts.require('FlightDelayUnderwrite.sol');
const FlightDelayPayout = artifacts.require('FlightDelayPayout.sol');


module.exports = async (deployer) => {


    // await FlightDelayController.at('0xf5c3086d42cb2857ad5f52c134fc3e698e8e9edd').registerContract(FlightDelayNewPolicy.address, 'FD.NewPolicy', true);
    // await FlightDelayController.at('0xf5c3086d42cb2857ad5f52c134fc3e698e8e9edd').registerContract(FlightDelayUnderwrite.address, 'FD.Underwrite', true);
    // await FlightDelayController.at('0xf5c3086d42cb2857ad5f52c134fc3e698e8e9edd').registerContract('0x20a640399ccb6bb6d97f460b6ec0e86b5c0bed53', 'FD.AccessController', true);

    await FlightDelayController.at('0xf5c3086d42cb2857ad5f52c134fc3e698e8e9edd').registerContract('0xa0eb827c013d3c5170cbb1f57a5f83f1c41caf74', 'FD.Payout', true);
    await FlightDelayController.at('0xf5c3086d42cb2857ad5f52c134fc3e698e8e9edd').setAllContracts();

    // await FlightDelayAddressResolver.at('0x63338bB37Bc3A0d55d2E9505F11E56c613b51494').setAddress(FlightDelayNewPolicy.address);

};

