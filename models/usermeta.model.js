const mongoose = require('mongoose');

// user schema
const userMetaSchema = new mongoose.Schema(
  {
    umeta_id: {
      type: String,
    },
    user_id: {
      type: String
    },
    meta_key: {
      type: String
    },
    meta_value: {
      type: String
    }
  }
);

module.exports = mongoose.model('UserMeta', userMetaSchema);
