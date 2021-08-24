var express = require('express');
var router = express.Router();

const nft_controller = require('../controllers/nftController');
const creator_controller = require('../controllers/creatorController');
const category_controller = require('../controllers/categoryController');
const nftInstance_controller = require('../controllers/nftInstanceController');

//@ home page
/* GET home page. */
router.get('/', function (req, res, next) {
  res.render('index', { title: 'Express' });
});

//@ NFTs
//+ GET request for creating a Book. NOTE This must come before routes that display Book (uses id).
router.get('/create', nft_controller.nft_create_get);

//+ POST request for creating Book.
router.post('/create', nft_controller.nft_create_post);

//* GET request to delete Book.
router.get('/marketplace/nft/:id/delete', nft_controller.nft_delete_get);

//* POST request to delete Book.
router.post('/marketplace/nft/:id/delete', nft_controller.nft_delete_post);

//$ GET request to delete Book.
router.get('/marketplace/nft/:id/buy', nft_controller.nft_buy_get);

//$ POST request to delete Book.
router.post('/marketplace/nft/:id/buy', nft_controller.nft_buy_post);

//# GET nft list.
router.get('/marketplace', nft_controller.index);

//# GET request for one nft.
router.get('/marketplace/nft/:id', nft_controller.nft_detail);

//@ Available

// GET nft list.
router.get('/marketplace/available', nft_controller.available);

//@ Creators
// GET request for one creator.
router.get('/marketplace/creator/:id', creator_controller.creator_detail);

// GET request for list of all creators.
router.get('/marketplace/creators', creator_controller.creator_list);

//@ Categories

// GET request for one category.
router.get('/marketplace/category/:id', category_controller.category_detail);

// GET request for list of all categories.
router.get('/marketplace/category', category_controller.category_list);

//@ about page
/* GET about page. */
router.get('/about', function (req, res, next) {
  res.render('about', { title: 'About' });
});

module.exports = router;
