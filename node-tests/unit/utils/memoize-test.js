'use strict';

const expect = require('chai').expect;
const memoize = require('../../../lib/utils/memoize');

describe('memoize', function() {
  function createContext(project, label) {
    return {
      project,
      label,

      pkg: {
        name: 'package-name'
      },

      calls: [],

      fn: memoize(function fn() {
        this.calls.push([].slice.call(arguments));
        return `${this.label}!`;
      })
    };
  }

  it('caches the results of a method call based on the target object', function() {
    const project = {};
    const context = createContext(project, 'A');

    expect(context.fn(1, 2)).to.equal('A!');
    expect(context.calls).to.deep.equal([
      [1, 2]
    ]);

    expect(context.fn(3, 4)).to.equal('A!');
    expect(context.calls).to.deep.equal([
      [1, 2]
    ]);

    // Second arg ("B") is ignored because the results are cached using "A"
    const contextSharedProject = createContext(project, 'B');

    expect(contextSharedProject.fn(5, 6)).to.equal('A!');
    expect(contextSharedProject.calls).to.deep.equal([]);

    // New cache
    const project2 = {};
    const contextSeparateProject = createContext(project2, 'C');

    expect(contextSeparateProject.fn(7, 8)).to.equal('C!');
    expect(contextSeparateProject.calls).to.deep.equal([
      [7, 8]
    ]);

    // Contexts without a project use a global cache
    const contextNoProject = createContext(null, 'D');

    expect(contextNoProject.fn(9, 10)).to.equal('D!');
    expect(contextNoProject.calls).to.deep.equal([
      [9, 10]
    ]);

    expect(contextNoProject.fn(11, 12)).to.equal('D!');
    expect(contextNoProject.calls).to.deep.equal([
      [9, 10]
    ]);

    const contextNoProjectAgain = createContext();

    expect(contextNoProjectAgain.fn(13, 14)).to.equal('D!');
    expect(contextNoProjectAgain.calls).to.deep.equal([]);
  });
});
