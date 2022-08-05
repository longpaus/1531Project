// tests for dm functions
import { requestClearV1, requestAuthRegisterV3, requestDmCreateV1, requestMessageSenddmV2, requestDmMessagesV2, requestUserRemove } from './testFunctions';
import request from 'sync-request';
import config from '../config.json';

const OK = 200;
const port = config.port;
const url = config.url;
const BAD_REQUEST = 400
const FORBIDDEN = 403

const DmCreateV2 = (token: string, uIds: number[]) => {
    const res = request(
        'POST',
        `${url}:${port}/dm/create/v2`,
        {
            body: JSON.stringify({
                uIds: uIds
            }),
            headers: {
                'Content-type': 'application/json',
                'token': token
            }
        }
    );
    return res;
}

const DmListV2 = (token: string) => {
    const res = request(
        'GET',
        `${url}:${port}/dm/list/v2`,
        {
            headers: {
                'token': token
            }
        }
    );
    return res;
}

const DmRemoveV2 = (token: string, dmId: number) => {
    const res = request(
        'DELETE',
        `${url}:${port}/dm/remove/v2`,
        {
            qs: {
                dmId: dmId
            },
            headers: {
                'token': token
            }
        }
    );
    return res;
}

const DmDetailsV2 = (token: string, dmId: number) => {
    const res = request(
        'GET',
        `${url}:${port}/dm/details/v2`,
        {
            qs: {
                dmId: dmId
            },
            headers: {
                'token': token
            }
        }
    );
    return res;
}

const DmLeaveV2 = (token: string, dmId: number) => {
    const res = request(
        'POST',
        `${url}:${port}/dm/leave/v2`,
        {
            body: JSON.stringify({
                dmId: dmId
            }),
            headers: {
                'Content-type': 'application/json',
                token: token
            }
        }
    );
    return res;
}

describe('dm tests', () => {
    requestClearV1();
    const token = requestAuthRegisterV3('foo@bar.com', 'password', 'John', 'Doe').token;
    const token2 = requestAuthRegisterV3('tea@bar.com', 'password', 'Jane', 'Smith').token;
    const token3 = requestAuthRegisterV3('see@bar.com', 'password', 'Steven', 'Alex').token;
    test.each([
        {token: token, uIds: [2], statusCode: OK, result: {dmId: 1}},
        {token: token2, uIds: [1, 3], statusCode: OK, result: {dmId: 2}},
        {token: token, uIds: [1, 2], statusCode: 400, result: {error: {message: 'Owner can not be included in list of dms'}}},
        {token: token, uIds: [2, 2], statusCode: 400, result: {error: {message: 'Duplicate users not allowed in uIds'}}},
        {token: token, uIds: [2, 99], statusCode: 400, result: {error: {message: 'Invalid uId in uIds'}}},
        {token: 'notatoken', uIds: [2], statusCode: 403, result: {error: {message: 'Invalid Token'}}}
    ])('/dm/create/v2 tests', ({token, uIds, statusCode, result}) => {
        let res = DmCreateV2(token, uIds);
        expect(res.statusCode).toBe(statusCode);
        expect(JSON.parse(res.body as string)).toStrictEqual(result);
    });
    test.each([
        {token: token, dmId: 1, statusCode: OK, result: {}},
        {token: token3, dmId: 1, statusCode: 403, result: {error: {message: 'Can not leave a dm you are not in'}}},
        {token: token, dmId: 99, statusCode: 400, result: {error: {message: 'Invalid dmId'}}},
        {token: 'not a token', dmId: 1, statusCode: 403, result: {error: {message: 'Invalid token'}}}
    ])('/dm/leave/v2 tests', ({token, dmId, statusCode, result}) => {
        let res = DmLeaveV2(token, dmId);
        expect(res.statusCode).toBe(statusCode);
        expect(JSON.parse(res.body as string)).toStrictEqual(result);
    });
    test.each([
        {token: token2, dmId: 2, statusCode: OK, result: {}},
        {token: token, dmId: 1, statusCode: 403, result: {error: {message: 'Only dm owner can remove dm'}}},
        {token: token2, dmId: 1, statusCode: 403, result: {error: {message: 'Only dm owner can remove dm'}}},
        {token: token, dmId: 99, statusCode: 400, result: {error: {message: 'Invalid dmId'}}}
    ])('/dm/remove/v2 tests', ({token, dmId, statusCode, result}) => {
        let res = DmRemoveV2(token, dmId);
        expect(res.statusCode).toBe(statusCode);
        expect(JSON.parse(res.body as string)).toStrictEqual(result);
    });
    test.each([
        {token: token2, statusCode: OK, result: {dms: [{dmId: 1, name: 'janesmith, johndoe'}]}},
        {token: token, statusCode: OK, result: {dms: []}},
        {token: 'notatoken', statusCode: 403, result: {error: {message: 'Invalid token'}}}
    ])('/dm/list/v2 tests', ({token, statusCode, result}) => {
        let res = DmListV2(token);
        expect(res.statusCode).toBe(statusCode);
        expect(JSON.parse(res.body as string)).toStrictEqual(result);
    });
    test.each([
        {token: token2, dmId: 1, statusCode: OK, result: {
            name: 'janesmith, johndoe',
            members: [{uId: 2, email: 'tea@bar.com', nameFirst: 'Jane', nameLast: 'Smith', handleStr: 'janesmith', profileImgUrl: expect.any(String)}]    
        }},
        {token: token, dmId: 99, statusCode: 400, result: {error: {message: 'Invalid dmId'}}},
        {token: token3, dmId: 1, statusCode: 403, result: {error: {message: 'Only members can view dm details'}}}
    ])('/dm/details/v2 tests', ({token, dmId, statusCode, result}) => {
        let res = DmDetailsV2(token, dmId);
        expect(res.statusCode).toBe(statusCode);
        expect(JSON.parse(res.body as string)).toStrictEqual(result);
    });
});
const dmMessagesV2 = (token: string, dmId: number, start: number) => {
    const res = request(
        'GET',
        `${url}:${port}/dm/messages/v2`,
        {
            qs: { dmId, start },
            headers:{
                token:token
            }
        }
    );
    return res
}

describe('tests for dm/messages/v1', () => {
    test('successful output with start at 0', () => {
        requestClearV1();
        const user1 = requestAuthRegisterV3('longpaus@gmail.com', 'password', 'long', 'pham');
        const user2 = requestAuthRegisterV3('wonderkid@gmail.com', 'shshhs', 'wonder', 'kid');
        const user3 = requestAuthRegisterV3('dpitts@yahoo.com', 'shshhs', 'wonder', 'kid');
        const dm1Id = requestDmCreateV1(user1.token, [user2.authUserId, user3.authUserId]).dmId
        const message1Id = requestMessageSenddmV2(user2.token, dm1Id, 'hello guys').messageId
        const message2Id = requestMessageSenddmV2(user3.token, dm1Id, 'fgfgggfgf').messageId
        const message3Id = requestMessageSenddmV2(user3.token, dm1Id, 'hdhdh dhdn').messageId
        const message4Id = requestMessageSenddmV2(user1.token, dm1Id, 'vfhdbhjds  dhbs dh jb dy dsb').messageId
        const message5Id = requestMessageSenddmV2(user1.token, dm1Id, 'lol').messageId
        const Dm1Messages = requestDmMessagesV2(user1.token, dm1Id, 0)
        expect(Dm1Messages.start).toBe(0);
        expect(Dm1Messages.end).toBe(-1);

        expect(Dm1Messages.messages[0].messageId).toBe(message5Id);
        expect(Dm1Messages.messages[0].uId).toBe(user1.authUserId);
        expect(Dm1Messages.messages[0].message).toBe('lol');

        expect(Dm1Messages.messages[1].messageId).toBe(message4Id);
        expect(Dm1Messages.messages[1].uId).toBe(user1.authUserId);
        expect(Dm1Messages.messages[1].message).toBe('vfhdbhjds  dhbs dh jb dy dsb');

        expect(Dm1Messages.messages[2].messageId).toBe(message3Id);
        expect(Dm1Messages.messages[2].uId).toBe(user3.authUserId);
        expect(Dm1Messages.messages[2].message).toBe('hdhdh dhdn');

        expect(Dm1Messages.messages[3].messageId).toBe(message2Id);
        expect(Dm1Messages.messages[3].uId).toBe(user3.authUserId);
        expect(Dm1Messages.messages[3].message).toBe('fgfgggfgf');

        expect(Dm1Messages.messages[4].messageId).toBe(message1Id);
        expect(Dm1Messages.messages[4].uId).toBe(user2.authUserId);
        expect(Dm1Messages.messages[4].message).toBe('hello guys');

        let dmMessagesResult = dmMessagesV2(user1.token, dm1Id, 0)
        expect(dmMessagesResult.statusCode).toBe(OK)
    });
    test('successful output start is not zero', () => {
        requestClearV1();
        const user1 = requestAuthRegisterV3('longpaus@gmail.com', 'password', 'long', 'pham');
        const user2 = requestAuthRegisterV3('wonderkid@gmail.com', 'shshhs', 'wonder', 'kid');
        const user3 = requestAuthRegisterV3('dpitts@yahoo.com', 'shshhs', 'wonder', 'kid');
        const dm1Id = requestDmCreateV1(user1.token, [user2.authUserId, user3.authUserId]).dmId
        const message1Id = requestMessageSenddmV2(user2.token, dm1Id, 'hello guys').messageId
        const message2Id = requestMessageSenddmV2(user3.token, dm1Id, 'fgfgggfgf').messageId
        const message3Id = requestMessageSenddmV2(user3.token, dm1Id, 'hdhdh dhdn').messageId
        requestMessageSenddmV2(user1.token, dm1Id, 'vfhdbhjds  dhbs dh jb dy dsb').messageId
        requestMessageSenddmV2(user1.token, dm1Id, 'lol').messageId
        const Dm1Messages = requestDmMessagesV2(user1.token, dm1Id, 2)
        expect(Dm1Messages.start).toBe(2);
        expect(Dm1Messages.end).toBe(-1);

        expect(Dm1Messages.messages[0].messageId).toBe(message3Id);
        expect(Dm1Messages.messages[0].uId).toBe(user3.authUserId);
        expect(Dm1Messages.messages[0].message).toBe('hdhdh dhdn');

        expect(Dm1Messages.messages[1].messageId).toBe(message2Id);
        expect(Dm1Messages.messages[1].uId).toBe(user3.authUserId);
        expect(Dm1Messages.messages[1].message).toBe('fgfgggfgf');

        expect(Dm1Messages.messages[2].messageId).toBe(message1Id);
        expect(Dm1Messages.messages[2].uId).toBe(user2.authUserId);
        expect(Dm1Messages.messages[2].message).toBe('hello guys');

        let dmMessagesResult = dmMessagesV2(user1.token, dm1Id, 2)
        expect(dmMessagesResult.statusCode).toBe(OK)
    });
    test('error: dmId is not valid', () => {
        requestClearV1();
        const user1 = requestAuthRegisterV3('longpaus@gmail.com', 'password', 'long', 'pham');
        const user2 = requestAuthRegisterV3('wonderkid@gmail.com', 'shshhs', 'wonder', 'kid');
        const user3 = requestAuthRegisterV3('dpitts@yahoo.com', 'shshhs', 'wonder', 'kid');
        const dm1Id = requestDmCreateV1(user1.token, [user2.authUserId, user3.authUserId]).dmId
        requestMessageSenddmV2(user2.token, dm1Id, 'hello guys').messageId
        // expect(requestDmMessagesV2(user1.token, 8, 2)).toThrow('invalid dmId')

        let dmMessagesResult = dmMessagesV2(user1.token, 8, 2)
        expect(dmMessagesResult.statusCode).toBe(BAD_REQUEST)
    });
    test('error start is greater than the number of messages in dm', () => {
        requestClearV1();
        const user1 = requestAuthRegisterV3('longpaus@gmail.com', 'password', 'long', 'pham');
        const user2 = requestAuthRegisterV3('wonderkid@gmail.com', 'shshhs', 'wonder', 'kid');
        const user3 = requestAuthRegisterV3('dpitts@yahoo.com', 'shshhs', 'wonder', 'kid');
        const dm1Id = requestDmCreateV1(user1.token, [user2.authUserId, user3.authUserId]).dmId
        requestMessageSenddmV2(user2.token, dm1Id, 'hello guys').messageId
        requestMessageSenddmV2(user3.token, dm1Id, 'fgfgggfgf').messageId
        requestMessageSenddmV2(user3.token, dm1Id, 'hdhdh dhdn').messageId
        requestMessageSenddmV2(user1.token, dm1Id, 'vfhdbhjds  dhbs dh jb dy dsb').messageId
        requestMessageSenddmV2(user1.token, dm1Id, 'lol').messageId
        // expect(requestDmMessagesV2(user1.token, dm1Id, 5)).toThrow('invalid start')

        let dmMessagesResult = dmMessagesV2(user1.token, dm1Id, 5)
        expect(dmMessagesResult.statusCode).toBe(BAD_REQUEST)
    });
    test('error: start is a negative number', () => {
        requestClearV1();
        const user1 = requestAuthRegisterV3('longpaus@gmail.com', 'password', 'long', 'pham');
        const user2 = requestAuthRegisterV3('wonderkid@gmail.com', 'shshhs', 'wonder', 'kid');
        const user3 = requestAuthRegisterV3('dpitts@yahoo.com', 'shshhs', 'wonder', 'kid');
        const dm1Id = requestDmCreateV1(user1.token, [user2.authUserId, user3.authUserId]).dmId
        requestMessageSenddmV2(user2.token, dm1Id, 'hello guys').messageId
        requestMessageSenddmV2(user3.token, dm1Id, 'fgfgggfgf').messageId
        requestMessageSenddmV2(user3.token, dm1Id, 'hdhdh dhdn').messageId
        requestMessageSenddmV2(user1.token, dm1Id, 'vfhdbhjds  dhbs dh jb dy dsb').messageId
        requestMessageSenddmV2(user1.token, dm1Id, 'lol').messageId
        // expect(requestDmMessagesV2(user1.token, dm1Id, -1)).toThrow('invalid start')
        
        let dmMessagesResult = dmMessagesV2(user1.token, dm1Id, -1)
        expect(dmMessagesResult.statusCode).toBe(BAD_REQUEST)
    });
    test('error: the user is not apart of the dm', () => {
        requestClearV1();
        const user1 = requestAuthRegisterV3('longpaus@gmail.com', 'password', 'long', 'pham');
        const user2 = requestAuthRegisterV3('wonderkid@gmail.com', 'shshhs', 'wonder', 'kid');
        const user3 = requestAuthRegisterV3('dpitts@yahoo.com', 'shshhs', 'wonder', 'kid');
        const dm1Id = requestDmCreateV1(user1.token, [user2.authUserId, user3.authUserId]).dmId
        requestMessageSenddmV2(user2.token, dm1Id, 'hello guys').messageId
        requestMessageSenddmV2(user3.token, dm1Id, 'fgfgggfgf').messageId
        requestMessageSenddmV2(user3.token, dm1Id, 'hdhdh dhdn').messageId
        requestMessageSenddmV2(user1.token, dm1Id, 'vfhdbhjds  dhbs dh jb dy dsb').messageId
        requestMessageSenddmV2(user1.token, dm1Id, 'lol').messageId
        // expect(requestDmMessagesV2('dhdjhbhvdb', dm1Id, 0)).toThrow('invalid userId');

        let dmMessagesResult = dmMessagesV2('dhdjhbhvdb', dm1Id, 0)
        expect(dmMessagesResult.statusCode).toBe(FORBIDDEN)        
    })
});

describe('testing userRemove interaction with dms', () => {
    test('user removed from dm', () => {
        requestClearV1();
        const token = requestAuthRegisterV3('foo@bar.com', 'password', 'John', 'Doe').token;
        const token2 = requestAuthRegisterV3('tea@bar.com', 'password', 'Jane', 'Smith').token;
        requestDmCreateV1(token2, [1]);
        requestMessageSenddmV2(token2, 1, 'random message');
        requestUserRemove(token, 2);
        const result = DmDetailsV2(token, 1);
        expect(JSON.parse(result.body as string)).toStrictEqual({
            name: 'janesmith, johndoe',
            members: [{
                uId: 1,
                email: 'foo@bar.com',
                nameFirst: 'John',
                nameLast: 'Doe',
                handleStr: 'johndoe',
                profileImgUrl: expect.any(String)
            }]
        });
        const result2 = requestDmMessagesV2(token, 1, 0);
        expect(result2.messages[0].message).toStrictEqual('Removed user');
    })
})
