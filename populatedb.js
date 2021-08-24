#! /usr/bin/env node

console.log('This script populates');

// Get arguments passed on command line
var userArgs = process.argv.slice(2);
console.log(userArgs);
/*
if (!userArgs[0].startsWith('mongodb')) {
    console.log('ERROR: You need to specify a valid mongodb URL as the first argument');
    return
}
*/
var async = require('async');
const Nft = require('./models/nft');
const Category = require('./models/category');
const Creator = require('./models/Creator');
const NftInstance = require('./models/nftInstance');

var mongoose = require('mongoose');
var mongoDB = userArgs[0];
mongoose.connect(mongoDB, { useNewUrlParser: true, useUnifiedTopology: true });
mongoose.Promise = global.Promise;
var db = mongoose.connection;
db.on('error', console.error.bind(console, 'MongoDB connection error:'));

let creators = [];
let categories = [];
let nfts = [];
let nftInstances = [];

//+ creator
function creatorCreate(name, cb) {
  creatorDetail = { name: name };

  var creator = new Creator(creatorDetail);

  creator.save(function (err) {
    if (err) {
      cb(err, null);
      return;
    }
    console.log('New Creator: ' + creator);
    creators.push(creator);
    cb(null, creator);
  });
}

//+ category
function categoryCreate(name, cb) {
  var category = new Category({ name: name });

  category.save(function (err) {
    if (err) {
      cb(err, null);
      return;
    }
    console.log('New category: ' + category);
    categories.push(category);
    cb(null, category);
  });
}

//+ NFT
function nftCreate(title, creator, category, price, src, cb) {
  nftDetail = {
    title: title,
    creator: creator,
    price: price,
    src: src,
  };
  if (category != false) nftDetail.category = category;

  var nft = new Nft(nftDetail);
  nft.save(function (err) {
    if (err) {
      cb(err, null);
      return;
    }
    console.log('New nft: ' + nft);
    nfts.push(nft);
    cb(null, nft);
  });
}

//+ NFT Instance
function nftInstanceCreate(nft, status, cb) {
  nftInstanceDetail = {
    nft: nft,
  };
  if (status != false) nftInstanceDetail.status = status;

  var nftInstance = new NftInstance(nftInstanceDetail);
  nftInstance.save(function (err) {
    if (err) {
      console.log('ERROR CREATING nftInstance: ' + nftInstance);
      cb(err, null);
      return;
    }
    console.log('New nftInstance: ' + nftInstance);
    nftInstances.push(nftInstance);
    cb(null, nft);
  });
}

//@ Create categories and creators
function createCategoryCreators(cb) {
  async.series(
    [
      function (callback) {
        creatorCreate('Fakurian Design', callback);
      },
      function (callback) {
        creatorCreate('Rostislav Uzunov', callback);
      },
      function (callback) {
        creatorCreate('Ayush Bharshankar', callback);
      },
      function (callback) {
        categoryCreate('3d', callback);
      },
    ],
    // optional callback
    cb
  );
}

//@ create NFTs
function createNfts(cb) {
  async.parallel(
    [
      function (callback) {
        nftCreate(
          'Brain Render',
          creators[0],
          [categories[0]],
          '0.0247',
          'https://images.unsplash.com/photo-1617791160536-598cf32026fb?ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&ixlib=rb-1.2.1&auto=format&fit=crop&w=959&q=80',
          callback
        );
      },
      function (callback) {
        nftCreate(
          'Cube Render',
          creators[1],
          [categories[0]],
          '0.0492',
          'https://images.pexels.com/photos/5011647/pexels-photo-5011647.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=750&w=1260',
          callback
        );
      },
      function (callback) {
        nftCreate(
          'Donut Render',
          creators[2],
          [categories[0]],
          '0.00854',
          'https://images.unsplash.com/flagged/photo-1621757458931-a1b076e5a8bb?ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&ixlib=rb-1.2.1&auto=format&fit=crop&w=2089&q=80',
          callback
        );
      },
    ],
    // optional callback
    cb
  );
}

//@ Create NFT instances
function createNftInstances(cb) {
  async.parallel(
    [
      function (callback) {
        nftInstanceCreate(nfts[0], 'Sold', callback);
      },
      function (callback) {
        nftInstanceCreate(nfts[1], 'Available', callback);
      },
      function (callback) {
        nftInstanceCreate(nfts[2], 'Available', callback);
      },
    ],
    // Optional callback
    cb
  );
}

//# perform functions
async.series(
  [createCategoryCreators, createNfts, createNftInstances],
  // Optional callback
  function (err, results) {
    if (err) {
      console.log('FINAL ERR: ' + err);
    } else {
      console.log('BOOKInstances: ' + nftInstances);
    }
    // All done, disconnect from database
    mongoose.connection.close();
  }
);
