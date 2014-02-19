/*global describe, it, beforeEach*/

require('should');
var restify = require('restify'),
    assert  = require('assert'),
    client  = restify.createJSONClient({
      version: '*',
      url: 'http://localhost:9000'
    });
var isSorted = function (list) {
  var sorted = true,
      last;
  list.forEach(function (item) {
    if (last && item._indexed_at > last) {
      sorted = false;
    }
    last = item._indexed_at;
  });
  return sorted;
};

describe('Search API', function () {
  describe('/search', function () {
    it('should return the first 10 results', function (done) {
      client.get('/search', function (err, req, res, data) {
        data.data.length.should.equal(10);
        done();
      });
    });

    it('returns results by recency if no search criteria are specified', function (done) {
      client.get('/search', function (err, req, res, data) {
        isSorted(data.data).should.equal(true);
        done();
      });
    });

    it('limits number of return values by the limit param', function (done) {
      client.get('/search?limit=14', function (err, req, res, data) {
        data.data.length.should.equal(14);
        client.get('/search?limit=7', function (err, req, res, data) {
          data.data.length.should.equal(7);
          done();
        });
      });
    });

    it('allows pagination using the page and limit params', function (done) {
      client.get('/search?limit=10&page=2', function (err, req, res, data) {
        data.data.length.should.equal(10);
        client.get('/search?limit=10&page=3', function (err, req, res, data) {
          data.data.length.should.equal(2);
          done();
        });
      });
    });

    it('should return results filtered by tag', function (done) {
      client.get('/search?tags=MOOC3,Badges', function (err, req, res, data) {
        data.data.length.should.equal(1);
        done();
      });
    });

    it('should let you filter by multiple items', function (done) {
      client.get('/search?tags=Badges&q=https://badge.unow.fr/api/v1/organizations/1-unow-mooc-badges.json', function (err, req, res, data) {
        data.data.length.should.equal(1);
        done();
      });
    });
  });

  describe('/recent', function () {
    it('should return recent badges', function (done) {
      client.get('/recent?limit=10&page=3', function (err, req, res, data) {
        data.data.length.should.equal(2);
        done();
      });
    });
  });
});