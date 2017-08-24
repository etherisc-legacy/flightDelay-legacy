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
    it('should have a balance of 0 in all accounts at startup', async () => {
        const FD_LG = await FlightDelayLedger.deployed();

        return FD_LG.ledger(0).then((balance) => {
            assert.equal(balance.valueOf(), 0, '0 wasnt in the first account');
        });
    }); // it

    it('should throw on invalid index', () => {
        const FD_LG = FlightDelayLedger.deployed();
        let itPasses = false;

        return FD_LG.ledger(6).then(() => {
            itPasses = true;
            assert.fail();
        })
            .catch(() => assert.fail())
            .then(() => {
                if (itPasses) {
                    assert.fail('should throw, but doesn`t');
                } else {
                    assert.isOk('it throws as expected');
                }
            });
    });

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
