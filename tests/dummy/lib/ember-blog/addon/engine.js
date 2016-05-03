import Engine from 'ember-engines/engine';
import Resolver from 'ember-engines/resolver';
import loadInitializers from 'ember-load-initializers';

let Eng;

const modulePrefix = 'ember-blog';

Eng = Engine.extend({
  modulePrefix,
  Resolver,

  dependencies: {
    services: [
      'data-store'
    ]
  }
});

loadInitializers(Eng, modulePrefix);

export default Eng;
