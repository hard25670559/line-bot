const db = require('../../database/firebase');
const { objectToArray } = require('./util');

const errors = db.ref('error');

async function create(error) {
  return new Promise((resolve, reject) => {
    try {
      errors
        .push(error);
      resolve(true);
    } catch (err) {
      reject(new Error(err));
    }
  });
}

async function read() {
  const result = await errors.get();
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
