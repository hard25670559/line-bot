const db = require('../../database/firebase');
const { objectToArray } = require('./util');

const errors = db.ref();

async function read() {
  const result = await errors.get();
  const tmpData = result.val();
  const data = objectToArray(tmpData);
  return data;
}

module.exports = {
  read,
};
