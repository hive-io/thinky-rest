'use strict';

var util = require('util'),
    Base = require('./base');

var Read = function(args) {
  Read.super_.call(this, args);
  if (!args.documentReadValidation && args.resource && args.resource.table) {
    this.table = args.resource.table;
  }
  this._r = args.odm.r;
};

util.inherits(Read, Base);

Read.prototype.action = 'read';
Read.prototype.method = 'get';
Read.prototype.plurality = 'singular';

Read.prototype.fetch = function(req, res, context) {
  var model = this.table ? this._r.table(this.table) : this.model,
      endpoint = this.endpoint,
      criteria = context.criteria || req.params[endpoint.attributes[0]];

  return model
    .get(criteria)
    .then(function(result) {
      context.instance = result;
      return context.continue;
    });
};

module.exports = Read;
