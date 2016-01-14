import Ember from 'ember';
import config from './config/environment';

const Router = Ember.Router.extend({
  location: config.locationType
});

Router.map(function() {
  this.route('routeless-engine-demo');

  this.route('routable-engine-demo', function() {
    this.route('normal-route');

    this.mount('ember-blog');

    this.mount('ember-blog', { as: 'hr-blog' });
    this.mount('ember-blog', { as: 'legal-blog' });

    this.mount('ember-blog', { as: 'blog', resetNamespace: true });
    this.mount('ember-blog', { as: 'dev-blog', resetNamespace: true });

    this.mount('ember-blog', { as: 'admin-blog', path: '/special-admin-blog-here' });
  });
});

export default Router;
