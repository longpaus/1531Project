
import { authRegisterV1 } from "../auth";
import { clearV1 } from '../other'
import { channelsCreateV1, channelsListV1, channelsListallV1 } from "../channels";
import { requestAuthRegisterV2, requestClearV1 } from './testFunctions';
import request from 'sync-request';
import config from '../config.json';

const OK = 200;
const port = config.port;
const url = config.url;

const channelsCreatev2 = (token: string, name: string, isPublic: boolean) => {
    const res = request(
        'POST',
        `${url}:${port}/channels/create/v2`,
        {
            body: JSON.stringify({
                token: token,
                name: name,
                isPublic: isPublic
            }),
            headers: {'Content-type': 'application/json'}
        }
    );
    return res;
}

describe('tests for the channelsCreateV1 function', () => {
    test('invalid name', () => {
        clearV1();
        authRegisterV1('foo@bar.com', 'StrongPassword', 'Jane', 'Smith');
        expect(channelsCreateV1(1, '', false)).toStrictEqual({error: 'error'});
        expect(channelsCreateV1(1, 'overtwentycharactername', true)).toStrictEqual({error: 'error'});
    });

    test('output for newChannel', () => {
        clearV1();
        authRegisterV1('foo@bar.com', 'StrongPassword', 'Jane', 'Smith')
        authRegisterV1('tea@bar.com', 'StrongPassword', 'John', 'Doe')
        expect(channelsCreateV1(1, 'hello', false)).toStrictEqual({channelId : 1});
        expect(channelsCreateV1(2, 'goodbye', true)).toStrictEqual({channelId : 2});
    });
});

describe('tests for the channelsListV1 function', () => {
    test('invalid authUserId', () => {
        clearV1();
        authRegisterV1('tea@bar.com', 'StrongPassword', 'John', 'Doe');
        channelsCreateV1(1, 'hello', false);
        channelsCreateV1(1, 'goodbye', true);
        expect(channelsListV1(2)).toStrictEqual({error: 'error'});
    });
    test('function output', () => {
        clearV1();
        authRegisterV1('tea@bar.com', 'StrongPassword', 'John', 'Doe');
        channelsCreateV1(1, 'hello', false);
        channelsCreateV1(1, 'goodbye', true);
        expect(channelsListV1(1)).toStrictEqual({channels: [{
            channelId : 1,
            name : 'hello'
        },
        {
            channelId : 2,
            name : 'goodbye'
        }]});
    });
});

describe('tests for the channellistall function', () => {
    test('regular input', () => {
        clearV1();
        authRegisterV1('foo@bar.com', 'StrongPassword', 'Jane', 'Smith');
        channelsCreateV1(1, 'hello', false);
        authRegisterV1('tea@bar.com', 'StrongPassword', 'Jane', 'ddy');
        channelsCreateV1(2, 'goodbye', true);
        expect(channelsListallV1(1)).toStrictEqual(
        { channels:
            [{
                name : 'hello',
                channelId: 1, 
            },
            {
                name : 'goodbye',
                channelId: 2,
            }]
        });        
    });
});

describe('tests for channels/create/v2', () => {
    requestClearV1();
    const token = requestAuthRegisterV2('foo@Bar.com', 'password', 'John', 'Doe').token;
    test('successful output', () => {
        const result = channelsCreatev2(token, 'coolname', true);
        expect(result.statusCode).toBe(OK);
        expect(JSON.parse(result.getBody() as string)).toStrictEqual({channelId: 1});
    });
    test('error outputs', () => {
        let result = channelsCreatev2('xd?', 'coolname', true);
        expect(result.statusCode).toBe(OK);
        expect(JSON.parse(result.getBody() as string)).toStrictEqual({error: 'error'});
        result = channelsCreatev2('token', '', true);
        expect(result.statusCode).toBe(OK);
        expect(JSON.parse(result.getBody() as string)).toStrictEqual({error: 'error'});
        result = channelsCreatev2('token', 'overtwentycharacterslong', true);
        expect(result.statusCode).toBe(OK);
        expect(JSON.parse(result.getBody() as string)).toStrictEqual({error: 'error'});
    })
});