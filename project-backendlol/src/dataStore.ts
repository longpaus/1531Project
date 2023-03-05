interface user {
  email: string,
  password: string,
  nameFirst: string,
  nameLast: string,
  id: number,
  handle: string,
  globalPermissions: number
}
interface message {
  messageId: number,
  uId: number,
  message: string,
  timeSent: number
}
interface channel {
  channelId: number,
  name: string,
  authUserId: number[],
  userIds: number [],
  isPublic: boolean,
  messages: message[],
}
interface dm {
  dmId: number,
  name: string,
  owner: number,
  userIds: number[],
  messages: message[]
}
interface token {
  token: string,
  uId: number
}
interface data {
  users: user[],
  channels: channel[],
  dms: dm[],
  tokens: token[]
}
let data: data = {
  users: [],
  channels: [],
  dms: [],
  tokens: []
};

// YOU SHOULDNT NEED TO MODIFY THE FUNCTIONS BELOW IN ITERATION 1

/*
Example usage
    let store = getData()
    console.log(store) # Prints { 'names': ['Hayden', 'Tam', 'Rani', 'Giuliana', 'Rando'] }

    names = store.names

    names.pop()
    names.push('Jake')

    console.log(store) # Prints { 'names': ['Hayden', 'Tam', 'Rani', 'Giuliana', 'Jake'] }
    setData(store)
*/

// Use get() to access the data
function getData() {
  return data;
}

// Use set(newData) to pass in the entire data object, with modifications made
function setData(newData: data) {
  data = newData;
  const fs = require('fs');
  fs.writeFileSync('backup.json', JSON.stringify(data, null, 2));
}

const loadData = () => {
  const fs = require('fs');
  const newData = fs.readFileSync('backup.json').length === 0 ? getData() : JSON.parse(fs.readFileSync('backup.json'));
  setData(newData);
}

export { getData, setData, loadData, user, message, channel, token, data, dm };
