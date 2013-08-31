'use strict';

var langUtils = require('../');
var should = require('should');

describe('langUtils', function() {
  it('uniqObjs', function() {
    langUtils.uniqObjs([{a: 1, b: 2}, {a: 1, b: 2}]).should.eql([{a: 1, b: 2}]);
  });
});
