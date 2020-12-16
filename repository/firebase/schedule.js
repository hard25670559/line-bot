const db = require('../../database/firebase');
const { objectToArray } = require('./util');

const schedules = db.ref('schedules');

async function create(schedule) {
  return new Promise((resolve, reject) => {
    try {
      schedules
        .push(schedule);
      resolve(true);
    } catch (err) {
      reject(new Error(err));
    }
  });
}

async function read() {
  const result = await schedules.get();
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
