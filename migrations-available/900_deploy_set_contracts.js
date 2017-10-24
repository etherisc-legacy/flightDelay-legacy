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


// register Adminstrators

FlightDelayController.at('0xf5c3086d42cb2857ad5f52c134fc3e698e8e9edd').registerContract('0xb5771324A8209c4b581a5f1e5c0DD48a9ABA2a59', 'FD.Funder', false);
FlightDelayController.at('0xf5c3086d42cb2857ad5f52c134fc3e698e8e9edd').registerContract('0xfee595b6b4a30bfa12604a5ec92156f1b5a1607f', 'FD.CustomersAdmin', false);
// REGISTER CONTRACTS
FlightDelayController.at('0xf5c3086d42cb2857ad5f52c134fc3e698e8e9edd').registerContract('0xd3a9d701ce93805cddcc4297fc28883efa5db92d', 'FD.AccessController', true);
FlightDelayController.at('0xf5c3086d42cb2857ad5f52c134fc3e698e8e9edd').registerContract('0x34ab5b2d94d624ae0f82332b79db47ab07a9948b', 'FD.Database', true);
FlightDelayController.at('0xf5c3086d42cb2857ad5f52c134fc3e698e8e9edd').registerContract('0xbd5af6f705e4582c3f2b368ccf278ce39c3cfc17', 'FD.Ledger', true);
FlightDelayController.at('0xf5c3086d42cb2857ad5f52c134fc3e698e8e9edd').registerContract('0xafca09726310a2b8e5fca4200f818a5e6bd0cf50', 'FD.NewPolicy', true);
FlightDelayController.at('0xf5c3086d42cb2857ad5f52c134fc3e698e8e9edd').registerContract('0x370f2f8495d337fac3de1f4590f6062b9019590e', 'FD.Underwrite', true);
FlightDelayController.at('0xf5c3086d42cb2857ad5f52c134fc3e698e8e9edd').registerContract('0xf90e9dc4d8cafa01a8520bc092a16eb6ab65574e', 'FD.Payout', true);

// TRANSFER OWNERSHIP
FlightDelayController.at('0xf5c3086d42cb2857ad5f52c134fc3e698e8e9edd').transferOwnership('0x2c53d79e4069480ca1f40db68f88c51732462f93');

// SETUP CONTRACTS
FlightDelayController.at('0xf5c3086d42cb2857ad5f52c134fc3e698e8e9edd').setAllContracts({ from: '0x2c53d79e4069480ca1f40db68f88c51732462f93', });

// SET ADDRESS RESOLVER
FlightDelayAddressResolver.at('0x63338bB37Bc3A0d55d2E9505F11E56c613b51494').setAddress('0xafca09726310a2b8e5fca4200f818a5e6bd0cf50');

FlightDelayController.at('0xf5c3086d42cb2857ad5f52c134fc3e698e8e9edd').registerContract('0x6F692C070f3263d1c3400367832Faf5CcC6Cd2f2', 'FD.Emergency', false);




function setOneContract(uint i) onlyOwner {
        FlightDelayControlledContract controlledContract;
        // TODO: Check for upper bound for i
        controlledContract = FlightDelayControlledContract(contracts[contractIds[i]].addr);
        controlledContract.setContracts();
    }




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