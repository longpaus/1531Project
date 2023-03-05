import request from 'sync-request';
import config from '../config.json';

const OK = 200;
const port = config.port;
const url = config.url;

function requestAuthRegisterV2(email:string, password:string, nameFirst:string, nameLast:string) {
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
function requestChannelsCreate(token:string, name:string, isPublic:boolean) {
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

function requestChannelJoinV2(token:string, channelId:number) {
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
function requestMessageSendV1(token:string, channelId:number, message:string) {
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
function requestChannelMessagesV2(token:string, channelId:number, start:number) {
  const res = request(
    'GET',
    `${url}:${port}/channel/messages/v2`,
    {
      qs: { token, channelId, start }
    }
  );
  return JSON.parse(res.getBody() as string);
}
function requestMessageEditV1(token:string, messageId:number, message:string) {
  const res = request(
    'PUT',
    `${url}:${port}/message/edit/v1`,
    {
      body: JSON.stringify({ token: token, messageId: messageId, message: message }),
      headers: {
        'content-type': 'application/json'
      }
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
const requestMessageRemoved = (token:string,messageId:number) => {
  const res = request(
    'DELETE',
    `${url}:${port}/message/remove/v1`,
    {
      qs: { token, messageId }
    }
  );
  return JSON.parse(res.getBody() as string);
}
const requestMessageSenddmV1 = (token:string,dmId:number,message:string) => {
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
const requestDmCreateV1 = (token:string,uIds:number[]) => {
  const res = request(
    'POST',
    `${url}:${port}/dm/create/v1`,
    {
      body: JSON.stringify({ token: token, uIds:uIds }),
      headers: {
        'content-type': 'application/json'
      }
    }
  );
  return JSON.parse(res.getBody() as string);
}
const requestDmMessagesV1 = (token:string,dmId:number,start:number) => {
  const res = request(
    'GET',
    `${url}:${port}/dm/messages/v1`,
    {
      qs: { token, dmId, start }
    }
  );
  return JSON.parse(res.getBody() as string);
}

describe('Tests for the message/send/v1 sever', () => {
  test('succesful output', () => {
    requestClearV1();
    const user1 = requestAuthRegisterV2('longpaus@gmail.com', 'password', 'long', 'pham');
    const user2 = requestAuthRegisterV2('wonderkid@gmail.com', 'shshhs', 'wonder', 'kid');
    const channel1Id = requestChannelsCreate(user1.token, 'channel1', true).channelId;
    requestChannelJoinV2(user2.token, channel1Id);
    const message1Id = requestMessageSendV1(user1.token, channel1Id, 'hello this is the first message').messageId;
    const message2Id = requestMessageSendV1(user2.token, channel1Id, 'hello this is the second message').messageId;
    const message3Id = requestMessageSendV1(user2.token, channel1Id, 'this is a random message').messageId;
    const message4Id = requestMessageSendV1(user1.token, channel1Id, 'yo hello there!').messageId;
    const channel1Messages = requestChannelMessagesV2(user1.token, channel1Id, 0).messages;
    expect(channel1Messages).toStrictEqual([
      {
        messageId: message4Id,
        uId: user1.authUserId,
        message: 'yo hello there!',
        timeSent: Math.floor(Date.now() / 1000)
      },
      {
        messageId: message3Id,
        uId: user2.authUserId,
        message: 'this is a random message',
        timeSent: Math.floor(Date.now() / 1000)
      },
      {
        messageId: message2Id,
        uId: user2.authUserId,
        message: 'hello this is the second message',
        timeSent: Math.floor(Date.now() / 1000)
      },
      {
        messageId: message1Id,
        uId: user1.authUserId,
        message: 'hello this is the first message',
        timeSent: Math.floor(Date.now() / 1000)
      },
    ]);
  });
  test('error: channelId is not valid', () => {
    requestClearV1();
    const user1 = requestAuthRegisterV2('longpaus@gmail.com', 'password', 'long', 'pham');
    requestAuthRegisterV2('wonderkid@gmail.com', 'shshhs', 'wonder', 'kid');
    expect(requestMessageSendV1(user1.token, 7, 'hello')).toStrictEqual({ error: 'error' });
  });
  test('error: length of message is invalid', () => {
    requestClearV1();
    const user1 = requestAuthRegisterV2('longpaus@gmail.com', 'password', 'long', 'pham');
    requestAuthRegisterV2('wonderkid@gmail.com', 'shshhs', 'wonder', 'kid');
    const channel1Id = requestChannelsCreate(user1.token, 'channel1', true).channelId;
    expect(requestMessageSendV1(user1.token, channel1Id, '')).toStrictEqual({ error: 'error' });
  });
  test('error: user is not valid', () => {
    requestClearV1;
    const user1 = requestAuthRegisterV2('longpaus@gmail.com', 'password', 'long', 'pham');
    requestAuthRegisterV2('wonderkid@gmail.com', 'shshhs', 'wonder', 'kid');
    const channel1Id = requestChannelsCreate(user1.token, 'channel1', true).channelId;
    expect(requestMessageSendV1('cdgvgcdsh', channel1Id, 'hellovhbd ddd dd')).toStrictEqual({ error: 'error' });
  });
});

describe('tests for message/edit/v1', () => {
  test('a successful edit', () => {
    requestClearV1();
    const user1 = requestAuthRegisterV2('longpaus@gmail.com', 'password', 'long', 'pham');
    const user2 = requestAuthRegisterV2('wonderkid@gmail.com', 'shshhs', 'wonder', 'kid');
    const channel1Id = requestChannelsCreate(user1.token, 'channel1', true).channelId;
    requestChannelJoinV2(user2.token, channel1Id);
    const message1Id = requestMessageSendV1(user1.token, channel1Id, 'hello this is the first message').messageId;
    const message2Id = requestMessageSendV1(user2.token, channel1Id, 'hello this is the second message').messageId;
    const message3Id = requestMessageSendV1(user2.token, channel1Id, 'this is a random message').messageId;
    const message4Id = requestMessageSendV1(user1.token, channel1Id, 'yo hello there!').messageId;
    requestMessageEditV1(user1.token, message1Id, 'hello this is the edited message');
    requestMessageEditV1(user1.token, message4Id, 'this message is edited');
    const channel1Messages = requestChannelMessagesV2(user1.token, channel1Id, 0).messages;
    expect(channel1Messages).toStrictEqual([
      {
        messageId: message4Id,
        uId: user1.authUserId,
        message: 'this message is edited',
        timeSent: Math.floor(Date.now() / 1000)
      },
      {
        messageId: message3Id,
        uId: user2.authUserId,
        message: 'this is a random message',
        timeSent: Math.floor(Date.now() / 1000)
      },
      {
        messageId: message2Id,
        uId: user2.authUserId,
        message: 'hello this is the second message',
        timeSent: Math.floor(Date.now() / 1000)
      },
      {
        messageId: message1Id,
        uId: user1.authUserId,
        message: 'hello this is the edited message',
        timeSent: Math.floor(Date.now() / 1000)
      },
    ]);
  });
  test('error: messageId is apart of any channel that the authorised is in', () => {
    requestClearV1();
    const user1 = requestAuthRegisterV2('longpaus@gmail.com', 'password', 'long', 'pham');
    const user2 = requestAuthRegisterV2('wonderkid@gmail.com', 'shshhs', 'wonder', 'kid');
    const user3 = requestAuthRegisterV2('dpitts@yahoo.com', 'shshhs', 'wonder', 'kid');
    const channel1Id = requestChannelsCreate(user1.token, 'channel1', true).channelId;
    const channel2Id = requestChannelsCreate(user1.token, 'channel2', true).channelId;
    requestChannelJoinV2(user2.token, channel1Id);
    requestChannelJoinV2(user3.token, channel2Id);
    requestMessageSendV1(user1.token, channel1Id, 'hello this is the first message').messageId;
    requestMessageSendV1(user2.token, channel1Id, 'hello this is the second message').messageId;
    const message3Id = requestMessageSendV1(user3.token, channel2Id, 'this is the first message of channel2').messageId;
    const result = requestMessageEditV1(user2.token, message3Id, 'hello this is the edited message');
    expect(result).toStrictEqual({ error: 'error' });
  });
  test('error: the authorised Id that is making the request did not send the message', () => {
    requestClearV1();
    const user1 = requestAuthRegisterV2('longpaus@gmail.com', 'password', 'long', 'pham');
    const user2 = requestAuthRegisterV2('wonderkid@gmail.com', 'shshhs', 'wonder', 'kid');
    const channel1Id = requestChannelsCreate(user1.token, 'channel1', true).channelId;
    requestChannelJoinV2(user2.token, channel1Id);
    const message1Id = requestMessageSendV1(user1.token, channel1Id, 'hello this is the first message').messageId;
    requestMessageSendV1(user2.token, channel1Id, 'hello this is the second message').messageId;
    const result = requestMessageEditV1(user2.token, message1Id, 'hello this is the edited message');
    expect(result).toStrictEqual({ error: 'error' });
  });
  test('error: the user does not have permission to edit the message', () => {
    requestClearV1();
    const user1 = requestAuthRegisterV2('longpaus@gmail.com', 'password', 'long', 'pham');
    const user2 = requestAuthRegisterV2('wonderkid@gmail.com', 'shshhs', 'wonder', 'kid');
    const channel1Id = requestChannelsCreate(user1.token, 'channel1', true).channelId;
    requestChannelJoinV2(user2.token, channel1Id);
    const message1Id = requestMessageSendV1(user1.token, channel1Id, 'hello this is the first message').messageId;
    const message2Id = requestMessageSendV1(user2.token, channel1Id, 'hello this is the second message').messageId;
    const result = requestMessageEditV1(user2.token, message1Id, 'hello this is the edited message');
    expect(result).toStrictEqual({ error: 'error' });
  });
});

describe('tests for message/remove/v1', () => {
  test('a successful output', () => {
    requestClearV1();
    const user1 = requestAuthRegisterV2('longpaus@gmail.com', 'password', 'long', 'pham');
    const user2 = requestAuthRegisterV2('wonderkid@gmail.com', 'shshhs', 'wonder', 'kid');
    const channel1Id = requestChannelsCreate(user1.token, 'channel1', true).channelId;
    requestChannelJoinV2(user2.token, channel1Id);
    const message1Id = requestMessageSendV1(user1.token, channel1Id, 'hello this is the first message').messageId;
    const message2Id = requestMessageSendV1(user2.token, channel1Id, 'hello this is the second message').messageId;
    const message3Id = requestMessageSendV1(user2.token, channel1Id, 'this is a random message').messageId;
    const message4Id = requestMessageSendV1(user1.token, channel1Id, 'yo hello there!').messageId;
    requestMessageRemoved(user1.token,message3Id);
    const channel1Messages = requestChannelMessagesV2(user1.token, channel1Id, 0).messages;
    expect(channel1Messages).toStrictEqual([
      {
        messageId: message4Id,
        uId: user1.authUserId,
        message: 'yo hello there!',
        timeSent: Math.floor(Date.now() / 1000)
      },
      {
        messageId: message2Id,
        uId: user2.authUserId,
        message: 'hello this is the second message',
        timeSent: Math.floor(Date.now() / 1000)
      },
      {
        messageId: message1Id,
        uId: user1.authUserId,
        message: 'hello this is the first message',
        timeSent: Math.floor(Date.now() / 1000)
      },
    ]);
  });
  test('error: the messageId is not apart of any channel that the user is in', () => {
    requestClearV1();
    const user1 = requestAuthRegisterV2('longpaus@gmail.com', 'password', 'long', 'pham');
    const user2 = requestAuthRegisterV2('wonderkid@gmail.com', 'shshhs', 'wonder', 'kid');
    const user3 = requestAuthRegisterV2('dpitts@yahoo.com', 'shshhs', 'wonder', 'kid');
    const channel1Id = requestChannelsCreate(user1.token, 'channel1', true).channelId;
    const channel2Id = requestChannelsCreate(user1.token, 'channel2', true).channelId;
    requestChannelJoinV2(user2.token, channel1Id);
    requestChannelJoinV2(user3.token, channel2Id);
    requestMessageSendV1(user1.token, channel1Id, 'hello this is the first message').messageId;
    requestMessageSendV1(user2.token, channel1Id, 'hello this is the second message').messageId;
    const message3Id = requestMessageSendV1(user3.token, channel2Id, 'this is the first message of channel2').messageId;
    expect(requestMessageRemoved(user2.token,message3Id)).toStrictEqual({ error: 'error' });
  });
  test('error: the message was not send by the authorised user making the request', () => {
    requestClearV1();
    const user1 = requestAuthRegisterV2('longpaus@gmail.com', 'password', 'long', 'pham');
    const user2 = requestAuthRegisterV2('wonderkid@gmail.com', 'shshhs', 'wonder', 'kid');
    const channel1Id = requestChannelsCreate(user1.token, 'channel1', true).channelId;
    requestChannelJoinV2(user2.token, channel1Id);
    const message1Id = requestMessageSendV1(user1.token, channel1Id, 'hello this is the first message').messageId;
    requestMessageSendV1(user2.token, channel1Id, 'hello this is the second message').messageId;
    expect(requestMessageRemoved(user2.token,message1Id)).toStrictEqual({ error: 'error' });
  });
  test('error: the user does not have permission to remove the message', () => {
    requestClearV1();
    const user1 = requestAuthRegisterV2('longpaus@gmail.com', 'password', 'long', 'pham');
    const user2 = requestAuthRegisterV2('wonderkid@gmail.com', 'shshhs', 'wonder', 'kid');
    const channel1Id = requestChannelsCreate(user1.token, 'channel1', true).channelId;
    requestChannelJoinV2(user2.token, channel1Id);
    const message1Id = requestMessageSendV1(user1.token, channel1Id, 'hello this is the first message').messageId;
    const message2Id = requestMessageSendV1(user2.token, channel1Id, 'hello this is the second message').messageId;
    expect(requestMessageRemoved(user2.token,message1Id)).toStrictEqual({ error: 'error' });
  });
});

describe('test for message/senddm/v1', () => {
  test('successful output', () => {
    requestClearV1();
    const user1 = requestAuthRegisterV2('longpaus@gmail.com', 'password', 'long', 'pham');
    const user2 = requestAuthRegisterV2('wonderkid@gmail.com', 'shshhs', 'wonder', 'kid');
    const user3 = requestAuthRegisterV2('dpitts@yahoo.com', 'shshhs', 'wonder', 'kid');
    const dm1Id = requestDmCreateV1(user1.token,[user2.authUserId,user3.authUserId]).dmId
    const message1Id = requestMessageSenddmV1(user2.token,dm1Id,'hello guys').messageId
    const message2Id = requestMessageSenddmV1(user3.token,dm1Id,'fgfgggfgf').messageId
    const Dm1Messages = requestDmMessagesV1(user1.token,dm1Id,0).messages
    expect(Dm1Messages[0].messageId).toBe(message2Id);
    expect(Dm1Messages[0].uId).toBe(user3.authUserId);
    expect(Dm1Messages[0].message).toBe('fgfgggfgf');

    expect(Dm1Messages[1].messageId).toBe(message1Id);
    expect(Dm1Messages[1].uId).toBe(user2.authUserId);
    expect(Dm1Messages[1].message).toBe('hello guys');
  });
  test('error: empty message', () => {
    requestClearV1();
    const user1 = requestAuthRegisterV2('longpaus@gmail.com', 'password', 'long', 'pham');
    const user2 = requestAuthRegisterV2('wonderkid@gmail.com', 'shshhs', 'wonder', 'kid');
    const user3 = requestAuthRegisterV2('dpitts@yahoo.com', 'shshhs', 'wonder', 'kid');
    const dm1Id = requestDmCreateV1(user1.token,[user2.authUserId,user3.authUserId]).dmId
    expect(requestMessageSenddmV1(user2.token,dm1Id,'')).toStrictEqual({error:'error'});
  });
  test('error: dmId does not exist', () => {
    requestClearV1();
    const user1 = requestAuthRegisterV2('longpaus@gmail.com', 'password', 'long', 'pham');
    const user2 = requestAuthRegisterV2('wonderkid@gmail.com', 'shshhs', 'wonder', 'kid');
    const user3 = requestAuthRegisterV2('dpitts@yahoo.com', 'shshhs', 'wonder', 'kid');
    requestDmCreateV1(user1.token,[user2.authUserId,user3.authUserId]);
    expect(requestMessageSenddmV1(user2.token,3,'fesvds')).toStrictEqual({error:'error'})
  });
  test('error: authorised user is not part of the dm', () => {
    requestClearV1();
    const user1 = requestAuthRegisterV2('longpaus@gmail.com', 'password', 'long', 'pham');
    const user2 = requestAuthRegisterV2('wonderkid@gmail.com', 'shshhs', 'wonder', 'kid');
    const user3 = requestAuthRegisterV2('dpitts@yahoo.com', 'shshhs', 'wonder', 'kid');
    const user4 = requestAuthRegisterV2('mwilson@yahoo.ca', 'shshhs', 'wonder', 'kid');
    const dm1Id = requestDmCreateV1(user1.token,[user2.authUserId,user3.authUserId]).dmId
    expect(requestMessageSenddmV1(user4.token,dm1Id,'fdfbbf')).toStrictEqual({error:'error'});
  });
});





