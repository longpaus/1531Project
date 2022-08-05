import { getData, data, setData, message } from './dataStore';
import { checkChannelId, checkUserId, checkUserInChannel, createNewMessageId } from './helpers';
import HTTPError from 'http-errors';

const commonErrorChecks = (userId: number, channelId: number) => {
  const check = checkUserInChannel(userId, channelId);
  if (!check) {
    throw HTTPError(400, 'Invalid channelId');
  } else if (!check.inChannel) {
    throw HTTPError(403, 'User not in channel');
  }
};

const standupStart = (userId: number, channelId: number, length: number) => {
  const timeFinish = Math.floor(Date.now()) + (length * 1000);
  const data: data = getData();
  const channel = checkChannelId(channelId);
  commonErrorChecks(userId, channelId);
  if (length < 0) {
    throw HTTPError(400, 'Length must be positive');
  } else if (data.channels[channel].standup.active) {
    throw HTTPError(400, 'Standup already active');
  }
  data.channels[channel].standup = {
    active: true,
    userId: userId,
    message: '',
    timeFinish: timeFinish
  };
  setData(data);
  setTimeout(() => {
    const newData: data = getData();
    const newMessage: message = {
      messageId: createNewMessageId(newData),
      uId: userId,
      message: newData.channels[channel].standup.message.slice(0, -1),
      timeSent: Math.floor(Date.now()),
      react: {
        reactId: 1,
        uIds: []
      },
      isPin: false
    };
    newData.channels[channel].messages.push(newMessage);
    newData.channels[channel].standup = {
      active: false,
      userId: 0,
      message: '',
      timeFinish: 0
    };
    setData(newData);
  }, length * 1000);
  return { timeFinish };
};

const standupActive = (userId: number, channelId: number) => {
  const data: data = getData();
  const channel = checkChannelId(channelId);
  commonErrorChecks(userId, channelId);
  if (data.channels[channel].standup.active) {
    return {
      isActive: data.channels[channel].standup.active,
      timeFinish: data.channels[channel].standup.timeFinish
    };
  } else {
    return {
      isActive: data.channels[channel].standup.active,
      timeFinish: null
    };
  }
};

const standupSend = (userId: number, channelId: number, message: string) => {
  const data: data = getData();
  commonErrorChecks(userId, channelId);
  if (message.length > 1000) {
    throw HTTPError(400, 'Message must be under 1000 characters');
  }
  if (!standupActive(userId, channelId).isActive) {
    throw HTTPError(400, 'No active standup');
  }
  const user = checkUserId(userId);
  const channel = checkChannelId(channelId);
  const handle = data.users[user].handle;
  data.channels[channel].standup.message += handle + ': ' + message + '\n';
  setData(data);
  return {};
};

export { standupStart, standupActive, standupSend };
