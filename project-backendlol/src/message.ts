import { getData, setData, data, message } from './dataStore';
import {
  createNewMessageId, isMessageIdValid, IsUserAnOwner,
  isChannelIdValid, isDmIdValid, getDmIndex, checkToken,
  checkChannelId
} from './helpers';

const ERROR = { error: 'error' };
const MAX_STR_LEN = 1000;
const MIN_STR_LEN = 1;


const messageSendV1 = (token: string, channelId: number, message: string) => {
  let userId: number;
  if (checkToken(token) !== -1) {
    userId = checkToken(token);
  } else {
    return ERROR;
  }
  const data = getData();
  if (!isChannelIdValid(channelId)) {
    return ERROR;
  }
  if (message.length < MIN_STR_LEN || message.length > MAX_STR_LEN) {
    return ERROR;
  }
  const channelIndex = checkChannelId(channelId);
  const newMessage: message = {
    messageId: createNewMessageId(data),
    uId: userId,
    message: message,
    timeSent: Math.floor(Date.now() / 1000)
  };
  data.channels[channelIndex].messages.push(newMessage);
  setData(data);
  return { messageId: newMessage.messageId };
};

const messageRemoveV1 = (token: string, messageId: number) => {
  let userId: number;
  if (checkToken(token) !== -1) {
    userId = checkToken(token);
  } else {
    return ERROR;
  }
  const data = getData();
  if (!isMessageIdValid(data, userId, messageId)) {
    if (!IsUserAnOwner(data, userId, messageId)) {
      return ERROR;
    }
  }
  let messageIndex: number;
  let channelIndex: number;
  for (const channel of data.channels) {
    for (const messages of channel.messages) {
      if (messages.messageId === messageId) {
        channelIndex = data.channels.indexOf(channel);
        messageIndex = data.channels[channelIndex].messages.indexOf(messages);
      }
    }
  }
  data.channels[channelIndex].messages.splice(messageIndex, 1);
  setData(data);
  return {};
};
const messageEditV1 = (token: string, messageId: number, message: string) => {
  if (message.length > MAX_STR_LEN) {
    return ERROR;
  }
  let userId: number;
  if (checkToken(token) !== -1) {
    userId = checkToken(token);
  } else {
    return ERROR;
  }
  const data = getData();
  if (!isMessageIdValid(data, userId, messageId)) {
    if (!IsUserAnOwner(data, userId, messageId)) {
      return ERROR;
    }
  }
  if (message.length !== 0) {
    for (const channel of data.channels) {
      for (const messages of channel.messages) {
        if (messages.messageId === messageId) {
          if (messages.uId === userId) {
            messages.message = message;
          }
        }
      }
    }
  } else if (message.length === 0) {
    messageRemoveV1(token, messageId);
  }
  setData(data);
  return {};
};

const messageSendDmV1 = (token: string, dmId: number, message: string) => {
  const data = getData();
  if (message.length > MAX_STR_LEN || message.length < MIN_STR_LEN) {
    return ERROR;
  }
  if (!isDmIdValid(dmId)) {
    return ERROR;
  }
  const userId = checkToken(token);
  const dmIndex = getDmIndex(dmId);
  if (!data.dms[dmIndex].userIds.includes(userId)) {
    return ERROR;
  }
  const newMessage: message = {
    messageId: createNewMessageId(data),
    message: message,
    uId: userId,
    timeSent: Math.floor(Date.now() / 1000)
  };
  data.dms[dmIndex].messages.push(newMessage);
  setData(data);
  return { messageId: newMessage.messageId };
};


export { messageSendV1, messageEditV1, messageRemoveV1, messageSendDmV1 };

