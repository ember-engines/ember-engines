import Ember from 'ember';

export default Ember.Route.extend({
  model(params) {
    console.log('ember-blog.post route model hook', params);
    return {
      id: params.id,
      title: `Post ${params.id}`
    };
  }
});
