const admin = require('firebase-admin');
const serviceAccount = require('../hard-xams-line-bot-firebase-adminsdk-g7cfn-d4d2a020d0.json');
require('dotenv').config();

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  databaseURL: process.env.DATABASE_URL,
});

module.exports = admin.database();
