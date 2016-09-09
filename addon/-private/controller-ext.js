import Ember from 'ember';
import { prefixRouteNameArg } from './utils';

Ember.Controller.reopen({
  transitionToRoute(...args) {
    return this._super.apply(this, (prefixRouteNameArg.call(this, 'Controller#transitionToRoute', ...args)));
  }
});
