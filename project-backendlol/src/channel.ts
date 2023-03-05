import { getData, setData,message } from './dataStore';
import { userProfileV1 } from './users';
import { checkUserInChannel, checkToken,checkChannelId } from './helpers';

const ERROR = { error: 'error' };

// inputing userid and channelid to show the channel details
function channelDetailsV1 (authUserId: number, channelId: number) {
  const data = getData();
  if (authUserId === -1) {
    return ERROR;
  }
  const newObject = {
    name: '',
    isPublic: true,
    ownerMember: [{}],
    allMember: [{}]
  };
  newObject.ownerMember =[];
  newObject.allMember = [];
  const check = checkUserInChannel(authUserId, channelId);
  if (!check || !check.inChannel) {
    return ERROR;
  }
  const save = check.channel;
  const ownerId = data.channels[save].userIds[0];
  newObject.name = data.channels[save].name;
  newObject.isPublic = data.channels[save].isPublic;
  if (userProfileV1(ownerId, ownerId) === ERROR) {
    return ERROR;
  }
  newObject.ownerMember.push(userProfileV1(ownerId, ownerId));
  let memberId = 0;
  let member = {};
  for (const i in data.channels[save].userIds) {
    memberId = data.channels[save].userIds[i];
    member = userProfileV1(memberId, memberId);
    newObject.allMember.push(member);
    member = {};
  }
  return newObject;
}

function channelJoinV1 (authUserId: number, channelId: number) {
  const data = getData();
  const check = checkUserInChannel(authUserId, channelId);
  if (!check || check.inChannel) {
    return ERROR;
  }
  const user = check.user;
  const channel = check.channel;
  let global = 0;
  if (data.users[user].globalPermissions === 1) {
    global = 1;
  }
  if (data.channels[channel].isPublic || global === 1) {
    data.channels[channel].userIds.push(authUserId);
    setData(data);
    return {};
  } else {
    return ERROR;
  }
}

function channelInviteV1 (authUserId: number, channelId : number, uId: number) {
  const data = getData();
  const check = checkUserInChannel(authUserId, channelId);
  const check2 = checkUserInChannel(uId, channelId);
  if (!check || !check2 || !check.inChannel || check2.inChannel) {
    return ERROR;
  }
  const channel = check.channel;
  data.channels[channel].userIds.push(uId);
  setData(data);
  return {};
}

/*
In this function there are three Parameters "authUserId, channelId, start","authUserId" means the player's name in the game then the "channelId" means the game's channel's name and the last "start" means the time the player begin to start the game.

*/
const channelMessagesV2 = (token: string, channelId: number, start: number) => {
  const data = getData();
  const userId = checkToken(token);
  const channelIndex = checkChannelId(channelId);
  if (userId === -1 || channelIndex === -1 || start < 0) {
    return ERROR;
  }
  if (!data.channels[channelIndex].userIds.includes(userId) || start >= data.channels[channelIndex].messages.length) {
    return ERROR;
  }
  let end = start + 50;
  if (end >= data.channels[channelIndex].messages.length) {
    end = -1;
  }
  let messages: message[] = data.channels[channelIndex].messages
  messages = messages.reverse();
  messages = messages.slice(start,start + 50)
  console.log(start,end,messages)
  return{ 
    messages,
    start,
    end 
  }
}

export {
  channelJoinV1,
  channelInviteV1,
  channelDetailsV1,
  channelMessagesV2
};
//  authRegisterV1('foo@bar.com', 'StrongPassword', 'Jae', 'Sith');

//    channelsCreateV1(1, 'hello', false);

//  authRegisterV1('tea@bar.com', 'StrongPassword', 'Jane', 'ddy');

// channelJoinV1(2,1);
// channelInviteV1(1,1,2);
// channelsCreateV1(2, 'goodbye', true);
// console.log( channelDetailsV1(1,1));
