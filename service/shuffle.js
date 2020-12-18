const { format } = require('date-fns');
const db = require('../repository/firebase');

function shuffle(users) {
  return users.sort(() => Math.random() - 0.5);
}

// 取得min ~ max之間的數值，包含min & max
function getRandom(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

// 先將禮物給上編號，並且記錄擁有者是誰
function giveGiftTag(users) {
  return shuffle(users)
    .map((user, index) => ({
      owner: user.userId,
      tag: index,
    }));
}

function shuffleGift(gifts) {
  const giftTags = gifts.map((gift) => gift.tag);
  const usedTags = [];
  return gifts.map((gift) => {
    const tags = giftTags
      // 排除已被挑選的禮物
      .filter((tag) => !usedTags.includes(tag))
      // 排除自己的禮物
      .filter((tag) => tag !== gift.tag);

    const tag = tags[getRandom(0, tags.length - 1)];
    usedTags.push(tag);
    return {
      ...gift,
      take: tag,
    };
  });
}

// 決定參加者要拿哪一個編號的禮物
async function giftGiving() {
  await db.gift.clean();
  const users = await db.user.read();
  const gifts = giveGiftTag(users);
  let result = [];
  do {
    result = shuffleGift(gifts);
  } while (!result[result.length - 1].take);

  console.clear();
  console.log(`-----------------------------${format(Date.now(), 'yyyy-MM-dd HH:mm:ss')}-----------------------------`);
  console.log(result);

  const task = result.map((data) => db.gift.create(data));
  await Promise.all(task);
}

module.exports = {
  giftGiving,
};
