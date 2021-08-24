const Nft = require('../models/nft');
const Category = require('../models/category');
const Creator = require('../models/Creator');
const NftInstance = require('../models/nftInstance');

const async = require('async');

//@ list of categories
exports.category_list = function (req, res, next) {
  Category.find()
    .sort([['name', 'ascending']])
    .exec(function (err, list_categories) {
      if (err) {
        return next(err);
      }
      //Successful, so render
      res.render('category_list', {
        title: 'category List',
        layout: 'marketplace',
        category_list: list_categories,
      });
    });
};

//@ Category details
exports.category_detail = function (req, res, next) {
  async.parallel(
    {
      category: function (callback) {
        Category.findById(req.params.id).exec(callback);
      },

      category_nfts: function (callback) {
        Nft.find({ category: req.params.id }).exec(callback);
      },
    },
    function (err, results) {
      if (err) {
        return next(err);
      }
      if (results.category == null) {
        // No results.
        var err = new Error('category not found');
        err.status = 404;
        return next(err);
      }
      // Successful, so render
      res.render('category_detail', {
        title: 'category Detail',
        layout: 'marketplace',
        category: results.category,
        category_nfts: results.category_nfts,
      });
    }
  );
};
