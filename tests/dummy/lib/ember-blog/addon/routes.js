export default function() {
  this.route('new');

  this.route('post', { path: 'post/:id' }, function() {
    this.route('comments', function() {
      this.route('comment', { path: ':id' });
    });
  });
}

// {{link-to 'blog.comments.comment'}}
//
