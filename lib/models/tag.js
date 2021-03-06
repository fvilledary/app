/**
 * Extend module's NODE_PATH
 * HACK: temporary solution
 */

var resolve = require('path').resolve;
require(resolve('lib/node-path'))(module);

/**
 * Module dependencies.
 */

var mongoose = require('mongoose')
  , Schema = mongoose.Schema
  , ObjectId = Schema.ObjectId
  , log = require('debug')('models:tag')
  , regex = require('lib/regexps');

var hexColorValidation = [hexColorValidator, 'Invalid hex color value'];
function hexColorValidator(value) {
	return regex.hexColor.test(value);
}

var TagSchema = new Schema({
    hash: { type: String, lowercase: true, trim: true, required: true }
  , name: { type: String, trim: true, required: true }
  , color: { type: String, default: '#091A33', validate: hexColorValidation }
  , createdAt: { type: Date, default: Date.now }
});

/**
 * Define Schema Indexes for MongoDB
 */

TagSchema.index({ createdAt: -1 });
TagSchema.index({ hash: 1 }, { unique: true, dropDups: true });

/**
 * Make Schema `.toObject()` and
 * `.toJSON()` parse getters for
 * proper JSON API response
 */

TagSchema.set('toObject', { getters: true });
TagSchema.set('toJSON', { getters: true });

var Tag = module.exports = mongoose.model('Tag', TagSchema);