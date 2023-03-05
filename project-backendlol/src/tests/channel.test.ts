import request from 'sync-request';
import config from '../config.json';


const OK = 200;
const port = config.port;
const url = config.url;


request(
    'DELETE',
    `${url}:${port}/clear/v1`,
)
const yes = request(
    'POST',
    `${url}:${port}/auth/register/v2`,
    {
        body: JSON.stringify({
            email: 'tea@bar.com',
            password: 'password',
            nameFirst: 'Jane',
            nameLast: 'Smith'
        }),
        headers: { 'Content-type': 'application/json' }
    }
);
const token2 = JSON.parse(String(yes.getBody())).token;

const res = request(
    'POST',
    `${url}:${port}/auth/register/v2`,
    {
        body: JSON.stringify({
            email: 'foo@bar.com',
            password: 'Password',
            nameFirst: 'John',
            nameLast: 'Doe'
        }),
        headers: { 'Content-type': 'application/json' }
    }
);
const token3 = JSON.parse(String(res.getBody())).token;
const pro = request(
    'POST',
    `${url}:${port}/auth/register/v2`,
    {
        body: JSON.stringify({
            email: 'sea@bar.com',
            password: 'Password',
            nameFirst: 'Steven',
            nameLast: 'Alex'
        }),
        headers: { 'Content-type': 'application/json' }
    }
);
const token4 = JSON.parse(String(pro.getBody())).token;

const haha = request(
    'POST',
    `${url}:${port}/channels/create/v2`,
    {
        body: JSON.stringify({
            token: token2,
            name: 'channel_1',
            isPublic: true
        }),
        headers: { 'Content-type': 'application/json' }
    }
);
const channelid1 = JSON.parse(String(haha.getBody())).channelId


const wawa = request(
    'POST',
    `${url}:${port}/channels/create/v2`,
    {
        body: JSON.stringify({
            token: token3,
            name: 'channel_2',
            isPublic: false
        }),
        headers: { 'Content-type': 'application/json' }
    }
);
const channelid2 = JSON.parse(String(wawa.getBody())).channelId

const join = request(
    'POST',
    `${url}:${port}/channel/join/v2`,
    {
        body: JSON.stringify({
            token: token3,
            channelId: channelid1
        }),
        headers: { 'Content-type': 'application/json' }
    }
);

describe('tests for the /channel/details/v2 and /channel/join function', () => {
    test('succesful output', () => {
        const pes = request(
            'GET',
            `${url}:${port}/channel/details/v2`,
            {
                qs: {
                    token: token2,
                    channelId: channelid1
                },
                headers: { 'Content-type': 'application/json' }
            }
        );
        const bodyObj = JSON.parse(pes.body as string);

        expect(res.statusCode).toBe(OK);
        expect(bodyObj).toStrictEqual({
            name: 'channel_1',
            isPublic: true,
            ownerMember: [{
                email: 'tea@bar.com',
                nameFirst: 'Jane',
                nameLast: 'Smith',
                handleStr: 'janesmith',
                uId: 1
            }],
            allMember: [{
                email: 'tea@bar.com',
                nameFirst: 'Jane',
                nameLast: 'Smith',
                handleStr: 'janesmith',
                uId: 1
            },
            {
                email: 'foo@bar.com',
                nameFirst: 'John',
                nameLast: 'Doe',
                handleStr: 'johndoe',
                uId: 2
            }],
        });
    });
    const yep = request(
        'GET',
        `${url}:${port}/channel/details/v2`,
        {
            qs: {
                token: token2,
                channelId: 500
            },
            headers: { 'Content-type': 'application/json' }
        }
    );
    const bodyObj2 = JSON.parse(yep.body as string);
    expect(yep.statusCode).toBe(OK);
    expect(bodyObj2).toStrictEqual({ error: 'error' });
    test("Error case:", () => {
        const yep = request(
            'GET',
            `${url}:${port}/channel/details/v2`,
            {
                qs: {
                    token: token4,
                    channelId: channelid1
                },
                headers: { 'Content-type': 'application/json' }
            }
        );
        const bodyObj2 = JSON.parse(yep.body as string);
        expect(yep.statusCode).toBe(OK);
        expect(bodyObj2).toStrictEqual({ error: 'error' });

    });

});

/*
test('duplicate uIds', () => {
    const yep = request(
        'POST',
        `${url}:${port}/dm/create/v1`,
        {
            body: JSON.stringify({
                token: token3,
                uIds: [1, 1]
            }),
            headers: {'Content-type': 'application/json'}
        }
    );
    const bodyObj = JSON.parse(String(yep.getBody()));
    expect(yep.statusCode).toBe(OK);
    expect(bodyObj).toStrictEqual({error: 'error'});
});
test('invalid uId', () => {
    const yep = request(
        'POST',
        `${url}:${port}/dm/create/v1`,
        {
            body: JSON.stringify({
                token: token3,
                uIds: [1, 99999]
            }),
            headers: {'Content-type': 'application/json'}
        }
    );
    const bodyObj = JSON.parse(String(yep.getBody()));
    expect(yep.statusCode).toBe(OK);
    expect(bodyObj).toStrictEqual({error: 'error'});
});
test('owner uId in uIds', () => {
    const yep = request(
        'POST',
        `${url}:${port}/dm/create/v1`,
        {
            body: JSON.stringify({
                token: token3,
                uIds: [1, 2]
            }),
            headers: {'Content-type': 'application/json'}
        }
    );
    const bodyObj = JSON.parse(String(yep.getBody()));
    expect(yep.statusCode).toBe(OK);
    expect(bodyObj).toStrictEqual({error: 'error'});
});
*/
function requestAuthRegisterV2(email: string, password: string, nameFirst: string, nameLast: string) {
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
            headers: { 'Content-type': 'application/json' }
        }
    );
    return JSON.parse(res.getBody() as string);
}
function requestChannelCreateV2(token: string, name: string, isPublic: boolean) {
    const res = request(
        'POST',
        `${url}:${port}/channels/create/v2`,
        {
            body: JSON.stringify({ token: token, name: name, isPublic: isPublic }),
            headers: {
                'Content-type': 'application/json'
            }
        }
    );
    return JSON.parse(res.getBody() as string);
}

function requestChannelJoinV2(token: string, channelId: number) {
    const res = request(
        'POST',
        `${url}:${port}/channel/join/v2`,
        {
            body: JSON.stringify({ token: token, channelId: channelId }),
            headers: {
                'content-type': 'application/json'
            }
        }
    );
    return JSON.parse(res.getBody() as string);
}
function requestMessageSendV1(token: string, channelId: number, message: string) {
    const res = request(
        'POST',
        `${url}:${port}/message/send/v1`,
        {
            body: JSON.stringify({ token: token, channelId: channelId, message: message }),
            headers: {
                'content-type': 'application/json'
            }
        }
    );
    return JSON.parse(res.getBody() as string);
}
function requestChannelMessagesV2(token: string, channelId: number, start: number) {
    const res = request(
        'GET',
        `${url}:${port}/channel/messages/v2`,
        {
            qs: { token, channelId, start }
        }
    );
    return JSON.parse(res.getBody() as string);
}
function requestClearV1() {
    const res = request(
        'DELETE',
        `${url}:${port}/clear/v1`
    );
}
describe('tests for channel/messages/v2', () => {
    test('successful output with start at 0', () => {
        requestClearV1();
        const user1 = requestAuthRegisterV2('longpaus@gmail.com', 'password', 'long', 'pham');
        const user2 = requestAuthRegisterV2('wonderkid@gmail.com', 'shshhs', 'wonder', 'kid');
        const user3 = requestAuthRegisterV2('dpitts@yahoo.com', 'shshhs', 'wonder', 'kid');
        const channel1Id = requestChannelCreateV2(user1.token, 'channel1', true).channelId;
        requestChannelJoinV2(user2.token, channel1Id);
        requestChannelJoinV2(user3.token, channel1Id);
        const message1Id = requestMessageSendV1(user2.token, channel1Id, 'hello guys').messageId
        const message2Id = requestMessageSendV1(user3.token, channel1Id, 'fgfgggfgf').messageId
        const message3Id = requestMessageSendV1(user3.token, channel1Id, 'hdhdh dhdn').messageId
        const message4Id = requestMessageSendV1(user1.token, channel1Id, 'vfhdbhjds  dhbs dh jb dy dsb').messageId
        const message5Id = requestMessageSendV1(user1.token, channel1Id, 'lol').messageId
        const channelMessages = requestChannelMessagesV2(user1.token, channel1Id, 0)
        expect(channelMessages.start).toBe(0);
        expect(channelMessages.end).toBe(-1);

        expect(channelMessages.messages[0].messageId).toBe(message5Id);
        expect(channelMessages.messages[0].uId).toBe(user1.authUserId);
        expect(channelMessages.messages[0].message).toBe('lol');

        expect(channelMessages.messages[1].messageId).toBe(message4Id);
        expect(channelMessages.messages[1].uId).toBe(user1.authUserId);
        expect(channelMessages.messages[1].message).toBe('vfhdbhjds  dhbs dh jb dy dsb');

        expect(channelMessages.messages[2].messageId).toBe(message3Id);
        expect(channelMessages.messages[2].uId).toBe(user3.authUserId);
        expect(channelMessages.messages[2].message).toBe('hdhdh dhdn');

        expect(channelMessages.messages[3].messageId).toBe(message2Id);
        expect(channelMessages.messages[3].uId).toBe(user3.authUserId);
        expect(channelMessages.messages[3].message).toBe('fgfgggfgf');

        expect(channelMessages.messages[4].messageId).toBe(message1Id);
        expect(channelMessages.messages[4].uId).toBe(user2.authUserId);
        expect(channelMessages.messages[4].message).toBe('hello guys');
    });
    test('successful output start is not zero', () => {
        requestClearV1();
        const user1 = requestAuthRegisterV2('longpaus@gmail.com', 'password', 'long', 'pham');
        const user2 = requestAuthRegisterV2('wonderkid@gmail.com', 'shshhs', 'wonder', 'kid');
        const user3 = requestAuthRegisterV2('dpitts@yahoo.com', 'shshhs', 'wonder', 'kid');
        const channel1Id = requestChannelCreateV2(user1.token, 'channel1', true).channelId;
        requestChannelJoinV2(user2.token, channel1Id);
        requestChannelJoinV2(user3.token, channel1Id);
        const message1Id = requestMessageSendV1(user2.token, channel1Id, 'hello guys').messageId
        const message2Id = requestMessageSendV1(user3.token, channel1Id, 'fgfgggfgf').messageId
        const message3Id = requestMessageSendV1(user3.token, channel1Id, 'hdhdh dhdn').messageId
        requestMessageSendV1(user1.token, channel1Id, 'vfhdbhjds  dhbs dh jb dy dsb').messageId
        requestMessageSendV1(user1.token, channel1Id, 'lol').messageId
        const channelMessages = requestChannelMessagesV2(user1.token, channel1Id, 2)
        expect(channelMessages.end).toBe(-1);
        expect(channelMessages.start).toBe(2);

        expect(channelMessages.messages[0].messageId).toBe(message3Id);
        expect(channelMessages.messages[0].uId).toBe(user3.authUserId);
        expect(channelMessages.messages[0].message).toBe('hdhdh dhdn');

        expect(channelMessages.messages[1].messageId).toBe(message2Id);
        expect(channelMessages.messages[1].uId).toBe(user3.authUserId);
        expect(channelMessages.messages[1].message).toBe('fgfgggfgf');

        expect(channelMessages.messages[2].messageId).toBe(message1Id);
        expect(channelMessages.messages[2].uId).toBe(user2.authUserId);
        expect(channelMessages.messages[2].message).toBe('hello guys');
    });
    test('error: dmId is not valid', () => {
        const user1 = requestAuthRegisterV2('longpaus@gmail.com', 'password', 'long', 'pham');
        const user2 = requestAuthRegisterV2('wonderkid@gmail.com', 'shshhs', 'wonder', 'kid');
        const user3 = requestAuthRegisterV2('dpitts@yahoo.com', 'shshhs', 'wonder', 'kid');
        const channel1Id = requestChannelCreateV2(user1.token, 'channel1', true).channelId;
        requestChannelJoinV2(user2.token, channel1Id);
        requestChannelJoinV2(user3.token, channel1Id);
        requestMessageSendV1(user2.token, channel1Id, 'hello guys')
        const channelMessages = requestChannelMessagesV2(user1.token, 800, 2)
        expect(channelMessages).toStrictEqual({ error: 'error' });
    });
    test('error start is greater than the number of messages in dm', () => {
        requestClearV1();
        const user1 = requestAuthRegisterV2('longpaus@gmail.com', 'password', 'long', 'pham');
        const user2 = requestAuthRegisterV2('wonderkid@gmail.com', 'shshhs', 'wonder', 'kid');
        const user3 = requestAuthRegisterV2('dpitts@yahoo.com', 'shshhs', 'wonder', 'kid');
        const channel1Id = requestChannelCreateV2(user1.token, 'channel1', true).channelId;
        requestChannelJoinV2(user2.token, channel1Id);
        requestChannelJoinV2(user3.token, channel1Id);
        requestMessageSendV1(user2.token, channel1Id, 'hello guys')
        const channelMessages = requestChannelMessagesV2(user1.token, channel1Id, 10)
        expect(channelMessages).toStrictEqual({ error: 'error' });
    });
    test('error: start is a negative number', () => {
        requestClearV1();
        const user1 = requestAuthRegisterV2('longpaus@gmail.com', 'password', 'long', 'pham');
        const user2 = requestAuthRegisterV2('wonderkid@gmail.com', 'shshhs', 'wonder', 'kid');
        const user3 = requestAuthRegisterV2('dpitts@yahoo.com', 'shshhs', 'wonder', 'kid');
        const channel1Id = requestChannelCreateV2(user1.token, 'channel1', true).channelId;
        requestChannelJoinV2(user2.token, channel1Id);
        requestChannelJoinV2(user3.token, channel1Id);
        requestMessageSendV1(user2.token, channel1Id, 'hello guys')
        const channelMessages = requestChannelMessagesV2(user1.token, channel1Id, -34)
        expect(channelMessages).toStrictEqual({ error: 'error' });
    });
    test('error: the user is not apart of the dm', () => {
        requestClearV1();
        const user1 = requestAuthRegisterV2('longpaus@gmail.com', 'password', 'long', 'pham');
        const user2 = requestAuthRegisterV2('wonderkid@gmail.com', 'shshhs', 'wonder', 'kid');
        const user3 = requestAuthRegisterV2('dpitts@yahoo.com', 'shshhs', 'wonder', 'kid');
        const channel1Id = requestChannelCreateV2(user1.token, 'channel1', true).channelId;
        requestChannelJoinV2(user2.token, channel1Id);
        requestChannelJoinV2(user3.token, channel1Id);
        requestMessageSendV1(user2.token, channel1Id, 'hello guys')
        const channelMessages = requestChannelMessagesV2('dhhjcvchhvcd', channel1Id, 0)
        expect(channelMessages).toStrictEqual({ error: 'error' });
    })
});
