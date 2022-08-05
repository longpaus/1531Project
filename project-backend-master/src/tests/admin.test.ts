import { requestClearV1, requestAuthRegisterV3 } from './testFunctions';
import request from 'sync-request';
import config from '../config.json';

const OK = 200;
const port = config.port;
const url = config.url;

const userRemove = (token: string, uId: number) => {
    const res = request(
        'DELETE',
        `${url}:${port}/admin/user/remove/v1`,
        {
            qs: {
                uId: uId
            },
            headers: {
                'token': token
            }
        }
    );
    return res;
}

const userPermissionChange = (token: string, uId: number, permissionId: number) => {
    const res = request(
        'POST',
        `${url}:${port}/admin/userpermission/change/v1`,
        {
            body: JSON.stringify({
                uId: uId,
                permissionId: permissionId
            }),
            headers: {
                'Content-type': 'application/json',
                'token': token
            }
        }
    );
    return res;
}

describe('tests for admin/user/remove/v1', () => {
    requestClearV1();
    const token = requestAuthRegisterV3('foo@bar.com', 'password', 'John', 'Doe').token;
    test('success case', () => {
        requestAuthRegisterV3('tea@bar.com', 'password', 'John', 'Doe');
        const result = userRemove(token, 2);
        expect(result.statusCode).toBe(OK);
        expect(JSON.parse(result.body as string)).toStrictEqual({});
    });
    test('uId refers to only global owner', () => {
        const result = userRemove(token, 1);
        expect(result.statusCode).toBe(400);
        expect(JSON.parse(result.body as string)).toStrictEqual({error: {message: 'Last global owner can not be removed'}});
    });
    test('authorized user not a global owner', () => {
        const token2 = requestAuthRegisterV3('sea@bar.com', 'password', 'Steve', 'Alex').token;
        const uId = requestAuthRegisterV3('plo@bar.com', 'password', 'John', 'Mills').authUserId;
        const result = userRemove(token2, uId);
        expect(result.statusCode).toBe(403);
        expect(JSON.parse(result.body as string)).toStrictEqual({error: {message: 'Not authorised to remove users'}});
    });
});

describe('tests for /admin/userpermssion/change/v1', () => {
    test('success cases', () => {
        requestClearV1();
        const token = requestAuthRegisterV3('foo@bar.com', 'password', 'John', 'Doe').token;
        const uId = requestAuthRegisterV3('tea@bar.com', 'password', 'Jane', 'Smith').authUserId;
        let result = userPermissionChange(token, uId, 1);
        expect(result.statusCode).toBe(OK);
        expect(JSON.parse(result.body as string)).toStrictEqual({});
        result = userPermissionChange(token, uId, 2);
        expect(result.statusCode).toBe(OK);
        expect(JSON.parse(result.body as string)).toStrictEqual({});
    });
    test('error cases', () => {
        requestClearV1();
        const token = requestAuthRegisterV3('foo@bar.com', 'password', 'John', 'Doe').token;
        let result = userPermissionChange(token, 1, 2);
        expect(result.statusCode).toBe(400);
        expect(JSON.parse(result.body as string)).toStrictEqual({error: {message: 'Can not demote the last global owner'}});
        const uId = requestAuthRegisterV3('tea@bar.com', 'password', 'Jane', 'Smith').authUserId;
        result = userPermissionChange(token, uId, 99);
        expect(result.statusCode).toBe(400);
        expect(JSON.parse(result.body as string)).toStrictEqual({error: {message: 'Invalid permissionId'}});
        result = userPermissionChange(token, uId, 2);
        expect(result.statusCode).toBe(400);
        expect(JSON.parse(result.body as string)).toStrictEqual({error: {message: 'User already has these permissions'}});
        const token2 = requestAuthRegisterV3('sea@bar.com', 'password', 'Steve', 'Alex').token;
        result = userPermissionChange(token2, uId, 1);
        expect(result.statusCode).toBe(403);
        expect(JSON.parse(result.body as string)).toStrictEqual({error: {message: 'Not authorised to change permissions'}});
    });
})