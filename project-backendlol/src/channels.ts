import { getData, setData, channel, data } from './dataStore';
import { checkUserId } from './helpers'

const ERROR = {error: 'error'};

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
    let data: data = getData();
    if (name.length < 1 || name.length > 20 || checkUserId(authUserId) === -1) {
        return ERROR;
    }
    let new_channel: channel = {
        channelId : data.channels.length + 1,
        name : name,
        authUserId : [authUserId],
        userIds : [authUserId],
        isPublic : isPublic,
        messages : [],
    }   
    data.channels.push(new_channel);
    setData(data);
    return {
        channelId : new_channel.channelId
    };
}
/**
 * Provide an array of all channels (and their associated details) 
 * that the authorised user is part of.
 * 
 * @param {integer} authUserId - userId of the user part of the listed channels
 * @returns {Array<{channelId : number, name : string}} channels - array of the 
 * channelId and the name of each channel the user is part of

 */

function channelsListV1(authUserId: number) {
    let data = getData();
    //ERROR CHECK
    let check = 0
    for(const user in data.users){
        if(data.users[user].id === authUserId){
            check = 1;
        }
    }
    if(check === 0){
        return ERROR;
    }
    //
    let channelsList = [];
    for (const num_channel in data.channels) {
        if (data.channels[num_channel].userIds.includes(authUserId)) {
            let inChannel = {
                channelId : data.channels[num_channel].channelId,
                name : data.channels[num_channel].name,
            };
            channelsList.push(inChannel);
        }
    }
    return {
        channels: channelsList
    }
}

/**
 * Provide an array of all channels (and their associated details) 
 * 
 * @param {integer} authUserId - userId of the user part of the listed channels
 * @returns {Array<{channelId : number, name : string}} channels - array of the 
 * channelId and the name of each channel the user is part of

 */
function channelsListallV1 (authUserId: number) {
    const data = getData();
    if(checkUserId(authUserId) === -1) {
        return ERROR;
    }
    let new_data_object = {
        name: '',
        channelId: 0
    };
    let new_data_list = [];
    for (let i in data.channels) {
        new_data_object.name = data.channels[i].name;
        new_data_object.channelId = data.channels[i].channelId;
        new_data_list.push(new_data_object);
        new_data_object = {
            name: '',
            channelId: 0
        };
    }
    return {
        channels : new_data_list
    }
}

export{
    channelsCreateV1,
    channelsListV1,
    channelsListallV1
}
