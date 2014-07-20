// var cmp = require('comparejs');
var expect = require('chai').expect;

module.exports = function(actual) {
  return {
    toEqual: function(expected) {
      expect(actual).to.eql(expected);
    },
    toHaveBeenCalledWith: function(expectedFn) {
      if (actual.args.length != 1) throw new Error('Expected ' + actual + ' to have been called once, but was called ' + actual.args.length + ' times');
      expectedFn.apply(null, actual.args[0]);
    }
  };
}