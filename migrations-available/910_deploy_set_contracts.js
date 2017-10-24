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


module.exports = async (deployer) => {

    //console.log('FlightDelayNewPolicy: ', FlightDelayNewPolicy.address);
    console.log('FlightDelayUnderwrite: ', FlightDelayUnderwrite.address);
    console.log('FlightDelayPayout: ', FlightDelayPayout.address);

//    await FlightDelayController.at('0xf5c3086d42cb2857ad5f52c134fc3e698e8e9edd').registerContract(FlightDelayNewPolicy.address, 'FD.NewPolicy', true);
    await FlightDelayController.at('0xf5c3086d42cb2857ad5f52c134fc3e698e8e9edd').registerContract(FlightDelayUnderwrite.address, 'FD.Underwrite', true);
    await FlightDelayController.at('0xf5c3086d42cb2857ad5f52c134fc3e698e8e9edd').registerContract(FlightDelayPayout.address, 'FD.Payout', true);

    await FlightDelayController.at('0xf5c3086d42cb2857ad5f52c134fc3e698e8e9edd').setAllContracts();

//    await FlightDelayAddressResolver.at('0x63338bB37Bc3A0d55d2E9505F11E56c613b51494').setAddress(FlightDelayNewPolicy.address);

};

/*

function setOneContract(uint i) onlyOwner {
        FlightDelayControlledContract controlledContract;
        // TODO: Check for upper bound for i
        controlledContract = FlightDelayControlledContract(contracts[contractIds[i]].addr);
        controlledContract.setContracts();
    }

*/


/*


    Running migration: 505_deploy_FlightDelayNewPolicy.js
20:27:20.235 INFO  [ original-require ] Deploy FlightDelayNewPolicy contract
  Deploying FlightDelayNewPolicy...
  ... 0x9b017b69f98c343793741a009f1931cea0c289cf7e5161a44c93d0c270e4f93c
  FlightDelayNewPolicy: 0x8e84845c32b5f40b74aee03bc15249585e3c7d50
Saving artifacts...
Running migration: 506_deploy_FlightDelayUnderwrite.js
20:28:11.663 INFO  [ original-require ] Deploy FlightDelayUnderwrite contract
  Deploying FlightDelayUnderwrite...
  ... 0x549bd2e7808d64ff732d6434819a2196d73f0e7b9a3196baf027b728c890aa59
  FlightDelayUnderwrite: 0x3b3170dbbc98cb896d8ad06457f3e87dd2b9ec10
Saving artifacts...
Running migration: 507_deploy_FlightDelayPayout.js
20:28:52.349 INFO  [ original-require ] Deploy FlightDelayPayout contract
  Deploying FlightDelayPayout...
  ... 0xf7155a4b30700b08b2ac9e0aa99ed76dc08a3933ea5681897aefa76cfe850e4f
  FlightDelayPayout: 0xea1a7dee572b56d91371aa6e36cb5432eb6f88cc
Saving artifacts...

*/
