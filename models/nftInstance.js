var mongoose = require('mongoose');

var Schema = mongoose.Schema;

var NftInstanceSchema = new Schema({
  nft: { type: Schema.Types.ObjectId, ref: 'Nft', required: true }, //reference to the associated nft
  status: {
    type: String,
    required: true,
    enum: ['Available', 'Sold'],
    default: 'Available',
  },
});

// Virtual for bookinstance's URL
NftInstanceSchema.virtual('url').get(function () {
  return '/marketplace/nftinstance/' + this._id;
});

//Export model
module.exports = mongoose.model('NftInstance', NftInstanceSchema);
