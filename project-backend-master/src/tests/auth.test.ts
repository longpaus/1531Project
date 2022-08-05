//tests for the functions in the auth.js folder

import { requestClearV1, requestAuthRegisterV3 } from './testFunctions'
import request from 'sync-request';
import config from '../config.json';

const OK = 200;
const port = config.port;
const url = config.url;


const authRegisterV3 = (email: string, password: string, nameFirst: string, nameLast: string) => {
    const res = request(
        'POST',
        `${url}:${port}/auth/register/v3`,
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

const authLoginV3 = (email: string, password: string) => {
    const res = request(
        'POST',
        `${url}:${port}/auth/login/v3`,
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

const authLogoutV2 = (token: string) => {
    const res = request(
        'POST',
        `${url}:${port}/auth/logout/v2`,
        {
            headers: {
                'Content-type': 'application/json',
                'token': token
            }
        }
    );
    return res;
}

const authPasswordRequest = (email: string) => {
    const res = request(
        'POST',
        `${url}:${port}/auth/passwordreset/request/v1`,
        {
            body: JSON.stringify({
                email: email
            }),
            headers: {
                'Content-type': 'application/json',
            }
        }
    );
    return res;
}

const authPasswordReset = (resetCode: string, newPassword: string) => {
    const res = request(
        'POST',
        `${url}:${port}/auth/passwordreset/reset/v1`,
        {
            body: JSON.stringify({
                resetCode: resetCode,
                newPassword: newPassword
            }),
            headers: {
                'Content-type': 'application/json',
            }
        }
    );
    return res;
}

describe('tests for auth functions', () => {
    requestClearV1();
    test.each([
        {email: 'foo@bar.com', password: 'password', nameFirst: 'John', nameLast: 'Doe', statusCode: OK, result: {token: expect.any(String), authUserId: 2}},
        {email: 'foo@bar.com', password: 'password', nameFirst: 'John', nameLast: 'Doe', statusCode: 400, result: {error: {message: 'Email already in use'}}},
        {email: 'tea@bar.com', password: 'pass', nameFirst: 'John', nameLast: 'Doe', statusCode: 400, result: {error: {message: 'Password must be over 5 characters long'}}},
        {email: 'kekek', password: 'password', nameFirst: 'John', nameLast: 'Doe', statusCode: 400, result: {error: {message: 'Email is invalid'}}},
        {email: 'tea@bar.com', password: 'password', nameFirst: '', nameLast: 'Doe', statusCode: 400, result: {error: {message: 'Name must be between 1 and 50 characters'}}},
        {email: 'tea@bar.com', password: 'password', nameFirst: 'John', nameLast: '', statusCode: 400, result: {error: {message: 'Name must be between 1 and 50 characters'}}},
        {email: 'tea@bar.com', password: 'password', nameFirst: 'iiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiii', nameLast: 'Doe', statusCode: 400, result: {error: {message: 'Name must be between 1 and 50 characters'}}},
        {email: 'tea@bar.com', password: 'password', nameFirst: 'John', nameLast: 'iiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiii', statusCode: 400, result: {error: {message: 'Name must be between 1 and 50 characters'}}},
    ])('/auth/register/v3 tests', ({email, password, nameFirst, nameLast, statusCode, result}) => {
        let res = authRegisterV3(email, password, nameFirst, nameLast);
        expect(res.statusCode).toBe(statusCode);
        expect(JSON.parse(res.body as string)).toStrictEqual(result);
    });
    test.each([
        {email: 'foo@bar.com', password: 'password', statusCode: OK, result: {token: expect.any(String), authUserId: 2}},
        {email: 'free@bar.com', password: 'password', statusCode: 400, result: {error: {message: 'Invalid Email'}}},
        {email: 'foo@bar.com', password: 'notPassword', statusCode: 400, result: {error: {message: 'Invalid Password'}}}
    ])('/auth/login/v3 tests', ({email, password, statusCode, result}) => {
        let res = authLoginV3(email, password);
        expect(res.statusCode).toBe(statusCode);
        expect(JSON.parse(res.body as string)).toStrictEqual(result);
    });
    test.each([
        {token: requestAuthRegisterV3('tree@bar.com', 'password', 'Name', 'Name').token, statusCode: OK, result: {}},
        {token: 'kekw', statusCode: 403, result: {error: {message: 'Invalid Token'}}}
    ])('/auth/logout/v3 tests', ({token, statusCode, result}) => {
        let res = authLogoutV2(token);
        expect(res.statusCode).toBe(statusCode);
        expect(JSON.parse(res.body as string)).toStrictEqual(result);
    });
    test.each([
        {email: 'foo@bar.com', statusCode: OK, result: {}},
        {email: 'notanemail@bar.com', statusCode: OK, result: {}}
    ])('/auth/passwordreset/request/v1 tests', ({email, statusCode, result}) => {
        let res = authPasswordRequest(email);
        expect(res.statusCode).toBe(statusCode);
        expect(JSON.parse(res.body as string)).toStrictEqual(result);
    });
    test.each([
        {code: 'WRON-GGGG', password: 'password', statusCode: 400, result: {error: {message: 'Invalid reset code'}}},
    ])('/auth/passwordreset/reset/v1 tests', ({code, password, statusCode, result}) => {
        let res = authPasswordReset(code, password);
        expect(res.statusCode).toBe(statusCode);
        expect(JSON.parse(res.body as string)).toStrictEqual(result);
    });
});