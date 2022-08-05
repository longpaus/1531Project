import { getData, setData } from "./data";
import { requestChannelsList, requestChannelMessages } from "./requests";
import { checkMessage } from "./commands";

const startTrackingChannels = (token: string, dankeMemerId: number) => {
	const data = getData();
	try {
		//get a list of all channels dank Memer is a part of
		let channels = requestChannelsList(token).channels;
		if( channels.length === 0 ) {
			return;
		}
		//Finding if dankMemer has left or been kicked from any channels
		const leftChannels = data.trackedChannels.map(x => x.channelId).filter(x => !channels.map(x => x.channelId).includes(x));
		//clears the intervals of channels dankMemer has been kicked from
		data.intervalTracker.map(x => {
			if(leftChannels.includes(x.channelId)) {
				clearInterval(x.intervalId);
			}
		});
		//Finds the ids of all untracked channels
		channels = channels.map(x => x.channelId).filter(x => !data.trackedChannels.map(x => x.channelId).includes(x));
		if (channels.length > 0) {
			//stores the channelInfo in data and starts tracking the channel
			channels.map(x => {
				let newData = getData();
				newData.trackedChannels.push({
					channelId: x,
					trackedMessages: [],
					dadJokeStatus: false
				});
				setData(newData);
				const newInterval = {
					channelId: x,
					intervalId: trackMessages(token, x, dankeMemerId)
				}
				newData = getData();
				newData.intervalTracker.push(newInterval);
				setData(data);
			});
		}
	} catch (err) {
		console.log(err)
	}
}

const trackMessages = (token: string, channelId: number, dankMemerId: number) => {
	console.log(`tracking ${channelId}`);
	// begins tracking the messages in channel : channelId
	return setInterval(() => {
		let data = getData();
		const channelIdIndex = data.trackedChannels.map(x => x.channelId).indexOf(channelId);
		//views messages
		try {const messages = requestChannelMessages(token, channelId, 0).messages;
			if (messages.length === 0) {
				return;
			} 
			//checks if the last sent message has been tracked
			if ( !data.trackedChannels[channelIdIndex].trackedMessages.includes(messages[0].messageId )) {
				const message = messages[0].message;
				const uId = messages[0].uId;
				//adds the messageId to tracked messages
				data.trackedChannels[channelIdIndex].trackedMessages.push(messages[0].messageId);
				setData(data);
				//checks message for commands
				if (messages[0].uId !== dankMemerId) {
					checkMessage(token, channelId, message, uId);
				}
			}
		} catch (err) {
			console.log(err);
		}
	}, 100);
}

export { startTrackingChannels, trackMessages };