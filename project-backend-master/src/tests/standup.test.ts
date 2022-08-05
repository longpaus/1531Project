import request from 'sync-request';
import config from '../config.json';
import { requestAuthRegisterV3, requestChannelsCreateV3, requestClearV1 } from "./testFunctions";

const OK = 200;
const port = config.port;
const url = config.url;

const sleepFor = (time: number) => {
    const now = Math.floor(Date.now());
    while(Math.floor(Date.now()) < now + time) {}
}

const standupStart = (token: string, channelId: number, length: number) => {
    const res = request(
        'POST',
        `${url}:${port}/standup/start/v1`,
        {
            body: JSON.stringify({
                channelId: channelId,
                length: length
            }),
            headers: {
                'Content-type': 'application/json',
                'token': token
            } 
        }
    );
    return res;
}

const standupActive = (token: string, channelId: number) => {
    const res = request(
        'GET',
        `${url}:${port}/standup/active/v1`,
        {
            qs: {
                channelId: channelId
            },
            headers: {
                'token': token
            } 
        }
    );
    return res;
}

const standupSend = (token: string, channelId: number, message: string) => {
    const res = request(
        'POST',
        `${url}:${port}/standup/send/v1`,
        {
            body: JSON.stringify({
                channelId: channelId,
                message: message
            }),
            headers: {
                'Content-type': 'application/json',
                'token': token
            } 
        }
    );
    return res;
}

requestClearV1();
const token = requestAuthRegisterV3('foo@bar.com', 'password', 'John', 'Doe').token;
const token2 = requestAuthRegisterV3('tea@bar.com', 'password', 'Jane', 'Smith').token;
const channelId = requestChannelsCreateV3(token, 'NewChannel', true).channelId;
    
describe('tests for /standup/start/v1', () => {
    test('success case', () => {
        const res = standupStart(token, channelId, 0.1);
        sleepFor(100);
        expect(res.statusCode).toBe(OK);
        expect(JSON.parse(res.body as string)).toStrictEqual({timeFinish: expect.any(Number)});
    });
    test('Standup already active', () => {
        standupStart(token, channelId, 1);
        const res = standupStart(token, channelId, 1);
        sleepFor(1000);
        expect(res.statusCode).toBe(400);
        expect(JSON.parse(res.body as string)).toStrictEqual({error: {message: 'Standup already active'}});
    });
    test('invalid channelId', () => {
        const res = standupStart(token, 99, 1);
        expect(res.statusCode).toBe(400);
        expect(JSON.parse(res.body as string)).toStrictEqual({error: {message: 'Invalid channelId'}});
    });
    test('length is negative', () => {
        const res = standupStart(token, channelId, -1);
        expect(res.statusCode).toBe(400);
        expect(JSON.parse(res.body as string)).toStrictEqual({error: {message: 'Length must be positive'}});
    });
    test('user not in channel', () => {
        const res = standupStart(token2, channelId, 1);
        expect(res.statusCode).toBe(403);
        expect(JSON.parse(res.body as string)).toStrictEqual({error: {message: 'User not in channel'}});
    });
});

describe('tests for /standup/active/v1', () => {
    test('success', () => {
        standupStart(token, channelId, 1);
        let res = standupActive(token, channelId);
        expect(res.statusCode).toBe(OK);
        expect(JSON.parse(res.body as string)).toStrictEqual({
            isActive: true,
            timeFinish: expect.any(Number)
        });
        sleepFor(1000);
        res = standupActive(token, channelId);
        expect(res.statusCode).toBe(OK);
        expect(JSON.parse(res.body as string)).toStrictEqual({
            isActive: false,
            timeFinish: null
        });
    });
    test('invalid channelId', () => {
        const res = standupActive(token , 99);
        expect(res.statusCode).toBe(400);
        expect(JSON.parse(res.body as string)).toStrictEqual({error: {message: 'Invalid channelId'}});
    });
    test('user not in channel', () => {
        const res = standupActive(token2 , channelId);
        expect(res.statusCode).toBe(403);
        expect(JSON.parse(res.body as string)).toStrictEqual({error: {message: 'User not in channel'}});
    });
});

describe('tests for /standup/send/v1', () => {
    test('success', () => {
        standupStart(token, channelId, 1);
        const res = standupSend(token, channelId, 'message');
        standupSend(token, channelId, 'message2');
        sleepFor(1000);
        expect(res.statusCode).toBe(OK);
        expect(JSON.parse(res.body as string)).toStrictEqual({});
    });
    test('standup not active', () => {
        const res = standupSend(token, channelId, 'message');
        expect(res.statusCode).toBe(400);
        expect(JSON.parse(res.body as string)).toStrictEqual({error: {message: 'No active standup'}});
    });
    test('message length over 1000 chars', () => {
        let message = 'x'
        for (let i = 0; i < 1001; i++) {
            message = message + 'x'
        }
        standupStart(token, channelId, 0.5);
        const res = standupSend(token, channelId, message);
        sleepFor(500);
        expect(res.statusCode).toBe(400);
        expect(JSON.parse(res.body as string)).toStrictEqual({error: {message: 'Message must be under 1000 characters'}});
    });
});