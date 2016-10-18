import Ember from 'ember';

export default Ember.Route.extend({
  redirect() {
    this.replaceWith('blog.post', 1, { queryParams: { lang: 'English' } });
  }
});