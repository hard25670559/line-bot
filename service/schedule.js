const schedule = require('node-schedule');
const { format } = require('date-fns');
const db = require('../repository/firebase');
const { sendMessage } = require('./line');
const { giftGiving } = require('./shuffle');

async function notifyGift(name, time) {
  await giftGiving();
  const gifts = await db.gift.read();

  schedule.scheduleJob(name, time, async () => {
    const messageQueue = gifts
      .map((gift) => sendMessage(gift.owner, {
        type: 'text',
        text: `你低的禮物號碼是${gift.tag + 1}號，你要領取的禮物號碼是${gift.take + 1}號`,
      }));
    await Promise.all(messageQueue);
  });
  await db.schedule.create({
    name,
    createAt: format(Date.now(), 'yyyy-MM-dd HH:mm:ss'),
    exeAt: format(time, 'yyyy-MM-dd HH:mm:ss'),
  });
}

module.exports = {
  notifyGift,
};
