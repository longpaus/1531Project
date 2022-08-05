import { NumberLiteralType } from "typescript"

interface userStatsChannels {
  numChannelsJoined: number,
  timeStamp: number
}
interface userStatsDms {
  numDmsJoined: number,
  timeStamp: number
}
interface userStatsMessages {
  numMessagesSent: number,
  timeStamp: number
}
interface workspaceStatsChannels {
  numChannelsExist: number,
  timeStamp: number
}
interface workspaceStatsDms {
  numDmsExist: number,
  timeStamp: number
}
interface workspaceStatsMessages {
  numMessagesExist: number,
  timeStamp: number
}
interface notification{
  channelId: number,
  dmId: number,
  notificationMessage:string
}
interface standup {
  active: boolean,
  userId: number,
  message: string,
  timeFinish: number
}

interface user {
  email: string,
  password: string,
  nameFirst: string,
  nameLast: string,
  id: number,
  handle: string,
  profileImgUrl: string,
  globalPermissions: number,
  notifications : notification[],
  stats: {
    channelsJoined: userStatsChannels[],
    dmsJoined: userStatsDms[],
    messagesSent: userStatsMessages[],
    involvementRate: number
  },
  isActive: boolean
}
interface react {
  reactId: number,
  uIds: number[],
}
interface message {
  messageId: number,
  uId: number,
  message: string,
  timeSent: number,
  isPin : boolean
  react: react
}
interface channel {
  channelId: number,
  name: string,
  authUserId: number[],
  userIds: number [],
  isPublic: boolean,
  messages: message[],
  standup: standup
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
interface resetCode {
  code: string,
  uId: number,
  time: number
}
interface workspaceStats {
  channelsExist: workspaceStatsChannels[],
  dmsExist: workspaceStatsDms[],
  messagesExist: workspaceStatsMessages[],
  utilizationRate: number
}
interface sentLaterMessage{
  channelId:number,
  message:string,
  timeSent:number,
  messageId:number,
  uId:number
}

interface sentLaterDm{
  dmId:number,
  message:string,
  timeSent:number,
  messageId:number,
  uId:number
}
interface data {
  users: user[],
  channels: channel[],
  dms: dm[],
  tokens: token[],
  resetCodes: resetCode[],
  workspaceStats: workspaceStats,
  sentLaterMessages: sentLaterMessage[],
  sentLaterDms:sentLaterDm[]
}

let dataStore: data = {
  users: [],
  channels: [],
  dms: [],
  tokens: [],
  resetCodes: [],
  sentLaterMessages: [],
  sentLaterDms: [],
  workspaceStats: {
    channelsExist: [],
    dmsExist: [],
    messagesExist: [],
    utilizationRate: 0
  }
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
  return dataStore;
}

// Use set(newData) to pass in the entire data object, with modifications made
function setData(newData: data) {
  dataStore = newData;
  const fs = require('fs');
  fs.writeFileSync('backup.json', JSON.stringify(newData, null, 2));
}

const loadData = () => {
  const fs = require('fs');
  try {
    const newData: data = JSON.parse(fs.readFileSync('backup.json'));
    newData.resetCodes = [];
    newData.sentLaterMessages = [];
    newData.sentLaterDms = [];
    setData(newData);
  } catch (err) {
    const newData = getData();
    setData(newData);
  }
};

export { getData, setData, loadData, user, message, channel, token, data, dm,notification,
   userStatsChannels, userStatsDms, userStatsMessages, workspaceStatsChannels, workspaceStatsDms, workspaceStatsMessages,sentLaterMessage,sentLaterDm };
