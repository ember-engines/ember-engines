/* eslint-disable ember/no-classic-classes */
import Route from '@ember/routing/route';

export default Route.extend({
  afterModel(model) {
    this.replaceWith('blog.post', model.id, {
      queryParams: { lang: 'English' },
    });
  },
});
