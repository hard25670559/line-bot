const db = require('../../database/firebase');
const { objectToArray } = require('./util');

const gifts = db.ref('gifts');

async function create(gift) {
  return new Promise((resolve) => {
    gifts
      .push(gift);
    resolve(true);
  });
}

async function read() {
  const result = await gifts.get();
  const tmpData = result.val();
  const data = objectToArray(tmpData);
  return data;
}

// "Reference.update failed:
// First argument  must be an object containing the children to replace."
async function update(id, gift) {
  await gifts.child(id).update(gift);
}

async function del(id) {
  console.log('del', id);
  return true;
}

async function clean() {
  await gifts.remove();
}

module.exports = {
  create,
  read,
  update,
  del,
  clean,
};
