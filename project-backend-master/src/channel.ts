import { getData, setData, message } from './dataStore';
import { userProfileV1 } from './users';
import { checkChannelId, checkToken, checkUserInChannel, checkUserId,checkUserChannelOwner, updateUserStatsChannels, updateWorkspaceStatsChannels,notifiAddedtoDmChannel } from './helpers';
import HTTPError from 'http-errors';

// inputing userid and channelid to show the channel details
function channelDetailsV1 (authUserId: number, channelId: number) {
  const data = getData();
  const check = checkUserInChannel(authUserId, channelId);
  if (!check) {
    throw HTTPError(400, 'Bad Request');
  } else if (!check.inChannel) {
    throw HTTPError(403, 'Forbidden');
  }

  const newObject = {
    name: data.channels[check.channel].name,
    isPublic: data.channels[check.channel].isPublic,
    ownerMembers: [{}],
    allMembers: [{}]
  };
  const save = check.channel;
  const owners = data.users.filter(x => data.channels[save].authUserId.includes(x.id));
  newObject.ownerMembers = owners.map(({ email, nameFirst, nameLast, id, handle, profileImgUrl }) => {
    return Object.assign({ email, nameFirst, nameLast, profileImgUrl }, { uId: id }, { handleStr: handle });
  });
  const users = data.users.filter(x => data.channels[save].userIds.includes(x.id));
  newObject.allMembers = users.map(({ email, nameFirst, nameLast, id, handle, profileImgUrl }) => {
    return Object.assign({ email, nameFirst, nameLast, profileImgUrl }, { uId: id }, { handleStr: handle });
  });
  return newObject;
}

function channelJoinV1 (authUserId: number, channelId: number) {
  const data = getData();
  const check = checkUserInChannel(authUserId, channelId);
  if (!check || check.inChannel) {
    throw HTTPError(400, 'Bad Request');
  }
  const user = check.user;
  const channel = check.channel;

  if (data.channels[channel].isPublic || data.users[user].globalPermissions === 1) {
    data.channels[channel].userIds.push(authUserId);
    setData(data);
    updateUserStatsChannels(authUserId, 1);
    updateWorkspaceStatsChannels(1);
    return {};
  } else {
    throw HTTPError(403, 'Forbidden');
  }
}

function channelInviteV1 (authUserId: number, channelId : number, uId: number) {
  const data = getData();
  const check = checkUserInChannel(authUserId, channelId);
  const check2 = checkUserInChannel(uId, channelId);
  if (!check || !check2 || check2.inChannel) {
    throw HTTPError(400, 'Bad Request');
  } else if (!check.inChannel) {
    throw HTTPError(403, 'Forbidden');
  }

  const channel = check.channel;
  data.channels[channel].userIds.push(uId);
  setData(data);
  notifiAddedtoDmChannel(-1,channelId,authUserId,uId)
  updateUserStatsChannels(uId, 1);
  updateWorkspaceStatsChannels(1);
  return {};
}

/*
In this function there are three Parameters "authUserId, channelId, start","authUserId" means the player's name in the game then the "channelId" means the game's channel's name and the last "start" means the time the player begin to start the game.

*/
const channelMessagesV3 = (token: string, channelId: number, start: number) => {
  const data = getData();
  const userId = checkToken(token);
  const channelIndex = checkChannelId(channelId);
  if (channelIndex === -1) {
    throw HTTPError(400, 'invalid channelId');
  }
  if (!data.channels[channelIndex].userIds.includes(userId) || userId === -1) {
    throw HTTPError(403, 'invalid userId');
  }
  if (data.channels[channelIndex].messages.length > 0 ? start >= data.channels[channelIndex].messages.length : start > 0) {
    throw HTTPError(400, 'invalid start');
  }
  if (start < 0) {
    throw HTTPError(400, 'invalid start');
  }
  let end = start + 50;
  if (end >= data.channels[channelIndex].messages.length) {
    end = -1;
  }
  let messages: message[] = data.channels[channelIndex].messages;
  messages = messages.reverse();
  messages = messages.slice(start, start + 50);
  return {
    messages: messages.map(x => {
      x.react = Object.assign(x.react, { isThisUserReacted: x.react.uIds.includes(userId) });
      return x;
    }),
    start,
    end
  };

};

/*
Given a channel with ID channelId that the authorised user is a member of,
remove them as a member of the channel.
*/
function channelLeaveV1(token: string, channelId: number) {
  const data = getData();
  const userId = checkToken(token);
  const check = checkUserInChannel(userId, channelId);
  if (!check) {
    throw HTTPError(400, 'Bad Request');
  } else if (!check.inChannel) {
    throw HTTPError(403, 'Forbidden');
  }
  const standUp = data.channels[check.channel].standup;
  if (standUp.active === true && standUp.userId === userId) {
    throw HTTPError(400, 'This user is the starter of an active standup');
  }
  if (data.channels[check.channel].authUserId.includes(userId) === true) {
    data.channels[check.channel].authUserId.splice(data.channels[check.channel].userIds.indexOf(userId), 1);
  }
  data.channels[check.channel].userIds.splice(data.channels[check.channel].userIds.indexOf(userId), 1);

  setData(data);
  updateUserStatsChannels(userId, -1);
  updateWorkspaceStatsChannels(-1);
  return {};
}

/*
Make user with user id uId an owner of the channel.
*/
function channelAddownerV1(token: string, channelId: number, uId: number) {
  const data = getData();
  const authUserId = checkToken(token);
  const check = checkUserInChannel(uId, channelId);
  if (!check || !check.inChannel) {
    throw HTTPError(400, 'Bad Request');
  } else if (!data.channels[check.channel].userIds.includes(authUserId)) {
    throw HTTPError(400, 'Bad Request');
  } else if (data.users[checkUserId(authUserId)].globalPermissions === 2) {
    if (!data.channels[check.channel].authUserId.includes(authUserId)) {
      throw HTTPError(403, 'Forbidden');
    }
  } else if (data.channels[check.channel].authUserId.includes(uId) === true) {
    throw HTTPError(400, 'Bad Request');
  }

  data.channels[check.channel].authUserId.push(uId);
  setData(data);
  return {};
}

/*
Remove user with user id uId as an owner of the channel.
*/
function channelRemoveownerV1(authUserId: number, channelId: number, uId: number) {
  const data = getData();
  const check = checkUserInChannel(uId, channelId);
  if (!check || !check.inChannel) {
    throw HTTPError(400, 'Bad Request');
  } else if (!data.channels[check.channel].userIds.includes(authUserId)) {
    throw HTTPError(400, 'Bad Request');
  } else if (data.users[checkUserId(authUserId)].globalPermissions === 2) {
    if (!data.channels[check.channel].authUserId.includes(authUserId)) {
      throw HTTPError(403, 'Forbidden');
    }
  } else if (!data.channels[check.channel].authUserId.includes(uId)) {
    throw HTTPError(400, 'Bad Request');
  } else if (data.channels[check.channel].authUserId.length === 1) {
    throw HTTPError(400, 'Bad Request');
  }
  const userIndex = data.channels[check.channel].authUserId.indexOf(uId);
  data.channels[check.channel].authUserId.splice(userIndex, 1);
  setData(data);
  return {};
}

const channelKick = (authUserId: number, channelId: number, uId: number) => {
  let data = getData();
  const check = checkUserInChannel(uId, channelId);
  if (!check || !check.inChannel) {
    throw HTTPError(400, 'User not in channel');
  } else if (!data.channels[check.channel].userIds.includes(authUserId)) {
    throw HTTPError(403, 'User not authorized to kick members');
  }
  data.channels[check.channel].userIds.splice(data.channels[check.channel].userIds.indexOf(uId), 1);
  if (data.channels[check.channel].authUserId.includes(uId)) {
    data.channels[check.channel].authUserId.splice(data.channels[check.channel].authUserId.indexOf(uId), 1);
  }
  return {};
}

export {
  channelJoinV1,
  channelInviteV1,
  channelDetailsV1,
  channelLeaveV1,
  channelAddownerV1,
  channelRemoveownerV1,
  channelMessagesV3,
  channelKick
};
