var mongoose = require('mongoose');

var Schema = mongoose.Schema;

var NftSchema = new Schema({
  title: { type: String, required: true },
  creator: { type: Schema.Types.ObjectId, ref: 'Creator', required: true },
  category: [{ type: Schema.Types.ObjectId, ref: 'Category', required: true }],
  price: { type: String, required: true },
  src: { type: String, required: true },
});

// Virtual for book's URL
NftSchema.virtual('url').get(function () {
  return '/marketplace/nft/' + this._id;
});

//Export model
module.exports = mongoose.model('Nft', NftSchema);
