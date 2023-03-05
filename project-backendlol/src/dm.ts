import { getData, setData, dm, data, message } from './dataStore';
import { checkUserId, checkDmId, checkToken, getDmIndex } from './helpers';

const ERROR = { error: 'error' };

const dmCreate = (token: string, uIds: number[]) => {
  const data: data = getData();
  const owner: number = checkToken(token);
  const userIndexs: number[] = uIds.map(x => checkUserId(x));
  if (owner === -1 || uIds.includes(owner) || userIndexs.includes(-1) || uIds.some((element, index) => { return uIds.indexOf(element) !== index; })) {
    return ERROR;
  }
  const dms: number[] = data.dms.map(x => x.dmId);
  let dmId: number = 0;
  dms.length === 0 ? dmId = 1 : dmId = Math.max(...dms) + 1;
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
  return { dmId: dmId };
};

const dmList = (token: string) => {
  const data: data = getData();
  const user: number = checkToken(token);
  if (user === -1) {
    return ERROR;
  }
  const dms = data.dms.filter(x => x.userIds.includes(user));
  const dmInfo = dms.map(({ owner, userIds, messages, ...rest }) => { return rest; });
  return {dms: dmInfo};
};

const dmRemove = (token: string, dmId: number) => {
  const data: data = getData();
  const user: number = checkToken(token);
  const dm: number = checkDmId(dmId);
  if (dm === -1 || data.dms[dm].owner !== user) {
    return ERROR;
  }
  data.dms.splice(dm, 1);
  setData(data);
  return {};
};

const dmDetails = (token: string, dmId: number) => {
  const data: data = getData();
  const user: number = checkToken(token);
  const dm: number = checkDmId(dmId);
  if (dm === -1 || !data.dms[dm].userIds.includes(user)) {
    return ERROR;
  }
  const users = data.users.filter(x => data.dms[dm].userIds.includes(x.id));
  const members = users.map(({ password, globalPermissions, id, handle, ...rest }) => {
    return Object.assign(rest, { uId: id }, { handleStr: handle });
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
  if (dm === -1 || !data.dms[dm].userIds.includes(user)) {
    return ERROR;
  }
  data.dms[dm].userIds = data.dms[dm].userIds.filter(x => x !== user);
  if (data.dms[dm].owner === user) {
    data.dms[dm].owner = 0;
  }
  setData(data);
  return {};
};


const dmMessagesV1 = (token: string, dmId: number, start: number) => {
  const data = getData();
  const userId = checkToken(token);
  const dmIndex = getDmIndex(dmId);
  if (userId === -1 || dmIndex === -1 || start < 0) {
    return ERROR;
  }
  if (!data.dms[dmIndex].userIds.includes(userId) || start >= data.dms[dmIndex].messages.length) {
    return ERROR;
  }
  let end = start + 50;
  if (end >= data.dms[dmIndex].messages.length) {
    end = -1;
  }
  let messages: message[] = data.dms[dmIndex].messages
  messages = messages.reverse();
  messages = messages.slice(start,start + 50)
  return{ 
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
  dmMessagesV1
};
