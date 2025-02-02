'use strict';

var Promise = require('bluebird'),
    TestFixture = require('./test-fixture'),
    request = require('request'),
    expect = require('chai').expect,
    _ = require('lodash'),
    rest = require('../lib'),
    schemas = require('./schemas');



var test = new TestFixture();

var maybeDescribe =
  (process.env.USE_RESTIFY && process.env.USE_THINKAGAIN) ? describe : describe.skip;
maybeDescribe('validation', function() {
  before(function() {
    test.resources = [];
    return test.initializeDatabase()
      .then(function() {
        test.models.User = test.db.createModel('users', schemas.User);
        test.models.Person = test.db.createModel('person', schemas.Person);
        test.models.PersonPkey =
          test.db.createModel('person_pkey', schemas.Person, { pk: 'firstname' });

        return Promise.all([
          test.models.User.tableReady(),
          test.models.Person.tableReady(),
          test.models.PersonPkey.tableReady()
        ]);
      });
  });

  after(function() {
    return test.dropDatabase();
  });

  beforeEach(function() {
    return test.initializeServer()
      .then(function() {
        rest.initialize({ app: test.app, odm: test.db });
        test.resources.push(rest.resource({
          model: test.models.User,
          endpoints: ['/users', '/user/:id'],
          documentWriteValidation: true
        }));
      });
  });

  afterEach(function(done) {
    test.clearDatabase()
      .then(function() {
        test.resources = [];
        test.server.close(done);
      });
  });

  describe('create', function() {
    it('should generate validation definitions', function() {
      var createMount = test.server.router.mounts.postusers,
          validation = createMount.spec.validation;

      expect(validation).to.eql({
        body: {
          type: 'object',
          properties: {
            available: { type: 'boolean' },
            username: { type: 'string' },
            email: { type: 'string', format: 'email' },
            id: { type: 'string' }
          },
          required: [ 'username' ],
          id: 'users'
        },
        responses: {
          200: { description: 'Success' },
          304: { description: 'Not modified' },
          409: {
            description: 'Duplicate record',
            schema: { $ref: '#/definitions/Error' }
          },
          default: {
            description: 'Unexpected error',
            schema: { $ref: '#/definitions/Error' }
          }
        }
      });
    });
  });

  describe('read', function() {
    it('should generate validation definitions', function() {
      var readMount = test.server.router.mounts.getuserid,
          validation = readMount.spec.validation;

      expect(validation).to.eql({
        params: {
          type: 'object',
          properties: { id: { type: 'string' } },
          required: [ 'id' ]
        },
        responses: {
          200: {
            description: 'Success',
            schema: {
              id: 'users',
              type: 'object',
              properties: {
                available: { type: 'boolean' },
                email: { type: 'string', format: 'email' },
                id: { type: 'string' },
                username: { type: 'string' }
              },
              required: [ 'username' ]
            }
          },
          404: {
            description: 'Not found',
            schema: { $ref: '#/definitions/Error' }
          },
          default: {
            description: 'Unexpected error',
            schema: { $ref: '#/definitions/Error' }
          }
        }
      });
    });
  });

  describe('list', function() {
    it('should generate validation definitions', function() {
      var listMount = test.server.router.mounts.getusers,
          validation = listMount.spec.validation;

      expect(validation).to.eql({
        query: {
          type: 'object',
          properties: {
            count: { type: 'integer', default: 100 },
            offset: { type: 'integer', default: 0 },
            q: { type: 'string' },
            sort: { type: 'string' }
          }
        },
        responses: {
          200: {
            description: 'Success',
            schema: {
              type: 'array',
              items: {
                id: 'users',
                type: 'object',
                properties: {
                  available: { type: 'boolean' },
                  email: { type: 'string', format: 'email' },
                  id: { type: 'string' },
                  username: { type: 'string' }
                },
                required: [ 'username' ]
              }
            }
          },
          404: {
            description: 'Not found',
            schema: { $ref: '#/definitions/Error' }
          },
          default: {
            description: 'Unexpected error',
            schema: { $ref: '#/definitions/Error' }
          }
        }
      });
    });
  });

  describe('update', function() {
    it('should generate validation definitions', function() {
      var updateMount = test.server.router.mounts.putuserid,
          validation = updateMount.spec.validation;

      expect(validation).to.eql({
        params: {
          type: 'object',
          properties: { id: { type: 'string' } },
          required: [ 'id' ]
        },
        body: {
          type: 'object',
          properties: {
            available: { type: 'boolean' },
            username: { type: 'string' },
            email: { type: 'string', format: 'email' },
            id: { type: 'string' }
          },
          id: 'users'
        },
        responses: {
          200: { description: 'Success' },
          404: {
            description: 'Not found',
            schema: { $ref: '#/definitions/Error' }
          },
          default: {
            description: 'Unexpected error',
            schema: { $ref: '#/definitions/Error' }
          }
        }
      });
    });
  });

  describe('delete', function() {
    it('should generate validation definitions', function() {
      var deleteMount = test.server.router.mounts.deleteuserid,
          validation = deleteMount.spec.validation;

      expect(validation).to.eql({
        params: {
          type: 'object',
          properties: { id: { type: 'string' } },
          required: [ 'id' ]
        },
        responses: {
          404: {
            description: 'Not found',
            schema: { $ref: '#/definitions/Error' }
          },
          default: {
            description: 'Unexpected error',
            schema: { $ref: '#/definitions/Error' }
          }
        }
      });
    });
  });

});
