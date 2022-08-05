import { requestChannelDetails, requestMessageSend, requestChannelKick, requestDmSend, requestDmCreate } from './requests';
import stupidJoke from 'stupid-joke'
import { getData, setData } from './data';
import { checkUserIsOwner, checkMemerIsOwner, locateIdFromHandle } from './helper';

const checkMessage = (token: string, channelId: number, message: string, senderId: number) => {
	if(getData().trackedChannels.filter(x => x.channelId === channelId)[0].dadJokeStatus) {
		dadJokeResponse(token, channelId, message);
	}
	const words = message.toLowerCase().split(' ');
	if (words[0] !== 'pls') {
		return;
	} else if (words[1] === 'help') {
		plsHelp(token, channelId);
	} else if (words[1] === 'joke') {
		plsJoke(token, channelId);
	} else if (words[1] === 'hug') {
		plsHug(token, channelId, words[2] || '', senderId);
	} else if (words[1] === 'kick') {
		plsKick(token, channelId, words[2] || '', senderId);
	} else if (words[1] === 'dadmode') {
		plsdadMode(token, channelId, senderId);
		plsdadStatus(token, channelId);
	} else if (words[1] === 'dadstatus') {
		plsdadStatus(token, channelId);
	}
}

const plsHelp = (token: string, channelId: number) => {
	const message = 'LIST OF COMMANDS\npls help - lists all possible commands\nFUN COMMANDS\npls joke - sends a random joke\npls hug - give someone a hug\npls dadmode - activates dadmode in the channel\npls dadstatus - checks whether dadmode is active or not\nADMIN COMMANDS\npls kick - kicks the given user from the channel';
	try {
		requestMessageSend(token, channelId, message);
	} catch (err) {
		console.log(err);
	}
}

const plsJoke = (token: string, channelId: number) => {
	try{
		//sends a joke from stupid-joke joke library
		requestMessageSend(token, channelId, stupidJoke.getRandom());
	} catch (err) {
		console.log(err);
	}
}

const plsHug = (token: string, channelId: number, handle: string, senderId: number) => {
	//checks provided handle
	if (handle.indexOf('@') !== 0) {
		requestMessageSend(token, channelId, 'You need to tag someone to hug');
		return;
	}
	try{
		//finds the handle of the sender
		const members = requestChannelDetails(token, channelId).allMembers;
		const senderHandle = members.filter(x => x.uId === senderId)[0].handleStr;
		//sends hug message
		requestMessageSend(token, channelId, `@${senderHandle} gives ${handle} a nice big hug.`);
	} catch (err) {
		console.log(err);
	}
}

const plsKick = (token: string, channelId: number, handle: string, senderId: number) => {
	//looks for user tag
	if (handle.indexOf('@') !== 0) {
		requestMessageSend(token, channelId, 'You can\'t kick the air 🤦');
		return;
	}
	try {
		//get details about the channel and its members
		const channelDeets = requestChannelDetails(token, channelId);
		//check senders permissions in the channel, can not check global permissions
		if (!checkUserIsOwner(token, channelId, senderId)) {
			requestMessageSend(token, channelId, 'It appears that you are not an owner in this channel, only owners can kick other members');
			return;
		} 
		//checks dank memers permissions in the channel
		else if (!checkMemerIsOwner(token, channelId)) {
			requestMessageSend(token, channelId, 'I do not have owner permissions in this channel.\nIf you want to use me as an administrative bot please add me as a channel owner.');
			return;
		}
		//locate the userId of the user to be kicked
		const userId = locateIdFromHandle(token, channelId, handle);
		try {
			//kicks the user and sends message 
			requestChannelKick(token, channelId, userId);
			requestMessageSend(token, channelId, `${handle} has been kicked from the channel`);
			//locate dmId of the user, if no id exists creates a dm
			let data = getData();
			let dmId = 0
			if (data.trackedUsers.map(x => x.userId).includes(userId)) {
				dmId = data.trackedUsers.filter(x => x.userId === userId)[0].dmId
			} else {
				dmId = requestDmCreate(token, userId).dmId;
				data.trackedUsers.push({
					userId: userId,
					dmId: dmId
				});
				setData(data);
			}
			//sends kick message to the dm of user
			requestDmSend(token, dmId, `You have been kicked from channel: ${channelDeets.name}`);
		} catch (err) {
			console.log(err);
		}
	} catch (err) {
		console.log(err);
	}
}

const plsdadMode = (token: string, channelId: number, senderId: number) => {
	if (!checkUserIsOwner(token, channelId, senderId)) {
		requestMessageSend(token, channelId, 'Only owners can activate or deactivate dad mode');
	} else {
		let data = getData();
		data.trackedChannels = data.trackedChannels.map(x => {
			if (x.channelId === channelId) {
				x.dadJokeStatus = !x.dadJokeStatus
			}
			return x;
		});
		setData(data);
	}
}

const plsdadStatus = (token: string, channelId: number) => {
	const message = getData().trackedChannels.filter(x => x.channelId === channelId)[0].dadJokeStatus ? 'Dad jokes active' : 'Dad jokes inactive';
	requestMessageSend(token, channelId, message);
	return;
}

const dadJokeResponse = (token: string, channelId: number, message: string) => {
	if(message.toLowerCase().includes('im ')) {
		const returnMessage = message.slice(message.indexOf('im ') +3)
		requestMessageSend(token, channelId, `Hi ${returnMessage}, I\'m dad.`);
	} else if (message.toLowerCase().includes('i\'m ')) {
		const returnMessage = message.slice(message.indexOf('i\'m ') + 4)
		requestMessageSend(token, channelId, `Hi ${returnMessage}, I\'m dad.`);
	} else if (message.toLowerCase().includes('i am')) {
		const returnMessage = message.slice(message.indexOf('i am ') + 5)
		requestMessageSend(token, channelId, `Hi ${returnMessage}, I\'m dad.`);
	}
	return;
}

export { checkMessage };