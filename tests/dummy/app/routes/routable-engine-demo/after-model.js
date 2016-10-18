import Ember from 'ember';

export default Ember.Route.extend({
  afterModel(model) {
    this.replaceWith('blog.post', model.id, { queryParams: { lang: 'English' } });
  }
});