import EmbroiderRouter from '@embroider/router';
import config from './config/environment.js';

export default class Router extends EmbroiderRouter {
  location = config.locationType;
  rootURL = config.rootURL;
}

Router.map(function () {
  this.route('account');
  this.route('item', { path: '/items/:item_id' });
  this.mount('blog', { path: '/blog' });
  // The same engine at a second mount point.
  this.mount('blog', { as: 'blog-two', path: '/blog-two' });
  // An eager engine: bundled with the host, nothing to load on entry.
  this.mount('shop', { path: '/shop' });
});
