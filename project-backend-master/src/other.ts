import fs from 'fs';
import { setData, data, getData, channel, dm, message } from './dataStore';
import { checkToken, checkUserId } from './helpers';
import HTTPError from 'http-errors';

/*
  The clear function sets the dataStore back to its initial state
*/
function clearV1() {
  const data: data = getData();
  const pfps = data.users.filter(x => !x.profileImgUrl.includes('default'));
  try {
    pfps.map(x => fs.unlinkSync(`profilePhotos/${x.id}.jpg`));
  } catch {

  }
  const newData: data = {
    users: [],
    channels: [],
    dms: [],
    tokens: [],
    resetCodes: [],
    sentLaterMessages: [],
    sentLaterDms: [],
    workspaceStats: {
      channelsExist: [],
      dmsExist: [],
      messagesExist: [],
      utilizationRate: 0
    }
  };
  setData(newData);
}

const searchV1 = (token:string, queryStr:string) => {
  const data:data = getData();
  const userId = checkToken(token);
  if (userId === -1) {
    throw HTTPError(400, 'invalid token');
  }
  if (queryStr.length < 1 || queryStr.length > 1000) {
    throw HTTPError(400, 'invalid queryStr length');
  }
  const channelsUserIn:channel[] = data.channels.filter(channel => channel.userIds.includes(userId));
  const dmsUserin:dm[] = data.dms.filter(dm => dm.userIds.includes(userId));
  let matchedStrInChannel:message[] = [];
  let mathedStrInDm:message[] = [];

  for (const channel of channelsUserIn) {
    matchedStrInChannel = channel.messages.filter(m => m.message.includes(queryStr));
  }
  for (const dm of dmsUserin) {
    mathedStrInDm = dm.messages.filter(m => m.message.includes(queryStr));
  }
  return { messages: [...matchedStrInChannel, ...mathedStrInDm] };
};

const notificationGetV1 = (token:string) => {
  const data:data = getData();
  const userId = checkToken(token);
  if (userId === -1) {
    throw HTTPError(400, 'invalid token');
  }
  const userIdIndex = checkUserId(userId)
  const notifications = data.users[userIdIndex].notifications.reverse().slice(0,20)
  return {notifications}
}
export { clearV1, searchV1,notificationGetV1 };
