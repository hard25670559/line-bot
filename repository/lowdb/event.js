const db = require('../../database/index');

const events = db.get('events');

async function create(event) {
  return new Promise((resolve, reject) => {
    try {
      events
        .push(event)
        .write();
      resolve(true);
    } catch (err) {
      reject(new Error(err));
    }
  });
}

async function read() {
  return new Promise((resolve, reject) => {
    try {
      resolve(events);
    } catch (err) {
      reject(new Error(err));
    }
  });
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
