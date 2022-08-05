import { requestAuthRegisterV3, requestClearV1 } from './testFunctions';
import request from 'sync-request';
import config from '../config.json';

const OK = 200;
const port = config.port;
const url = config.url;
requestClearV1();
const channelsCreatev3 = (token: string, name: string, isPublic: boolean) => {
    const res = request(
        'POST',
        `${url}:${port}/channels/create/v3`,
        {
            body: JSON.stringify({
                name: name,
                isPublic: isPublic
            }),
            headers: {
                'Content-type': 'application/json',
                token: token
            }
        }
    );
    return res;
}
const channelsListV3 = (token: string) => {
    const res = request(
        'GET',
        `${url}:${port}/channels/list/v3`,
        {
            
            headers: {
                token: token,
            }
        }
    );
    return {
        body : JSON.parse(res.getBody() as string),
        statusCode: res.statusCode
    };
    
}
const channelsListAllV3 = (token: string) => {
    const res =  request(
        'GET',
        `${url}:${port}/channels/listall/v3`,
        {
            
            headers: {
                token: token,
        }
        }
    );
    return {
        body : JSON.parse(res.getBody() as string),
        statusCode: res.statusCode
    };
}

requestClearV1();
const token = requestAuthRegisterV3('foo@Bar.com', 'password', 'John', 'Doe').token;
const token1 = requestAuthRegisterV3('haha@Bar.com', 'password1', 'John', 'Ay').token;
const token2 = requestAuthRegisterV3('tea@Bar.com', 'password2', 'John', 'Zhu').token;
channelsCreatev3(token1,"newChannel1", true);
channelsCreatev3(token2,"newChannel2", false);

describe('tests for channels/create/v2', () => {
    test.each([
        {token: token, name: 'newChannel', isPublic: true, statusCode: OK, result: {channelId: 3}},
        {token: token, name: '', isPublic: true, statusCode: 400, result: {error: {message: 'Name must be between 1 and 20 characters'}}},
        {token: token, name: 'thisiswellovertwentycharacterslong', isPublic: true, statusCode: 400, result: {error: {message: 'Name must be between 1 and 20 characters'}}}
    ])('/channels/create/v3 tests', ({token, name, isPublic, statusCode, result}) => {
        let res = channelsCreatev3(token, name, isPublic);
        expect(res.statusCode).toBe(statusCode);
        expect(JSON.parse(res.body as string)).toStrictEqual(result);
    });
});

test('success details', () => { 
    const channel1 = channelsListV3 (token1);
    expect(channel1.statusCode).toEqual(200);
    expect(channel1.body).toStrictEqual (
        {channels: [{channelId: 1, name: 'newChannel1'}]
    });
})

test('success listall', () => { 
    const channel2 = channelsListAllV3 (token1);
    expect(channel2.statusCode).toEqual(200);
    expect(channel2.body).toStrictEqual (
        {channels: [{channelId: 1, name: 'newChannel1'},{channelId:2, name: 'newChannel2'},{channelId: 3, name: 'newChannel'}]
    });
});
