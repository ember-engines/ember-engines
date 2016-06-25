// Load extensions to Ember
import '../-private/route-ext';
import '../-private/engine-ext';
import '../-private/engine-instance-ext';
import '../-private/keywords/mount';

// TODO: Move to ensure they run prior to instantiating Ember.Application
export function initialize() {
}

export default {
  name: 'engines',
  initialize
};
