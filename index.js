const line = require('@line/bot-sdk');
const express = require('express');
const db = require('./database');

// const CHANNEL_ID = '1655375708';
const CHANNEL_SECRET = '25865e7590b48d8537ea17e6a91572c6';
const CHANNEL_ACCESS_TOKEN = 'hb1UpOscBOVIdHH4nri1WFvM4PZ++wjEWo0l42eXLoJJRtIqC5yUSRkcDuerA2nkR4zBVP8MTFWLIs0yHJ1PrukyfVHnU7n9+tjn3rjDvdHtFtf5GAKN0FoW8ywTjdJDlPzt7IAOR/BREXKDpUHejAdB04t89/1O/w1cDnyilFU=';

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

// event handler
function handleEvent(event) {
  if (event.type !== 'message' || event.message.type !== 'text') {
    // ignore non-text-message event
    return Promise.resolve(null);
  }

  // create a echoing text message
  const echo = { type: 'text', text: event.message.text };
  db.get('messages').push({
    ...event.message,
    token: event.replyToken,
  }).write();

  // use reply API
  return client.replyMessage(event.replyToken, echo);
}

// register a webhook handler with middleware
// about the middleware, please refer to doc
app.post('/callback', line.middleware(config), (req, res) => {
  Promise
    .all(req.body.events.map(handleEvent))
    .then((result) => res.json(result))
    .catch((err) => {
      console.error(err);
      res.status(500).end();
    });
});

app.get('/', (req, res) => {
  console.log(db.get('users'));
  res.json(db.get('users'));
});

// listen on port
const port = process.env.PORT || 3000;
app.listen(port, () => {
  console.log(`listening on http://localhost:${port}`);
});
