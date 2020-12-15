const line = require('@line/bot-sdk');
const express = require('express');
const { format } = require('date-fns');
const db = require('./database');
require('dotenv').config();

// const CHANNEL_ID = '1655375708';
const { CHANNEL_SECRET } = process.env;
const { CHANNEL_ACCESS_TOKEN } = process.env;

// create LINE SDK config from env variables
const config = {
  channelAccessToken: CHANNEL_ACCESS_TOKEN,
  channelSecret: CHANNEL_SECRET,
};

// create LINE SDK client
const client = new line.Client(config);

// create Express app
// about Express itself: https://expressjs.com/
const app = express();

async function onFollow(event) {
  let active;
  try {
    const defMassage = { type: 'text', text: '夜露死苦' };
    active = await client.replyMessage(event.replyToken, defMassage);
    const { userId } = event.source;
    const profile = await client.getProfile(userId);
    db.get('users').push(profile).write();
  } catch (err) {
    db.get('errors')
      .push({
        where: 'onFollow',
        err,
        time: format(Date.now(), 'yyyy-MM-dd HH:mm:ss'),
      })
      .write();
    active = Promise.resolve(null);
  }
  return active;
}

async function onMessage(event) {
  let active;
  try {
    const replyMessage = { type: 'text', text: '我機器人，跨模辣!' };
    if (event.message.type === 'text') {
      replyMessage.text = event.message.text;
    }
    active = await client.replyMessage(event.replyToken, replyMessage);
    db.get('messages').push({
      ...event.message,
      token: event.replyToken,
      source: event.source,
      time: format(event.timestamp, 'yyyy-MM-dd HH:mm:ss'),
    }).write();
  } catch (err) {
    db.get('errors')
      .push({
        where: 'onMessage',
        err,
        time: format(Date.now(), 'yyyy-MM-dd HH:mm:ss'),
      })
      .write();
    active = Promise.resolve(null);
  }

  return active;
}

// event handler
async function handleEvent(event) {
  let active = Promise.resolve(null);
  try {
    switch (event.type) {
      case 'follow':
        onFollow(event);
        break;
      case 'message':
        onMessage(event);
        break;
      default:
        break;
    }
  } catch (err) {
    active = Promise.resolve(null);
    db.get('errors')
      .push({
        where: 'handleEvent',
        err,
        time: format(Date.now(), 'yyyy-MM-dd HH:mm:ss'),
      })
      .write();
  }
  return active;
}

// register a webhook handler with middleware
// about the middleware, please refer to doc
app.post('/callback', line.middleware(config), async (req, res) => {
  db.get('events')
    .push(req.body.events)
    .write();

  try {
    const result = await Promise.all(req.body.events.map(handleEvent));
    res.json(result);
  } catch (err) {
    db.get('errors')
      .push({
        where: 'post/callback',
        err,
        time: format(Date.now(), 'yyyy-MM-dd HH:mm:ss'),
      })
      .write();
    res.status(500).end();
  }
});

app.get('/data', (req, res) => {
  res.json(db);
});
app.get('/users', (req, res) => {
  res.json(db.get('users'));
});
app.get('/messages', (req, res) => {
  res.json(db.get('messages'));
});
app.get('/events', (req, res) => {
  res.json(db.get('events'));
});
app.get('/count', (req, res) => {
  res.json(db.get('count'));
});
app.get('/resp', (req, res) => {
  res.json(db.get('resp'));
});
app.get('/errors', (req, res) => {
  res.json(db.get('errors'));
});
app.get('/test', (req, res) => {
  const cols = db.map((value, name) => name);
  res.json(cols);
});

app.get('/', (req, res) => {
  res.json(process.env);
});
app.get('/send', async (req, res) => {
  try {
    const result = await client
      .pushMessage(req.query.userId
        ? req.query.userId : 'U6b133b78a90a1731a89e122fcc35d5e5', {
        type: 'text',
        text: req.query.message ? req.query.message : '安安',
      });
    res.json(result);
  } catch (err) {
    db.get('errors')
      .push({
        where: 'get/send',
        err,
        time: format(Date.now(), 'yyyy-MM-dd HH:mm:ss'),
      })
      .write();
    res.status(500).end();
  }
});

// listen on port
const port = process.env.PORT || 3000;
app.listen(port, () => {
  console.log(`listening on http://localhost:${port}`);
});
