const schedule = require('node-schedule');
const db = require('../repository/firebase');
const { sendMessage } = require('./line');

function shuffle(users) {
  return users.sort(() => Math.random() - 0.5);
}

async function addAlert(name, time) {
  const users = await db.user.read();
  const shuffleUsers = shuffle(users);

  schedule.scheduleJob(name, time, async () => {
    const messageQueue = shuffleUsers
      .map((user, index) => sendMessage(user.userId, {
        type: 'text',
        text: `安安，您的籤號是${index + 1}號`,
      }));
    await Promise.all(messageQueue);
  });
  db.schedule.create({
    name,
    time,
  });
}

module.exports = {
  addAlert,
  shuffle,
};
