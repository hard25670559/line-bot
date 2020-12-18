const express = require('express');
// const bodyParser = require('body-parser');
const { format, addSeconds } = require('date-fns');
const {
  message, event, error, user, schedule, gift,
} = require('./repository/firebase');
const firebaseRoot = require('./repository/firebase/data');
const { handleEvent, middleware, sendMessage } = require('./service/line');
const { notifyGift } = require('./service/schedule');
require('dotenv').config();

// create Express app
// about Express itself: https://expressjs.com/
const app = express();
// app.use(bodyParser.json());
// app.use(bodyParser.urlencoded({ extended: false }));

// register a webhook handler with middleware
// about the middleware, please refer to doc
app.post('/callback', middleware, async (req, res) => {
  try {
    await event.create({
      headers: req.headers,
      body: req.body,
    });
  } catch (err) {
    await error.create({
      where: 'post/callback.write request',
      err: err.message,
      time: format(Date.now(), 'yyyy-MM-dd HH:mm:ss'),
    });
  }

  try {
    const result = await Promise.all(req.body.events.map(handleEvent));
    res.json(result);
  } catch (err) {
    await error.create({
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
app.get('/schedules', async (req, res) => {
  const schedules = await schedule.read();
  res.json(schedules);
});
app.get('/gifts', async (req, res) => {
  const gifts = await gift.read();
  res.json(gifts);
});

// app.get('/test', async (req, res) => {
//   try {
//     await giftGiving();
//     res.json(result);
//   } catch (err) {
//     await error.create({
//       where: '/test',
//       err: err.message,
//       time: format(Date.now(), 'yyyy-MM-dd HH:mm:ss'),
//     });
//     console.log('error');
//     res.status(500).end();
//   }
// });

app.get('/shuffle', async (req, res) => {
  try {
    await notifyGift('齁齁齁齁～', addSeconds(Date.now(), 5));
    res.status(200).end();
  } catch (err) {
    await error.create({
      where: '/shuffle',
      err: err.message,
      time: format(Date.now(), 'yyyy-MM-dd HH:mm:ss'),
    });
    console.log('error');
    res.status(500).end();
  }
});

app.get('/env', (req, res) => {
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
const port = process.env.PORT || 4000;
app.listen(port, () => {
  console.log(`listening on http://localhost:${port}`);
});
