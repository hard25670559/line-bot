const db = require('../database/firebase');
const { objectToArray } = require('../service/firebase');

const messages = db.ref('messages');

async function create(message) {
  return new Promise((resolve, reject) => {
    try {
      messages
        .push(message);
      resolve(true);
    } catch (err) {
      reject(new Error(err));
    }
  });
}

async function read() {
  const result = await messages.get();
  const tmpData = result.val();
  const data = objectToArray(tmpData);
  return data;
}

async function update(id, message) {
  console.log(`update${id}`, message);
  return true;
}

async function del(id) {
  console.log('del', id);
  return true;
}

module.exports = {
  create,
  read,
  update,
  del,
};
