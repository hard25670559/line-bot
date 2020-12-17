const db = require('../repository/firebase');

function shuffle(users) {
  return users.sort(() => Math.random() - 0.5);
}

function getRandom(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

async function shuffleGift() {
  const users = await db.user.read();
  const userContainer = users.map((user) => user.userId);

  const shuffleUsers = shuffle(users);
  const giftsTmp = shuffleUsers.map((user, index) => {
    const userTmpContainer = userContainer
      .filter((userTmp) => userTmp !== user.userId);
    const toIndex = getRandom(0, userTmpContainer.length - 1);
    const toUserId = userTmpContainer[toIndex];
    userContainer.splice(userContainer.indexOf(toUserId), 1);
    return {
      ownerGift: index,
      owner: user.userId,
      to: toUserId,
    };
  });

  const gifts = giftsTmp.map((gift) => {
    const { ownerGift } = giftsTmp.find((tmp) => gift.to === tmp.owner);
    console.log('test', ownerGift);
    return db.gift.create({
      ...gift,
      toGift: ownerGift,
    });
  });

  await Promise.all(gifts);
}

async function shuffleResult() {
  const gifts = await db.gift.read();
  const users = await db.user.read();
  const result = gifts.map((gift) => {
    const toUser = users.find((user) => user.fid === gift.to);
    const fromUser = users.find((user) => user.fid === gift.owner);
    return {
      to: toUser,
      from: fromUser,
      ownerGiftNum: gift.ownerGiftNum,
      toGiftNum: gift.toGiftNum,
    };
  });
  return result;
}

module.exports = {
  shuffleGift,
};
