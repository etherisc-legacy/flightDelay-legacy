/**
 * Unit tests for FlightDelayNewPolicy
 *
 * @author Christoph Mussenbrock
 * @description t.b.d
 * @copyright (c) 2017 etherisc GmbH
 *
 */

const padRight = (s, len, ch) =>
    (s + Array(len).join(ch || ' ')).slice(0, len);

const bytes32 = s => padRight(web3.toHex(s), 66, '0');

const standardTx = value => context => ({
    from: context.accounts[1],
    gas: 4700000,
    value: value || web3.toWei(1234, 'finney'),
});

const standardFlight = (flightNumber, depYMD, offsDep, offsArr) =>
    () => {
        const now = new Date(Date.now());
        return {
            flightNumber,
            carrierFlightNumber: `AF/${flightNumber}`,
            departureYearMonthDay: depYMD || `/dep/${now.toISOString().replace(/-/g, '/').slice(0, 10)}`,
            departureTime: (now.valueOf() / 1000) + (offsDep || 60),
            // departureTime + 60; // * 60 * 24;
            arrivalTime: (now.valueOf() / 1000) + (offsArr || 90),
        };
    };

const standardTimeoutHandler = (resolve, reject, context) =>
    () => {
        context.logger.logLine('running into timeout', '', 'info');
        reject('Shit! we got stuck.');
    };


const standardLogHandler = eventDef =>
    (resolve, reject, context) =>
        (log) => {
            if (log.event === 'LogSetState') {
                // eslint-disable-next-line
                context.lastState = context.web3.toUtf8(log.args._stateMessage);
                context.logger.logLine('SetState', context.lastState, 'info');
            }
            if (context.eventsHappened(eventDef)) {
                resolve(`Hurray - ${context.lastState}`);
            }
        };

const testSuite = [
    {
        testId: '#20',
        shouldDoSomething: 'should process #20 - flight <15 min delay (no payout)',
        flight: standardFlight('20'),
        timeoutHandler: standardTimeoutHandler,
        timeout_value: 80000,
        logHandler: standardLogHandler([
            {
                event: 'LogSetState',
                args: {
                    _stateMessage: bytes32('Expired - no delay!'),
                },
            },
        ]),
        tx: standardTx(),
    },
    {
        testId: '#21',
        shouldDoSomething: 'should process #21 - flight > 15 <= 30min. delay',
        flight: standardFlight('21'),
        timeoutHandler: standardTimeoutHandler,
        timeout_value: 80000,
        logHandler: standardLogHandler([
            {
                event: 'LogSendFunds',
            },
            {
                event: 'LogSetState',
                args: {
                    _stateMessage: bytes32('Payout successful!'),
                },
            },
        ]),
        tx: standardTx(),
    },
    {
        testId: '#22',
        shouldDoSomething: 'should process #22 - flight > 30 <= 45 delay',
        flight: standardFlight('22'),
        timeoutHandler: standardTimeoutHandler,
        timeout_value: 80000,
        logHandler: standardLogHandler([
            {
                event: 'LogSendFunds',
            },
            {
                event: 'LogSetState',
                args: {
                    _stateMessage: bytes32('Payout successful!'),
                },
            },
        ]),
        tx: standardTx(),
    },
    {
        testId: '#23',
        shouldDoSomething: 'should process #23 - flight > 30 <= 45min. delay',
        flight: standardFlight('23'),
        timeoutHandler: standardTimeoutHandler,
        timeout_value: 80000,
        logHandler: standardLogHandler([
            {
                event: 'LogSendFunds',
            },
            {
                event: 'LogSetState',
                args: {
                    _stateMessage: bytes32('Payout successful!'),
                },
            },
        ]),
        tx: standardTx(),
    }, {
        testId: '#24',
        shouldDoSomething: 'should process #24 - flight cancelled',
        flight: standardFlight('24'),
        timeoutHandler: standardTimeoutHandler,
        timeout_value: 80000,
        logHandler: standardLogHandler([
            {
                event: 'LogSendFunds',
            },
            {
                event: 'LogSetState',
                args: {
                    _stateMessage: bytes32('Payout successful!'),
                },
            },
        ]),
        tx: standardTx(),
    },
    {
        testId: '#25',
        shouldDoSomething: 'should process #25 - flight diverted',
        flight: standardFlight('25'),
        timeoutHandler: standardTimeoutHandler,
        timeout_value: 80000,
        logHandler: standardLogHandler([
            {
                event: 'LogSendFunds',
            },
            {
                event: 'LogSetState',
                args: {
                    _stateMessage: bytes32('Payout successful!'),
                },
            },
        ]),
        tx: standardTx(),
    },
    {
        testId: '#26',
        shouldDoSomething: 'should process #26 - flight never landing.should go on Manual payout.',
        flight: standardFlight('26'),
        timeoutHandler: resolve => () =>
            resolve('OK - #26 should run in timeout, Manual payout.'),
        timeout_value: 80000,
        logHandler: (resolve, reject, context) => (log) => {
            if (log.event === 'LogSetState') {
                context.lastState = context.web3.toUtf8(log.args._stateMessage);
                context.logger.logLine('SetState', context.lastState, 'info');
            } else if (log.event === 'LogSendFunds') {
                reject('#26 should never payout.');
            }
        },
        tx: standardTx(),
    },
    {
        testId: '#27',
        shouldDoSomething: 'should process #27 - invalid status from oracle',
        flight: standardFlight('27'),
        timeoutHandler: resolve => () => resolve('OK - #27 should run in timeout, Manual payout.'),
        timeout_value: 30000,
        logHandler: (resolve, reject, context) => (log) => {
            if (log.event === 'LOG_SetState') {
                context.lastState = context.web3.toUtf8(log.args._stateMessage);
                context.logger.logLine('SetState', context.lastState, 'info');
            } else if (log.event === 'LOG_SendFunds') {
                reject('#27 should never payout.');
            }
        },
        tx: standardTx(),
    },
    {
        testId: '#30',
        shouldDoSomething: 'should process #30 - empty result from oracle',
        flight: standardFlight('30'),
        timeoutHandler: standardTimeoutHandler,
        timeout_value: 80000,
        logHandler: standardLogHandler([
            {
                event: 'LogSendFunds',
            },
            {
                event: 'LogSetState',
                args: {
                    _stateMessage: bytes32('Declined (empty result)'),
                },
            },
            {
                event: 'LogPolicyDeclined',
            },
        ]),
        tx: standardTx(),
    },
    {
        testId: '#31',
        shouldDoSomething: 'should process #31 - invalid result from oracle',
        flight: standardFlight('31'),
        timeoutHandler: standardTimeoutHandler,
        timeout_value: 80000,
        logHandler: standardLogHandler([
            {
                event: 'LogSendFunds',
            },
            {
                event: 'LogSetState',
                args: {
                    _stateMessage: bytes32('Declined (invalid result)'),
                },
            },
            {
                event: 'LogPolicyDeclined',
            },
        ]),
        tx: standardTx(),
    },
    {
        testId: '#32',
        shouldDoSomething: 'should process #32 - too few observations',
        flight: standardFlight('32'),
        timeoutHandler: standardTimeoutHandler,
        timeout_value: 80000,
        logHandler: standardLogHandler([
            {
                event: 'LogSendFunds',
            },
            {
                event: 'LogSetState',
                args: {
                    _stateMessage: bytes32('Declined (too few observations)'),
                },
            },
            {
                event: 'LogPolicyDeclined',
            },
        ]),
        tx: standardTx(),
    },
    {
        testId: '#41',
        shouldDoSomething: 'should process #41 - premium too low',
        flight: standardFlight('20'),
        timeoutHandler: standardTimeoutHandler,
        timeout_value: 80000,
        logHandler: standardLogHandler([
            {
                event: 'LogPolicyDeclined',
                args: {
                    strReason: bytes32('Invalid premium value'),
                },
            },
        ]),
        tx: standardTx(web3.toWei(499, 'finney')),
    },
    {
        testId: '#42',
        shouldDoSomething: 'should process #42 - premium too high',
        flight: standardFlight('20'),
        timeoutHandler: standardTimeoutHandler,
        timeout_value: 80000,
        logHandler: standardLogHandler([
            {
                event: 'LogPolicyDeclined',
                args: {
                    strReason: bytes32('Invalid premium value'),
                },
            },
        ]),
        tx: standardTx(web3.toWei(5001, 'finney')),
    },
    {
        testId: '#43',
        shouldDoSomething: 'should process #43 - too short before start',
        flight: standardFlight('20', false, 1, 90),
        timeoutHandler: standardTimeoutHandler,
        timeout_value: 80000,
        logHandler: standardLogHandler([
            {
                event: 'LogPolicyDeclined',
                args: {
                    strReason: bytes32('Invalid arrival/departure time'),
                },
            },
        ]),
        tx: standardTx(),
    },
    {
        testId: '#44',
        shouldDoSomething: 'should process #44 - invalid departureYearMonthDay',
        flight: standardFlight('20', '/dep/2015/06/30'),
        timeoutHandler: standardTimeoutHandler,
        timeout_value: 80000,
        logHandler: standardLogHandler([
            {
                event: 'LogPolicyDeclined',
                args: {
                    strReason: bytes32('Invalid arrival/departure time'),
                },
            },
        ]),
        tx: standardTx(),
    },
    {
        testId: '#45',
        shouldDoSomething: 'should process #45 - invalid departureTime',
        flight: standardFlight('20', false, -200),
        timeoutHandler: standardTimeoutHandler,
        timeout_value: 80000,
        logHandler: standardLogHandler([
            {
                event: 'LogPolicyDeclined',
                args: {
                    strReason: bytes32('Invalid arrival/departure time'),
                },
            },
        ]),
        tx: standardTx(),
    },
    {
        testId: '#46',
        shouldDoSomething: 'should process #46 - invalid arrivalTime',
        flight: standardFlight('20', false, 60, 200000),
        timeoutHandler: standardTimeoutHandler,
        timeout_value: 80000,
        logHandler: standardLogHandler([
            {
                event: 'LogPolicyDeclined',
                args: {
                    strReason: bytes32('Invalid arrival/departure time'),
                },
            },
        ]),
        tx: standardTx(),
    },
];

module.exports = testSuite;
