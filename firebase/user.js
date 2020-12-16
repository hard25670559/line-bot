const db = require('../database/index');

const users = db.get('users');

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
  return users;
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
