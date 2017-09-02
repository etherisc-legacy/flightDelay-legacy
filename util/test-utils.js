/**
 * Assert previous error
 *
 * @param {any} error
 * @returns
 */
function assertJump(error) {
    return assert.isAbove(error.message.search('invalid opcode'), -1, 'Invalid opcode error must be returned');
}

/**
 * Returns value in ethers
 *
 * @param {any} number
 * @returns
 */
function ether(n) {
    return new web3.BigNumber(web3.toWei(n, 'ether'));
}

module.exports = {
    assertJump,
    ether,
};
