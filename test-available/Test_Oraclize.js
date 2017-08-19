/**
 * Unit tests for FlightDelayNewPolicy
 *
 * @author Christoph Mussenbrock
 * @description t.b.d
 * @copyright (c) 2017 etherisc GmbH
 *
 */

const TestOraclize = artifacts.require('_Test_Oraclize');


contract('_Test_Oraclize', () => {
    it('should schedule Oraclize Call', async () => {
        const TO = await TestOraclize.deployed();
        return TO.test_callIt();
    });
});
