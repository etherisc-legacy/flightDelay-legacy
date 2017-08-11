/**
 * Deployment script for FlightDelay
 *
 * @author Christoph Mussenbrock
 * @description Deploy FlightDelayController
 * @copyright (c) 2017 etherisc GmbH
 *
 */

const FlightDelayController = artifacts.require('FlightDelayController.sol');
const FlightDelayAccessController = artifacts.require('FlightDelayAccessController.sol');
const FlightDelayDatabase = artifacts.require('FlightDelayDatabase.sol');
const FlightDelayLedger = artifacts.require('FlightDelayLedger.sol');
const FlightDelayNewPolicy = artifacts.require('FlightDelayNewPolicy.sol');
const FlightDelayUnderwrite = artifacts.require('FlightDelayUnderwrite.sol');
const FlightDelayPayout = artifacts.require('FlightDelayPayout.sol');

const withEthBalance = v => web3.toWei(v, 'ether');

module.exports = (deployer) => {
  let controller;

  deployer.deploy(FlightDelayController)
    .then(() => {
      controller = FlightDelayController.address;
      return deployer.deploy(FlightDelayAccessController, controller);
    })
    .then(() => deployer.deploy(FlightDelayDatabase, controller))
    .then(() => deployer.deploy(FlightDelayLedger, controller, { value: withEthBalance(500), }))
    .then(() => deployer.deploy(FlightDelayNewPolicy, controller))
    .then(() => deployer.deploy(FlightDelayUnderwrite, controller, { value: withEthBalance(50), }))
    .then(() => deployer.deploy(FlightDelayPayout, controller, { value: withEthBalance(50), }))
    .then(() => {
      let instance;
      return FlightDelayController.deployed()
        .then((_i) => {
          instance = _i;
          return _i.registerContract(FlightDelayController.address, 'FD.Owner');
        })
        .then(() => instance.registerContract(FlightDelayAccessController.address, 'FD.AccessController'))
        .then(() => instance.registerContract(FlightDelayDatabase.address, 'FD.Database'))
        .then(() => instance.registerContract(FlightDelayLedger.address, 'FD.Ledger'))
        .then(() => instance.registerContract(FlightDelayNewPolicy.address, 'FD.NewPolicy'))
        .then(() => instance.registerContract(FlightDelayUnderwrite.address, 'FD.Underwrite'))
        .then(() => instance.registerContract(FlightDelayPayout.address, 'FD.Payout'))
        .then(() => instance.setAllContracts({ gas: 3000000, }));
    });
};
