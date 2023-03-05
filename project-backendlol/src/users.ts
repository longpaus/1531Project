import { getData } from './dataStore';
const ERROR = { error: 'error' };

function userProfileV1(authUserId:number, uId: number) {
  const user = {

    email: '',
    nameFirst: '',
    nameLast: '',
    handleStr: '',
    uId: 0,
  };
  const data = getData();
  let flag = 0;
  // ERROR CHECK
  let check = 0;
  for (const user in data.users) {
    if (data.users[user].id === authUserId) {
      check = 1;
    }
  }
  if (check === 0) {
    return ERROR;
  }
  //
  for (let count = 0; count < data.users.length; count++) {
    if (uId === data.users[count].id) {
      flag = 1;
      user.uId = data.users[count].id;
      user.email = data.users[count].email;
      user.nameFirst = data.users[count].nameFirst;
      user.nameLast = data.users[count].nameLast;
      user.handleStr = data.users[count].handle;
    }
  }
  if (flag == 0) {
    return { error: 'error' };
  }
  return user;
  /* return {
    uId: 1,
    email: 'example@gmail.com',
    nameFirst: 'Hayden',
    nameLast: 'Smith',
    handleStr: 'haydensmith'
  } */
}
export { userProfileV1 };
