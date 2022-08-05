import validator from 'validator';
import { getData, setData, user, data } from './dataStore';
import HTTPError from 'http-errors';
import { checkUserId, getHashOf, getIdFromEmail, initializeWorkspaceStats, invalidateToken, removeResetCode, utilizationRate } from './helpers';
import { sendMail } from './nodemailer';
import config from './config.json';

const port = config.port;
const url = config.url;
const RESETCODETIMEOUT = 1; // time until reset code expires in minutes

/* When given an email and password, if they belong to the same registered user returns their authUserId
    Arguments:
            <email> (<string>)      -<a string containing the email of a registered user>
            <password> (<string>)   -<a string containing the password of a registered user>

    Return Value:
            returns <{authUserId: authUserId}> on <valid email and password belonging to the same registered user>
            returns <{error: 'error'}> on <invalid email, invalid password, or email and password belonging to different users>
*/
function authLoginV1(email: string, password: string) {
  const data: data = getData();
  email = email.toLowerCase();
  const emails: string[] = data.users.map(x => x.email);
  if (!emails.includes(email)) {
    throw HTTPError(400, 'Invalid Email');
  } else if (data.users[emails.indexOf(email)].password !== getHashOf(password)) {
    throw HTTPError(400, 'Invalid Password');
  }
  return {};
}

/* Registers a user, storing their data in the dataStore and assigning them an authUserId, a handle
and their global permissions, then returns their authUserId
    Arguments:
    <email> (<string>)          -<a string containing the email to be registered>
    <password> (<string>)       -<a string containing the password>
    <nameFirst> (<string>)      -<a string containing the first name of the user>
    <nameLast> (<string>)       -<a string containing the last name of the user>

    Return Values:
    Returns <{authUserId}> on <succesfully registering the user>
    Returns <{error: 'error'}> on <any inputs not meeting the specifications>
*/
const authRegisterV1 = (email: string, password: string, nameFirst: string, nameLast: string) => {
  const data: data = getData();
  email = email.toLowerCase();
  if (!validator.isEmail(email)) {
    throw HTTPError(400, 'Email is invalid');
  }
  if (password.length < 6) {
    throw HTTPError(400, 'Password must be over 5 characters long');
  }
  if (nameFirst.length < 1 || nameFirst.length > 50) {
    throw HTTPError(400, 'Name must be between 1 and 50 characters');
  }
  if (nameLast.length < 1 || nameLast.length > 50) {
    throw HTTPError(400, 'Name must be between 1 and 50 characters');
  }
  const emails: string[] = data.users.filter(x => x.isActive).map(x => x.email);
  if (emails.includes(email)) {
    throw HTTPError(400, 'Email already in use');
  }
  const timeStamp = Math.floor(Date.now());
  const newUser: user = {
    email: email,
    password: getHashOf(password),
    nameFirst: nameFirst,
    nameLast: nameLast,
    id: 1 + data.users.length,
    handle: '',
    profileImgUrl: `${url}:${port}/static/default.jpg`,
    globalPermissions: data.users.length === 0 ? 1 : 2,
    notifications: [],
    stats: {
      channelsJoined: [{ numChannelsJoined: 0, timeStamp }],
      dmsJoined: [{ numDmsJoined: 0, timeStamp }],
      messagesSent: [{ numMessagesSent: 0, timeStamp }],
      involvementRate: 0
    },
    isActive: true
  };
  let newHandle = '';
  newHandle = nameFirst.toLowerCase() + nameLast.toLowerCase();
  newHandle = newHandle.replace(/[^A-Za-z0-9]/g, '');
  if (newHandle.length > 20) {
    newHandle = newHandle.slice(0, 20);
  }
  const handles: string[] = data.users.filter(x => x.isActive).map(x => x.handle);
  if (handles.includes(newHandle)) {
    let duplicates = 0;
    let i = 1;
    while (i === 1) {
      if (!handles.includes(newHandle + duplicates)) {
        i = 2;
      }
      if (i === 1) {
        duplicates++;
      }
    }
    newHandle = newHandle + duplicates;
  }
  newUser.handle = newHandle;
  data.users.push(newUser);
  setData(data);
  if (data.users.length === 1) {
    initializeWorkspaceStats(timeStamp);
  }
  utilizationRate();
  return {};
};

const passwordResetRequest = (email: string) => {
  const data: data = getData();
  const uId = getIdFromEmail(email);
  if (uId === -1) {
    return {};
  }
  const tokens = data.tokens.filter(x => x.uId === uId);
  tokens.map(x => invalidateToken(x.token));
  let code = Math.random().toString(36).slice(2, 6) + '-' + Math.random().toString(36).slice(2, 6);
  code = code.toUpperCase();
  data.resetCodes.push({
    code: getHashOf(code),
    uId: uId,
    time: Math.floor(Date.now())
  });
  setData(data);
  sendMail(email, code);
  return setTimeout(() => {
    removeResetCode(getHashOf(code));
  }, RESETCODETIMEOUT * 60000);
};

const passwordReset = (resetCode: string, newPassword: string) => {
  const data: data = getData();
  resetCode = getHashOf(resetCode);
  const codes = data.resetCodes.map(x => x.code);
  if (!codes.includes(resetCode)) {
    throw HTTPError(400, 'Invalid reset code');
  } else if (newPassword.length < 6) {
    throw HTTPError(400, 'Password must be over 5 characters long');
  }
  const user = data.resetCodes[codes.indexOf(resetCode)].uId;
  data.users[checkUserId(user)].password = getHashOf(newPassword);
  setData(data);
  removeResetCode(resetCode);
  return {};
};

export {
  authLoginV1,
  authRegisterV1,
  passwordResetRequest,
  passwordReset
};
