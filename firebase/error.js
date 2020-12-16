const db = require('../database/index');

const errors = db.get('errors');

async function create(error) {
  return new Promise((resolve, reject) => {
    try {
      errors
        .push(error)
        .write();
      resolve(true);
    } catch (err) {
      reject(new Error(err));
    }
  });
}

async function read() {
  return errors;
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
