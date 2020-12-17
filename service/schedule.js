const schedule = require('node-schedule');
const { format } = require('date-fns');
const db = require('../repository/firebase');
const { sendMessage } = require('./line');

function shuffle(users) {
  return users.sort(() => Math.random() - 0.5);
}

async function addAlert(name, time) {
  const users = await db.user.read();
  const shuffleUsers = shuffle(users);
  shuffleUsers.forEach(async (user, index) => {
    await db.gift.create({
      giftNum: index,
      user,
      time: format(time, 'yyyy-MM-dd HH:mm:ss'),
    });
  });

  schedule.scheduleJob(name, time, async () => {
    const messageQueue = shuffleUsers
      .map((user, index) => sendMessage(user.userId, {
        type: 'text',
        text: `你低的禮物號碼是${index + 1}號，你要領取的禮物號碼是${index + 1}`,
      }));
    await Promise.all(messageQueue);
  });
  db.schedule.create({
    name,
    createAt: format(Date.now(), 'yyyy-MM-dd HH:mm:ss'),
    exeAt: format(time, 'yyyy-MM-dd HH:mm:ss'),
  });
}

module.exports = {
  addAlert,
};
