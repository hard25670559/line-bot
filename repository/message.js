const db = require('../database/index');

const messages = db.get('messages');

async function create(message) {
  return new Promise((resolve, reject) => {
    try {
      messages
        .push(message)
        .write();
      resolve(true);
    } catch (err) {
      reject(new Error(err));
    }
  });
}

async function read() {
  return messages;
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
