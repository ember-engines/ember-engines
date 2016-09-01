// Load extensions to Ember
import '../-private/controller-ext';
import '../-private/route-ext';
import '../-private/router-ext';
import '../-private/engine-ext';
import '../-private/engine-instance-ext';
import '../-private/keywords/mount';
import '../-private/keywords/outlet';
import '../-private/router-dsl-ext';

// TODO: Move to ensure they run prior to instantiating Ember.Application
export function initialize() {
}

export default {
  name: 'engines',
  initialize
};
