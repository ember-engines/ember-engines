// Load extensions to Ember
import 'ember-engines/route-ext';
import 'ember-engines/router-ext';
import 'ember-engines/engine-ext';
import 'ember-engines/engine-instance-ext';
import 'ember-engines/keywords/mount';

// TODO: Move to ensure they are ran prior to instantiating Ember.Application
export function initialize() {
}

export default {
  name: 'engines',
  initialize
};
