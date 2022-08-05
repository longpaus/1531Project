import config from '../src/config.json';
import request from 'sync-request';
import { loadData, getData } from './data';
import { trackMessages } from './trackChannel';

const url = config.url;
const port = config.port;

const email = 'dankmemer@anything.com';
const password = 'veRySecurePassW0rD';

const setUp = () => {
	const res = request(
		'POST',
		`${url}:${port}/auth/register/v3`,
		{
			body: JSON.stringify({
				email: email,
				password: password,
				nameFirst: 'Dank',
				nameLast: 'Memer'
			}),
			headers: { 'Content-type': 'application/json' }
		}
	);
	if (res.statusCode === 200) {
		request(
			'POST',
			`${url}:${port}/user/profile/uploadphoto/v1`,
			{
				body: JSON.stringify({
					imgUrl: 'https://static.wikia.nocookie.net/youtube/images/f/ff/Dank_Memer_Discord_Bot_icon.jpg/revision/latest?cb=20201206191240',
					xStart: 0,
					yStart: 0,
					xEnd: 900,
					yEnd: 900
				}),
				headers: {
					'Content-type': 'application/json',
					'token': JSON.parse(res.body as string).token
				}
			}
		);
		return JSON.parse(res.body as string);
	}
	const res2 = request(
			'POST',
			`${url}:${port}/auth/login/v3`,
			{
					body: JSON.stringify({
							email: email,
							password: password,
					}),
					headers: { 'Content-type': 'application/json' }
			}
	);
	if (res2.statusCode !== 200) {
			throw new Error('Something went wrong with login process, please check details or that Treats is currently running');
	}
	loadData();
	const data = getData();
	data.trackedChannels.map(x => trackMessages(JSON.parse(res2.body as string).token, x.channelId, JSON.parse(res2.body as string).authUserId));
	return JSON.parse(res2.body as string);
};

const logout = (token: string) => {
	request(
		'POST',
		`${url}:${port}/auth/logout/v2`,
		{
			headers: {
				'content-type': 'application/json',
				'token': token
			}
		}
	);
	return;
}

export { setUp, logout }
