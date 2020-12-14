const lowdb = require('lowdb');
const FileSync = require('lowdb/adapters/FileSync');
const lodashId = require('lodash-id');

const adapter = new FileSync('./db.json');
const db = lowdb(adapter);
db._.mixin(lodashId);

module.exports = db;
