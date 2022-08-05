import request from 'sync-request';
import config from '../config.json';
import {
  requestAuthRegisterV3, requestChannelsCreateV3,
  requestChannelJoinV2, requestMessageSendV2, requestChannelMessagesV3,
  requestMessageEditV2, requestClearV1, requestMessageRemoved,requestChannelLeaveV1,requestDmLeaveV2,
  requestMessageSenddmV2, requestDmCreateV1, requestDmMessagesV2,requestMessageSendLaterV1,requestMessageSendDmLaterV1, requestMessageShareV1, requestSearchV1
} from './testFunctions';
import HTTPError from 'http-errors';
import { time } from 'console';

const OK = 200;
const BAD_REQUEST = 400
const FORBIDDEN = 403
const port = config.port;
const url = config.url;

const searchV1 = (token:string,queryStr:string) => {
    const res = request(
        'GET',
        `${url}:${port}/channel/messages/v3`,
        {
            qs: { queryStr },
            headers:{
                token:token
            }
        }
    );
    return res
}
describe('test for search/v1', () => {
    test('successful output', () => {
        requestClearV1();
        const user1 = requestAuthRegisterV3('longpaus@gmail.com', 'password', 'long', 'pham');
        const user2 = requestAuthRegisterV3('wonderkid@gmail.com', 'shshhs', 'wonder', 'kid');
        const user3 = requestAuthRegisterV3('dpitts@yahoo.com', 'shshhs', 'wonder', 'kid');
        const channel1Id = requestChannelsCreateV3(user1.token, 'channel1', true).channelId;
        requestChannelJoinV2(user2.token, channel1Id);
        const dm1Id = requestDmCreateV1(user1.token, [user3.authUserId]).dmId
        const message1Id = requestMessageSendV2(user2.token,channel1Id,'hello sjjsns sjusjsj').messageId
        const message2Id = requestMessageSendV2(user1.token,channel1Id,'sjjsns sjusjs').messageId
        const message3Id = requestMessageSendV2(user2.token,channel1Id,' sjjshellons sjusjsj').messageId
        const message4Id = requestMessageSenddmV2(user3.token,dm1Id,'hellooooooooo').messageId
        const message5Id = requestMessageSenddmV2(user3.token,dm1Id,'shsjsksn').messageId
        const messages = requestSearchV1(user1.token,'hello').messages

        expect(messages[0].messageId).toBe(message1Id);
        expect(messages[0].uId).toBe(user2.authUserId);
        expect(messages[0].message).toBe('hello sjjsns sjusjsj');

        expect(messages[1].messageId).toBe(message3Id);
        expect(messages[1].uId).toBe(user2.authUserId);
        expect(messages[1].message).toBe(' sjjshellons sjusjsj');

        expect(messages[2].messageId).toBe(message4Id);
        expect(messages[2].uId).toBe(user3.authUserId);
        expect(messages[2].message).toBe('hellooooooooo');
    });
    test('invalid length for queryStr', () => {
        requestClearV1();
        const user1 = requestAuthRegisterV3('longpaus@gmail.com', 'password', 'long', 'pham');
        let searchResult = searchV1(user1.token,'')
        expect(searchResult.statusCode).toBe(BAD_REQUEST)
    })
});