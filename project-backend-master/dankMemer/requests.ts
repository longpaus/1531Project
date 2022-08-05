import config from '../src/config.json';
import request from 'sync-request';

const url = config.url;
const port = config.port;

const requestChannelsList = (token: string) => {
  const res = request(
		'GET',
		`${url}:${port}/channels/list/v3`,
		{
			headers: {
				'token': token
			}
		}
  );
	if(res.statusCode === 200) {
		return JSON.parse(res.body as string);
	} else {
		throw new Error('something went wrong with channelsList');
	}
}

const requestChannelMessages = (token: string, channelId: number, start: number) => {
	const res = request(
		'GET',
		`${url}:${port}/channel/messages/v3`,
		{
			qs: {
				channelId: channelId,
				start: start
			},
			headers: {
				'token': token
			}
		}
	);
	if (res.statusCode === 200) {
		return JSON.parse(res.body as string);
	} else {
		throw new Error('Could not view messages')
	}
}

const requestMessageSend = (token: string, channelId: number, message: string) => {
	const res = request(
		'POST',
		`${url}:${port}/message/send/v2`,
		{
			body: JSON.stringify({ channelId: channelId, message: message }),
			headers: {
				'content-type': 'application/json',
				'token': token
			}
		}
	);
	if (res.statusCode === 200) {
		return JSON.parse(res.body as string);
	} else {
		throw new Error(`could not send message to channelId: ${channelId}`);
	}
}

const requestChannelDetails = (token: string, channelId: number) => {
	const res = request(
		'GET',
		`${url}:${port}/channel/details/v3`,
		{
			qs: {
				channelId: channelId,
			},
			headers: {
				'token': token
			}
		}
	);
	if(res.statusCode === 200){
		return JSON.parse(res.body as string);
	} else {
		throw new Error('could not view channel Details');
	}
}

const requestChannelKick  = (token: string, channelId: number, uId: number) => {
	const res = request(
		'POST',
		`${url}:${port}/channel/kick`,
		{
			body: JSON.stringify({
				channelId: channelId,
				uId: uId
			}),
			headers: {
				'Content-type': 'application/json',
				'token': token
			}
		}
	);
	if (res.statusCode === 200) {
		return JSON.parse(res.body as string);
	} else {
		throw new Error('Could not kick user from channel');
	}
}

const requestDmSend = (token: string, dmId: number, message: string) => {
	const res = request(
		'POST',
		`${url}:${port}/message/senddm/v2`,
		{
			body: JSON.stringify(
				{
					dmId: dmId,
					message: message 
				}),
			headers: {
				'content-type': 'application/json',
				'token': token
			}
		}
	);
	if (res.statusCode === 200) {
		return JSON.parse(res.body as string);
	} else {
		throw new Error(`could not send message to channelId: ${dmId}`);
	}
}

const requestDmCreate = (token: string, uId: number) => {
	const res = request(
        'POST',
        `${url}:${port}/dm/create/v2`,
        {
            body: JSON.stringify({
                uIds: [uId]
            }),
            headers: { 
                'Content-type': 'application/json',
                'token': token
            }
        }
    );
	if (res.statusCode === 200) {
		return JSON.parse(res.body as string);
	} else {
		throw new Error('could not create dm');
	}
}

export { requestChannelsList, requestChannelMessages, requestMessageSend, requestChannelDetails, requestChannelKick, requestDmSend, requestDmCreate };