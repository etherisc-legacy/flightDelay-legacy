/**
 * Unit tests for FlightDelayNewPolicy
 *
 * @author Christoph Mussenbrock
 * @description t.b.d
 * @copyright (c) 2017 etherisc GmbH
 *
 */

const FlightDelayUnderwrite = artifacts.require('FlightDelayUnderwrite');


contract('FlightDelayUnderwrite', () => {
    it('should schedule Oraclize Call', async () => {
        const FD_UW = await FlightDelayUnderwrite.deployed();

        const policyId = 0;
        const carrierFlightNumber = 'LH/410';

        return FD_UW.scheduleUnderwriteOraclizeCall(policyId, carrierFlightNumber,
            {
                gas: 4700000,
            }
        );
    });
});
