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

const requestAuthRegisterV2 = (email: string, password: string, nameFirst: string, nameLast: string) => {
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
            headers: {'Content-type': 'application/json'} 
        }
    );
    return JSON.parse(res.getBody() as string);
}

const requestDmCreateV1 = (token: string, uIds: number[]) => {
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
    return JSON.parse(res.getBody() as string);
}

const requestChannelsCreateV2 = (token: string, name: string, isPublic: boolean) => {
    const res = request(
        'POST',
        `${url}:${port}/channels/creat1/v2`,
        {
            body: JSON.stringify({
                token: token,
                name: name,
                isPublic: isPublic
            }),
            headers: {'Content-type': 'application/json'}
        }
    );
    return JSON.parse(res.getBody() as string);
}

const requestMessageSenddmV1 = (token: string, dmId: number, message: string) => {
    const res = request(
        'POST',
        `${url}:${port}/message/senddm/v1`,
        {
            body: JSON.stringify({ token: token, dmId: dmId, message: message }),
            headers: {
                'content-type': 'application/json'
            }
        }
    );
    return JSON.parse(res.getBody() as string);
}

const requestDmMessagesV1 = (token: string, dmId: number, start: number) => {
    const res = request(
        'GET',
        `${url}:${port}/dm/messages/v1`,
        {
            qs: { token, dmId, start }
        }
    );
    return JSON.parse(res.getBody() as string);
}

export{
    requestClearV1,
    requestAuthRegisterV2,
    requestDmCreateV1,
    requestChannelsCreateV2,
    requestMessageSenddmV1,
    requestDmMessagesV1
}