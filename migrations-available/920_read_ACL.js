/**
 * Deployment script for FlightDelay
 *
 * @author Christoph Mussenbrock
 * @description Deploy FlightDelayController
 * @copyright (c) 2017 etherisc GmbH
 *
 */

const FlightDelayAddressResolver = artifacts.require('FlightDelayAddressResolver.sol');
const FlightDelayController = artifacts.require('FlightDelayController.sol');
const FlightDelayNewPolicy = artifacts.require('FlightDelayNewPolicy.sol');
const FlightDelayUnderwrite = artifacts.require('FlightDelayUnderwrite.sol');
const FlightDelayPayout = artifacts.require('FlightDelayPayout.sol');
const FlightDelayDatabase = artifacts.require('FlightDelayDatabase.sol');


module.exports = async (deployer) => {


    var contracts = [

        { name: 'FD.Owner',             address: '0x6f692c070f3263d1c3400367832faf5ccc6cd2f2', },
        { name: 'FD.CustomersAdmin',    address: '0xfee595b6b4a30bfa12604a5ec92156f1b5a1607f', },
        { name: 'FD.Funder',            address: '0xb5771324a8209c4b581a5f1e5c0dd48a9aba2a59', },
        { name: 'FD.Emergency',         address: '0x6f692c070f3263d1c3400367832faf5ccc6cd2f2', },
        { name: 'FD.NewPolicy',         address: '0xc0f29798c57e890cac82a79dadbebfb3d3fa67b9', },
        { name: 'FD.Underwrite',        address: '0xef6ce7185680385cab0b6c1da209c50ebd27290a', },
        { name: 'FD.Payout',            address: '0xd003d6eda71f164993e948f2dd1de1dac0233556', },
        { name: 'FD.Ledger',            address: '0xbd5af6f705e4582c3f2b368ccf278ce39c3cfc17', },
        { name: 'FD.Database',          address: '0x34ab5b2d94d624ae0f82332b79db47ab07a9948b', },
        { name: 'FD.AccessController',  address: '0xd3a9d701ce93805cddcc4297fc28883efa5db92d', },
        { name: 'FD.Controller',        address: '0xF5c3086D42Cb2857Ad5f52c134fc3e698E8e9edd', },

    ];

    DB = FlightDelayDatabase.at('0x34ab5b2d94d624ae0f82332b79db47ab07a9948b');


    for (var con1 in contracts) {

        for (var con2 in contracts) {

            for (var i = 100; i < 110; i++) {
                var acc = await DB.accessControl(contracts[con1].address, contracts[con2].address, i);
                if (acc) console.log(contracts[con1].name, contracts[con2].name, i, acc);
            }
        }
    }

};

