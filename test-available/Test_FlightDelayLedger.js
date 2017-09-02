/**
 * Unit tests for FlightDelayController
 *
 * @author Christoph Mussenbrock
 * @description t.b.d
 * @copyright (c) 2017 etherisc GmbH
 *
 */

const FlightDelayLedger = artifacts.require('FlightDelayLedger');


contract('FlightDelayLedger', () => {


    it('should have equal balances in accounts after booking', () => {
        const FD_LG = FlightDelayLedger.deployed();
        const ether5 = web3.toWei(5, 'ether');

        return FD_LG.bookkeeping(0, 1, ether5)
            .then(() =>
                FD_LG.ledger(0)
                    .then((balance0) => {
                        assert.equal(-balance0.valueOf(), ether5);
                        return FD_LG.ledger(1)
                            .then((balance1) => {
                                assert.equal(balance1.valueOf(), ether5);
                                assert.equal(-balance0.valueOf(), balance1.valueOf(), 'balances are not equal');
                            });
                    })
            );
    });

    it('should throw on overflow', async () => {
        // const LG = await FlightDelayLedger.deployed();
        // TODO: check if safeMath for various overflows in bookkeeping works.
    });
});
