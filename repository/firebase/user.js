const db = require('../../database/firebase');
const { objectToArray } = require('./util');

const users = db.ref('users');

async function create(user) {
  return new Promise((resolve, reject) => {
    try {
      users
        .push(user)
        .write();
      resolve(true);
    } catch (err) {
      reject(new Error(err));
    }
  });
}

async function read() {
  const result = await users.get();
  const tmpData = result.val();
  const data = objectToArray(tmpData);
  return data;
}

async function update(id, user) {
  console.log(`update${id}`, user);
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
