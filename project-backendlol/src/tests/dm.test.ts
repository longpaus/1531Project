// tests for dm functions
import { requestClearV1, requestAuthRegisterV2, requestDmCreateV1,requestMessageSenddmV1, requestDmMessagesV1} from './testFunctions';
import request from 'sync-request';
import config from '../config.json';

const OK = 200;
const port = config.port;
const url = config.url;

const DmCreateV1 = (token: string, uIds: number[]) => {
    const res = request(
        'POST',
        `${url}:${port}/dm/create/v1`,
        {
            body: JSON.stringify({
                token: token,
                uIds: uIds
            }),
            headers: {'Content-type': 'application/json'}
        }
    );
    return res;
}

const DmListV1 = (token: string) => {
    const res = request(
        'GET',
        `${url}:${port}/dm/list/v1`,
        {
            qs: {
                token: token
            }
        }
    );
    return res;
}

const DmRemoveV1 = (token: string, dmId: number) => {
    const res = request(
        'DELETE',
        `${url}:${port}/dm/remove/v1`,
        {
            qs: {
                token: token,
                dmId: dmId
            }
        }
    );
    return res;
}

const DmDetailsV1 = (token: string, dmId: number) => {
    const res = request(
        'GET',
        `${url}:${port}/dm/details/v1`,
        {
            qs: {
                token: token,
                dmId: dmId
            }
        }
    );
    return res;
}

const DmLeaveV1 = (token: string, dmId: number) => {
    const res = request(
        'POST',
        `${url}:${port}/dm/leave/v1`,
        {
            body: JSON.stringify({
                token: token,
                dmId: dmId
            }),
            headers: {'Content-type': 'application/json'}
        }
    );
    return res;
}

requestClearV1();
const token = requestAuthRegisterV2('foo@bar.com', 'password', 'John', 'Doe').token;
const token2 = requestAuthRegisterV2('tea@bar.com', 'password', 'Jane', 'Smith').token;
const token3 = requestAuthRegisterV2('sea@bar.com', 'password', 'Steve', 'Alex').token;
const token4 = requestAuthRegisterV2('plea@bar.com', 'password', 'John', 'Mills').token;

describe('tests for the dm/create/v1 function', () => {
    test('succesfully made dm', () => {
        const result = DmCreateV1(token, [2, 3, 4]);
        expect(result.statusCode).toBe(OK);
        expect(JSON.parse(result.getBody() as string)).toStrictEqual({ dmId: 1 });
    });
    test('error cases', () => {
        let result = DmCreateV1(token, [2, 2]);
        expect(result.statusCode).toBe(OK);
        expect(JSON.parse(result.getBody() as string)).toStrictEqual({ error: 'error' });
        result = DmCreateV1(token, [1, 2, 3]);
        expect(result.statusCode).toBe(OK);
        expect(JSON.parse(result.getBody() as string)).toStrictEqual({ error: 'error' });
        result = DmCreateV1(token, [2, 99]);
        expect(result.statusCode).toBe(OK);
        expect(JSON.parse(result.getBody() as string)).toStrictEqual({ error: 'error' });
    });
});

describe('tests for dm/list/v1', () => {
    test('success output', () => {
        requestDmCreateV1(token2, [1, 3,]);
        const result = DmListV1(token);
        expect(result.statusCode).toBe(OK);
        expect(JSON.parse(result.getBody() as string)).toStrictEqual({dms: [
            {
                name: 'janesmith, johndoe, johnmills, stevealex',
                dmId: 1
            },{
                name: 'janesmith, johndoe, stevealex',
                dmId: 2
            }
        ]});
    });
})

describe('tests for dm/remove/v1', () => {
    test('succesfully removed dm', () => {
        const result = DmRemoveV1(token, 1);
        expect(result.statusCode).toBe(OK);
        expect(JSON.parse(result.getBody() as string)).toStrictEqual({});
    });
    test('error cases', () => {
        let result = DmRemoveV1(token, 5);
        expect(result.statusCode).toBe(OK);
        expect(JSON.parse(result.getBody() as string)).toStrictEqual({ error: 'error' });
        result = DmRemoveV1(token, 2);
        expect(result.statusCode).toBe(OK);
        expect(JSON.parse(result.getBody() as string)).toStrictEqual({ error: 'error' });
        result = DmRemoveV1(token3, 2);
        expect(result.statusCode).toBe(OK);
        expect(JSON.parse(result.getBody() as string)).toStrictEqual({ error: 'error' });
    });
});

describe('tests for the dm/details/v1 function', () => {
    test('succesful output', () => {
        const yep = request(
            'GET',
            `${url}:${port}/dm/details/v1`,
            {
                qs: {
                    token: token2,
                    dmId: '2'
                }
            }
        );
        const bodyObj = JSON.parse(String(yep.getBody()));
        expect(yep.statusCode).toBe(OK);
        expect(bodyObj).toStrictEqual({
            name: 'janesmith, johndoe, stevenalex',
            members: [
                {
                    uId: 1,
                    email: 'tea@bar.com',
                    nameFirst: 'Jane',
                    nameLast: 'Smith',
                    handleStr: 'janesmith'
                }, {
                    uId: 2,
                    email: 'foo@bar.com',
                    nameFirst: 'John',
                    nameLast: 'Doe',
                    handleStr: 'johndoe'
                }, {
                    uId: 3,
                    email: 'sea@bar.com',
                    nameFirst: 'Steven',
                    nameLast: 'Alex',
                    handleStr: 'stevenalex'
                }
            ]
        });
    });
    test('dmId not valid', () => {
        const yep = request(
            'GET',
            `${url}:${port}/dm/details/v1`,
            {
                qs: {
                    token: token2,
                    dmId: '999'
                }
            }
        );
        const bodyObj = JSON.parse(String(yep.getBody()));
        expect(yep.statusCode).toBe(OK);
        expect(bodyObj).toStrictEqual({ error: 'error' });
    });
    test('user not in dm', () => {
        const yep = request(
            'GET',
            `${url}:${port}/dm/details/v1`,
            {
                qs: {
                    token: token5,
                    dmId: '2'
                }
            }
        );
        const bodyObj = JSON.parse(String(yep.getBody()));
        expect(yep.statusCode).toBe(OK);
        expect(bodyObj).toStrictEqual({ error: 'error' });
    });
});
describe('tests for dm/leave/v1', () => {
    test('succesful output', () => {
        const yep = request(
            'POST',
            `${url}:${port}/dm/leave/v1`,
            {
                body: JSON.stringify({
                    token: token4,
                    dmId: 2
                }),
                headers: { 'Content-type': 'application/json' }
            }
        );
        const bodyObj = JSON.parse(String(yep.getBody()));
        expect(yep.statusCode).toBe(OK);
        expect(bodyObj).toStrictEqual({});
    });
    test('user not in dm', () => {
        const yep = request(
            'POST',
            `${url}:${port}/dm/leave/v1`,
            {
                body: JSON.stringify({
                    token: token5,
                    dmId: 2
                }),
                headers: { 'Content-type': 'application/json' }
            }
        );
        const bodyObj = JSON.parse(String(yep.getBody()));
        expect(yep.statusCode).toBe(OK);
        expect(bodyObj).toStrictEqual({ error: 'error' });
    });
    test('dmId not valid', () => {
        const yep = request(
            'POST',
            `${url}:${port}/dm/leave/v1`,
            {
                body: JSON.stringify({
                    token: token5,
                    dmId: 999
                }),
                headers: { 'Content-type': 'application/json' }
            }
        );
        const bodyObj = JSON.parse(String(yep.getBody()));
        expect(yep.statusCode).toBe(OK);
        expect(bodyObj).toStrictEqual({ error: 'error' });
    });
});






describe('tests for dm/messages/v1', () => {
    test('successful output with start at 0', () => {
        requestClearV1();
        const user1 = requestAuthRegisterV2('longpaus@gmail.com', 'password', 'long', 'pham');
        const user2 = requestAuthRegisterV2('wonderkid@gmail.com', 'shshhs', 'wonder', 'kid');
        const user3 = requestAuthRegisterV2('dpitts@yahoo.com', 'shshhs', 'wonder', 'kid');
        const dm1Id = requestDmCreateV1(user1.token, [user2.authUserId, user3.authUserId]).dmId
        const message1Id = requestMessageSenddmV1(user2.token, dm1Id, 'hello guys').messageId
        const message2Id = requestMessageSenddmV1(user3.token, dm1Id, 'fgfgggfgf').messageId
        const message3Id = requestMessageSenddmV1(user3.token, dm1Id, 'hdhdh dhdn').messageId
        const message4Id = requestMessageSenddmV1(user1.token, dm1Id, 'vfhdbhjds  dhbs dh jb dy dsb').messageId
        const message5Id = requestMessageSenddmV1(user1.token, dm1Id, 'lol').messageId
        const Dm1Messages = requestDmMessagesV1(user1.token, dm1Id, 0)
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
    });
    test('successful output start is not zero', () => {
        requestClearV1();
        const user1 = requestAuthRegisterV2('longpaus@gmail.com', 'password', 'long', 'pham');
        const user2 = requestAuthRegisterV2('wonderkid@gmail.com', 'shshhs', 'wonder', 'kid');
        const user3 = requestAuthRegisterV2('dpitts@yahoo.com', 'shshhs', 'wonder', 'kid');
        const dm1Id = requestDmCreateV1(user1.token, [user2.authUserId, user3.authUserId]).dmId
        const message1Id = requestMessageSenddmV1(user2.token, dm1Id, 'hello guys').messageId
        const message2Id = requestMessageSenddmV1(user3.token, dm1Id, 'fgfgggfgf').messageId
        const message3Id = requestMessageSenddmV1(user3.token, dm1Id, 'hdhdh dhdn').messageId
        requestMessageSenddmV1(user1.token, dm1Id, 'vfhdbhjds  dhbs dh jb dy dsb').messageId
        requestMessageSenddmV1(user1.token, dm1Id, 'lol').messageId
        const Dm1Messages = requestDmMessagesV1(user1.token, dm1Id, 2)
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
    });
    test('error: dmId is not valid', () => {
        const user1 = requestAuthRegisterV2('longpaus@gmail.com', 'password', 'long', 'pham');
        const user2 = requestAuthRegisterV2('wonderkid@gmail.com', 'shshhs', 'wonder', 'kid');
        const user3 = requestAuthRegisterV2('dpitts@yahoo.com', 'shshhs', 'wonder', 'kid');
        const dm1Id = requestDmCreateV1(user1.token, [user2.authUserId, user3.authUserId]).dmId
        requestMessageSenddmV1(user2.token, dm1Id, 'hello guys').messageId
        const Dm1Messages = requestDmMessagesV1(user1.token, 8, 2)
        expect(Dm1Messages).toStrictEqual({ error: 'error' });
    });
    test('error start is greater than the number of messages in dm', () => {
        requestClearV1();
        const user1 = requestAuthRegisterV2('longpaus@gmail.com', 'password', 'long', 'pham');
        const user2 = requestAuthRegisterV2('wonderkid@gmail.com', 'shshhs', 'wonder', 'kid');
        const user3 = requestAuthRegisterV2('dpitts@yahoo.com', 'shshhs', 'wonder', 'kid');
        const dm1Id = requestDmCreateV1(user1.token, [user2.authUserId, user3.authUserId]).dmId
        requestMessageSenddmV1(user2.token, dm1Id, 'hello guys').messageId
        requestMessageSenddmV1(user3.token, dm1Id, 'fgfgggfgf').messageId
        requestMessageSenddmV1(user3.token, dm1Id, 'hdhdh dhdn').messageId
        requestMessageSenddmV1(user1.token, dm1Id, 'vfhdbhjds  dhbs dh jb dy dsb').messageId
        requestMessageSenddmV1(user1.token, dm1Id, 'lol').messageId
        expect(requestDmMessagesV1(user1.token, dm1Id, 5)).toStrictEqual({ error: 'error' });
    });
    test('error: start is a negative number', () => {
        requestClearV1();
        const user1 = requestAuthRegisterV2('longpaus@gmail.com', 'password', 'long', 'pham');
        const user2 = requestAuthRegisterV2('wonderkid@gmail.com', 'shshhs', 'wonder', 'kid');
        const user3 = requestAuthRegisterV2('dpitts@yahoo.com', 'shshhs', 'wonder', 'kid');
        const dm1Id = requestDmCreateV1(user1.token, [user2.authUserId, user3.authUserId]).dmId
        requestMessageSenddmV1(user2.token, dm1Id, 'hello guys').messageId
        requestMessageSenddmV1(user3.token, dm1Id, 'fgfgggfgf').messageId
        requestMessageSenddmV1(user3.token, dm1Id, 'hdhdh dhdn').messageId
        requestMessageSenddmV1(user1.token, dm1Id, 'vfhdbhjds  dhbs dh jb dy dsb').messageId
        requestMessageSenddmV1(user1.token, dm1Id, 'lol').messageId
        expect(requestDmMessagesV1(user1.token, dm1Id, -1)).toStrictEqual({ error: 'error' });
    });
    test('error: the user is not apart of the dm', () => {
        requestClearV1();
        const user1 = requestAuthRegisterV2('longpaus@gmail.com', 'password', 'long', 'pham');
        const user2 = requestAuthRegisterV2('wonderkid@gmail.com', 'shshhs', 'wonder', 'kid');
        const user3 = requestAuthRegisterV2('dpitts@yahoo.com', 'shshhs', 'wonder', 'kid');
        const dm1Id = requestDmCreateV1(user1.token, [user2.authUserId, user3.authUserId]).dmId
        requestMessageSenddmV1(user2.token, dm1Id, 'hello guys').messageId
        requestMessageSenddmV1(user3.token, dm1Id, 'fgfgggfgf').messageId
        requestMessageSenddmV1(user3.token, dm1Id, 'hdhdh dhdn').messageId
        requestMessageSenddmV1(user1.token, dm1Id, 'vfhdbhjds  dhbs dh jb dy dsb').messageId
        requestMessageSenddmV1(user1.token, dm1Id, 'lol').messageId
        expect(requestDmMessagesV1('dhdjhbhvdb', dm1Id, 0)).toStrictEqual({ error: 'error' });
    })
});
