import validator from 'validator';
import { getData, setData, user, data } from './dataStore';

const ERROR = { error: 'error' };
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
  const i = emails.indexOf(email);
  if (i === -1) {
    return ERROR;
  }
  const user: user = data.users[i];
  if (user.password === password) {
    return {
      authUserId: user.id
    };
  }
  return ERROR;
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
function authRegisterV1(email: string, password: string, nameFirst: string, nameLast: string) {
  const data: data = getData();
  email = email.toLowerCase();
  if (!validator.isEmail(email)) {
    return ERROR;
  }
  if (password.length < 6) {
    return ERROR;
  }
  if (nameFirst.length < 1 || nameFirst.length > 50) {
    return ERROR;
  }
  if (nameLast.length < 1 || nameLast.length > 50) {
    return ERROR;
  }
  const emails: string[] = data.users.map(x => x.email);
  if (emails.includes(email)) {
    return ERROR;
  }
  const newUser: user = {
    email: email,
    password: password,
    nameFirst: nameFirst,
    nameLast: nameLast,
    id: 1 + data.users.length,
    handle: '',
    globalPermissions: data.users.length === 0 ? 1 : 2
  };
  let newHandle = '';
  newHandle = nameFirst.toLowerCase() + nameLast.toLowerCase();
  if (newHandle.length > 20) {
    newHandle = newHandle.slice(0, 20);
  }
  const handles: string[] = data.users.map(x => x.handle);
  if (handles.includes(newHandle)) {
    let duplicates = 0;
    while (1 === 1) {
      if (!handles.includes(newHandle + duplicates)) {
        break;
      }
      duplicates++;
    }
    newHandle = newHandle + duplicates;
  }
  newUser.handle = newHandle;
  data.users.push(newUser);
  setData(data);
  return {
    authUserId: newUser.id
  };
}

export {
  authLoginV1,
  authRegisterV1
};
