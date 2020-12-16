const schedule = require('node-schedule');
const db = require('../repository/firebase');
const { sendMessage } = require('./line');

async function addAlert(name, time) {
  const users = await db.user.read();

  schedule.scheduleJob(name, time, () => {
    users.forEach((user) => {
      sendMessage(user.userId, {
        type: 'text',
        text: '安安',
      });
    });
    console.log(users);
  });
  db.schedule.create({
    name,
    time,
  });
}

module.exports = {
  addAlert,
};
