const db = require('../../database/firebase');
const { objectToArray } = require('./util');

const events = db.ref('events');

async function create(event) {
  return new Promise((resolve, reject) => {
    try {
      events
        .push(event);
      resolve(true);
    } catch (err) {
      reject(new Error(err));
    }
  });
}

async function read() {
  const result = await events.get();
  const tmpData = result.val();
  const data = objectToArray(tmpData);
  return data;
}

async function update(id, event) {
  console.log(`update${id}`, event);
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
