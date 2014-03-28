'use strict';

var langUtils = require('../');
var should = require('should');

describe('langUtils', function() {
  it('uniqObjs', function() {
    langUtils.uniqObjs([{a: 1, b: 2}, {a: 1, b: 2}]).should.eql([{a: 1, b: 2}]);
  });

  it('getPath', function() {
    langUtils.getPath({a: {b: 1}}, ['a']).should.eql({b: 1});
    langUtils.getPath({a: {b: 1}}, ['a', 'b']).should.eql(1);
  });

  it('setsAndSelectsPath', function() {
    var obj = { a: { b: { c: 0 } } };
    obj.a.b.c.should.eql(0);
    langUtils.setObjWithPath(obj, 'a.b.c', 1);
    obj.a.b.c.should.eql(1);
    langUtils.selectObjWithPath(obj, 'a.b.c').should.eql(1);
  });
});
