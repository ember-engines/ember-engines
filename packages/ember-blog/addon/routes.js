import buildRoutes from 'ember-engines/routes';

export default buildRoutes(function() {
  this.route('new');

  this.route('post', { path: 'post/:id' }, function() {
    this.route('comments', function() {
      this.route('comment', { path: ':id' });
    });

    // The likes route loads slowly to test loading states
    this.route('likes');

    // The diggs route throws an error to test error states
    this.route('diggs');

    this.route('post-reset-namespace', { resetNamespace: true }, function() {
    });
  });
});
