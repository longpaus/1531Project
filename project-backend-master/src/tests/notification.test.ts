import request from 'sync-request';
import config from '../config.json';
import {
  requestAuthRegisterV3, requestChannelsCreateV3,
  requestChannelJoinV2, requestMessageSendV2, requestChannelInviteV3,
  requestMessageEditV2, requestClearV1, requestMessageRemoved,requestChannelLeaveV1,requestDmLeaveV2,requestNotificationGetV1,
  requestMessageSenddmV2, requestDmCreateV1, requestDmMessagesV2,requestMessageSendLaterV1,requestMessageSendDmLaterV1, requestMessageShareV1, requestUserRemove,requestmessageReactV1
} from './testFunctions';
import HTTPError from 'http-errors';
import { time } from 'console';

const OK = 200;
const BAD_REQUEST = 400
const FORBIDDEN = 403
const port = config.port;
const url = config.url;
describe('test for request/notificationGet/v1', () => {
    test('successful output', () => {
        requestClearV1();
        const user1 = requestAuthRegisterV3('longpaus@gmail.com', 'password', 'long', 'pham');
        const user2 = requestAuthRegisterV3('wonderkid@gmail.com', 'shshhs', 'wonder', 'kid');
        const user3 = requestAuthRegisterV3('dpitts@yahoo.com', 'shshhs', 'wonder', 'kid');
        const channel1Id = requestChannelsCreateV3(user1.token, 'channel1', true).channelId;
        requestChannelInviteV3(user1.token,channel1Id,user2.authUserId)
        const dm1Id = requestDmCreateV1(user1.token, [user3.authUserId]).dmId
        const message1Id = requestMessageSendV2(user2.token,channel1Id,'@longpham @longpham @wonderkid hello sjjsns sjusjsj').messageId
        const message2Id = requestMessageSenddmV2(user3.token,dm1Id,'hellooooooooo @wonderkid').messageId
        requestmessageReactV1(user1.token,message1Id,1)
        const user1Notification = requestNotificationGetV1(user1.token).notifications
        expect(user1Notification[0].channelId).toBe(channel1Id)
        expect(user1Notification[0].dmId).toBe(-1)
        expect(user1Notification[0].notificationMessage).toBe('{wonderkid} tagged you in {channel1}: {@longpham @longpham }')

        const user2Notification = requestNotificationGetV1(user2.token).notifications
        expect(user2Notification[0].channelId).toBe(channel1Id)
        expect(user2Notification[0].dmId).toBe(-1)
        expect(user2Notification[0].notificationMessage).toBe('{longpham} reacted to your message in {channel1}')
        
        expect(user2Notification[1].channelId).toBe(-1)
        expect(user2Notification[1].dmId).toBe(dm1Id)
        expect(user2Notification[1].notificationMessage).toBe('{wonderkid0} tagged you in {longpham, wonderkid0}: {hellooooooooo @wonde}')

        expect(user2Notification[2].channelId).toBe(channel1Id)
        expect(user2Notification[2].dmId).toBe(-1)
        expect(user2Notification[2].notificationMessage).toBe('{wonderkid} tagged you in {channel1}: {@longpham @longpham }')

        expect(user2Notification[3].notificationMessage).toBe('{longpham} added you to {channel1}')
        expect(user2Notification[3].dmId).toBe(-1)
        expect(user2Notification[3].channelId).toBe(channel1Id)

        const user3Notification = requestNotificationGetV1(user3.token).notifications
        expect(user3Notification[0].channelId).toBe(-1)
        expect(user3Notification[0].dmId).toBe(dm1Id)
        expect(user3Notification[0].notificationMessage).toBe('{longpham} added you to {longpham, wonderkid0}')

        

        
    })
})