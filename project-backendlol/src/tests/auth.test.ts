//tests for the functions in the auth.js folder

import { authLoginV1, authRegisterV1 } from "../auth";
import { clearV1 } from '../other'
import { requestClearV1, requestAuthRegisterV2 } from './testFunctions'
import request from 'sync-request';
import config from '../config.json';

const OK = 200;
const port = config.port;
const url = config.url;

requestClearV1();


describe('tests for the authRegisterV1 function', () => {
    test('invalid inputs', () => {
        clearV1();
        expect(authRegisterV1('foo@bar.com', 'StrongPassword', '', 'Smith')).toStrictEqual({error: 'error'});
        expect(authRegisterV1('foo@bar.com', 'StrongPassword', 'Jane', '')).toStrictEqual({error: 'error'});
        expect(authRegisterV1('foo@bar.com', 'StrongPassword', 'ThisIsOverFiftyCharacterLongThisIsOverFiftyCharacterLong', 'Smith')).toStrictEqual({error: 'error'});
        expect(authRegisterV1('foo@bar.com', 'StrongPassword', 'Jane', 'ThisIsOverFiftyCharacterLongThisIsOverFiftyCharacterLong')).toStrictEqual({error: 'error'});
        expect(authRegisterV1('foo@bar.com', 'Short', 'Jane', 'Smith')).toStrictEqual({error: 'error'});
    });
    test('Email already in use', () => {
        clearV1();
        authRegisterV1('foo@bar.com', 'StrongPassword', 'Jane', 'Smith')
        expect(authRegisterV1('foo@bar.com', 'StrongPassword', 'John', 'Doe')).toStrictEqual({error: 'error'});
    });
    test('Case sensitivity in email', () => {
        clearV1();
        authRegisterV1('foo@bar.com', 'StrongPassword', 'Jane', 'Smith')
        expect(authRegisterV1('FOO@bar.com', 'StrongPassword', 'John', 'Doe')).toStrictEqual({error: 'error'});
    })
    test('output for authRegisterV1', () => {
        clearV1();
        expect(authRegisterV1('foo@bar.com', 'StrongPassword', 'Jane', 'Smith')).toStrictEqual({authUserId: 1});
        expect(authRegisterV1('tea@bar.com', 'StrongPassword', 'John', 'Doe')).toStrictEqual({authUserId: 2});
    });
});

describe('Tests for the authLoginV1 function', () => {
    test('Invalid email', () => {
        clearV1();
        authRegisterV1('foo@bar.com', 'Password', 'Jane', 'Smith');
        expect(authLoginV1('tea@bar.com', 'Password')).toStrictEqual({error: 'error'});
    });
    test('Invalid password', () => {
        expect(authLoginV1('foo@bar.com', 'wrong')).toStrictEqual({error: 'error'});
    });
    test('output on log in', () => {
        expect(authLoginV1('foo@bar.com', 'Password')).toStrictEqual({authUserId: 1});
    });
    test('email case sensitivity', () => {
        expect(authLoginV1('FOO@bar.com', 'Password')).toStrictEqual({authUserId: 1});
    })
    test('password case sensitivity', () => {
        expect(authLoginV1('foo@bar.com', 'pAsSwOrD')).toStrictEqual({error: 'error'});
    })
});

const authRegisterV2 = (email: string, password: string, nameFirst: string, nameLast: string) => {
    const res = request(
        'POST',
        `${url}:${port}/auth/register/v2`,
        {
            body: JSON.stringify({
                email: email,
                password: password,
                nameFirst: nameFirst,
                nameLast: nameLast
            }),
            headers: {'Content-type': 'application/json'} 
        }
    );
    return res;
}

const authLoginV2 = (email: string, password: string) => {
    const res = request(
        'POST',
        `${url}:${port}/auth/login/v2`,
        {
            body: JSON.stringify({
                email: email,
                password: password,
            }),
            headers: {'Content-type': 'application/json'} 
        }
    );
    return res;
}

const authLogoutV1 = (token: string) => {
    const res = request(
        'POST',
        `${url}:${port}/auth/logout/v1`,
        {
            body: JSON.stringify({
                token: token
            }),
            headers: {'Content-type': 'application/json'} 
        }
    );
    return res;
}

describe('tests for auth/register/v2', () => {
    test('succesfully registered', () => {
        requestClearV1();
        let result = authRegisterV2('foo@bar.com', 'password', 'John', 'Doe');
        expect(result.statusCode).toBe(OK);
        expect(JSON.parse(result.getBody() as string)).toStrictEqual({
            token: expect.any(String),
            authUserId: 1
        });
        result = authRegisterV2('tea@bar.com', 'password', 'Jane', 'Smith');
        expect(result.statusCode).toBe(OK);
        expect(JSON.parse(result.getBody() as string)).toStrictEqual({
            token: expect.any(String),
            authUserId: 2
        });
    });
    test('error cases', () => {
        let result = authRegisterV2('foo@bar.com', 'password', 'John', 'Doe');
        expect(result.statusCode).toBe(OK);
        expect(JSON.parse(result.getBody() as string)).toStrictEqual({error: 'error'});
        result = authRegisterV2('bee@bar.com', 'pass', 'John', 'Doe');
        expect(result.statusCode).toBe(OK);
        expect(JSON.parse(result.getBody() as string)).toStrictEqual({error: 'error'});
        result = authRegisterV2('bee@bar.com', 'password', 'thisiswayoverfiftycharacterslongyeahbelivemeitisplsbelieveme', 'Doe');
        expect(result.statusCode).toBe(OK);
        expect(JSON.parse(result.getBody() as string)).toStrictEqual({error: 'error'});
        result = authRegisterV2('bee@bar.com', 'password', 'John', 'thisiswayoverfiftycharacterslongyeahbelievemeitisplsbelieveme');
        expect(result.statusCode).toBe(OK);
        expect(JSON.parse(result.getBody() as string)).toStrictEqual({error: 'error'});
    })
})

describe('tests for auth/login/v1', () => {
    test('succesful login', () => {
        let result = authLoginV2('foo@bar.com', 'password');
        expect(result.statusCode).toBe(OK);
        expect(JSON.parse(result.getBody() as string)).toStrictEqual({
            token: expect.any(String),
            authUserId: 1
        });
    });
    test('error cases', () => {
        let result = authLoginV2('bee@bar.com', 'password');
        expect(result.statusCode).toBe(OK);
        expect(JSON.parse(result.getBody() as string)).toStrictEqual({error:'error'});
        result = authLoginV2('foo@bar.com', 'wrongpassword');
        expect(result.statusCode).toBe(OK);
        expect(JSON.parse(result.getBody() as string)).toStrictEqual({error:'error'});
    });
});

describe('tests for auth/logout/v1', () => {
    requestClearV1();
    let token = requestAuthRegisterV2('foo@bar.com', 'password', 'John', 'Doe').token
    test('succesful logout', () => {
        const result = authLogoutV1(token);
        expect(result.statusCode).toBe(OK);
        expect(JSON.parse(result.getBody() as string)).toStrictEqual({});
    });
});