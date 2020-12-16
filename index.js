const express = require('express');
const { format } = require('date-fns');
const admin = require('firebase-admin');
const serviceAccount = require('./hard-xams-line-bot-firebase-adminsdk-g7cfn-d4d2a020d0.json');
const db = require('./database');
const { user, error } = require('./repository');
const { handleEvent, middleware, sendMessage } = require('./service/line');
require('dotenv').config();

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  databaseURL: process.env.DATABASE_URL,
});

const fdb = admin.database();
// create Express app
// about Express itself: https://expressjs.com/
const app = express();

// register a webhook handler with middleware
// about the middleware, please refer to doc
app.post('/callback', middleware, async (req, res) => {
  try {
    db.get('events')
      .push({
        headers: req.headers,
        body: req.body,
      })
      .write();
  } catch (err) {
    error.create({
      where: 'post/callback.write request',
      err,
      time: format(Date.now(), 'yyyy-MM-dd HH:mm:ss'),
    });
  }

  try {
    const result = await Promise.all(req.body.events.map(handleEvent));
    res.json(result);
  } catch (err) {
    error.create({
      where: 'post/callback',
      err,
      time: format(Date.now(), 'yyyy-MM-dd HH:mm:ss'),
    });
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
app.get('/test', async (req, res) => {
  try {
    const status = await user.create({ name: 'test' });
    console.log(status);
  } catch (err) {
    console.log(err);
  }

  res.sendStatus(200).end();
});

app.get('/', (req, res) => {
  res.json(process.env);
});

app.get('/send', async (req, res) => {
  try {
    sendMessage(req.query.userId
      ? req.query.userId : 'U6b133b78a90a1731a89e122fcc35d5e5', {
      type: 'text',
      text: req.query.message ? req.query.message : '安安',
    });
    res.status(200).end();
  } catch (err) {
    error.create({
      where: 'get/send',
      err,
      time: format(Date.now(), 'yyyy-MM-dd HH:mm:ss'),
    });
    res.status(500).end();
  }
});

app.get('/firebase', async (req, res) => {
  console.clear();
  try {
    await fdb.ref('abc').push({
      title: 'todo 1',
      time: format(Date.now(), 'yyyy-MM-dd HH:mm:ss'),
    });

    fdb.ref().once('value', (snapshot) => {
      console.log(snapshot.val());
    });
  } catch (err) {
    console.log(err);
  }
  res.sendStatus(200).end();
});

// listen on port
const port = process.env.PORT || 3000;
app.listen(port, () => {
  console.log(`listening on http://localhost:${port}`);
});
