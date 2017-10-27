/**
 * Deployment script for FlightDelay
 *
 * @author Christoph Mussenbrock
 * @description Deploy FlightDelayController
 * @copyright (c) 2017 etherisc GmbH
 *
 */

const FlightDelayLedger = artifacts.require('FlightDelayLedger.sol');
const FlightDelayUnderwrite = artifacts.require('FlightDelayUnderwrite.sol');
const FlightDelayPayout = artifacts.require('FlightDelayPayout.sol');

const fund = value => web3.toWei(value, 'ether');


FlightDelayLedger.at('0xbd5af6f705e4582c3f2b368ccf278ce39c3cfc17').fund({ value: fund(1.5), });
FlightDelayUnderwrite.at('0x370f2f8495d337fac3de1f4590f6062b9019590e').fund({ value: fund(0.5), });
FlightDelayPayout.at('0xf90e9dc4d8cafa01a8520bc092a16eb6ab65574e').fund({ value: fund(0.5), });
