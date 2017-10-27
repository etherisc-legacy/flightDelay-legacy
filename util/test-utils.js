/**
 * Assert previous error
 *
 * @param {any} error
 * @returns
 */
module.exports.assertJump = error =>
    assert.isAbove(error.message.search('invalid opcode'), -1, 'Invalid opcode error must be returned');

/**
 * Returns value in ethers
 *
 * @param {any} number
 * @returns
 */
module.exports.ether = n =>
    new web3.BigNumber(web3.toWei(n, 'ether'));

module.exports.EVMThow = () => 'invalid opcode';

/**
 *
 *
 * @param {any} artifacts
 * @returns
 */
module.exports.getDeployedContracts = async () => ({
    PY: await artifacts.require('FlightDelayPayout').deployed(),
    DB: await artifacts.require('FlightDelayDatabase').deployed(),
    AC: await artifacts.require('FlightDelayAccessController').deployed(),
    UW: await artifacts.require('FlightDelayUnderwrite').deployed(),
    LG: await artifacts.require('FlightDelayLedger').deployed(),
    NP: await artifacts.require('FlightDelayNewPolicy').deployed(),
    C: await artifacts.require('FlightDelayController').deployed(),
});

/**
 *
 *
 * @param {any} contracts
 * @param {any} accounts
 * @param {any} permissions
 * @returns
 */
module.exports.expectedPermissions = (FD, accounts, permissions) => {
    const permissionsSet = [
        [ 'FD.Owner', accounts[1], false, ],
        [ 'FD.Funder', accounts[2], false, ],
        [ 'FD.CustomersAdmin', accounts[3], false, ],
        [ 'FD.Emergency', accounts[4], false, ],
        [ 'FD.Controller', FD.C.address, false, ],
        [ 'FD.Database', FD.DB.address, false, ],
        [ 'FD.Ledger', FD.LG.address, false, ],
        [ 'FD.Payout', FD.PY.address, false, ],
        [ 'FD.Underwrite', FD.UW.address, false, ],
        [ 'FD.NewPolicy', FD.NP.address, false, ],
        [ 'FD.AccessController', FD.AC.address, false, ],
        [ 'deployer', accounts[0], false, ],
        [ 'customer', accounts[5], false, ],
        [ 'oraclize', accounts[6], false, ],
    ];

    return permissionsSet.map((perm) => {
        if (permissions[perm[0]] !== undefined) {
            return [ perm[0], perm[1], permissions[perm[0]], ];
        }

        return perm;
    });
};
