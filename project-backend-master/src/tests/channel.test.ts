import request from 'sync-request';
import config from '../config.json';
import {requestAuthRegisterV3, requestChannelsCreateV3,
    requestChannelJoinV2,requestMessageSendV2, requestChannelMessagesV3, requestClearV1, requestStandupStart, requestUserRemove} from './testFunctions';
  


const OK = 200;
const port = config.port;
const url = config.url;
const BAD_REQUEST = 400;
const FORBIDDEN = 403;

const sleepFor = (time: number) => {
    const now = Math.floor(Date.now());
    while(Math.floor(Date.now()) < now + time) {}
}

const channelJoin = (token: string, channelId: number) => {
    return request (
        'POST',
        `${url}:${port}/channel/join/v3`,
        {
             body : JSON.stringify ({
                
                channelId: channelId
            }),
            headers: {'Content-type': 'application/json',
            token: token}
        }
    );
};

const channelDetails = (token: string, channelId: number) => {
    return request(
        'GET',
        `${url}:${port}/channel/details/v3`,
        {
            qs:{
                
                channelId: channelId
            },
            headers: {'Content-type': 'application/json',
            token: token}
        }
    );
}

const channelInvite = (token: string, channelId: number, uId: number) => {
    return request (
        'POST',
        `${url}:${port}/channel/invite/v3`,
        {
             body : JSON.stringify ({
                
                channelId: channelId,
                uId: uId
            }),
            headers: {'Content-type': 'application/json',
            token: token}
        }
    );
}

const channelLeave = (token: string, channelId: number) => {
    return request (
        'POST',
        `${url}:${port}/channel/leave/v2`,
        {
             body : JSON.stringify ({
                
                channelId: channelId
            }),
            headers: {
                'Content-type': 'application/json',
                'token': token
            }
        }
    );
}

const channelAddOwner = (token: string, channelId: number, uId: number) => {
    return request (
        'POST',
        `${url}:${port}/channel/addowner/v2`,
        {
             body : JSON.stringify ({
                
                channelId: channelId,
                uId: uId
            }),
            headers: {'Content-type': 'application/json',
            token: token}
        }
    );
}

const channelRemoveOwner = (token: string, channelId: number, uId: number) => {
    return request (
        'POST',
        `${url}:${port}/channel/removeowner/v2`,
        {
             body : JSON.stringify ({
                
                channelId: channelId,
                uId: uId
            }),
            headers: {'Content-type': 'application/json',
            token: token
        }
        }
    );
}



describe('tests for /channel functions', () => {
    requestClearV1();
    const token2 = requestAuthRegisterV3('tea@bar.com', 'password', 'Jane', 'Smith').token;
    const token3 = requestAuthRegisterV3('foo@bar.com', 'password', 'John', 'Doe').token;
    const token4 = requestAuthRegisterV3('sea@bar.com', 'password', 'Steven', 'Alex').token;
    const token5 = requestAuthRegisterV3('hea@bar.com', 'password', 'Zhu', 'Alex').token;
    const channelid1 = requestChannelsCreateV3(token2, 'channel_1', true).channelId;
    const channelid2 = requestChannelsCreateV3(token2, 'channel_2', false).channelId;
    test('succesful output', () => {
        const res = channelJoin(token3, channelid1);
        const dsd = channelInvite(token2, channelid1, 3);
        expect(channelJoin(token3,channelid1).statusCode).toBe(400);
        expect(channelJoin(token5,channelid2).statusCode).toBe(403);
        expect(channelAddOwner(token2, channelid1, 2).statusCode).toBe(OK);
        channelAddOwner(token2, channelid1, 3);
        expect(channelAddOwner(token2, channelid1, 2).statusCode).toBe(400);
        expect(channelRemoveOwner(token2, channelid1, 3).statusCode).toBe(OK);
        expect(channelAddOwner(token4, channelid1, 3).statusCode).toBe(403);
        expect(channelLeave(token4,channelid1).statusCode).toBe(OK);
        const pes = channelDetails(token2, channelid1);
        const bodyObj = JSON.parse(pes.body as string);
        expect(dsd.statusCode).toBe(OK);
        expect(res.statusCode).toBe(OK);
        expect(pes.statusCode).toBe(OK);
        expect(bodyObj).toStrictEqual({
            name: 'channel_1',
            isPublic : true,
            ownerMembers : [{
                email : 'tea@bar.com',
                nameFirst : 'Jane',
                nameLast : 'Smith',
                handleStr : 'janesmith',
                uId : 1,
                profileImgUrl: expect.any(String)
            },{
                email: 'foo@bar.com',
                nameFirst: 'John',
                nameLast: 'Doe',
                handleStr : 'johndoe',
                uId : 2,
                profileImgUrl: expect.any(String)
            }],
            allMembers: [{
                email : 'tea@bar.com',
                nameFirst : 'Jane',
                nameLast : 'Smith',
                handleStr : 'janesmith',
                uId : 1,
                profileImgUrl: expect.any(String)
            },{
                email: 'foo@bar.com',
                nameFirst: 'John',
                nameLast: 'Doe',
                handleStr : 'johndoe',
                uId : 2,
                profileImgUrl: expect.any(String)
            },]
        });
    });
    test('error case', () => {
        const dsd = channelInvite(token2, channelid1, 2);
        expect (dsd.statusCode).toBe(400);
        expect(channelDetails(token5,3).statusCode).toBe(400);
        expect(channelDetails(token5,channelid2).statusCode).toBe(403);
        expect(channelInvite(token4,channelid1,4).statusCode).toBe(403);
        expect(channelLeave(token2,3).statusCode).toBe(400);
        expect(channelLeave(token4,channelid1).statusCode).toBe(403);
        expect(channelAddOwner(token2, 3, 2).statusCode).toBe(400);//wrong channel
        expect(channelAddOwner(token2, channelid1, 5).statusCode).toBe(400);
        expect(channelAddOwner(token2, channelid1, 3).statusCode).toBe(400);
        expect(channelAddOwner(token4, channelid1, 1).statusCode).toBe(400);
        

        channelRemoveOwner(token2, channelid1, 2);//only 1 left now
        
        expect(channelRemoveOwner(token2, 3, 2).statusCode).toBe(400);//wrong channel
        expect(channelRemoveOwner(token2, channelid1, 2).statusCode).toBe(400);//not owener
        expect(channelRemoveOwner(token2, channelid1, 5).statusCode).toBe(400);//not valid uid 
        expect(channelRemoveOwner(token2, channelid1, 1).statusCode).toBe(400);//last owner
        expect(channelRemoveOwner(token3, channelid1, 1).statusCode).toBe(403);//not permission 
        expect(channelRemoveOwner(token4, channelid1, 1).statusCode).toBe(400);
        //auth no in channel
        expect(channelInvite(token2,channelid2,2).statusCode).toBe(200);
        expect(channelAddOwner(token2,channelid2,2).statusCode).toBe(200);
        expect(channelLeave(token3, channelid2).statusCode).toBe(200);
    });
    
    test('standup leave', () => {
        requestClearV1();
        const token2 = requestAuthRegisterV3('tea@bar.com', 'password', 'Jane', 'Smith').token;
        const token3 = requestAuthRegisterV3('foo@bar.com', 'password', 'John', 'Doe').token;
        const channelid1 = requestChannelsCreateV3(token2, 'channel_1', true).channelId;
        channelInvite(token2,channelid1,2);
        requestStandupStart(token3,channelid1,0.5);
        expect(channelLeave(token3,channelid1).statusCode).toBe(400);
        sleepFor(500)
    });
});
    
function channelMessagesV3(token: string, channelId: number, start: number) {
    const res = request(
        'GET',
        `${url}:${port}/channel/messages/v3`,
        {
            qs: { channelId, start },
            headers:{
                token:token
            }
        }
    );
    return res
}

   
describe('tests for channel/messages/v3', () => {
    test('successful output with start at 0', () => {
        requestClearV1();
        const user1 = requestAuthRegisterV3('longpaus@gmail.com', 'password', 'long', 'pham');
        const user2 = requestAuthRegisterV3('wonderkid@gmail.com', 'shshhs', 'wonder', 'kid');
        const user3 = requestAuthRegisterV3('dpitts@yahoo.com', 'shshhs', 'wonder', 'kid');
        const channel1Id = requestChannelsCreateV3(user1.token, 'channel1', true).channelId;
        requestChannelJoinV2(user2.token, channel1Id);
        requestChannelJoinV2(user3.token, channel1Id);
        const message1Id = requestMessageSendV2(user2.token, channel1Id, 'hello guys').messageId
        const message2Id = requestMessageSendV2(user3.token, channel1Id, 'fgfgggfgf').messageId
        const message3Id = requestMessageSendV2(user3.token, channel1Id, 'hdhdh dhdn').messageId
        const message4Id = requestMessageSendV2(user1.token, channel1Id, 'vfhdbhjds  dhbs dh jb dy dsb').messageId
        const message5Id = requestMessageSendV2(user1.token, channel1Id, 'lol').messageId
        const channelMessages = requestChannelMessagesV3(user1.token, channel1Id, 0)
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

        let channelMessgaesResult = channelMessagesV3(user1.token, channel1Id, 0)
        expect(channelMessgaesResult.statusCode).toBe(OK)
    });
    test('successful output start is not zero', () => {
        requestClearV1();
        const user1 = requestAuthRegisterV3('longpaus@gmail.com', 'password', 'long', 'pham');
        const user2 = requestAuthRegisterV3('wonderkid@gmail.com', 'shshhs', 'wonder', 'kid');
        const user3 = requestAuthRegisterV3('dpitts@yahoo.com', 'shshhs', 'wonder', 'kid');
        const channel1Id = requestChannelsCreateV3(user1.token, 'channel1', true).channelId;
        requestChannelJoinV2(user2.token, channel1Id);
        requestChannelJoinV2(user3.token, channel1Id);
        const message1Id = requestMessageSendV2(user2.token, channel1Id, 'hello guys').messageId
        const message2Id = requestMessageSendV2(user3.token, channel1Id, 'fgfgggfgf').messageId
        const message3Id = requestMessageSendV2(user3.token, channel1Id, 'hdhdh dhdn').messageId
        requestMessageSendV2(user1.token, channel1Id, 'vfhdbhjds  dhbs dh jb dy dsb').messageId
        requestMessageSendV2(user1.token, channel1Id, 'lol').messageId
        const channelMessages = requestChannelMessagesV3(user1.token, channel1Id, 2)
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

        let channelMessgaesResult = channelMessagesV3(user1.token, channel1Id, 2)
        expect(channelMessgaesResult.statusCode).toBe(OK)
    });
    test('error: channelId is not valid', () => {
        requestClearV1();
        const user1 = requestAuthRegisterV3('longpaus@gmail.com', 'password', 'long', 'pham');
        const user2 = requestAuthRegisterV3('wonderkid@gmail.com', 'shshhs', 'wonder', 'kid');
        const user3 = requestAuthRegisterV3('dpitts@yahoo.com', 'shshhs', 'wonder', 'kid');
        const channel1Id = requestChannelsCreateV3(user1.token, 'channel1', true).channelId;
        requestChannelJoinV2(user2.token, channel1Id);
        requestChannelJoinV2(user3.token, channel1Id);
        requestMessageSendV2(user2.token, channel1Id, 'hello guys');
        // expect(requestChannelMessagesV3(user1.token, 800, 2)).toThrow('invalid channelId')

        let channelMessgaesResult = channelMessagesV3(user1.token, 800, 2)
        expect(channelMessgaesResult.statusCode).toBe(BAD_REQUEST)
    });
    test('error start is greater than the number of messages in dm', () => {
        requestClearV1();
        const user1 = requestAuthRegisterV3('longpaus@gmail.com', 'password', 'long', 'pham');
        const user2 = requestAuthRegisterV3('wonderkid@gmail.com', 'shshhs', 'wonder', 'kid');
        const user3 = requestAuthRegisterV3('dpitts@yahoo.com', 'shshhs', 'wonder', 'kid');
        const channel1Id = requestChannelsCreateV3(user1.token, 'channel1', true).channelId;
        requestChannelJoinV2(user2.token, channel1Id);
        requestChannelJoinV2(user3.token, channel1Id);
        requestMessageSendV2(user2.token, channel1Id, 'hello guys')
        // expect(requestChannelMessagesV3(user1.token, channel1Id, 10)).toThrow('invalid start')

        let channelMessgaesResult = channelMessagesV3(user1.token, channel1Id, 10)
        expect(channelMessgaesResult.statusCode).toBe(BAD_REQUEST)
    });
    test('error: start is a negative number', () => {
        requestClearV1();
        const user1 = requestAuthRegisterV3('longpaus@gmail.com', 'password', 'long', 'pham');
        const user2 = requestAuthRegisterV3('wonderkid@gmail.com', 'shshhs', 'wonder', 'kid');
        const user3 = requestAuthRegisterV3('dpitts@yahoo.com', 'shshhs', 'wonder', 'kid');
        const channel1Id = requestChannelsCreateV3(user1.token, 'channel1', true).channelId;
        requestChannelJoinV2(user2.token, channel1Id);
        requestChannelJoinV2(user3.token, channel1Id);
        requestMessageSendV2(user2.token, channel1Id, 'hello guys')
        // expect(requestChannelMessagesV3(user1.token, channel1Id, -34)).toThrow('invalid start')

        let channelMessgaesResult = channelMessagesV3(user1.token, channel1Id, -34)
        expect(channelMessgaesResult.statusCode).toBe(BAD_REQUEST)
    });
    test('error: the user is not apart of the channel', () => {
        requestClearV1();
        const user1 = requestAuthRegisterV3('longpaus@gmail.com', 'password', 'long', 'pham');
        const user2 = requestAuthRegisterV3('wonderkid@gmail.com', 'shshhs', 'wonder', 'kid');
        const user3 = requestAuthRegisterV3('dpitts@yahoo.com', 'shshhs', 'wonder', 'kid');
        const channel1Id = requestChannelsCreateV3(user1.token, 'channel1', true).channelId;
        requestChannelJoinV2(user2.token, channel1Id);
        requestChannelJoinV2(user3.token, channel1Id);
        requestMessageSendV2(user2.token, channel1Id, 'hello guys')
        // expect(requestChannelMessagesV3('dhhjcvchhvcd', channel1Id, 0)).toThrow('invalid userId')

        let channelMessgaesResult = channelMessagesV3('dhhjcvchhvcd', channel1Id, 0)
        expect(channelMessgaesResult.statusCode).toBe(FORBIDDEN)
    })
});

describe('user remove interaction with channels', () => {
    test('user removed from channel', () => {
        requestClearV1();
        const token = requestAuthRegisterV3('foo@bar.com', 'password', 'John', 'Doe').token;
        const token2 = requestAuthRegisterV3('tea@bar.com', 'password', 'Jane', 'Smith').token;
        requestChannelsCreateV3(token, 'newChannel', true);
        requestChannelJoinV2(token2, 1);
        channelAddOwner(token, 1, 2);
        requestMessageSendV2(token2, 1, 'random Message');
        requestUserRemove(token, 2);
        const result = channelDetails(token, 1);
        expect(JSON.parse(result.body as string)).toStrictEqual({
            name: 'newChannel',
            isPublic: true,
            ownerMembers: [{
                uId: 1,
                email: 'foo@bar.com',
                nameFirst: 'John',
                nameLast: 'Doe',
                handleStr: 'johndoe',
                profileImgUrl: expect.any(String)
            }],
            allMembers: [{
                uId: 1,
                email: 'foo@bar.com',
                nameFirst: 'John',
                nameLast: 'Doe',
                handleStr: 'johndoe',
                profileImgUrl: expect.any(String)
            }]
        });
        const result2 = requestChannelMessagesV3(token, 1, 0);
        expect(result2.messages[0].message).toStrictEqual('Removed user');
    })
});

   
