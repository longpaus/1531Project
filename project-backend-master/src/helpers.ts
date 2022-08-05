import { data, getData, token, setData, userStatsChannels, userStatsDms, userStatsMessages, workspaceStatsChannels, workspaceStatsDms, workspaceStatsMessages, message,notification, channel } from './dataStore';
import { v4 as uuidv4 } from 'uuid';
import crypto from 'crypto';
import HTTPError from 'http-errors';

function checkUserId(uId: number) {
  const data: data = getData();
  const userIds: number[] = data.users.map(x => x.id);
  return userIds.indexOf(uId);
}

function checkChannelId(channelId: number) {
  const data: data = getData();
  const channelIds: number[] = data.channels.map(x => x.channelId);
  return channelIds.indexOf(channelId);
}

const checkDmId = (dmId: number) => {
  const data: data = getData();
  const dmIds: number[] = data.dms.map(x => x.dmId);
  return dmIds.indexOf(dmId);
};
/*
a helper function that takes in a userId and channelId and returns false if channel
or user don't exist. Else returns an object containing the position of the channel and
user in the dataStore and true or false depending on if the user is in the channel
*/
function checkUserInChannel(uId: number, channelId: number) {
  const data: data = getData();
  if (checkChannelId(channelId) === -1 || checkUserId(uId) === -1) {
    return false;
  }
  const ret = {
    channel: checkChannelId(channelId),
    user: checkUserId(uId),
    inChannel: data.channels[checkChannelId(channelId)].userIds.includes(uId)
  };
  return ret;
}

const getHashOf = (text: string) => {
  return crypto.createHash('sha256').update(text + 'wet rat').digest('hex');
};
/* given a users Id generates and stores a token,
then returns the token */
const generateToken = (email: string) => {
  const data: data = getData();
  const newToken = uuidv4();
  const token: token = {
    token: getHashOf(newToken),
    uId: getIdFromEmail(email)
  };
  data.tokens.push(token);
  setData(data);
  return {
    token: newToken,
    authUserId: token.uId
  };
};
/* checks if the token is a valid token and returns the associated
id if it is, else returns -1 */
const checkToken = (token: string) => {
  const data: data = getData();
  token = getHashOf(token);
  const tokens: string[] = data.tokens.map(x => x.token);
  if (tokens.includes(token)) {
    return data.tokens[tokens.indexOf(token)].uId;
  }
  return -1;
};
/* given a valid token, invalidates the token and returns true.
when given an invalid token returns false. */
const invalidateToken = (token: string) => {
  const data: data = getData();
  const tokens: string[] = data.tokens.map(x => x.token);
  if (!tokens.includes(token)) {
    throw HTTPError(403, 'Invalid Token');
  } else {
    const index = tokens.indexOf(token);
    data.tokens.splice(index, 1);
    setData(data);
    return true;
  }
};

const getIdFromEmail = (email: string) => {
  const data: data = getData();
  email = email.toLowerCase();
  const emails: string[] = data.users.map(x => x.email);
  return emails.includes(email) ? data.users[emails.indexOf(email)].id : -1;
};
// give a unique messageId that is not being used in the system
const createNewMessageId = (data: data) => {
  let messageIds: number[] = [];
  for (const channel of data.channels) {
    const channelmessagesId: number[] = channel.messages.map(item => item.messageId);
    messageIds = messageIds.concat(channelmessagesId);
  }
  for (const dm of data.dms) {
    const channelDmsId: number[] = dm.messages.map(item => item.messageId);
    messageIds = messageIds.concat(channelDmsId);
  }

  const sentLaterMessageId: number[] = data.sentLaterMessages.map(item => item.messageId);
  messageIds = messageIds.concat(sentLaterMessageId);

  const sentLaterDmId: number[] = data.sentLaterDms.map(item => item.dmId);
  messageIds = messageIds.concat(sentLaterDmId);

  if (messageIds.length === 0) {
    return 0;
  }
  return Math.max.apply(null, messageIds) + 1;
};

/*
isMessageIdValid
return true if the autherised user is the one who send the
message with the Id of messageId
return false if messageId does not exist or the user is not the
one who send the message
*/
const isMessageIdValid = (userId: number, messageId: number) => {
  const data: data = getData();
  if (checkMessage(messageId)) {
    for (const channel of data.channels) {
      for (const messages of channel.messages) {
        if (messages.messageId === messageId) {
          if (messages.uId === userId) {
            return true;
          }
        }
      }
    }
    return false;
  } else {
    for (const dm in data.dms) {
      for (const messages of data.dms[dm].messages) {
        if (messages.messageId === messageId) {
          if (messages.uId === userId) {
            return true;
          } else if (data.dms[dm].owner === userId) {
            return true;
          }
        }
      }
    }
    return false;
  }
};
/*
IsUserAnOwner
return true if the user is an owner of treats or
user is an owner in the channel of messageId
*/
const IsUserAnOwner = (userId: number, messageId: number) => {
  const data: data = getData();
  if (data.users[checkUserId(userId)].globalPermissions === 1) {
    return true;
  }
  if (checkMessage(messageId)) {
    for (const channel of data.channels) {
      for (const messages of channel.messages) {
        if (messages.messageId === messageId) {
          return channel.authUserId.includes(userId);
        }
      }
    }
  } else {
    for (const dm of data.dms) {
      for (const messages of dm.messages) {
        if (messages.messageId === messageId && messages.uId === dm.owner) {
          return true;
        }
      }
    }
  }
};

// returns true if messgeId exist else return false
const doesMessageIdExist = (messageId: number) => {
  const data = getData();
  let messageIds: number[] = [];
  for (const channel of data.channels) {
    const channelmessagesId: number[] = channel.messages.map(item => item.messageId);
    messageIds = messageIds.concat(channelmessagesId);
  }
  for (const dm of data.dms) {
    const channelDmsId: number[] = dm.messages.map(item => item.messageId);
    messageIds = messageIds.concat(channelDmsId);
  }

  return messageIds.includes(messageId);
};
const isChannelIdValid = (channelId: number) => {
  const data: data = getData();
  const channelIds: number[] = data.channels.map(item => item.channelId);
  return channelIds.includes(channelId);
};
const isDmIdValid = (dmId: number) => {
  const data: data = getData();
  const dmIds: number[] = data.dms.map(item => item.dmId);
  return dmIds.includes(dmId);
};

// returns -1 if dmId does not exist
const getDmIndex = (dmId: number) => {
  const data: data = getData();
  const dmIds: number[] = data.dms.map(item => item.dmId);
  return dmIds.indexOf(dmId);
};

// returns true if message in channel, false if message in dm
const checkMessage = (messageId: number) => {
  const data: data = getData();
  const dmMessages = data.dms.reduce((currDm, prevDm) => [...currDm, ...prevDm.messages.map(x => x.messageId)], []);
  return !dmMessages.includes(messageId);
};

const checkUserChannelOwner = (uId: number, channelId: number) => {
  const data: data = getData();
  return checkChannelId(channelId) !== -1 ? data.channels[checkChannelId(channelId)].authUserId.includes(uId) : false;
};

const removeResetCode = (code: string) => {
  const data: data = getData();
  const codes = data.resetCodes.map(x => x.code);
  if (codes.includes(code)) {
    data.resetCodes.splice(codes.indexOf(code), 1);
    setData(data);
  }
};

const totalMessages = () => {
  const data: data = getData();
  return data.users.map(x => x.stats.messagesSent[x.stats.messagesSent.length - 1].numMessagesSent).reduce((a, b) => a + b, 0);
};

const userInvolvement = (uId: number) => {
  const data: data = getData();
  const user = checkUserId(uId);
  const userNumber: number = data.users[user].stats.channelsJoined[data.users[user].stats.channelsJoined.length - 1].numChannelsJoined +
    data.users[user].stats.dmsJoined[data.users[user].stats.dmsJoined.length - 1].numDmsJoined +
    data.users[user].stats.messagesSent[data.users[user].stats.messagesSent.length - 1].numMessagesSent;
  const totalNumber = data.channels.length + data.dms.length + totalMessages();
  data.users[user].stats.involvementRate = totalNumber <= 0 ? 0 : userNumber / totalNumber > 1 ? 1 : userNumber / totalNumber;
  setData(data);
};

const updateUserStatsChannels = (uId: number, amount: number) => {
  const data = getData();
  const user = checkUserId(uId);
  const newChannelStats: userStatsChannels = {
    numChannelsJoined: data.users[user].stats.channelsJoined[data.users[user].stats.channelsJoined.length - 1].numChannelsJoined + amount,
    timeStamp: Math.floor(Date.now())
  };
  data.users[user].stats.channelsJoined.push(newChannelStats);
  setData(data);
  data.users.map(x => userInvolvement(x.id));
};

const updateUserStatsDms = (uId: number, amount: number) => {
  const data = getData();
  const user = checkUserId(uId);
  const newDmStats: userStatsDms = {
    numDmsJoined: data.users[user].stats.dmsJoined[data.users[user].stats.dmsJoined.length - 1].numDmsJoined + amount,
    timeStamp: Math.floor(Date.now())
  };
  data.users[user].stats.dmsJoined.push(newDmStats);
  setData(data);
  data.users.map(x => userInvolvement(x.id));
};

const updateUserStatsMessages = (uId: number, amount: number) => {
  const data = getData();
  const user = checkUserId(uId);
  const newMessageStats: userStatsMessages = {
    numMessagesSent: data.users[user].stats.messagesSent[data.users[user].stats.messagesSent.length - 1].numMessagesSent + amount,
    timeStamp: Math.floor(Date.now())
  };
  data.users[user].stats.messagesSent.push(newMessageStats);
  setData(data);
  data.users.map(x => userInvolvement(x.id));
};

const utilizationRate = () => {
  const data: data = getData();
  const uselessUsers = data.users.filter(x => x.stats.involvementRate > 0).length;
  data.workspaceStats.utilizationRate = uselessUsers / data.users.length;
  setData(data);
};

const updateWorkspaceStatsChannels = (amount: number) => {
  const data: data = getData();
  const newChannelStats: workspaceStatsChannels = {
    numChannelsExist: data.workspaceStats.channelsExist[data.workspaceStats.channelsExist.length - 1].numChannelsExist + amount,
    timeStamp: Math.floor(Date.now())
  };
  data.workspaceStats.channelsExist.push(newChannelStats);
  setData(data);
  utilizationRate();
};

const updateWorkspaceStatsDms = (amount: number) => {
  const data: data = getData();
  const newDmStats: workspaceStatsDms = {
    numDmsExist: data.workspaceStats.dmsExist[data.workspaceStats.dmsExist.length - 1].numDmsExist + amount,
    timeStamp: Math.floor(Date.now())
  };
  data.workspaceStats.dmsExist.push(newDmStats);
  setData(data);
  utilizationRate();
};

const updateWorkspaceStatsMessages = (amount: number) => {
  const data: data = getData();
  const newMessagestats: workspaceStatsMessages = {
    numMessagesExist: data.workspaceStats.messagesExist[data.workspaceStats.messagesExist.length - 1].numMessagesExist + amount,
    timeStamp: Math.floor(Date.now())
  };
  data.workspaceStats.messagesExist.push(newMessagestats);
  setData(data);
  utilizationRate();
};

const initializeWorkspaceStats = (timeStamp: number) => {
  const data: data = getData();
  data.workspaceStats = {
    channelsExist: [{ numChannelsExist: 0, timeStamp }],
    dmsExist: [{ numDmsExist: 0, timeStamp }],
    messagesExist: [{ numMessagesExist: 0, timeStamp }],
    utilizationRate: 0
  };
  setData(data);
};

/*
check in dm or channel to see if the messageId is in the same channel
or dm as the userId
*/
const isUserInMessageIdChannel = (messageId: number, userId: number) => {
  const data: data = getData();
  if (checkMessage(messageId)) {
    for (const channel of data.channels) {
      for (const messages of channel.messages) {
        if (messages.messageId === messageId) {
          return channel.userIds.includes(userId);
        }
      }
    }
  } else {
    for (const dm of data.dms) {
      for (const messages of dm.messages) {
        if (messages.messageId === messageId) {
          return dm.userIds.includes(userId);
        }
      }
    }
  }
  return false;
};

const didUserSendMessageId = (userId: number, messageId: number) => {
  const data: data = getData();
  if (checkMessage(messageId)) {
    for (const channel of data.channels) {
      for (const messages of channel.messages) {
        if (messages.messageId === messageId && messages.uId === userId) {
          return true;
        }
      }
    }
    return false;
  } else {
    for (const dm of data.dms) {
      for (const messages of dm.messages) {
        if (messages.messageId === messageId && messages.uId === userId) {
          return true;
        }
      }
    }
    return false;
  }
};
const sentLaterDms = () => {
  const data = getData();
  let index = 0;
  for (const message of data.sentLaterDms) {
    if (checkDmId(message.dmId) !== -1) {
      if (message.timeSent <= Math.floor(Date.now() / 1000) && data.dms[checkDmId(message.dmId)].userIds.includes(message.uId)) {
        data.dms[checkDmId(message.dmId)].messages.push(
          {
            messageId: message.messageId,
            uId: message.uId,
            message: message.message,
            timeSent: message.timeSent,
            react: {
              reactId: 1,
              uIds: []
            },
            isPin: false
          }
        );
        updateUserStatsMessages(message.uId, 1);
        updateWorkspaceStatsMessages(1);
        notificationTagged(message.message,message.uId,-1,message.dmId)
        data.sentLaterDms.splice(index, 1);
      }
    }
    index++;
  }
  setData(data);
};

const sentLaterMessages = () => {
  const data: data = getData();
  let index = 0;

  for (const message of data.sentLaterMessages) {
    if (isChannelIdValid(message.channelId)) {
      if (message.timeSent <= Math.floor(Date.now() / 1000) && data.channels[checkChannelId(message.channelId)].userIds.includes(message.uId)) {
        data.channels[checkChannelId(message.channelId)].messages.push(
          {
            messageId: message.messageId,
            uId: message.uId,
            message: message.message,
            timeSent: message.timeSent,
            react: {
              reactId: 1,
              uIds: []
            },
            isPin: false
          }
        );
        updateUserStatsMessages(message.uId, 1);
        updateWorkspaceStatsMessages(1);
        notificationTagged(message.message,message.uId,message.channelId,-1)
        data.sentLaterMessages.splice(index, 1);
      }
    }
    index++;
  }
  setData(data);
};

const returnMessageInfo = (messageId:number):message => {
  const data:data = getData();
  for (const channel of data.channels) {
    for (const message of channel.messages) {
      if (message.messageId === messageId) {
        return message;
      }
    }
  }
  for (const dm of data.dms) {
    for (const message of dm.messages) {
      if (message.messageId === messageId) {
        return message;
      }
    }
  }
}
const doesHandleExist = (handle:string) => {
  const data:data = getData()
  const handles:string[] = data.users.map(user => user.handle)
  return handles.includes(handle)
}
const getUidFromHandle = (handle:string) => {
  const data:data = getData()
  const user = data.users.filter(user => user.handle === handle)
  return user[0].id
}
const notificationTagged = (message:string,uId:number,channelId:number,dmId:number) => {
  const data:data = getData()
  if(message.match(/@[a-z0-9]+/g)){
    let taggedHandles = message.match(/@[a-z0-9]+/g)
    taggedHandles = taggedHandles.map(x => x.replace("@",""))
    taggedHandles = taggedHandles.filter((v,i,a) => a.indexOf(v) === i)
    taggedHandles = taggedHandles.filter(doesHandleExist)
    const name = (channelId === -1)? data.dms[checkDmId(dmId)].name:data.channels[checkChannelId(channelId)].name
    for(const taggedHandle of taggedHandles){
      const uIdIndex = checkUserId(uId)
      const taggedUserIndex = checkUserId(getUidFromHandle(taggedHandle))
      const notification:notification = {
        notificationMessage:'{'+data.users[uIdIndex].handle+'} tagged you in {'+name+'}: {'+message.substring(0,20)+'}',
        channelId,
        dmId
      }
      data.users[taggedUserIndex].notifications.push(notification)
    }
  }
}
const notifiAddedtoDmChannel = (dmId:number,channelId:number,adderId:number,uId:number) => {
  const data: data = getData()
  const userHandle = data.users[checkUserId(adderId)].handle
  const name = (channelId === -1)? data.dms[checkDmId(dmId)].name:data.channels[checkChannelId(channelId)].name
  const notification:notification = {
    notificationMessage:'{'+userHandle+'} added you to {'+name+'}',
    channelId,
    dmId
  }
  data.users[checkUserId(uId)].notifications.push(notification)
}
const notificationReact = (reactedUserId: number,dmId:number,channelId:number,uId:number) =>{
  const data: data = getData()
  const userHandle = data.users[checkUserId(reactedUserId)].handle
  const name = (channelId === -1)? data.dms[checkDmId(dmId)].name:data.channels[checkChannelId(channelId)].name
  const notification:notification = {
    notificationMessage:'{'+userHandle+'} reacted to your message in {'+name+'}',
    channelId,
    dmId
  }
  data.users[checkUserId(uId)].notifications.push(notification)
}
const channelDmIdThatMessageIn = (messageId:number):number => {
  const data: data = getData()
  if (checkMessage(messageId)) {
    for(const channel of data.channels){
      if(channel.messages.map(message => message.messageId).includes(messageId)){
        return channel.channelId
      }
    }
  }else{
    for(const dm of data.dms){
      if(dm.messages.map(message => message.messageId).includes(messageId)){
        return dm.dmId
      }
    }
  }
}
const whoSendMessageId = (messageId:number):number => {
  const data: data = getData()
  if(checkMessage(messageId)){
    for(const channel of data.channels){
      for(const message of channel.messages){
        if(message.messageId === messageId){
          return message.uId
        }
      }
    }
  }
  else{
    for(const dm of data.dms){
      for(const message of dm.messages){
        if(message.messageId === messageId){
          return message.uId
        }
      }
    }
  }
}
export {
  checkUserInChannel,
  checkUserId,
  checkChannelId,
  generateToken,
  getIdFromEmail,
  createNewMessageId,
  isMessageIdValid,
  IsUserAnOwner,
  invalidateToken,
  checkToken,
  checkDmId,
  isChannelIdValid,
  isDmIdValid,
  getDmIndex,
  checkMessage,
  checkUserChannelOwner,
  getHashOf,
  removeResetCode,
  updateUserStatsChannels,
  updateUserStatsDms,
  updateUserStatsMessages,
  updateWorkspaceStatsChannels,
  updateWorkspaceStatsDms,
  updateWorkspaceStatsMessages,
  initializeWorkspaceStats,
  utilizationRate,
  doesMessageIdExist,
  isUserInMessageIdChannel,
  didUserSendMessageId,
  sentLaterMessages,
  sentLaterDms,
  returnMessageInfo,
  notificationTagged,
  channelDmIdThatMessageIn,
  notifiAddedtoDmChannel,
  notificationReact,
  whoSendMessageId
};
