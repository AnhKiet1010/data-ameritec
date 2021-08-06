const mongoose = require('mongoose');

// user schema
const userInfoSchema = new mongoose.Schema(
  {
    oldid: {
      type: String
    },
    user_registered: {
      type: String
    },
    user_login: {
      type: String
    },
    user_pass: {
      type: String
    },
    user_email: {
      type: String
    },
    user_nicename: {
      type: String
    },
    user_url: {
      type: String
    },
    user_activation_key: {
      type: String
    },
    user_status: {
      type: String
    },
    display_name: {
      type: String
    },
  }
);

module.exports = mongoose.model('UserInfo', userInfoSchema);
