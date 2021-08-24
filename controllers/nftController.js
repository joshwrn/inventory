const Nft = require('../models/nft');
const Category = require('../models/category');
const Creator = require('../models/Creator');
const NftInstance = require('../models/nftInstance');
const { body, validationResult } = require('express-validator');

const async = require('async');

//+ Marketplace page
exports.index = function (req, res) {
  async.parallel(
    {
      nfts: function (callback) {
        Nft.find({}, 'src').exec(callback);
      },
    },
    function (err, results) {
      //Successful, so render
      res.render('nft_list', { title: 'Marketplace', data: results, layout: 'marketplace' });
    }
  );
};

//+ Display detail page for a specific book.
exports.nft_detail = function (req, res, next) {
  async.parallel(
    {
      nft: function (callback) {
        Nft.findById(req.params.id).populate('creator').populate('category').exec(callback);
      },
      nft_instance: function (callback) {
        NftInstance.find({ nft: req.params.id, status: 'Available' }).exec(callback);
      },
    },
    function (err, results) {
      if (err) {
        return next(err);
      }
      if (results.nft == null) {
        // No results.
        var err = new Error('Nft not found');
        err.status = 404;
        return next(err);
      }
      // Successful, so render.
      res.render('nft_detail', {
        nft: results.nft,
        nft_delete: results.nft.url + '/delete',
        nft_buy: results.nft.url + '/buy',
        layout: 'marketplace',
        nft_instance: results.nft_instance,
        category: results.nft.category[0],
      });
    }
  );
};

//+ available page
exports.available = function (req, res) {
  async.parallel(
    {
      nfts: function (callback) {
        NftInstance.find({ status: 'Available' }).populate('nft').exec(callback);
      },
    },
    function (err, results) {
      console.log('cool');
      //Successful, so render
      res.render('available_list', { title: 'available', data: results, layout: 'marketplace' });
    }
  );
};

//$ NFT form
//+ Get form

exports.nft_create_get = function (req, res, next) {
  async.parallel(
    {
      creators: function (callback) {
        Creator.find(callback);
      },
      category: function (callback) {
        Category.find(callback);
      },
    },
    function (err, results) {
      if (err) {
        return next(err);
      }
      res.render('nft_form', {
        title: 'Create NFT',
      });
    }
  );
};

//+ Post form

//+ Handle book create on POST.
exports.nft_create_post = [
  // Convert the genre to an array.
  (req, res, next) => {
    if (!(req.body.category instanceof Array)) {
      if (typeof req.body.category === 'undefined') req.body.category = [];
      else req.body.category = new Array(req.body.category);
    }
    next();
  },
  // Validate and sanitise fields.
  body('title', 'Title must not be empty.').trim().isLength({ min: 1 }).escape(),
  body('creator', 'Author must not be empty.').trim().isLength({ min: 1 }).escape(),
  body('category', 'Summary must not be empty.').trim().isLength({ min: 1 }).escape(),
  body('price', 'ISBN must not be empty').trim().isLength({ min: 1 }).escape(),
  body('src', 'src must not be empty').trim().isLength({ min: 1 }),

  // Process request after validation and sanitization.
  async (req, res, next) => {
    console.log(req.body);
    // Extract the validation errors from a request.
    const errors = validationResult(req);

    let creatorObj = await Creator.findOne({ name: req.body.creator }).exec();
    let catObj = await Category.findOne({ name: req.body.category }).exec();

    console.log('category before', catObj);

    //$ if there isn't a category or creator create a new one now.

    if (creatorObj === null) {
      const newCreator = new Creator({
        name: req.body.creator,
      });

      await newCreator.save();
      creatorObj = await Creator.findOne({ name: req.body.creator }).exec();
    }

    if (catObj === null) {
      const newCategory = new Category({
        name: req.body.category,
      });

      await newCategory.save();
      catObj = await Category.findOne({ name: req.body.category }).exec();
    }

    console.log('category after', catObj);

    // Create a Book object with escaped and trimmed data.
    var nft = new Nft({
      title: req.body.title,
      creator: creatorObj,
      category: catObj,
      price: req.body.price,
      src: req.body.src,
    });

    if (!errors.isEmpty()) {
      // There are errors. Render form again with sanitized values/error messages.

      // Get all creators and categories for form.
      async.parallel(function (err, results) {
        if (err) {
          return next(err);
        }

        res.render('nft_form', {
          title: 'Create NFT',
          nft: nft,
          errors: errors.array(),
        });
      });
      return;
    } else {
      // Data from form is valid. Save book.
      await nft.save();

      //create instance for nft
      const newInstance = new NftInstance({
        nft: nft,
        status: 'Available',
      });

      await newInstance.save();

      // redirect to new nft page
      res.redirect(nft.url);
    }
  },
];

//+ Display book delete form on GET.
exports.nft_delete_get = function (req, res, next) {
  // Successful, so render.
  res.render('nft_delete', {
    title: 'Delete Book',
  });
};

//+ Handle nft delete on POST.
exports.nft_delete_post = async function (req, res, next) {
  // Assume the post has valid id (ie no validation/sanitization).

  const nft = await Nft.findById(req.params.id).populate('creator').populate('category').exec();

  const nft_instance = await NftInstance.findOne({ nft: req.params.id }).exec();

  console.log(nft);

  if (nft_instance) {
    await NftInstance.findByIdAndRemove(nft_instance.id);
  }

  await Nft.findByIdAndRemove(nft.id);

  res.redirect('/marketplace');
};

//$ UPDATE

//+ get update form
exports.nft_buy_get = function (req, res, next) {
  // Successful, so render.
  res.render('nft_buy', {
    title: 'Buy Book',
  });
};

//+ Handle book update on POST.
exports.nft_buy_post = async function (req, res, next) {
  await NftInstance.findOneAndUpdate({ nft: req.params.id }, { status: 'Sold' });
  res.redirect('/marketplace');
};
