const line = require('@line/bot-sdk');
const express = require('express');
const { format } = require('date-fns');
const { text } = require('body-parser');
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
  const defMassage = { type: 'text', text: '夜露死苦' };
  const active = await client.replyMessage(event.replyToken, defMassage);
  const userId = event.source;
  const profile = await client.getProfile(userId);
  db.get('users').push(profile).write();
  return active;
}

async function onMessage(event) {
  const replyMessage = { type: 'text', text: '我機器人，跨模辣!' };
  if (event.message.type === 'text') {
    replyMessage.text = event.message.text;
  }
  const active = await client.replyMessage(event.replyToken, replyMessage);
  db.get('messages').push({
    ...event.message,
    token: event.replyToken,
    source: event.source,
    time: format(event.timestamp, 'yyyy-MM-dd HH:mm:ss'),
  }).write();

  return active;
}

// event handler
async function handleEvent(event) {
  let active = Promise.resolve(null);
  try {
    active = {
      follow: onFollow,
      message: onMessage,
    }(event.type)(event);
  } catch (err) {
    active = Promise.resolve(null);
    db.get('errors')
      .push({
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

// listen on port
const port = process.env.PORT || 3000;
app.listen(port, () => {
  console.log(`listening on http://localhost:${port}`);
});
