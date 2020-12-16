const line = require('@line/bot-sdk');
const { format } = require('date-fns');
const { message, user, error } = require('../repository/firebase');
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

async function onFollow(event) {
  let active;
  try {
    const defMassage = { type: 'text', text: '夜露死苦' };
    active = await client.replyMessage(event.replyToken, defMassage);
    const { userId } = event.source;
    const profile = await client.getProfile(userId);
    await user.create(profile);
  } catch (err) {
    error.create({
      where: 'onFollow',
      err: err.message,
      time: format(Date.now(), 'yyyy-MM-dd HH:mm:ss'),
    });
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
    message.create({
      ...event.message,
      token: event.replyToken,
      source: event.source,
      time: format(event.timestamp, 'yyyy-MM-dd HH:mm:ss'),
    });
  } catch (err) {
    error.create({
      where: 'onMessage',
      err: err.message,
      time: format(Date.now(), 'yyyy-MM-dd HH:mm:ss'),
    });
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
    error.create({
      where: 'handleEvent',
      err: err.message,
      time: format(Date.now(), 'yyyy-MM-dd HH:mm:ss'),
    });
  }
  return active;
}

async function sendMessage(userId, messageData) {
  let result = {};
  try {
    result = await client.pushMessage(userId, messageData);
  } catch (err) {
    error.create({
      where: 'get/send',
      err: err.message,
      time: format(Date.now(), 'yyyy-MM-dd HH:mm:ss'),
    });
  }
  return result;
}

module.exports = {
  middleware: line.middleware(config),
  handleEvent,
  sendMessage,
};
