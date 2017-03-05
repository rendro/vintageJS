const expect = require('expect.js');
const assert = require('assert');
const { stub } = require('sinon');

const { compose } = require('../src/utils.js');

describe('Utils', () => {
  describe('compose', () => {
    it('should compose g after f', () => {
      const f1 = stub().returns(24);
      const f2 = stub().returns(42);
      const c = compose(f2, f1);

      expect(c(1)).to.be(42);
      assert(f1.called);
      assert(f1.calledWith(1));
      assert(f2.called);
      assert(f2.calledWith(24));
      assert(f1.calledBefore(f2));
    });
  });
});
