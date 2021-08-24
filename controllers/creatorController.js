const Nft = require('../models/nft');
const Category = require('../models/category');
const Creator = require('../models/Creator');
const NftInstance = require('../models/nftInstance');

const async = require('async');

// Display list of all Authors.
exports.creator_list = function (req, res, next) {
  Creator.find()
    .sort([['name', 'ascending']])
    .exec(function (err, list_creators) {
      if (err) {
        return next(err);
      }
      //Successful, so render
      res.render('creator_list', {
        title: 'Creator List',
        creator_list: list_creators,
        layout: 'marketplace',
      });
    });
};

// Display detail page for a specific Creator.
exports.creator_detail = function (req, res, next) {
  async.parallel(
    {
      creator: function (callback) {
        Creator.findById(req.params.id).exec(callback);
      },
      creators_nfts: function (callback) {
        Nft.find({ creator: req.params.id }, 'src').exec(callback);
      },
    },
    function (err, results) {
      if (err) {
        return next(err);
      } // Error in API usage.
      if (results.creator == null) {
        // No results.
        var err = new Error('Creator not found');
        err.status = 404;
        return next(err);
      }
      // Successful, so render.
      res.render('creator_detail', {
        layout: 'marketplace',
        creator: results.creator,
        creator_nfts: results.creators_nfts,
      });
    }
  );
};
