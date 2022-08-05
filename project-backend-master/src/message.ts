
import { getData, setData, message, sentLaterMessage, sentLaterDm } from './dataStore';
import {
  createNewMessageId, IsUserAnOwner,
  isChannelIdValid, checkUserInChannel, isDmIdValid, getDmIndex, checkToken,
  checkChannelId,
  checkMessage,channelDmIdThatMessageIn,
  updateUserStatsMessages,notificationReact,whoSendMessageId,
  updateWorkspaceStatsMessages,checkUserId,doesMessageIdExist,didUserSendMessageId,isUserInMessageIdChannel, checkDmId, returnMessageInfo,notificationTagged
} from './helpers';
import HTTPError from 'http-errors';

const MAX_STR_LEN = 1000;
const MIN_STR_LEN = 1;

const messageSendV2 = (token: string, channelId: number, message: string) => {
  const userId = checkToken(token);
  const data = getData();
  if (checkUserId(userId) === -1) {
    throw HTTPError(403, 'userId not in channel');
  }
  const check = checkUserInChannel(userId, channelId);
  if (!check) {
    throw HTTPError(400, 'invalid channelId');
  }
  if (!check.inChannel) {
    throw HTTPError(403, 'userId not in channel');
  }
  if (message.length < MIN_STR_LEN || message.length > MAX_STR_LEN) {
    throw HTTPError(400, 'invalid message length');
  }
  const channelIndex = checkChannelId(channelId);
  const newMessage: message = {
    messageId: createNewMessageId(data),
    uId: userId,
    message: message,
    timeSent: Math.floor(Date.now() / 1000),
    react: {
      reactId: 1,
      uIds: []
    },
    isPin: false
  };
  data.channels[channelIndex].messages.push(newMessage);
  setData(data);
  updateUserStatsMessages(userId, 1);
  updateWorkspaceStatsMessages(1);
  notificationTagged(message,userId,channelId,-1)
  return { messageId: newMessage.messageId };
};

const messageRemoveV2 = (token: string, messageId: number) => {
  let userId: number;
  if (checkToken(token) !== -1) {
    userId = checkToken(token);
  } else {
    throw HTTPError(400, 'invalid userId');
  }
  const type: string = checkMessage(messageId) ? 'channels' : 'dms';
  const data = getData();
  if (!doesMessageIdExist(messageId)) {
    throw HTTPError(400, 'invalid messageId');
  }
  if (!didUserSendMessageId(userId, messageId)) {
    if (!isUserInMessageIdChannel(messageId, userId)) {
      throw HTTPError(400, 'invalid messageId');
    } else if (!IsUserAnOwner(userId, messageId)) {
      throw HTTPError(403, 'user have no permmission');
    }
  }
  let messageIndex = 0;
  let channelIndex = 0;
  for (const channel of data[type]) {
    for (const messages of channel.messages) {
      if (messages.messageId === messageId) {
        channelIndex = data[type].indexOf(channel);
        messageIndex = data[type][channelIndex].messages.indexOf(messages);
      }
    }
  }
  data[type][channelIndex].messages.splice(messageIndex, 1);
  setData(data);
  updateWorkspaceStatsMessages(-1);
  return {};
};

const messageEditV2 = (token: string, messageId: number, message: string) => {
  if (message.length > MAX_STR_LEN) {
    throw HTTPError(400, 'invalid message length');
  }
  let userId: number;
  if (checkToken(token) !== -1) {
    userId = checkToken(token);
  } else {
    throw HTTPError(400, 'invalid userId');
  }
  const type: string = checkMessage(messageId) ? 'channels' : 'dms';
  const data = getData();
  if (!doesMessageIdExist(messageId)) {
    throw HTTPError(400, 'invalid messageId');
  }
  if (!didUserSendMessageId(userId, messageId)) {
    if (!isUserInMessageIdChannel(messageId, userId)) {
      throw HTTPError(400, 'invalid messageId');
    } else if (!IsUserAnOwner(userId, messageId)) {
      throw HTTPError(403, 'user have no permmission');
    }
  }

  if (message.length !== 0) {
    for (const channel of data[type]) {
      for (const messages of channel.messages) {
        if (messages.messageId === messageId) {
          messages.message = message;
        }
      }
    }
  } else if (message.length === 0) {
    messageRemoveV2(token, messageId);
  }
  const channelDmId = channelDmIdThatMessageIn(messageId)
  notificationTagged(message,userId,(type === 'dms')?-1:channelDmId,(type === 'dms')?channelDmId:-1)
  setData(data);
  return {};
};

const messageSendDmV2 = (token: string, dmId: number, message: string) => {
  const data = getData();
  if (message.length > MAX_STR_LEN || message.length < MIN_STR_LEN) {
    throw HTTPError(400, 'invalid message length');
  }
  if (!isDmIdValid(dmId)) {
    throw HTTPError(400, 'invalid dmId');
  }
  const userId = checkToken(token);
  const dmIndex = getDmIndex(dmId);
  if (!data.dms[dmIndex].userIds.includes(userId)) {
    throw HTTPError(403, 'invalid userId');
  }
  const newMessage: message = {
    messageId: createNewMessageId(data),
    message: message,
    uId: userId,
    timeSent: Math.floor(Date.now() / 1000),
    react: {
      reactId: 1,
      uIds: []
    },
    isPin: false
  };
  data.dms[dmIndex].messages.push(newMessage);
  setData(data);
  updateUserStatsMessages(userId, 1);
  updateWorkspaceStatsMessages(1);
  notificationTagged(message,userId,-1,dmId)
  return { messageId: newMessage.messageId };
};
const messageSendLaterV1 = (token:string, channelId: number, message:string, timeSent:number) => {
  const data = getData();
  const userId = checkToken(token);
  if (message.length > MAX_STR_LEN || message.length < MIN_STR_LEN) {
    throw HTTPError(400, 'invalid message length');
  }
  if (!isChannelIdValid(channelId)) {
    throw HTTPError(400, 'invalid channelId');
  }
  if (timeSent < Math.floor(Date.now() / 1000)) {
    throw HTTPError(400, 'invlid timesent');
  }
  if (!data.channels[checkChannelId(channelId)].userIds.includes(userId)) {
    throw HTTPError(403, 'invalid userId');
  }
  const newMessage:sentLaterMessage = {
    channelId,
    message,
    timeSent,
    messageId: createNewMessageId(data),
    uId: userId
  };
  data.sentLaterMessages.push(newMessage);
  setData(data);
  return { messageId: newMessage.messageId };
};

const messageSentLaterDmV1 = (token:string, dmId:number, message:string, timeSent:number) => {
  const data = getData();
  const userId = checkToken(token);
  if (message.length > MAX_STR_LEN || message.length < MIN_STR_LEN) {
    throw HTTPError(400, 'invalid message length');
  }
  if (!isDmIdValid(dmId)) {
    throw HTTPError(400, 'invalid dmId');
  }
  if (timeSent < Math.floor(Date.now() / 1000)) {
    throw HTTPError(400, 'invlid timesent');
  }
  if (!data.dms[checkDmId(dmId)].userIds.includes(userId)) {
    throw HTTPError(403, 'invalid userId');
  }
  const newMessage:sentLaterDm = {
    dmId,
    message,
    timeSent,
    messageId:createNewMessageId(data),
    uId:userId
  }
  data.sentLaterDms.push(newMessage)
  setData(data)
  return {messageId:newMessage.messageId}
}

const messageShareV1 = (token:string,ogMessageId:number,message:string,channelId:number,dmId:number) => {
  const userId = checkToken(token);
  const data = getData();
  if ((channelId !== -1 && dmId !== -1) || (channelId === -1 && dmId === -1)) {
    throw HTTPError(400, 'invalid channelId or dmId');
  }
  if (message.length > 1000) {
    throw HTTPError(400, 'invalid message length');
  }
  if (!isUserInMessageIdChannel(ogMessageId, userId)) {
    throw HTTPError(400, 'invalid messageId');
  }
  const newMessage:message = {
    message: returnMessageInfo(ogMessageId).message + message,
    messageId: createNewMessageId(data),
    timeSent: Math.floor(Date.now() / 1000),
    uId: userId,
    react: {
      reactId: 1,
      uIds: []
    },
    isPin: false
  };
  if (channelId === -1) {
    const dmIndex = getDmIndex(dmId);
    if (dmIndex === -1) {
      throw HTTPError(400, 'invalid dmId');
    }
    if (!data.dms[dmIndex].userIds.includes(userId)) {
      throw HTTPError(403, 'user has not join the dm they are trying to send to');
    }
    data.dms[dmIndex].messages.push(newMessage);
  } else if (dmId === -1) {
    const channelIndex = checkChannelId(channelId);
    if (channelIndex === -1) {
      throw HTTPError(400, 'invalid channelId');
    }
    if (!data.channels[channelIndex].userIds.includes(userId)) {
      throw HTTPError(403, 'user has not join the channel that they are trying to send to');
    }
    data.channels[channelIndex].messages.push(newMessage);
  }
  setData(data);
  updateUserStatsMessages(userId, 1);
  updateWorkspaceStatsMessages(1);
  return ({ sharedMessageId: newMessage.messageId });
};

function messageReactV1(token: string, messageId: number, reactId: number) {
  const userId = checkToken(token);
  if (!doesMessageIdExist(messageId)) {
    throw HTTPError(400, 'Invalid messageId');
  }
  if (reactId !== 1) {
    throw HTTPError(400, 'Invalid reactId');
  }
  const type: string = checkMessage(messageId) ? 'channels' : 'dms';
  const data = getData();
  for (const channel of data[type]) {
    for (const message of channel.messages) {
      if (message.messageId === messageId) {
        if (message.react.uIds.includes(userId)) {
          throw HTTPError(400, 'already reacted');
        }
        message.react.uIds.push(userId);
      }
    }
  }
  const channelDmId = channelDmIdThatMessageIn(messageId)
  notificationReact(userId,(type === 'dms')?channelDmId:-1,(type === 'channels') ? channelDmId : -1,whoSendMessageId(messageId))
  setData(data);
  return {};
}

function messageUnreactV1(token: string, messageId: number, reactId: number) {
  const userId = checkToken(token);
  if (!doesMessageIdExist(messageId)) {
    throw HTTPError(400, 'Invalid messageId');
  }
  if (reactId !== 1) {
    throw HTTPError(400, 'Invalid reactId');
  }
  const type: string = checkMessage(messageId) ? 'channels' : 'dms';
  const data = getData();
  for (const channel of data[type]) {
    for (const message of channel.messages) {
      if (message.messageId === messageId) {
        if (!message.react.uIds.includes(userId)) {
          throw HTTPError(400, 'not reacted');
        }
        message.react.uIds.splice(message.react.uids.indexOf(userId), 1);
      }
    }
  }
  setData(data);
  return {};
}

const messagePinV1 = (token: string, messageId : number) => {
  let userId: number;
  if (checkToken(token) !== -1) {
    userId = checkToken(token);
  } else {
    throw HTTPError(400, 'invalid userId');
  }
  const type: string = checkMessage(messageId) ? 'channels' : 'dms';

  const data = getData();
  if (!doesMessageIdExist(messageId)) {
    throw HTTPError(400, 'invalid messageId1');
  }
  if (!didUserSendMessageId(userId, messageId)) {
    if (!isUserInMessageIdChannel(messageId, userId)) {
      throw HTTPError(400, 'invalid message');
    } else if (!IsUserAnOwner(userId, messageId)) {
      throw HTTPError(403, 'user have no permmission');
    }
  }
  for (const channel of data[type]) {
    for (const messages of channel.messages) {
      if (messages.messageId === messageId) {
        if (messages.isPin === false) {
          messages.isPin = true;
        } else if (messages.isPin === true) { throw HTTPError(400, 'message already pinned!'); }
      }
    }
  }

  setData(data);
  return {};
};
const messageUnPinV1 = (token: string, messageId: number) => {
  let userId: number;
  if (checkToken(token) !== -1) {
    userId = checkToken(token);
  } else {
    throw HTTPError(400, 'invalid userId');
  }
  const type: string = checkMessage(messageId) ? 'channels' : 'dms';

  const data = getData();
  if (!doesMessageIdExist(messageId)) {
    throw HTTPError(400, 'invalid messageId');
  }
  if (!didUserSendMessageId(userId, messageId)) {
    if (!isUserInMessageIdChannel(messageId, userId)) {
      throw HTTPError(400, 'invalid messageId');
    } else if (!IsUserAnOwner(userId, messageId)) {
      throw HTTPError(403, 'user have no permmission');
    }
  }
  for (const channel of data[type]) {
    for (const messages of channel.messages) {
      if (messages.messageId === messageId) {
        if (messages.isPin === true) {
          messages.isPin = false;
        } else if (messages.isPin === false) { throw HTTPError(400, 'message already unpinned!'); }
      }
    }
  }
  setData(data);
  return {};
};
export { messagePinV1, messageUnPinV1, messageUnreactV1, messageReactV1, messageSendV2, messageEditV2, messageRemoveV2, messageSendDmV2, messageSendLaterV1, messageSentLaterDmV1, messageShareV1 };
