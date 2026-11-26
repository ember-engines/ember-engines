import { buildRoutes } from 'ember-engines-runtime';

export default buildRoutes(function () {
  this.route('post', { path: '/post/:id' });
  this.mount('comments');
});
