import Engine from 'ember-engines/engine';
import Resolver from 'ember-resolver';
import loadInitializers from 'ember-load-initializers';
import config from '<%= dasherizedModuleName %>/config/environment';

class Eng extends Engine {
  modulePrefix = config.modulePrefix;
  Resolver = Resolver;
}

loadInitializers(Eng, config.modulePrefix);

export default Eng;
