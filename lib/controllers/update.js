'use strict';

var _ = require('lodash'),
    util = require('util'),
    Base = require('./base'),
    ReadController = require('./read');

var Update = function(args) {
  if (args.resource.updateMethod)
    this.method = args.resource.updateMethod;
  Update.super_.call(this, args);
};

util.inherits(Update, Base);

Update.prototype.action = 'update';
Update.prototype.method = 'put';
Update.prototype.plurality = 'singular';

Update.prototype.fetch = ReadController.prototype.fetch;
Update.prototype.write = function(req, res, context) {
  var instance = context.instance;
  context.attributes = _.extend(context.attributes, req.body);

  this.endpoint.attributes.forEach(function(a) {
    if (req.params.hasOwnProperty(a))
      context.attributes[a] = req.params[a];
  });

  // @todo: consider options, e.g. { durability: 'soft', conflict: 'update' }

  var self = this;
  return instance
    .merge(context.attributes)
    .save()
    .then(function(result) {
      context.instance = result;
      return context.continue;
    });
};

module.exports = Update;
