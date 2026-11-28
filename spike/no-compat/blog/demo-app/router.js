import EmbroiderRouter from '@embroider/router';
import config from './config.js';

export default class Router extends EmbroiderRouter {
  location = config.locationType;
  rootURL = config.rootURL;
}

Router.map(function () {
  this.route('item', { path: '/items/:item_id' });
  this.mount('blog', { path: '/blog' });
});
