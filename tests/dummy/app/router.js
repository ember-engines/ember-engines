import Ember from 'ember';
import config from './config/environment';

const Router = Ember.Router.extend({
  location: config.locationType
});

Router.map(function() {
  this.route('routeless-engine-demo');

  this.route('routeable-engine-demo', function() {
    this.mount('ember-blog', { as: 'blog', path: '/blog' });
    this.mount('ember-blog', { as: 'dev-blog', path: '/dev-blog' });
  });
});

export default Router;
