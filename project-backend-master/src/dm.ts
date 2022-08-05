import { getData, setData, dm, data, message } from './dataStore';
import { checkUserId, checkDmId, checkToken, getDmIndex, updateUserStatsDms, updateWorkspaceStatsDms,notifiAddedtoDmChannel } from './helpers';
import HTTPError from 'http-errors'

const ERROR = { error: 'error' };

const dmCreate = (token: string, uIds: number[]) => {
  const data: data = getData();
  const owner: number = checkToken(token);
  const userIndexs: number[] = uIds.map(x => checkUserId(x));
  if (owner === -1) {
    throw HTTPError(403, 'Invalid Token');
  } else if (uIds.includes(owner)) {
    throw HTTPError(400, 'Owner can not be included in list of dms');
  } else if (userIndexs.includes(-1)) {
    throw HTTPError(400, 'Invalid uId in uIds');
  } else if (uIds.some((element, index) => { return uIds.indexOf(element) !== index; })) {
    throw HTTPError(400, 'Duplicate users not allowed in uIds');
  }
  const dmId = Math.max(...data.dms.map(x => x.dmId), 0) + 1;
  userIndexs.push(checkUserId(owner));
  const names: string[] = userIndexs.map(x => data.users[x].handle);
  names.sort();
  const name = names.reduce((name: string, currName: string) => names.indexOf(currName) === 0 ? name + currName : name + ',' + ' ' + currName, '');
  const newDm: dm = {
    dmId: dmId,
    name: name,
    owner: owner,
    userIds: [owner, ...uIds],
    messages: []
  };
  data.dms.push(newDm);
  setData(data);
  newDm.userIds.map(x => updateUserStatsDms(x, 1));
  updateWorkspaceStatsDms(1);
  for(const uId of uIds){
    notifiAddedtoDmChannel(dmId,-1,owner,uId)
  }
  return { dmId: dmId };
};

const dmList = (token: string) => {
  const data: data = getData();
  const user: number = checkToken(token);
  if (user === -1) {
    throw HTTPError(403, 'Invalid token');
  }
  const dms = data.dms.filter(x => x.userIds.includes(user));
  const dmInfo = dms.map(({ name, dmId }) => { return { name, dmId }; });
  return { dms: dmInfo };
};

const dmRemove = (token: string, dmId: number) => {
  const data: data = getData();
  const user: number = checkToken(token);
  const dm: number = checkDmId(dmId);
  if (dm === -1) {
    throw HTTPError(400, 'Invalid dmId');
  } else if (data.dms[dm].owner !== user) {
    throw HTTPError(403, 'Only dm owner can remove dm');
  }
  const users: number[] = data.dms[dm].userIds;
  data.dms.splice(dm, 1);
  setData(data);
  users.map(x => updateUserStatsDms(x, -1));
  updateWorkspaceStatsDms(-1);
  return {};
};

const dmDetails = (token: string, dmId: number) => {
  const data: data = getData();
  const user: number = checkToken(token);
  const dm: number = checkDmId(dmId);
  if (dm === -1) {
    throw HTTPError(400, 'Invalid dmId');
  } else if (!data.dms[dm].userIds.includes(user)) {
    throw HTTPError(403, 'Only members can view dm details');
  }
  const users = data.users.filter(x => data.dms[dm].userIds.includes(x.id));
  const members = users.map(({ email, nameFirst, nameLast, id, handle, profileImgUrl }) => {
    return Object.assign({ email, nameFirst, nameLast, profileImgUrl }, { uId: id }, { handleStr: handle });
  });
  return {
    name: data.dms[dm].name,
    members: members
  };
};

const dmLeave = (token: string, dmId: number) => {
  const data: data = getData();
  const user: number = checkToken(token);
  const dm: number = checkDmId(dmId);
  if (user === -1) {
    throw HTTPError(403, 'Invalid token');
  } else if (dm === -1) {
    throw HTTPError(400, 'Invalid dmId');
  } else if (!data.dms[dm].userIds.includes(user)) {
    throw HTTPError(403, 'Can not leave a dm you are not in');
  }
  data.dms[dm].userIds = data.dms[dm].userIds.filter(x => x !== user);
  if (data.dms[dm].owner === user) {
    data.dms[dm].owner = 0;
  }
  setData(data);
  updateUserStatsDms(user, -1);
  return {};
};

const dmMessagesV2 = (token: string, dmId: number, start: number) => {
  const data = getData();
  const userId = checkToken(token);
  const dmIndex = getDmIndex(dmId);
  if (dmIndex === -1) {
    throw HTTPError(400, 'invalid dmId');
  }
  if (!data.dms[dmIndex].userIds.includes(userId) || userId === -1) {
    throw HTTPError(403, 'invalid userId');
  }
  if (data.dms[dmIndex].messages.length > 0 ? start >= data.dms[dmIndex].messages.length : start > 0) {
    throw HTTPError(400, 'invalid start');
  }
  if (start < 0) {
    throw HTTPError(400, 'invalid start');
  }
  let end = start + 50;
  if (end >= data.dms[dmIndex].messages.length) {
    end = -1;
  }
  let messages: message[] = data.dms[dmIndex].messages;
  messages = messages.reverse();
  messages = messages.slice(start, start + 50);
  return {
    messages,
    start,
    end
  };
};

export {
  dmCreate,
  dmList,
  dmRemove,
  dmDetails,
  dmLeave,
  dmMessagesV2
};
