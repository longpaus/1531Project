import { getData, data, setData } from './dataStore';
import { checkUserId } from './helpers';
import HTTPError from 'http-errors';

const removeUser = (authUserId: number, uId: number) => {
  const data: data = getData();
  const authUserIdIndex = checkUserId(authUserId);
  const userIdIndex = checkUserId(uId);
  if (data.users[authUserIdIndex].globalPermissions === 2) {
    throw HTTPError(403, 'Not authorised to remove users');
  } else if (data.users.filter(x => x.globalPermissions === 1).length === 1 && data.users[userIdIndex].globalPermissions === 1) {
    throw HTTPError(400, 'Last global owner can not be removed');
  }
  data.users[userIdIndex].isActive = false;
  data.users[userIdIndex].nameFirst = 'Removed';
  data.users[userIdIndex].nameLast = 'user';
  data.channels = data.channels.map(x => {
    x.messages.map(x => {
      if (x.uId === uId) {
        x.message = 'Removed user';
      }
      return x;
    });
    return x;
  });
  data.channels = data.channels.map(x => {
    if (x.userIds.includes(uId)) {
      x.userIds.splice(x.userIds.indexOf(uId), 1);
      if (x.authUserId.includes(uId)) {
        x.authUserId.splice(x.authUserId.indexOf(uId), 1);
      }
    }
    return x;
  });
  data.dms = data.dms.map(x => {
    x.messages.map(x => {
      if (x.uId === uId) {
        x.message = 'Removed user';
      }
      return x;
    });
    return x;
  });
  data.dms = data.dms.map(x => {
    if (x.userIds.includes(uId)) {
      x.userIds.splice(x.userIds.indexOf(uId), 1);
    }
    if (x.owner === uId) {
      x.owner = 0;
    }
    return x;
  });
  setData(data);
  return {};
};

const userPermissionsChange = (authUserId: number, uId: number, permissionId: number) => {
  const data: data = getData();
  const authUserIdIndex = checkUserId(authUserId);
  const userIdIndex = checkUserId(uId);
  if (data.users[authUserIdIndex].globalPermissions === 2) {
    throw HTTPError(403, 'Not authorised to change permissions');
  } else if (data.users.filter(x => x.globalPermissions === 1).length === 1 && data.users[userIdIndex].globalPermissions === 1) {
    throw HTTPError(400, 'Can not demote the last global owner');
  } else if (permissionId !== 1 && permissionId !== 2) {
    throw HTTPError(400, 'Invalid permissionId');
  } else if (data.users[userIdIndex].globalPermissions === permissionId) {
    throw HTTPError(400, 'User already has these permissions');
  }
  data.users[userIdIndex].globalPermissions = permissionId;
  setData(data);
  return {};
};

export { removeUser, userPermissionsChange };
