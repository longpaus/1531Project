import express from 'express';
import { echo } from './echo';
import morgan from 'morgan';
import cors from 'cors';
import config from './config.json';
import errorHandler from 'middleware-http-errors';
import { clearV1, searchV1,notificationGetV1 } from './other';
import { authLoginV1, authRegisterV1, passwordResetRequest, passwordReset } from './auth';
import { channelDetailsV1, channelJoinV1, channelInviteV1, channelMessagesV3, channelLeaveV1, channelAddownerV1, channelRemoveownerV1, channelKick } from './channel';
import { userProfileV1, usersAllV1, userProfileSetnameV1, userProfileSetemailV1, userProfileSethandleV1, userStats, usersStats, uploadProfilePhoto } from './users';
import { channelsCreateV1, channelsListallV1, channelsListV1 } from './channels';
import { dmCreate, dmList, dmRemove, dmDetails, dmLeave, dmMessagesV2 } from './dm';
import { removeUser, userPermissionsChange } from './admin';
import { generateToken, invalidateToken, checkToken, getHashOf, sentLaterMessages, sentLaterDms } from './helpers';
import { loadData } from './dataStore';
import { messagePinV1, messageUnPinV1, messageUnreactV1, messageReactV1, messageSendDmV2, messageSendV2, messageEditV2, messageRemoveV2, messageSendLaterV1, messageSentLaterDmV1, messageShareV1 } from './message';
import { standupStart, standupActive, standupSend } from './standup';

const resetTimeouts: any[] = [];

// Set up web app, use JSON
const app = express();
app.use(express.json());
// Use middleware that allows for access from other domains
app.use(cors());
app.use('/static', express.static('profilePhotos'));

const PORT: number = parseInt(process.env.PORT || config.port);
const HOST: string = process.env.IP || 'localhost';

// Example get request
app.get('/echo', (req, res, next) => {
  try {
    const data = req.query.echo as string;
    return res.json(echo(data));
  } catch (err) {
    next(err);
  }
});

app.post('/auth/register/v3', (req, res) => {
  const { email, password, nameFirst, nameLast } = req.body;
  authRegisterV1(email, password, nameFirst, nameLast);
  res.json(generateToken(email));
});

app.post('/auth/login/v3', (req, res) => {
  const { email, password } = req.body;
  authLoginV1(email, password);
  res.json(generateToken(email));
});

app.post('/auth/logout/v2', (req, res) => {
  const token = req.header('token') as string;
  invalidateToken(getHashOf(token));
  res.json({});
});

app.post('/auth/passwordreset/request/v1', (req, res) => {
  const { email } = req.body;
  const x = passwordResetRequest(email);
  if (x !== {}) {
    resetTimeouts.push(x);
  }
  res.json({});
});

app.post('/auth/passwordreset/reset/v1', (req, res) => {
  const { resetCode, newPassword } = req.body;
  res.json(passwordReset(resetCode, newPassword));
});

app.post('/dm/create/v2', (req, res) => {
  const { uIds } = req.body;
  const token = req.header('token') as string;
  res.json(dmCreate(token, uIds));
});

app.post('/dm/leave/v2', (req, res) => {
  const { dmId } = req.body;
  const token = req.header('token') as string;
  res.json(dmLeave(token, dmId));
});

app.delete('/dm/remove/v2', (req, res) => {
  res.json(dmRemove(req.header('token') as string, parseInt(req.query.dmId as string)));
});

app.get('/dm/list/v2', (req, res) => {
  const token: string = req.header('token') as string;
  res.json(dmList(token));
});

app.get('/dm/details/v2', (req, res) => {
  res.json(dmDetails(req.header('token') as string, parseInt(req.query.dmId as string)));
});

app.post('/channels/create/v3', (req, res) => {
  const { name, isPublic } = req.body;
  const token = req.header('token') as string;
  res.json(channelsCreateV1(checkToken(token), name, isPublic));
});

app.get('/user/stats/v1', (req, res) => {
  const token = req.header('token') as string;
  res.json({ userStats: userStats(checkToken(token)) });
});

app.get('/users/stats/v1', (req, res) => {
  const token = req.header('token') as string;
  checkToken(token);
  res.json({ workspaceStats: usersStats() });
});

app.post('/user/profile/uploadphoto/v1', (req, res) => {
  const { imgUrl, xStart, yStart, xEnd, yEnd } = req.body;
  const token = req.header('token') as string;
  uploadProfilePhoto(imgUrl, checkToken(token), xStart, yStart, xEnd, yEnd);
  res.json({});
});

app.post('/standup/start/v1', (req, res) => {
  const { channelId, length } = req.body;
  const token = req.header('token') as string;
  res.json(standupStart(checkToken(token), channelId, length));
});

app.get('/standup/active/v1', (req, res) => {
  const token = req.header('token') as string;
  const channelId = req.query.channelId as string;
  res.json(standupActive(checkToken(token), Number.parseInt(channelId)));
});

app.post('/standup/send/v1', (req, res) => {
  const token = req.header('token') as string;
  const { channelId, message } = req.body;
  res.json(standupSend(checkToken(token), channelId, message));
});

app.put('/message/edit/v2', (req, res) => {
  const token = req.header('token') as string;
  const { messageId, message } = req.body;
  res.json(messageEditV2(token, messageId, message));
});
app.post('/message/send/v2', (req, res) => {
  const { channelId, message } = req.body;
  const token = req.header('token') as string;
  return res.json(messageSendV2(token, channelId, message));
});

app.delete('/message/remove/v2', (req, res) => {
  const token = req.header('token') as string;
  const messageId = parseInt(req.query.messageId as string);
  res.json(messageRemoveV2(token, messageId));
});
app.post('/message/senddm/v2', (req, res) => {
  const token = req.header('token') as string;
  const { dmId, message } = req.body;
  res.json(messageSendDmV2(token, dmId, message));
});
app.get('/dm/messages/v2', (req, res) => {
  const token = req.header('token') as string;
  const dmId = parseInt(req.query.dmId as string);
  const start = parseInt(req.query.start as string);
  return res.json(dmMessagesV2(token, dmId, start));
});
app.get('/channel/messages/v3', (req, res) => {
  const token = req.header('token') as string;
  const channelId = parseInt(req.query.channelId as string);
  const start = parseInt(req.query.start as string);
  res.json(channelMessagesV3(token, channelId, start));
});

app.delete('/admin/user/remove/v1', (req, res) => {
  const token = req.header('token') as string;
  const uId = parseInt(req.query.uId as string);
  res.json(removeUser(checkToken(token), uId));
});

app.post('/message/sendlater/v1', (req, res) => {
  const token = req.header('token') as string;
  const { channelId, message, timeSent } = req.body;
  res.json(messageSendLaterV1(token, channelId, message, timeSent));
});

app.post('/message/sendlaterdm/v1', (req, res, next) => {
  const token = req.header('token') as string;
  const { dmId, message, timeSent } = req.body;
  res.json(messageSentLaterDmV1(token, dmId, message, timeSent));
});

app.post('/message/share/v1', (req, res) => {
  const token = req.header('token') as string;
  const { ogMessageId, dmId, message, channelId } = req.body;
  res.json(messageShareV1(token, ogMessageId, message, channelId, dmId));
});

app.get('/search/v1', (req, res) => {
  const token = req.header('token') as string;
  const queryStr = req.query.queryStr as string;
  res.json(searchV1(token,queryStr));
});

app.post('/channel/kick', (req, res) => {
  const token = req.header('token') as string;
  const { channelId, uId } = req.body;
  res.json(channelKick(checkToken(token), channelId, uId));
});

app.post('/admin/userpermission/change/v1', (req, res) => {
  const token = req.header('token') as string;
  const { uId, permissionId } = req.body;
  res.json(userPermissionsChange(checkToken(token), uId, permissionId));
});

app.post('/channel/join/v3', (req, res) => {
  const { channelId } = req.body;
  const token = req.header('token') as string;
  channelJoinV1(checkToken(token), channelId);
  res.json({});
});
app.get('/channel/details/v3', (req, res) => {
  const token = req.header('token') as string;
  const Id = req.query.channelId as string;
  const channelId = Number.parseInt(Id);
  res.json(channelDetailsV1(checkToken(token), channelId));
});
app.post('/channel/invite/v3', (req, res) => {
  const { channelId, uId } = req.body;
  const token = req.header('token') as string;
  res.json(channelInviteV1(checkToken(token), channelId, uId));
});

app.post('/channel/leave/v2', (req, res) => {
  const { channelId } = req.body;
  const token = req.header('token') as string;
  res.json(channelLeaveV1(token, channelId));
});

app.post('/channel/addowner/v2', (req, res) => {
  const { channelId, uId } = req.body;
  const token = req.header('token') as string;
  res.json(channelAddownerV1(token, channelId, uId));
});

app.post('/channel/removeowner/v2', (req, res) => {
  const { channelId, uId } = req.body;
  const token = req.header('token') as string;
  res.json(channelRemoveownerV1(checkToken(token), channelId, uId));
});

app.get('/channels/listall/v3', (req, res) => {
  const token = req.header('token') as string;
  checkToken(token);
  res.json(channelsListallV1());
});
app.get('/channels/list/v3', (req, res) => {
  const token = req.header('token') as string;
  res.json(channelsListV1(checkToken(token)));
});

app.get('/user/profile/v3', (req, res) => {
  const token = req.header('token') as string;
  const uId = Number.parseInt(req.query.uId as string);
  res.json(userProfileV1(checkToken(token), uId));
});

app.get('/users/all/v2', (req, res) => {
  const token = req.header('token') as string;
  res.json(usersAllV1(token));
});

app.put('/user/profile/setname/v2', (req, res) => {
  const token = req.header('token') as string;
  const nameFirst = req.body.nameFirst as string;
  const nameLast = req.body.nameLast as string;
  res.json(userProfileSetnameV1(token, nameFirst, nameLast));
});

app.put('/user/profile/setemail/v2', (req, res) => {
  const token = req.header('token') as string;
  const email = req.body.email as string;
  res.json(userProfileSetemailV1(token, email));
});

app.put('/user/profile/sethandle/v2', (req, res) => {
  const token = req.header('token') as string;
  const handleStr = req.body.handleStr as string;
  res.json(userProfileSethandleV1(token, handleStr));
});
app.post('/message/pin/v1', (req, res) => {
  const token = req.header('token') as string;
  const { messageId } = req.body;
  res.json(messagePinV1(token, messageId));
});
app.post('/message/unpin/v1', (req, res) => {
  const token = req.header('token') as string;
  const { messageId } = req.body;

  res.json(messageUnPinV1(token, messageId));
});
app.post('/message/react/v1', (req, res) => {
  const token = req.header('token') as string;
  const messageId = req.body.messageId as number;
  const reactId = req.body.reactId as number;
  res.json(messageReactV1(token, messageId, reactId));
});
app.post('/message/unreact/v1', (req, res) => {
  const token = req.header('token') as string;
  const messageId = req.body.messageId as number;
  const reactId = req.body.reactId as number;
  res.json(messageUnreactV1(token, messageId, reactId));
});

app.get('/notifications/get/v1', (req, res) => {
  const token = req.header('token') as string;
  res.json(notificationGetV1(token));
});


app.use(errorHandler());
app.use(morgan('dev'));

// start server
const server = app.listen(PORT, HOST, () => {
  console.log(`⚡️ Server listening on port ${PORT} at ${HOST}`);
  loadData();
});

app.delete('/clear/v1', (req, res) => {
  res.json(clearV1());
});

const intervalId1 = setInterval(sentLaterMessages, 1000);
const intervalId2 = setInterval(sentLaterDms, 1000);

// For coverage, handle Ctrl+C gracefully
process.on('SIGINT', () => {
  resetTimeouts.map(x => {
    clearTimeout(x);
    resetTimeouts.splice(resetTimeouts.indexOf(x), 1);
    return x;
  });
  clearInterval(intervalId1);
  clearInterval(intervalId2);
  server.close(() => {
    console.log('Shutting down server gracefully.');
  });
});
