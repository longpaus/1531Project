import { data, getData, token, setData } from './dataStore';
import { v4 as uuidv4 } from 'uuid';

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
/* given a users Id generates and stores a token,
then returns the token */
const generateToken = (uId: number) => {
  const data: data = getData();
  const token: token = {
    token: uuidv4(),
    uId: uId
  };
  data.tokens.push(token);
  setData(data);
  return token.token;
};
/* checks if the token is a valid token and returns the associated
id if it is, else returns -1 */
const checkToken = (token: string) => {
  const data: data = getData();
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
    return false;
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
  const i = emails.indexOf(email);
  return data.users[i].id;
};
// give a unique messageId that is not being used in the system
const createNewMessageId = (data:data) => {
  let messageIds: number[] = [];
  for (const channel of data.channels) {
    const channelmessagesId: number[] = channel.messages.map(item => item.messageId);
    messageIds = messageIds.concat(channelmessagesId);
  }
  for (const dm of data.dms) {
    const channelDmsId: number[] = dm.messages.map(item => item.messageId);
    messageIds = messageIds.concat(channelDmsId);
  }
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
const isMessageIdValid = (data:data, userId:number, messageId:number) => {
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
};
/*
IsUserAnOwner
return true if the user is an owner of treats or
user is an owner in the channel of messageId
*/
const IsUserAnOwner = (data:data, userId:number, messageId:number) => {
  if (data.users[userId - 1].globalPermissions === 1) {
    return true;
  }
  for (const channel of data.channels) {
    for (const messages of channel.messages) {
      if (messages.messageId === messageId) {
        if (channel.authUserId.includes(userId)) {
          return true;
        }
      }
    }
  }
  return false;
};
const isChannelIdValid = (channelId: number) => {
  const data: data = getData();
  const channelIds: number[] = data.channels.map(item => item.channelId);
  return channelIds.includes(channelId);
};
const isDmIdValid = (dmId:number) => {
  const data: data = getData();
  const dmIds: number[] = data.dms.map(item => item.dmId);
  return dmIds.includes(dmId);
};

// returns -1 if dmId does not exist
const getDmIndex = (dmId:number) => {
  const data: data = getData();
  const dmIds: number[] = data.dms.map(item => item.dmId);
  return dmIds.indexOf(dmId);
};
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
  getDmIndex
};
