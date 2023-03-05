import express from 'express';
import { echo } from './echo';
import morgan from 'morgan';
import cors from 'cors';
import config from './config.json';
import { clearV1 } from './other';
import { authLoginV1, authRegisterV1 } from './auth';
import { channelDetailsV1, channelJoinV1,channelMessagesV2 } from './channel';
import { channelsCreateV1, channelsListallV1, channelsListV1 } from './channels';
import { dmCreate, dmList, dmRemove, dmDetails, dmLeave, dmMessagesV1 } from './dm';
import { generateToken, getIdFromEmail, invalidateToken, checkToken } from './helpers';
import { loadData } from './dataStore';
import { messageSendDmV1, messageEditV1, messageRemoveV1, messageSendV1 } from './message';

// Set up web app, use JSON
const app = express();
app.use(cors());
app.use(express.json());

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


// for logging errors
app.use(morgan('dev'));

// start server
app.listen(PORT, HOST, () => {
  console.log(`⚡️ Server listening on port ${PORT} at ${HOST}`);
  loadData();
});

app.delete('/clear/v1', (req, res) => {
  res.json(clearV1());
});

app.post('/auth/register/v2', (req, res) => {
  const { email, password, nameFirst, nameLast } = req.body;
  const result = authRegisterV1(email, password, nameFirst, nameLast);
  const key: string[] = Object.keys(result);
  if (key.includes('error')) {
    res.json({ error: 'error' });
  } else {
    const id: number = getIdFromEmail(email);
    const token = generateToken(id);
    res.json({
      token: token,
      authUserId: id
    });
  }
});

app.post('/auth/login/v2', (req, res) => {
  const { email, password } = req.body;
  const result = authLoginV1(email, password);
  const key: string[] = Object.keys(result);
  if (key.includes('error')) {
    res.json({ error: 'error' });
  } else {
    const id: number = getIdFromEmail(email);
    const token = generateToken(id);
    res.json({
      token: token,
      authUserId: id
    });
  }
});

app.post('/auth/logout/v1', (req, res) => {
  const { token } = req.body;
  invalidateToken(token);
  res.json({});
});

app.post('/dm/create/v1', (req, res) => {
  const { token, uIds } = req.body;
  res.json(dmCreate(token, uIds));
});

app.get('/dm/list/v1', (req, res) => {
  const token: string = req.query.token as string;
  res.json(dmList(token));
});

app.delete('/dm/remove/v1', (req, res) => {
  res.json(dmRemove(req.query.token as string, parseInt(req.query.dmId as string)));
});

app.get('/dm/details/v1', (req, res) => {
  res.json(dmDetails(req.query.token as string, parseInt(req.query.dmId as string)));
});

app.post('/dm/leave/v1', (req, res) => {
  const { token, dmId } = req.body;
  res.json(dmLeave(token, dmId));
});
app.post('/channels/create/v2', (req, res) => {
  const { token, name, isPublic } = req.body;
  res.json(channelsCreateV1(checkToken(token), name, isPublic));
});
app.post('/channel/join/v2', (req, res) => {
  const { token, channelId } = req.body;
  channelJoinV1(checkToken(token), channelId);
  res.json({});
});
app.get('/channel/details/v2', (req, res) => {
  const token = req.query.token as string;
  const Id = req.query.channelId as string;
  const channelId = Number.parseInt(Id);
  res.json(channelDetailsV1(checkToken(token), channelId));
});
app.get('/channels/listall/v2', (req, res) => {
  const token = req.query.token as string;
  res.json(channelsListallV1(checkToken(token)));
});
app.get('/channels/list/v2', (req, res) => {
  const token = req.query.token as string;
  res.json(channelsListV1(checkToken(token)));
});

app.post('/message/send/v1', (req, res) => {
  const { token, channelId, message } = req.body;
  res.json(messageSendV1(token, channelId, message));
});

app.put('/message/edit/v1', (req, res) => {
  const { token, messageId, message } = req.body;
  res.json(messageEditV1(token, messageId, message));
});

app.delete('/message/remove/v1', (req, res) => {
  const token = req.query.token as string;
  const messageId = parseInt(req.query.messageId as string);
  res.json(messageRemoveV1(token, messageId));
});
app.post('/message/senddm/v1', (req, res) => {
  const { token, dmId, message } = req.body;
  res.json(messageSendDmV1(token, dmId, message));
});
app.get('/dm/messages/v1', (req, res) => {
  const token = req.query.token as string;
  const dmId = parseInt(req.query.dmId as string);
  const start = parseInt(req.query.start as string);
  console.log("debug", dmId);
  res.json(dmMessagesV1(token,dmId,start));
});
app.get('/channel/messages/v2', (req, res) => {
  const token = req.query.token as string;
  const channelId = parseInt(req.query.channelId as string);
  const start = parseInt(req.query.start as string);
  res.json(channelMessagesV2(token,channelId,start));
});
