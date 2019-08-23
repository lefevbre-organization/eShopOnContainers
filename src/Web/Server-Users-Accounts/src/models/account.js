const mongoose = require('mongoose');
const { Schema } = mongoose;

const AccountSchema = new Schema({
    user: { type: String, required: true },
    provider: { type: String, required: true },
    email: { type: String, required: true },
    defaultAccount: { type: Boolean, required: true }
});

module.exports = mongoose.model('Account', AccountSchema);