import {requestChannelDetails} from './requests'

const checkUserIsOwner = (token: string, channelId: number, uId: number) => {
    const channelDeets = requestChannelDetails(token, channelId);
	const owners = channelDeets.ownerMembers;
    if (owners.map(x => x.uId).includes(uId)) {
        return true;
    } else {
        return false;
    }
}

const checkMemerIsOwner = (token: string, channelId: number) => {
    const channelDeets = requestChannelDetails(token, channelId);
	const owners = channelDeets.ownerMembers;
    if (owners.map(x => x.email).includes('dankmemer@anything.com')) {
        return true;
    } else {
        return false;
    }
}

const locateIdFromHandle = (token: string, channelId: number, handle: string) => {
    const channelDeets = requestChannelDetails(token, channelId);
	const members = channelDeets.allMembers;
    return members.filter(x => x.handleStr === handle.replace('@', ''))[0].uId;
}

export { checkUserIsOwner, checkMemerIsOwner, locateIdFromHandle }