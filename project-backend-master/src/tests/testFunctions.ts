import { channel } from 'diagnostics_channel';
import request from 'sync-request';
import config from '../config.json';

const port = config.port;
const url = config.url;

const requestClearV1 = () => {
    const res = request(
        'DELETE',
        `${url}:${port}/clear/v1`,
    );
}

const requestAuthRegisterV3 = (email: string, password: string, nameFirst: string, nameLast: string) => {
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
            headers: { 'Content-type': 'application/json' }
        }
    );
    return JSON.parse(res.body as string);
}

const requestDmCreateV1 = (token: string, uIds: number[]) => {
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
    return JSON.parse(res.body as string);
}

const requestChannelsCreateV3 = (token: string, name: string, isPublic: boolean) => {
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
                'token': token
            }
        }
    );
    return JSON.parse(res.body as string);
}

const requestMessageSenddmV2 = (token: string, dmId: number, message: string) => {
    const res = request(
        'POST',
        `${url}:${port}/message/senddm/v2`,
        {
            body: JSON.stringify({ dmId: dmId, message: message }),
            headers: {
                'content-type': 'application/json',
                token: token
            }
        }
    );
    return JSON.parse(res.getBody() as string);
}

const requestDmMessagesV2 = (token: string, dmId: number, start: number) => {
    const res = request(
        'GET',
        `${url}:${port}/dm/messages/v2`,
        {
            qs: { dmId, start },
            headers: {
                'token': token
            }
        }
    );
    return JSON.parse(res.body as string);
}

function requestChannelJoinV2(token: string, channelId: number) {
    const res = request(
        'POST',
        `${url}:${port}/channel/join/v3`,
        {
            body: JSON.stringify({ channelId: channelId }),
            headers: {
                'content-type': 'application/json',
                'token': token
            }
        }
    );
    return JSON.parse(res.getBody() as string);
}

function requestMessageSendV2(token: string, channelId: number, message: string) {
    const res = request(
        'POST',
        `${url}:${port}/message/send/v2`,
        {
            body: JSON.stringify({ channelId: channelId, message: message }),
            headers: {
                'content-type': 'application/json',
                'token': token
            }
        }
    );
    return JSON.parse(res.getBody() as string);
}

function requestChannelMessagesV3(token: string, channelId: number, start: number) {
    const res = request(
        'GET',
        `${url}:${port}/channel/messages/v3`,
        {
            qs: { channelId, start },
            headers: {
                token: token
            }
        }
    );
    return JSON.parse(res.getBody() as string);
}

function requestMessageEditV2(token: string, messageId: number, message: string) {
    const res = request(
        'PUT',
        `${url}:${port}/message/edit/v2`,
        {
            body: JSON.stringify({ messageId: messageId, message: message }),
            headers: {
                'content-type': 'application/json',
                token: token
            }
        }
    );
    return JSON.parse(res.getBody() as string);
}
const requestMessageRemoved = (token: string, messageId: number) => {
    const res = request(
        'DELETE',
        `${url}:${port}/message/remove/v2`,
        {
            qs: { messageId },
            headers: {
                token: token
            }
        }
    );
    return JSON.parse(res.getBody() as string);
}
const requestStandupStart = (token: string, channelId: number, length: number) => {
    const res = request(
        'POST',
        `${url}:${port}/standup/start/v1`,
        {
            body: JSON.stringify({
                channelId: channelId,
                length: length
            }),
            headers: {
                'Content-type': 'application/json',
                'token': token
            }
        }
    );
    return res;
}
const requestMessageSendLaterV1 = (token: string, channelId: number, message: string, timeSent: number) => {
    const res = request(
        'POST',
        `${url}:${port}/message/sendlater/v1`,
        {
            body: JSON.stringify({ channelId: channelId, message: message, timeSent: timeSent }),
            headers: {
                'content-type': 'application/json',
                'token': token
            }
        }
    );
    return JSON.parse(res.getBody() as string);
}
const requestMessageSendDmLaterV1 = (token: string, dmId: number, message: string, timeSent: number) => {
    const res = request(
        'POST',
        `${url}:${port}/message/sendlaterdm/v1`,
        {
            body: JSON.stringify({ dmId: dmId, message: message, timeSent: timeSent }),
            headers: {
                'content-type': 'application/json',
                'token': token
            }
        }
    );
    return JSON.parse(res.getBody() as string);
}
const requestChannelLeaveV1 = (token: string, channelId: number) => {
    const res = request(
        'POST',
        `${url}:${port}/channel/leave/v2`,
        {
            body: JSON.stringify({ channelId: channelId }),
            headers: {
                'content-type': 'application/json',
                'token': token
            }
        }
    );
    return JSON.parse(res.getBody() as string);
}
const requestDmLeaveV2 = (token: string, dmId: number) => {
    const res = request(
        'POST',
        `${url}:${port}/dm/leave/v2`,
        {
            body: JSON.stringify({ dmId: dmId }),
            headers: {
                'content-type': 'application/json',
                'token': token
            }
        }
    );
    return JSON.parse(res.getBody() as string);
}

const requestMessageShareV1 = (token: string, ogMessageId: number, message: string, channelId: number, dmId: number) => {
    const res = request(
        'POST',
        `${url}:${port}/message/share/v1`,
        {
            body: JSON.stringify({ ogMessageId, message, channelId, dmId }),
            headers: {
                'content-type': 'application/json',
                'token': token
            }
        }
    );
    return JSON.parse(res.getBody() as string);
}

const requestUserRemove = (token: string, uId: number) => {
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
    return JSON.parse(res.body as string);
}

const requestSearchV1 = (token: string, queryStr: string) => {
    const res = request(
        'GET',
        `${url}:${port}/search/v1`,
        {
            qs: { queryStr },
            headers: {
                token: token
            }
        }
    );
    return JSON.parse(res.getBody() as string);
}
const requestNotificationGetV1 = (token:string) => {
    const res = request(
        'GET',
        `${url}:${port}/notifications/get/v1`,
        {
            qs: {},
            headers: {
                token: token
            }
        }
    );
    return JSON.parse(res.getBody() as string);
}
const requestmessageReactV1 = (token:string,messageId:number,reactId:number) => {
    const res = request(
        'POST',
        `${url}:${port}/message/react/v1`,
        {
            body: JSON.stringify({ messageId, reactId}),
            headers: {
                'content-type': 'application/json',
                'token': token
            }
        }
    );
    return JSON.parse(res.getBody() as string);
}
const requestChannelInviteV3 = (token:string,channelId:number,uId:number) => {
    const res = request(
        'POST',
        `${url}:${port}/channel/invite/v3`,
        {
            body: JSON.stringify({ channelId, uId}),
            headers: {
                'content-type': 'application/json',
                'token': token
            }
        }
    );
    return JSON.parse(res.getBody() as string);
}
export {
    requestClearV1,
    requestAuthRegisterV3,
    requestDmCreateV1,
    requestChannelsCreateV3,
    requestMessageSenddmV2,
    requestDmMessagesV2,
    requestChannelJoinV2,
    requestMessageSendV2,
    requestChannelMessagesV3,
    requestMessageEditV2,
    requestMessageRemoved,
    requestStandupStart,
    requestMessageSendLaterV1,
    requestMessageSendDmLaterV1,
    requestChannelLeaveV1,
    requestDmLeaveV2,
    requestMessageShareV1,
    requestUserRemove,
    requestSearchV1,
    requestNotificationGetV1,
    requestmessageReactV1,
    requestChannelInviteV3
}