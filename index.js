const express = require('express');
const { format, addSeconds } = require('date-fns');
const {
  message, event, error, user,
} = require('./repository/firebase');
const firebaseRoot = require('./repository/firebase/data');
const { handleEvent, middleware, sendMessage } = require('./service/line');
const { addAlert, shuffle } = require('./service/schedule');
require('dotenv').config();

// create Express app
// about Express itself: https://expressjs.com/
const app = express();

// register a webhook handler with middleware
// about the middleware, please refer to doc
app.post('/callback', middleware, async (req, res) => {
  try {
    event.create({
      headers: req.headers,
      body: req.body,
    });
  } catch (err) {
    error.create({
      where: 'post/callback.write request',
      err: err.message,
      time: format(Date.now(), 'yyyy-MM-dd HH:mm:ss'),
    });
  }

  try {
    const result = await Promise.all(req.body.events.map(handleEvent));
    res.json(result);
  } catch (err) {
    error.create({
      where: 'post/callback',
      err: err.message,
      time: format(Date.now(), 'yyyy-MM-dd HH:mm:ss'),
    });
    res.status(500).end();
  }
});

app.get('/data', async (req, res) => {
  const data = await firebaseRoot.read();
  res.json(data);
});
app.get('/users', async (req, res) => {
  const users = await user.read();
  res.json(users);
});
app.get('/messages', async (req, res) => {
  const data = await message.read();
  res.json(data);
});
app.get('/events', async (req, res) => {
  const events = await event.read();
  res.json(events);
});
app.get('/errors', async (req, res) => {
  const errors = await error.read();
  res.json(errors);
});
// app.get('/schedules', async (req, res) => {
//   const schedules = await schedule
// })
app.get('/test', async (req, res) => {
  try {
    await addAlert('sendAlert', addSeconds(Date.now(), 5));
  } catch (err) {
    await error.create({
      where: 'onFollow',
      err: err.message,
      time: format(Date.now(), 'yyyy-MM-dd HH:mm:ss'),
    });
    console.log('error');
  }

  res.sendStatus(200).end();
});

app.get('/shuffle', async (req, res) => {
  const users = await user.read();
  const shuffleUsers = shuffle(users);
  res.json(shuffleUsers);
});

app.get('/tel', (req, res) => {
  res.send(`<!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Document</title>
    </head>
    <body>
      <a href="tel:0425670559">Tel</a>
    </body>
    </html>`);
});

app.get('/', (req, res) => {
  res.json(process.env);
});

app.get('/send', async (req, res) => {
  let code = 200;
  try {
    await sendMessage(req.query.userId
      ? req.query.userId : 'U6b133b78a90a1731a89e122fcc35d5e5', {
      type: 'text',
      text: req.query.message ? req.query.message : '安安',
    });
    code = 200;
  } catch (err) {
    console.log('err', err);
    await error.create({
      where: 'get/send',
      err: err.message,
      time: format(Date.now(), 'yyyy-MM-dd HH:mm:ss'),
    });
    code = 500;
  }
  res.status(code).end();
});

// listen on port
const port = process.env.PORT || 3000;
app.listen(port, () => {
  console.log(`listening on http://localhost:${port}`);
});
