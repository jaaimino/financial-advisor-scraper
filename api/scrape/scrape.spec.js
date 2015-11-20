'use strict';

var should = require('should');
var app = require('../../app');
var request = require('supertest');

/**
 * Refresh all clients data
 * @param  {[type]} 'GET      /api/scrape'  [description]
 * @param  {[type]} function( [description]
 * @return {[type]}           [description]
 */
describe('GET /api/scrape', function() {
  it('should respond with JSON array', function(done) {
    request(app)
      .get('/api/scrape')
      .expect(200)
      .expect('Content-Type', /json/)
      .end(function(err, res) {
        if (err) return done(err);
        res.body.should.be.instanceof(Array);
        done();
      });
  });
});
