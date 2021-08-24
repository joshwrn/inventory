var mongoose = require('mongoose');

var Schema = mongoose.Schema;

var CreatorSchema = new Schema({
  name: { type: String, required: true, maxLength: 100 },
});

// Virtual for author's full name
CreatorSchema.virtual('fullName').get(function () {
  return this.name;
});

// Virtual for author's URL
CreatorSchema.virtual('url').get(function () {
  return '/marketplace/creator/' + this._id;
});

//Export model
module.exports = mongoose.model('Creator', CreatorSchema);
