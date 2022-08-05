import request from 'sync-request';
import config from '../config.json';
import {
  requestAuthRegisterV3, requestChannelsCreateV3,
  requestChannelJoinV2, requestMessageSendV2, requestChannelMessagesV3,
  requestMessageEditV2, requestClearV1, requestMessageRemoved,requestChannelLeaveV1,requestDmLeaveV2,
  requestMessageSenddmV2, requestDmCreateV1, requestDmMessagesV2,requestMessageSendLaterV1,requestMessageSendDmLaterV1, requestMessageShareV1, requestmessageReactV1
} from './testFunctions';

const OK = 200;
const BAD_REQUEST = 400
const FORBIDDEN = 403
const port = config.port;
const url = config.url;

const messageSendDmLaterV1 = (token:string,dmId:number,message:string,timeSent:number) => {
  const res = request(
      'POST',
      `${url}:${port}/message/sendlaterdm/v1`,
      {
          body: JSON.stringify({ dmId: dmId, message: message,timeSent:timeSent }),
          headers: {
              'content-type': 'application/json',
              'token': token
          }
      }
  );
  return res
}
const messageShareV1 = (token:string,ogMessageId:number,message:string,channelId:number,dmId:number) => {
  const res = request(
      'POST',
      `${url}:${port}/message/share/v1`,
      {
          body: JSON.stringify({ogMessageId,message,channelId,dmId}),
          headers: {
              'content-type': 'application/json',
              'token':token
          }
      }
  );
  return res
}    
const messageSenddmV2 = (token: string, dmId: number, message: string) => {
  const res = request(
    'POST',
    `${url}:${port}/message/senddm/v2`,
    {
      body: JSON.stringify({ dmId: dmId, message: message }),
      headers: {
        'content-type': 'application/json',
        token:token
      }
    }
  );
  return res;
}
const messageSendLaterV1 = (token:string,channelId:number,message:string,timeSent:number) => {
  const res = request(
      'POST',
      `${url}:${port}/message/sendlater/v1`,
      {
          body: JSON.stringify({ channelId: channelId, message: message,timeSent:timeSent }),
          headers: {
              'content-type': 'application/json',
              'token': token
          }
      }
  );
  return res
}

function messageSendV2(token: string, channelId: number, message: string) {
  const res = request(
      'POST',
      `${url}:${port}/message/send/v2`,
      {
          body: JSON.stringify({ channelId: channelId, message: message }),
          headers: {
              'content-type': 'application/json',
              token:token
          }
      }
  );
  return res;
}


function messageEditV2(token:string, messageId:number, message:string) {
  const res = request(
    'PUT',
    `${url}:${port}/message/edit/v2`,
    {
      body: JSON.stringify({ messageId: messageId, message: message }),
      headers: {
        'content-type': 'application/json',
        token:token
      }
    }
  );
  return res;
}

const messageRemoved = (token:string,messageId:number) => {
  const res = request(
    'DELETE',
    `${url}:${port}/message/remove/v2`,
    {
      qs: { messageId },
      headers:{
          token:token
      }
    }
  );
  return res;
}
const messagePin = (token:string, messageId: number) => {
  const res = request(
    'POST',
    `${url}:${port}/message/pin/v1`,
    {
      body: JSON.stringify({ messageId: messageId  }),
      headers:{
        'content-type': 'application/json',
          token:token
      }
    }
  );
  return res;
}
const messageReactV1 = (token:string,messageId:number,reactId:number) => {
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
  return res
}
const messageUnPin = (token:string, messageId: number) => {
  const res = request(
    'POST',
    `${url}:${port}/message/unpin/v1`,
    {
      body: JSON.stringify({ messageId: messageId}),
      headers:{
          'content-type': 'application/json',
          token:token
      }
    }
  );
  return res;
}
test('succesful output1', () => {
  requestClearV1();
  const user1 = requestAuthRegisterV3('longpaus@gmail.com', 'password', 'long', 'pham');
  const user2 = requestAuthRegisterV3('wonderkid@gmail.com', 'shshhs', 'wonder', 'kid');
  const channel1Id = requestChannelsCreateV3(user1.token, 'channel1', true).channelId;
  requestChannelJoinV2(user2.token, channel1Id);
  const message1Id = requestMessageSendV2(user1.token, channel1Id, 'hello this is the first message').messageId;
  const message2Id = requestMessageSendV2(user2.token, channel1Id, 'hello this is the second message').messageId;
  expect(messagePin(user1.token, message1Id).statusCode).toBe(200);
  messagePin(user2.token,message2Id);
  expect(messageUnPin(user1.token, message1Id).statusCode).toBe(200);
  const channel1Messages = requestChannelMessagesV3(user1.token, channel1Id, 0);
  expect(channel1Messages.messages[1].isPin).toBe(false);
  
  expect(channel1Messages.messages[0].isPin).toBe(true);

} );
test('succesful output1', () => {
  requestClearV1();
  const user1 = requestAuthRegisterV3('longpaus@gmail.com', 'password', 'long', 'pham');
  const user2 = requestAuthRegisterV3('wonderkid@gmail.com', 'shshhs', 'wonder', 'kid');
  const user3 = requestAuthRegisterV3('wonder@gmail.com', 'shshhs', 'wonder', 'd')
  const channel1Id = requestChannelsCreateV3(user1.token, 'channel1', true).channelId;
  requestChannelJoinV2(user2.token, channel1Id);
  const message1Id = requestMessageSendV2(user1.token, channel1Id, 'hello this is the first message').messageId;
  const message2Id = requestMessageSendV2(user2.token, channel1Id, 'hello this is the second message').messageId;
  expect(messagePin(user1.token, message1Id).statusCode).toBe(200);
  expect(messagePin(user1.token,message1Id).statusCode).toBe(400);// message already pinned
  expect(messageUnPin(user1.token, message1Id).statusCode).toBe(200);
  expect(messageUnPin(user1.token, message1Id).statusCode).toBe(400);//message already unpinned
  expect(messagePin(user1.token, 54434).statusCode).toBe(400);//invalid message id.
  expect(messageUnPin(user1.token, 5431).statusCode).toBe(400);
  expect(messagePin(user2.token, message1Id).statusCode).toBe(403);
  expect(messageUnPin(user2.token, message1Id).statusCode).toBe(403);
  expect(messagePin(user3.token, message1Id).statusCode).toBe(400);//not in channel
  expect(messageUnPin(user3.token, message1Id).statusCode).toBe(400);// not in channel
  expect(messagePin('dsa',message1Id).statusCode).toBe(400);
  expect(messageUnPin('dsa',message1Id).statusCode).toBe(400);
  //const channel1Messages = requestChannelMessagesV3(user1.token, channel1Id, 0);
  //expect(channel1Messages.messages[1].isPin).toBe(false);
  
  //expect(channel1Messages.messages[0].isPin).toBe(true);

} );
describe('Tests for the /message/unreact/v1 valid', () => {
  test('successful output', () => {
    requestClearV1();
    const user1 = requestAuthRegisterV3('longpaus@gmail.com', 'password', 'long', 'pham');
    const user2 = requestAuthRegisterV3('wonderkid@gmail.com', 'shshhs', 'wonder', 'kid');
    const channel1Id = requestChannelsCreateV3(user1.token, 'channel1', true).channelId;
    requestChannelJoinV2(user2.token, channel1Id);
    const message1Id = requestMessageSendV2(user1.token, channel1Id, 'hello this is the first message').messageId;
    const message2Id = requestMessageSendV2(user2.token, channel1Id, 'hello this is the second message').messageId;
    const channel1Messages = requestChannelMessagesV3(user1.token, channel1Id, 0)
      const res = request(
          'POST',
          `${url}:${port}/message/unreact/v1`,
          {
              json: {
                  messageId: -1000, 
                  reactId: 1,
                  token: user1.token
              }
        
          }
      )
      
      const bodyObj = JSON.parse(res.body as string);
      expect(res.statusCode).toBe(400);
  });
});
describe('Tests for the /message/unreact/v1 valid', () => {
  test('successful output', () => {
    requestClearV1();
    const user1 = requestAuthRegisterV3('longpaus@gmail.com', 'password', 'long', 'pham');
    const user2 = requestAuthRegisterV3('wonderkid@gmail.com', 'shshhs', 'wonder', 'kid');
    const channel1Id = requestChannelsCreateV3(user1.token, 'channel1', true).channelId;
    requestChannelJoinV2(user2.token, channel1Id);
    const message1Id = requestMessageSendV2(user1.token, channel1Id, 'hello this is the first message').messageId;
    const message2Id = requestMessageSendV2(user2.token, channel1Id, 'hello this is the second message').messageId;
    const channel1Messages = requestChannelMessagesV3(user1.token, channel1Id, 0)
      const res = request(
          'POST',
          `${url}:${port}/message/unreact/v1`,
          {
              json: {
                  messageId: message1Id, 
                  reactId: -100,
                  token: user1.token
              }
        
          }
      )
      const bodyObj = JSON.parse(res.body as string);
      expect(res.statusCode).toBe(400);
  });
});
describe('Tests for the /message/unreact/v1 valid', () => {
  test('successful output', () => {
    requestClearV1();
    const user1 = requestAuthRegisterV3('longpaus@gmail.com', 'password', 'long', 'pham');
    const user2 = requestAuthRegisterV3('wonderkid@gmail.com', 'shshhs', 'wonder', 'kid');
    const channel1Id = requestChannelsCreateV3(user1.token, 'channel1', true).channelId;
    requestChannelJoinV2(user2.token, channel1Id);
    const message1Id = requestMessageSendV2(user1.token, channel1Id, 'hello this is the first message').messageId;
    const message2Id = requestMessageSendV2(user2.token, channel1Id, 'hello this is the second message').messageId;
    const channel1Messages = requestChannelMessagesV3(user1.token, channel1Id, 0)
      const res = request(
          'POST',
          `${url}:${port}/message/unreact/v1`,
          {
              json: {
                  messageId: message1Id, 
                  reactId: 1,
                  token: user1.token
              }
        
          }
      )
      const bodyObj = JSON.parse(res.body as string);
      expect(res.statusCode).toBe(400);
  });
});

describe('Tests for the /message/react/v1 valid', () => {
  test('successful output', () => {
    requestClearV1();
    const user1 = requestAuthRegisterV3('longpaus@gmail.com', 'password', 'long', 'pham');
    const user2 = requestAuthRegisterV3('wonderkid@gmail.com', 'shshhs', 'wonder', 'kid');
    const channel1Id = requestChannelsCreateV3(user1.token, 'channel1', true).channelId;
    requestChannelJoinV2(user2.token, channel1Id);
    const message1Id = requestMessageSendV2(user1.token, channel1Id, 'hello this is the first message').messageId;
    const message2Id = requestMessageSendV2(user2.token, channel1Id, 'hello this is the second message').messageId;
    const channel1Messages = requestChannelMessagesV3(user1.token, channel1Id, 0)
      const res = request(
          'POST',
          `${url}:${port}/message/react/v1`,
          {
              json: {
                  messageId: -1000, 
                  reactId: 1,
                  token: user1.token
              }
        
          }
      )
      const bodyObj = JSON.parse(res.body as string);
      expect(res.statusCode).toBe(400);
  });
});
describe('Tests for the /message/react/v1 valid', () => {
  test('successful output', () => {
    requestClearV1();
    const user1 = requestAuthRegisterV3('longpaus@gmail.com', 'password', 'long', 'pham');
    const user2 = requestAuthRegisterV3('wonderkid@gmail.com', 'shshhs', 'wonder', 'kid');
    const channel1Id = requestChannelsCreateV3(user1.token, 'channel1', true).channelId;
    requestChannelJoinV2(user2.token, channel1Id);
    const message1Id = requestMessageSendV2(user1.token, channel1Id, 'hello this is the first message').messageId;
    const message2Id = requestMessageSendV2(user2.token, channel1Id, 'hello this is the second message').messageId;
    const channel1Messages = requestChannelMessagesV3(user1.token, channel1Id, 0)
      const res = request(
          'POST',
          `${url}:${port}/message/react/v1`,
          {
              json: {
                  messageId: message1Id, 
                  reactId: -100,
                  token: user1.token
              }
        
          }
      )
      const bodyObj = JSON.parse(res.body as string);
      expect(res.statusCode).toBe(400);
  });
});
describe('Tests for the /message/react/v1 valid', () => {
  test('successful output', () => {
    requestClearV1();
    const user1 = requestAuthRegisterV3('longpaus@gmail.com', 'password', 'long', 'pham');
    const user2 = requestAuthRegisterV3('wonderkid@gmail.com', 'shshhs', 'wonder', 'kid');
    const channel1Id = requestChannelsCreateV3(user1.token, 'channel1', true).channelId;
    requestChannelJoinV2(user2.token, channel1Id);
    const message1Id = requestMessageSendV2(user1.token, channel1Id, 'hello this is the first message').messageId;
    const message2Id = requestMessageSendV2(user2.token, channel1Id, 'hello this is the second message').messageId;
    const channel1Messages = requestChannelMessagesV3(user1.token, channel1Id, 0)
     
      expect(messageReactV1(user1.token,message1Id,1).statusCode).toBe(OK)
     
  });
});
describe('Tests for the message/send/v2 sever', () => {
  test('succesful output', () => {
    requestClearV1();
    const user1 = requestAuthRegisterV3('longpaus@gmail.com', 'password', 'long', 'pham');
    const user2 = requestAuthRegisterV3('wonderkid@gmail.com', 'shshhs', 'wonder', 'kid');
    const channel1Id = requestChannelsCreateV3(user1.token, 'channel1', true).channelId;
    requestChannelJoinV2(user2.token, channel1Id);
    const message1Id = requestMessageSendV2(user1.token, channel1Id, 'hello this is the first message').messageId;
    const message2Id = requestMessageSendV2(user2.token, channel1Id, 'hello this is the second message').messageId;
    const channel1Messages = requestChannelMessagesV3(user1.token, channel1Id, 0)

    expect(channel1Messages.messages[0].messageId).toBe(message2Id);
    expect(channel1Messages.messages[0].uId).toBe(user2.authUserId);
    expect(channel1Messages.messages[0].message).toBe('hello this is the second message');

    expect(channel1Messages.messages[1].messageId).toBe(message1Id);
    expect(channel1Messages.messages[1].uId).toBe(user1.authUserId);
    expect(channel1Messages.messages[1].message).toBe('hello this is the first message');

    let messageSendResult = messageSendV2(user1.token, channel1Id, 'hello this is the first message');
    expect(messageSendResult.statusCode).toBe(OK);
  });
  test('error: channelId is not valid', () => {
    requestClearV1();
    const user1 = requestAuthRegisterV3('longpaus@gmail.com', 'password', 'long', 'pham');
    requestAuthRegisterV3('wonderkid@gmail.com', 'shshhs', 'wonder', 'kid');
    // expect(requestMessageSendV2(user1.token, 7, 'hello')).toThrow('invalid channelId');
    let messageSendResult = messageSendV2(user1.token, 7, 'hello');
    expect(messageSendResult.statusCode).toBe(BAD_REQUEST);
  });
  test('error: length of message is invalid', () => {
    requestClearV1();
    const user1 = requestAuthRegisterV3('longpaus@gmail.com', 'password', 'long', 'pham');
    requestAuthRegisterV3('wonderkid@gmail.com', 'shshhs', 'wonder', 'kid');
    const channel1Id = requestChannelsCreateV3(user1.token, 'channel1', true).channelId;
    // expect(requestMessageSendV2(user1.token, channel1Id, '')).toBe('invalid message length');
    let messageSendResult = messageSendV2(user1.token, channel1Id, '');
    expect(messageSendResult.statusCode).toBe(BAD_REQUEST);
  });
  test('error: user is not valid', () => {
    requestClearV1();
    const user1 = requestAuthRegisterV3('longpaus@gmail.com', 'password', 'long', 'pham');
    requestAuthRegisterV3('wonderkid@gmail.com', 'shshhs', 'wonder', 'kid');
    const channel1Id = requestChannelsCreateV3(user1.token, 'channel1', true).channelId;
    // expect(requestMessageSendV2('cdgvgcdsh', channel1Id, 'hellovhbd ddd dd')).toThrow('userId not in channel');
    let messageSendResult = messageSendV2('cdgvgcdsh', channel1Id, 'hellovhbd ddd dd');
    expect(messageSendResult.statusCode).toBe(FORBIDDEN);
  });
});

describe('tests for message/edit/v2', () => {
  test('a successful edit', () => {
    requestClearV1();
    const user1 = requestAuthRegisterV3('longpaus@gmail.com', 'password', 'long', 'pham');
    const user2 = requestAuthRegisterV3('wonderkid@gmail.com', 'shshhs', 'wonder', 'kid');
    const channel1Id = requestChannelsCreateV3(user1.token, 'channel1', true).channelId;
    requestChannelJoinV2(user2.token, channel1Id);
    const message1Id = requestMessageSendV2(user1.token, channel1Id, 'hello this is the first message').messageId;
    const message2Id = requestMessageSendV2(user2.token, channel1Id, 'hello this is the second message').messageId;
    const message3Id = requestMessageSendV2(user2.token, channel1Id, 'this is a random message').messageId;
    const message4Id = requestMessageSendV2(user1.token, channel1Id, 'yo hello there!').messageId;
    requestMessageEditV2(user1.token, message1Id, 'hello this is the edited message');
    requestMessageEditV2(user1.token, message4Id, 'this message is edited');
    const channel1Messages = requestChannelMessagesV3(user1.token, channel1Id, 0);

    expect(channel1Messages.messages[0].messageId).toBe(message4Id);
    expect(channel1Messages.messages[0].uId).toBe(user1.authUserId);
    expect(channel1Messages.messages[0].message).toBe('this message is edited');

    expect(channel1Messages.messages[1].messageId).toBe(message3Id);
    expect(channel1Messages.messages[1].uId).toBe(user2.authUserId);
    expect(channel1Messages.messages[1].message).toBe('this is a random message');

    expect(channel1Messages.messages[2].messageId).toBe(message2Id);
    expect(channel1Messages.messages[2].uId).toBe(user2.authUserId);
    expect(channel1Messages.messages[2].message).toBe('hello this is the second message');

    expect(channel1Messages.messages[3].messageId).toBe(message1Id);
    expect(channel1Messages.messages[3].uId).toBe(user1.authUserId);
    expect(channel1Messages.messages[3].message).toBe('hello this is the edited message');

    let messageEditResult = messageEditV2(user1.token, message1Id, 'hello this is the edited message');
    expect(messageEditResult.statusCode).toBe(OK);
  });
  test('error: messageId is apart of any channel that the authorised is in', () => {
    requestClearV1();
    const user1 = requestAuthRegisterV3('longpaus@gmail.com', 'password', 'long', 'pham');
    const user2 = requestAuthRegisterV3('wonderkid@gmail.com', 'shshhs', 'wonder', 'kid');
    const user3 = requestAuthRegisterV3('dpitts@yahoo.com', 'shshhs', 'wonder', 'kid');
    const channel1Id = requestChannelsCreateV3(user1.token, 'channel1', true).channelId;
    const channel2Id = requestChannelsCreateV3(user1.token, 'channel2', true).channelId;
    requestChannelJoinV2(user2.token, channel1Id);
    requestChannelJoinV2(user3.token, channel2Id);
    requestMessageSendV2(user1.token, channel1Id, 'hello this is the first message').messageId;
    requestMessageSendV2(user2.token, channel1Id, 'hello this is the second message').messageId;
    const message3Id = requestMessageSendV2(user3.token, channel2Id, 'this is the first message of channel2').messageId;
    // expect(requestMessageEditV2(user2.token, message3Id, 'hello this is the edited message')).toThrow('invalid messageId')
    
    let messageEditResult = messageEditV2(user2.token, message3Id, 'hello this is the edited message');
    expect(messageEditResult.statusCode).toBe(BAD_REQUEST);
  });
  test('edit into an empty message', () => {
    requestClearV1();
    const user1 = requestAuthRegisterV3('longpaus@gmail.com', 'password', 'long', 'pham');
    const user2 = requestAuthRegisterV3('wonderkid@gmail.com', 'shshhs', 'wonder', 'kid');
    const channel1Id = requestChannelsCreateV3(user1.token, 'channel1', true).channelId;
    requestChannelJoinV2(user2.token, channel1Id);
    const message1Id = requestMessageSendV2(user1.token, channel1Id, 'hello this is the first message').messageId;
    const message2Id = requestMessageSendV2(user2.token, channel1Id, 'hello this is the second message').messageId;
    requestMessageEditV2(user1.token,message1Id,'')
    const channel1Messages = requestChannelMessagesV3(user1.token, channel1Id, 0);

    expect(channel1Messages.messages[0].messageId).toBe(message2Id);
    expect(channel1Messages.messages[0].uId).toBe(user2.authUserId);
    expect(channel1Messages.messages[0].message).toBe('hello this is the second message');

  });
  test('error: the user does not have permission to edit the message', () => {
    requestClearV1();
    const user1 = requestAuthRegisterV3('longpaus@gmail.com', 'password', 'long', 'pham');
    const user2 = requestAuthRegisterV3('wonderkid@gmail.com', 'shshhs', 'wonder', 'kid');
    const channel1Id = requestChannelsCreateV3(user1.token, 'channel1', true).channelId;
    requestChannelJoinV2(user2.token, channel1Id);
    const message1Id = requestMessageSendV2(user1.token, channel1Id, 'hello this is the first message').messageId;
    const message2Id = requestMessageSendV2(user2.token, channel1Id, 'hello this is the second message').messageId;
    // expect(requestMessageEditV2(user2.token, message1Id, 'hello this is the edited message')).toThrow('user have no permmission')
    
    let messageEditResult = messageEditV2(user2.token, message1Id, 'hello this is the edited message');
    expect(messageEditResult.statusCode).toBe(FORBIDDEN);
  });
});

describe('tests for message/remove/v2', () => {
  test('a successful output', () => {
    requestClearV1();
    const user1 = requestAuthRegisterV3('longpaus@gmail.com', 'password', 'long', 'pham');
    const user2 = requestAuthRegisterV3('wonderkid@gmail.com', 'shshhs', 'wonder', 'kid');
    const channel1Id = requestChannelsCreateV3(user1.token, 'channel1', true).channelId;
    requestChannelJoinV2(user2.token, channel1Id);
    const message1Id = requestMessageSendV2(user1.token, channel1Id, 'hello this is the first message').messageId;
    const message2Id = requestMessageSendV2(user2.token, channel1Id, 'hello this is the second message').messageId;
    const message3Id = requestMessageSendV2(user2.token, channel1Id, 'this is a random message').messageId;
    const message4Id = requestMessageSendV2(user1.token, channel1Id, 'yo hello there!').messageId;
    requestMessageRemoved(user1.token, message3Id);
    const channel1Messages = requestChannelMessagesV3(user1.token, channel1Id, 0);

    expect(channel1Messages.messages[0].messageId).toBe(message4Id);
    expect(channel1Messages.messages[0].uId).toBe(user1.authUserId);
    expect(channel1Messages.messages[0].message).toBe('yo hello there!');

    expect(channel1Messages.messages[1].messageId).toBe(message2Id);
    expect(channel1Messages.messages[1].uId).toBe(user2.authUserId);
    expect(channel1Messages.messages[1].message).toBe('hello this is the second message');

    expect(channel1Messages.messages[2].messageId).toBe(message1Id);
    expect(channel1Messages.messages[2].uId).toBe(user1.authUserId);
    expect(channel1Messages.messages[2].message).toBe('hello this is the first message');

    let messageRemoveResults = messageRemoved(user1.token, message1Id);
    expect(messageRemoveResults.statusCode).toBe(OK);
  });
  test('error: the messageId is not apart of any channel that the user is in', () => {
    requestClearV1();
    const user1 = requestAuthRegisterV3('longpaus@gmail.com', 'password', 'long', 'pham');
    const user2 = requestAuthRegisterV3('wonderkid@gmail.com', 'shshhs', 'wonder', 'kid');
    const user3 = requestAuthRegisterV3('dpitts@yahoo.com', 'shshhs', 'wonder', 'kid');
    const channel1Id = requestChannelsCreateV3(user1.token, 'channel1', true).channelId;
    const channel2Id = requestChannelsCreateV3(user1.token, 'channel2', true).channelId;
    requestChannelJoinV2(user2.token, channel1Id);
    requestChannelJoinV2(user3.token, channel2Id);
    requestMessageSendV2(user1.token, channel1Id, 'hello this is the first message').messageId;
    requestMessageSendV2(user2.token, channel1Id, 'hello this is the second message').messageId;
    const message3Id = requestMessageSendV2(user3.token, channel2Id, 'this is the first message of channel2').messageId;
    
    // expect(requestMessageRemoved(user2.token, message3Id)).toThrow('invalid messageId')
    let messageRemoveResults = messageRemoved(user2.token, message3Id);
    expect(messageRemoveResults.statusCode).toBe(BAD_REQUEST);
  });
  test('error: the user does not have permission to remove the message', () => {
    requestClearV1();
    const user1 = requestAuthRegisterV3('longpaus@gmail.com', 'password', 'long', 'pham');
    const user2 = requestAuthRegisterV3('wonderkid@gmail.com', 'shshhs', 'wonder', 'kid');
    const channel1Id = requestChannelsCreateV3(user1.token, 'channel1', true).channelId;
    requestChannelJoinV2(user2.token, channel1Id);
    const message1Id = requestMessageSendV2(user1.token, channel1Id, 'hello this is the first message').messageId;
    const message2Id = requestMessageSendV2(user2.token, channel1Id, 'hello this is the second message').messageId;
    // expect(requestMessageRemoved(user2.token, message1Id)).toThrow('user have no permmission')
    let messageRemoveResults = messageRemoved(user2.token, message1Id);
    expect(messageRemoveResults.statusCode).toBe(FORBIDDEN);
  });
});

describe('test for message/senddm/v2', () => {
  test('successful output', () => {
    requestClearV1();
    const user1 = requestAuthRegisterV3('longpaus@gmail.com', 'password', 'long', 'pham');
    const user2 = requestAuthRegisterV3('wonderkid@gmail.com', 'shshhs', 'wonder', 'kid');
    const user3 = requestAuthRegisterV3('dpitts@yahoo.com', 'shshhs', 'wonder', 'kid');
    const dm1Id = requestDmCreateV1(user1.token, [user2.authUserId, user3.authUserId]).dmId
    const message1Id = requestMessageSenddmV2(user2.token, dm1Id, 'hello guys').messageId
    const message2Id = requestMessageSenddmV2(user3.token, dm1Id, 'fgfgggfgf').messageId
    const Dm1Messages = requestDmMessagesV2(user1.token, dm1Id, 0).messages
    expect(Dm1Messages[0].messageId).toBe(message2Id);
    expect(Dm1Messages[0].uId).toBe(user3.authUserId);
    expect(Dm1Messages[0].message).toBe('fgfgggfgf');
    
    expect(Dm1Messages[1].messageId).toBe(message1Id);
    expect(Dm1Messages[1].uId).toBe(user2.authUserId);
    expect(Dm1Messages[1].message).toBe('hello guys');
  });
  test('error: empty message', () => {
    requestClearV1();
    const user1 = requestAuthRegisterV3('longpaus@gmail.com', 'password', 'long', 'pham');
    const user2 = requestAuthRegisterV3('wonderkid@gmail.com', 'shshhs', 'wonder', 'kid');
    const user3 = requestAuthRegisterV3('dpitts@yahoo.com', 'shshhs', 'wonder', 'kid');
    const dm1Id = requestDmCreateV1(user1.token, [user2.authUserId, user3.authUserId]).dmId
    // expect(requestMessageSenddmV2(user2.token, dm1Id, '')).toThrow('invalid message length');

    let messageSenddmResult = messageSenddmV2(user2.token, dm1Id, '');
    expect(messageSenddmResult.statusCode).toBe(BAD_REQUEST);
  
  });
  test('error: dmId does not exist', () => {
    requestClearV1();
    const user1 = requestAuthRegisterV3('longpaus@gmail.com', 'password', 'long', 'pham');
    const user2 = requestAuthRegisterV3('wonderkid@gmail.com', 'shshhs', 'wonder', 'kid');
    const user3 = requestAuthRegisterV3('dpitts@yahoo.com', 'shshhs', 'wonder', 'kid');
    requestDmCreateV1(user1.token, [user2.authUserId, user3.authUserId]);
    // expect(requestMessageSenddmV2(user2.token, 3, 'fesvds')).toThrow('invalid userId')

    let messageSenddmResult = messageSenddmV2(user2.token, 3, 'fesvds');
    expect(messageSenddmResult.statusCode).toBe(BAD_REQUEST);
  });
  test('error: authorised user is not part of the dm', () => {
    requestClearV1();
    const user1 = requestAuthRegisterV3('longpaus@gmail.com', 'password', 'long', 'pham');
    const user2 = requestAuthRegisterV3('wonderkid@gmail.com', 'shshhs', 'wonder', 'kid');
    const user3 = requestAuthRegisterV3('dpitts@yahoo.com', 'shshhs', 'wonder', 'kid');
    const user4 = requestAuthRegisterV3('mwilson@yahoo.ca', 'shshhs', 'wonder', 'kid');
    const dm1Id = requestDmCreateV1(user1.token, [user2.authUserId, user3.authUserId]).dmId
    // expect(requestMessageSenddmV2(user4.token, dm1Id, 'fdfbbf')).toThrow('invalid userId');

    let messageSenddmResult = messageSenddmV2(user4.token, dm1Id, 'fdfbbf');
    expect(messageSenddmResult.statusCode).toBe(FORBIDDEN);
  });
});

describe('tests for message/sendlater/v1', () => {
  test('successful output', () => {
    requestClearV1();
    const user1 = requestAuthRegisterV3('longpaus@gmail.com', 'password', 'long', 'pham');
    const user2 = requestAuthRegisterV3('wonderkid@gmail.com', 'shshhs', 'wonder', 'kid');
    const channel1Id = requestChannelsCreateV3(user1.token, 'channel1', true).channelId;
    requestChannelJoinV2(user2.token, channel1Id);
    const message1Id = requestMessageSendV2(user1.token, channel1Id, 'hello this is the first message').messageId;
    const sentTime = Math.floor(Date.now() / 1000) + 2
    const messageId2 = requestMessageSendLaterV1(user1.token,channel1Id,'sent later message', sentTime).messageId
    const waitTill = new Date(new Date().getTime() + 3000); 
    while ( waitTill> new Date());
    const channel1Messages = requestChannelMessagesV3(user1.token, channel1Id, 0).messages
    expect(channel1Messages[0].message).toBe('sent later message');
    expect(channel1Messages[0].messageId).toBe(messageId2);
    expect(channel1Messages[0].uId).toBe(user1.authUserId);
    expect(channel1Messages[0].timeSent).toBe(sentTime);

    expect(channel1Messages[1].messageId).toBe(message1Id);
    expect(channel1Messages[1].uId).toBe(user1.authUserId);
    expect(channel1Messages[1].message).toBe('hello this is the first message');
    
  });
  test('error time sent is a time in the past', () => {
    requestClearV1()
    const user1 = requestAuthRegisterV3('longpaus@gmail.com', 'password', 'long', 'pham');
    const user2 = requestAuthRegisterV3('wonderkid@gmail.com', 'shshhs', 'wonder', 'kid');
    const channel1Id = requestChannelsCreateV3(user1.token, 'channel1', true).channelId;
    requestChannelJoinV2(user2.token, channel1Id);
    const message1Id = requestMessageSendV2(user1.token, channel1Id, 'hello this is the first message').messageId;
    const sentTime = Math.floor(Date.now() / 1000) - 10
    let messageSendLaterResult = messageSendLaterV1(user1.token,channel1Id,'djdjjd',sentTime)
    expect(messageSendLaterResult.statusCode).toBe(BAD_REQUEST)
  });
  test('error message length is invalid', () => {
    requestClearV1()
    const user1 = requestAuthRegisterV3('longpaus@gmail.com', 'password', 'long', 'pham');
    const user2 = requestAuthRegisterV3('wonderkid@gmail.com', 'shshhs', 'wonder', 'kid');
    const channel1Id = requestChannelsCreateV3(user1.token, 'channel1', true).channelId;
    requestChannelJoinV2(user2.token, channel1Id);
    const message1Id = requestMessageSendV2(user1.token, channel1Id, 'hello this is the first message').messageId;
    const sentTime = Math.floor(Date.now() / 1000) + 10
    let messageSendLaterResult = messageSendLaterV1(user1.token,channel1Id,'',sentTime)
    expect(messageSendLaterResult.statusCode).toBe(BAD_REQUEST)
  });
  test('error channelId is not valid', () => {
    requestClearV1()
    const user1 = requestAuthRegisterV3('longpaus@gmail.com', 'password', 'long', 'pham');
    const user2 = requestAuthRegisterV3('wonderkid@gmail.com', 'shshhs', 'wonder', 'kid');
    const channel1Id = requestChannelsCreateV3(user1.token, 'channel1', true).channelId;
    requestChannelJoinV2(user2.token, channel1Id);
    const message1Id = requestMessageSendV2(user1.token, channel1Id, 'hello this is the first message').messageId;
    const sentTime = Math.floor(Date.now() / 1000) + 10
    let messageSendLaterResult = messageSendLaterV1(user1.token,10,'dsds',sentTime)
    expect(messageSendLaterResult.statusCode).toBe(BAD_REQUEST)
  });
  test('error user is not valid', () => {
    requestClearV1()
    const user1 = requestAuthRegisterV3('longpaus@gmail.com', 'password', 'long', 'pham');
    const user2 = requestAuthRegisterV3('wonderkid@gmail.com', 'shshhs', 'wonder', 'kid');
    const channel1Id = requestChannelsCreateV3(user1.token, 'channel1', true).channelId;
    requestChannelJoinV2(user2.token, channel1Id);
    const message1Id = requestMessageSendV2(user1.token, channel1Id, 'hello this is the first message').messageId;
    const sentTime = Math.floor(Date.now() / 1000) + 10
    let messageSendLaterResult = messageSendLaterV1('shcdhbs',channel1Id,'shsh',sentTime)
    expect(messageSendLaterResult.statusCode).toBe(FORBIDDEN)
  });
  test('user has left the channel before message is send', () => {
    requestClearV1();
    const user1 = requestAuthRegisterV3('longpaus@gmail.com', 'password', 'long', 'pham');
    const user2 = requestAuthRegisterV3('wonderkid@gmail.com', 'shshhs', 'wonder', 'kid');
    const channel1Id = requestChannelsCreateV3(user1.token, 'channel1', true).channelId;
    requestChannelJoinV2(user2.token, channel1Id);
    const message1Id = requestMessageSendV2(user1.token, channel1Id, 'hello this is the first message').messageId;
    const sentTime = Math.floor(Date.now() / 1000) + 2
    const messageId2 = requestMessageSendLaterV1(user1.token,channel1Id,'sent later message', sentTime).messageId
    requestChannelLeaveV1(user1.token,channel1Id)
    const waitTill = new Date(new Date().getTime() + 3000); 
    while ( waitTill> new Date());
    const channel1Messages = requestChannelMessagesV3(user2.token, channel1Id, 0).messages
  
    expect(channel1Messages[0].messageId).toBe(message1Id);
    expect(channel1Messages[0].uId).toBe(user1.authUserId);
    expect(channel1Messages[0].message).toBe('hello this is the first message');
  });

});

describe('test for message/sendlaterdm/v1', () => {
  test('successful output', () => {
    requestClearV1();
    const user1 = requestAuthRegisterV3('longpaus@gmail.com', 'password', 'long', 'pham');
    const user2 = requestAuthRegisterV3('wonderkid@gmail.com', 'shshhs', 'wonder', 'kid');
    const user3 = requestAuthRegisterV3('dpitts@yahoo.com', 'shshhs', 'wonder', 'kid');
    const dm1Id = requestDmCreateV1(user1.token, [user2.authUserId, user3.authUserId]).dmId
    const message1Id = requestMessageSenddmV2(user2.token, dm1Id, 'hello guys').messageId
    const sentTime = Math.floor(Date.now() / 1000) + 1
    const messages2Id = requestMessageSendDmLaterV1(user1.token,dm1Id,'shcdhcsd',sentTime).messageId
    const waitTill = new Date(new Date().getTime() + 2000); 
    while ( waitTill> new Date());
    const Dm1Messages = requestDmMessagesV2(user1.token, dm1Id, 0).messages
    expect(Dm1Messages[0].message).toBe('shcdhcsd');
    expect(Dm1Messages[0].messageId).toBe(messages2Id);
    expect(Dm1Messages[0].uId).toBe(user1.authUserId);
    expect(Dm1Messages[0].timeSent).toBe(sentTime);

    expect(Dm1Messages[1].messageId).toBe(message1Id);
    expect(Dm1Messages[1].uId).toBe(user2.authUserId);
    expect(Dm1Messages[1].message).toBe('hello guys');
  });
  test('error invalid timesent', () => {
    requestClearV1()
    const user1 = requestAuthRegisterV3('longpaus@gmail.com', 'password', 'long', 'pham');
    const user2 = requestAuthRegisterV3('wonderkid@gmail.com', 'shshhs', 'wonder', 'kid');
    const user3 = requestAuthRegisterV3('dpitts@yahoo.com', 'shshhs', 'wonder', 'kid');
    const dm1Id = requestDmCreateV1(user1.token, [user2.authUserId, user3.authUserId]).dmId
    const message1Id = requestMessageSenddmV2(user2.token, dm1Id, 'hello guys').messageId
    const sentTime = Math.floor(Date.now() / 1000) - 1
    let messageSenddmLaterResult = messageSendDmLaterV1(user1.token,dm1Id,'shcdhcsd',sentTime)
    expect(messageSenddmLaterResult.statusCode).toBe(BAD_REQUEST)
  });
  test('error invalid message length', () =>{
    requestClearV1()
    const user1 = requestAuthRegisterV3('longpaus@gmail.com', 'password', 'long', 'pham');
    const user2 = requestAuthRegisterV3('wonderkid@gmail.com', 'shshhs', 'wonder', 'kid');
    const user3 = requestAuthRegisterV3('dpitts@yahoo.com', 'shshhs', 'wonder', 'kid');
    const dm1Id = requestDmCreateV1(user1.token, [user2.authUserId, user3.authUserId]).dmId
    const message1Id = requestMessageSenddmV2(user2.token, dm1Id, 'hello guys').messageId
    const sentTime = Math.floor(Date.now() / 1000) + 1
    let messageSenddmLaterResult = messageSendDmLaterV1(user1.token,dm1Id,'',sentTime)
    expect(messageSenddmLaterResult.statusCode).toBe(BAD_REQUEST)
  });
  test('error invalid dmId', () => {
    requestClearV1()
    const user1 = requestAuthRegisterV3('longpaus@gmail.com', 'password', 'long', 'pham');
    const user2 = requestAuthRegisterV3('wonderkid@gmail.com', 'shshhs', 'wonder', 'kid');
    const user3 = requestAuthRegisterV3('dpitts@yahoo.com', 'shshhs', 'wonder', 'kid');
    const dm1Id = requestDmCreateV1(user1.token, [user2.authUserId, user3.authUserId]).dmId
    const message1Id = requestMessageSenddmV2(user2.token, dm1Id, 'hello guys').messageId
    const sentTime = Math.floor(Date.now() / 1000) + 1
    let messageSenddmLaterResult = messageSendDmLaterV1(user1.token,90,'dccddc',sentTime)
    expect(messageSenddmLaterResult.statusCode).toBe(BAD_REQUEST)
  });
  test('error invalid userId', () => {
    requestClearV1()
    const user1 = requestAuthRegisterV3('longpaus@gmail.com', 'password', 'long', 'pham');
    const user2 = requestAuthRegisterV3('wonderkid@gmail.com', 'shshhs', 'wonder', 'kid');
    const user3 = requestAuthRegisterV3('dpitts@yahoo.com', 'shshhs', 'wonder', 'kid');
    const dm1Id = requestDmCreateV1(user1.token, [user2.authUserId, user3.authUserId]).dmId
    const message1Id = requestMessageSenddmV2(user2.token, dm1Id, 'hello guys').messageId
    const sentTime = Math.floor(Date.now() / 1000) + 1
    let messageSenddmLaterResult = messageSendDmLaterV1('chcdj',dm1Id,'dccddc',sentTime)
    expect(messageSenddmLaterResult.statusCode).toBe(FORBIDDEN)
  });
  test('user has left the dm before message is sent', () => {
    requestClearV1();
    const user1 = requestAuthRegisterV3('longpaus@gmail.com', 'password', 'long', 'pham');
    const user2 = requestAuthRegisterV3('wonderkid@gmail.com', 'shshhs', 'wonder', 'kid');
    const user3 = requestAuthRegisterV3('dpitts@yahoo.com', 'shshhs', 'wonder', 'kid');
    const dm1Id = requestDmCreateV1(user1.token, [user2.authUserId, user3.authUserId]).dmId
    const message1Id = requestMessageSenddmV2(user2.token, dm1Id, 'hello guys').messageId
    const sentTime = Math.floor(Date.now() / 1000) + 1
    const messages2Id = requestMessageSendDmLaterV1(user1.token,dm1Id,'shcdhcsd',sentTime).messageId
    requestDmLeaveV2(user1.token,dm1Id)
    const waitTill = new Date(new Date().getTime() + 2000); 
    while ( waitTill> new Date());
    const Dm1Messages = requestDmMessagesV2(user2.token, dm1Id, 0).messages

    expect(Dm1Messages[0].messageId).toBe(message1Id);
    expect(Dm1Messages[0].uId).toBe(user2.authUserId);
    expect(Dm1Messages[0].message).toBe('hello guys');
  });
  
});

describe('test for message/share/v1', () => {
  test('successful output: share message from channel to another channel', () => {
    requestClearV1();
    const user1 = requestAuthRegisterV3('longpaus@gmail.com', 'password', 'long', 'pham');
    const user2 = requestAuthRegisterV3('wonderkid@gmail.com', 'shshhs', 'wonder', 'kid');
    const user3 = requestAuthRegisterV3('dpitts@yahoo.com', 'shshhs', 'wonder', 'kid');
    const channel1Id = requestChannelsCreateV3(user1.token, 'channel1', true).channelId;
    const channel2Id = requestChannelsCreateV3(user1.token, 'channel2', true).channelId;
    requestChannelJoinV2(user2.token, channel1Id);
    requestChannelJoinV2(user3.token, channel2Id);
    const message1Id = requestMessageSendV2(user1.token, channel1Id, 'hello this is the first message').messageId;
    const message2Id = requestMessageSendV2(user3.token, channel2Id, 'hhhshshshsh').messageId;
    const sharedMessageId = requestMessageShareV1(user1.token,message2Id,'optional message',channel1Id,-1).sharedMessageId

    const channel1Messages = requestChannelMessagesV3(user1.token, channel1Id, 0).messages
    expect(channel1Messages[0].message).toBe('hhhshshshshoptional message');
    expect(channel1Messages[0].messageId).toBe(sharedMessageId);
    expect(channel1Messages[0].uId).toBe(user1.authUserId);

    expect(channel1Messages[1].messageId).toBe(message1Id);
    expect(channel1Messages[1].uId).toBe(user1.authUserId);
    expect(channel1Messages[1].message).toBe('hello this is the first message');
  });
  test('successful output sharing a message from dm to channel', () => {
    requestClearV1();
    const user1 = requestAuthRegisterV3('longpaus@gmail.com', 'password', 'long', 'pham');
    const user2 = requestAuthRegisterV3('wonderkid@gmail.com', 'shshhs', 'wonder', 'kid');
    const user3 = requestAuthRegisterV3('dpitts@yahoo.com', 'shshhs', 'wonder', 'kid');
    const channel1Id = requestChannelsCreateV3(user1.token, 'channel1', true).channelId;
    requestChannelJoinV2(user2.token, channel1Id);
    const dm1Id = requestDmCreateV1(user1.token, [user2.authUserId, user3.authUserId]).dmId
    const message1Id = requestMessageSenddmV2(user1.token,dm1Id,'dm message').messageId
    const message2Id = requestMessageShareV1(user2.token,message1Id,'',channel1Id,-1).sharedMessageId

    const channel1Messages = requestChannelMessagesV3(user1.token, channel1Id, 0).messages
    expect(channel1Messages[0].messageId).toBe(message2Id);
    expect(channel1Messages[0].uId).toBe(user2.authUserId);
    expect(channel1Messages[0].message).toBe('dm message');
  });
  test('successful output sharing message from channel to dm', () => {
    requestClearV1();
    const user1 = requestAuthRegisterV3('longpaus@gmail.com', 'password', 'long', 'pham');
    const user2 = requestAuthRegisterV3('wonderkid@gmail.com', 'shshhs', 'wonder', 'kid');
    const user3 = requestAuthRegisterV3('dpitts@yahoo.com', 'shshhs', 'wonder', 'kid');
    const channel1Id = requestChannelsCreateV3(user1.token, 'channel1', true).channelId;
    requestChannelJoinV2(user2.token, channel1Id);
    const dm1Id = requestDmCreateV1(user1.token, [user2.authUserId, user3.authUserId]).dmId
    const message1Id = requestMessageSendV2(user2.token,channel1Id,'shshhshs').messageId
    const message2Id = requestMessageShareV1(user1.token,message1Id,'shshshs',-1,dm1Id).sharedMessageId
    const Dm1Messages = requestDmMessagesV2(user2.token, dm1Id, 0).messages

    expect(Dm1Messages[0].messageId).toBe(message2Id);
    expect(Dm1Messages[0].uId).toBe(user1.authUserId);
    expect(Dm1Messages[0].message).toBe('shshhshsshshshs');
  });
  test('successful output sharing a dm message into a dm', () => {
    requestClearV1();
    const user1 = requestAuthRegisterV3('longpaus@gmail.com', 'password', 'long', 'pham');
    const user2 = requestAuthRegisterV3('wonderkid@gmail.com', 'shshhs', 'wonder', 'kid');
    const user3 = requestAuthRegisterV3('dpitts@yahoo.com', 'shshhs', 'wonder', 'kid');
    const dm1Id = requestDmCreateV1(user1.token, [user2.authUserId]).dmId
    const dm2Id = requestDmCreateV1(user2.token, [user3.authUserId]).dmId
    const message1Id = requestMessageSenddmV2(user3.token,dm2Id,'hello').messageId
    const message2Id = requestMessageShareV1(user2.token,message1Id,'',-1,dm1Id).sharedMessageId

    const Dm1Messages = requestDmMessagesV2(user2.token, dm1Id, 0).messages

    expect(Dm1Messages[0].messageId).toBe(message2Id);
    expect(Dm1Messages[0].uId).toBe(user2.authUserId);
    expect(Dm1Messages[0].message).toBe('hello');
  });
  test('error channelId or dmId is invalid', () => {
    requestClearV1();
    const user1 = requestAuthRegisterV3('longpaus@gmail.com', 'password', 'long', 'pham');
    const user2 = requestAuthRegisterV3('wonderkid@gmail.com', 'shshhs', 'wonder', 'kid');
    const user3 = requestAuthRegisterV3('dpitts@yahoo.com', 'shshhs', 'wonder', 'kid');
    const channel1Id = requestChannelsCreateV3(user1.token, 'channel1', true).channelId;
    requestChannelJoinV2(user2.token, channel1Id);
    const dm1Id = requestDmCreateV1(user1.token, [user2.authUserId, user3.authUserId]).dmId
    const message1Id = requestMessageSenddmV2(user3.token,dm1Id,'hello').messageId

    let messageShareV1Result = messageShareV1(user1.token,message1Id,'',-1,7777)
    expect(messageShareV1Result.statusCode).toBe(BAD_REQUEST)

    messageShareV1Result = messageShareV1(user1.token,message1Id,'',3,-1)
    expect(messageShareV1Result.statusCode).toBe(BAD_REQUEST)

    messageShareV1Result = messageShareV1(user1.token,message1Id,'',-1,-1)
    expect(messageShareV1Result.statusCode).toBe(BAD_REQUEST)

    messageShareV1Result = messageShareV1(user1.token,message1Id,'',channel1Id,dm1Id)
    expect(messageShareV1Result.statusCode).toBe(BAD_REQUEST)
  });
  test('error user is not in the channel or dm of ogMessageId', () => {
    requestClearV1();
    const user1 = requestAuthRegisterV3('longpaus@gmail.com', 'password', 'long', 'pham');
    const user2 = requestAuthRegisterV3('wonderkid@gmail.com', 'shshhs', 'wonder', 'kid');
    const user3 = requestAuthRegisterV3('dpitts@yahoo.com', 'shshhs', 'wonder', 'kid');
    const channel1Id = requestChannelsCreateV3(user1.token, 'channel1', true).channelId;
    requestChannelJoinV2(user2.token, channel1Id);
    const dm1Id = requestDmCreateV1(user1.token, [user2.authUserId]).dmId
    const message1Id = requestMessageSenddmV2(user1.token,dm1Id,'hello').messageId

    let messageShareV1Result = messageShareV1(user3.token,message1Id,'',-1,channel1Id)
    expect(messageShareV1Result.statusCode).toBe(BAD_REQUEST)
  });
  test('error user is not in the channel or dm they are trying to share to', () => {
    requestClearV1();
    const user1 = requestAuthRegisterV3('longpaus@gmail.com', 'password', 'long', 'pham');
    const user2 = requestAuthRegisterV3('wonderkid@gmail.com', 'shshhs', 'wonder', 'kid');
    const user3 = requestAuthRegisterV3('dpitts@yahoo.com', 'shshhs', 'wonder', 'kid');
    const channel1Id = requestChannelsCreateV3(user1.token, 'channel1', true).channelId;
    requestChannelJoinV2(user2.token, channel1Id);
    const dm1Id = requestDmCreateV1(user1.token, [user3.authUserId]).dmId
    const message1Id = requestMessageSenddmV2(user1.token,dm1Id,'hello').messageId

    let messageShareV1Result = messageShareV1(user3.token,message1Id,'',channel1Id,-1)
    expect(messageShareV1Result.statusCode).toBe(FORBIDDEN)
  });
});





