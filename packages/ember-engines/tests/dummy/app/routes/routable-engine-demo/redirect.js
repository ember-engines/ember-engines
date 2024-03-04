/* eslint-disable ember/no-classic-classes */
import Route from '@ember/routing/route';

export default Route.extend({
  redirect() {
    this.replaceWith('blog.post', 1, { queryParams: { lang: 'English' } });
  },
});
