export default function() {
  this.route('new');

  this.route('comments', function() {
    this.route('comment', { path: ':id' });
  });
}

// {{link-to 'blog.comments.comment'}}
//
