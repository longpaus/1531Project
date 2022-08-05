import { getData, setData, channel, data } from './dataStore';
import { updateUserStatsChannels, updateWorkspaceStatsChannels } from './helpers';
import HTTPError from 'http-errors';

/**
 * Creates a new channel with the given name that is
 * either a public or private channel.
 * The user who created it automatically joins the channel.
 *
 * @param {integer} authUserId - userId of the creater
 * @param {string} name - name of channel
 * @param {boolean} isPublic - true if channel is public, false for channel is private
 * @returns {interger} channelId - new channelId value
 *
 */
const channelsCreateV1 = (authUserId: number, name: string, isPublic: boolean) => {
  const data: data = getData();
  if (name.length < 1 || name.length > 20) {
    throw HTTPError(400, 'Name must be between 1 and 20 characters');
  }
  const newChannel: channel = {
    channelId: data.channels.length + 1,
    name: name,
    authUserId: [authUserId],
    userIds: [authUserId],
    isPublic: isPublic,
    messages: [],
    standup: {
      active: false,
      userId: 0,
      message: '',
      timeFinish: 0
    }
  };
  data.channels.push(newChannel);
  setData(data);
  updateUserStatsChannels(authUserId, 1);
  updateWorkspaceStatsChannels(1);
  return {
    channelId: newChannel.channelId
  };
};
/**
 * Provide an array of all channels (and their associated details)
 * that the authorised user is part of.
 *
 * @param {integer} authUserId - userId of the user part of the listed channels
 * @returns {Array<{channelId : number, name : string}} channels - array of the
 * channelId and the name of each channel the user is part of

 */

function channelsListV1(authUserId: number) {
  const data = getData();

  const channels = data.channels.filter(x => x.userIds.includes(authUserId));
  return { channels: channels.map(({ channelId, name }) => { return { channelId, name }; }) };
}

/**
 * Provide an array of all channels (and their associated details)
 *
 * @returns {Array<{channelId : number, name : string}} channels - array of the
 * channelId and the name of each channel the user is part of

 */
function channelsListallV1 () {
  const data = getData();
  return { channels: data.channels.map(({ channelId, name }) => { return { channelId, name }; }) };
}

export {
  channelsCreateV1,
  channelsListV1,
  channelsListallV1
};
