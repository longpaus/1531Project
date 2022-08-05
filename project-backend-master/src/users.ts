import { getData, setData, data } from './dataStore';
import { checkToken, checkUserId } from './helpers';
import validator from 'validator';
import request from 'sync-request';
import fs from 'fs';
import HTTPError from 'http-errors';
import config from './config.json';
import sharp from 'sharp';
import sizeOf from 'image-size';

const port = config.port;
const url = config.url;

function userProfileV1(authUserId: number, uId: number) {
  const data = getData();
  if (checkUserId(uId) === -1) {
    throw HTTPError(400, 'Invalid uId');
  }
  const user = data.users.filter(x => x.id === uId).map(({ email, nameFirst, nameLast, id, handle, profileImgUrl }) => {
    return Object.assign({ email, nameFirst, nameLast, profileImgUrl }, { uId: id }, { handleStr: handle });
  })[0];
  return { user };
}
function usersAllV1(token: string) {
  const data = getData();
  const users = data.users.filter(x => x.isActive).map(({ email, nameFirst, nameLast, id, handle, profileImgUrl }) => {
    return Object.assign({ email, nameFirst, nameLast, profileImgUrl }, { uId: id }, { handleStr: handle });
  });
  return { users };
}
function userProfileSetnameV1(token: any, nameFirst: string, nameLast: string) {
  const user = checkToken(token);
  if (nameFirst.length < 1 || nameFirst.length > 50 || user === -1) {
    throw HTTPError(400, 'length of nameFirst is not between 1 and 50 characters inclusive');
  }
  if (nameLast.length < 1 || nameLast.length > 50) {
    throw HTTPError(400, 'length of nameLast is not between 1 and 50 characters inclusive');
  }
  const data = getData();
  for (let count = 0; count < data.users.length; count++) {
    if (user === data.users[count].id) {
      data.users[count].nameFirst = nameFirst;
      data.users[count].nameLast = nameLast;
    }
  }
  setData(data);
  return {};
}

function userProfileSetemailV1(token: any, email: string) {
  const user = checkToken(token);
  const data = getData();
  if (!validator.isEmail(email) || user === -1) {
    throw HTTPError(400, 'email entered is not a valid email');
  }
  for (let count = 0; count < data.users.length; count++) {
    if (email === data.users[count].email) {
      throw HTTPError(400, 'email address is already being used by another user');
    }
  }
  for (let count = 0; count < data.users.length; count++) {
    if (user === data.users[count].id) {
      data.users[count].email = email;
    }
  }
  setData(data);
  return {};
}

function userProfileSethandleV1(token: any, handleStr: string) {
  const user = checkToken(token);
  const data = getData();
  if (handleStr.length < 3 || handleStr.length > 20 || user === -1) {
    throw HTTPError(400, 'length of handleStr is not between 3 and 20 characters inclusive');
  }
  if (handleStr.match(/^[0-9A-Za-z]+$/) === null) {
    throw HTTPError(400, 'handleStr contains characters that are not alphanumeric');
  }
  for (let count = 0; count < data.users.length; count++) {
    if (handleStr === data.users[count].handle) {
      throw HTTPError(400, 'the handle is already used by another user');
    }
  }
  for (let count = 0; count < data.users.length; count++) {
    if (user === data.users[count].id) {
      data.users[count].handle = handleStr;
    }
  }
  setData(data);
  return {};
}

const userStats = (uId: number) => {
  const data: data = getData();
  return data.users[checkUserId(uId)].stats;
};

const usersStats = () => {
  const data: data = getData();
  return data.workspaceStats;
};

const uploadProfilePhoto = (imgUrl: string, userId: number, xStart: number, yStart: number, xEnd: number, yEnd: number) => {
  if (!imgUrl.includes('.jpg')) {
    throw HTTPError(400, 'Image must be a .jpg');
  } else if (xStart < 0 || yStart < 0 || xStart > xEnd || yStart > yEnd) {
    throw HTTPError(400, 'Invalid dimensions');
  }
  const res = request(
    'GET',
    imgUrl
  );
  if (res.statusCode !== 200) {
    throw HTTPError(400, 'Url not valid');
  }
  const body = res.body;
  fs.writeFileSync(`profilePhotos/temp${userId}.jpg`, body, { flag: 'w' });
  const dimensions = sizeOf(`profilePhotos/temp${userId}.jpg`);
  if (xEnd > dimensions.width || yEnd > dimensions.height) {
    throw HTTPError(400, 'Invalid dimensions');
  }
  sharp(`profilePhotos/temp${userId}.jpg`)
    .extract({ top: yStart, left: xStart, width: xEnd - xStart, height: yEnd - yStart })
    .toFile(`profilePhotos/${userId}.jpg`)
    .then(() => {
      fs.unlinkSync(`profilePhotos/temp${userId}.jpg`);
    });
  const data: data = getData();
  data.users[checkUserId(userId)].profileImgUrl = `${url}:${port}/static/${userId}.jpg`;
  setData(data);
};
export {
  userProfileV1,
  usersAllV1,
  userProfileSetnameV1,
  userProfileSetemailV1,
  userProfileSethandleV1,
  userStats,
  usersStats,
  uploadProfilePhoto
};
