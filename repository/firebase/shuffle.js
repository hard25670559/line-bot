const db = require('../../database/firebase');
const { objectToArray } = require('./util');

const shuffles = db.ref('shuffles');

async function create(shuffle) {
  return new Promise((resolve, reject) => {
    try {
      shuffles
        .push(shuffle);
      resolve(true);
    } catch (err) {
      reject(new Error(err));
    }
  });
}

async function read() {
  const result = await shuffles.get();
  const tmpData = result.val();
  const data = objectToArray(tmpData);
  return data;
}

async function update(id, shuffle) {
  console.log(`update${id}`, shuffle);
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
