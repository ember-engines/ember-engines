import { namespaceEngineRouteName } from '../../../utils/namespace-engine-route-name';
import { module, test } from 'qunit';

module('Unit | Utility | namespace-engine-route-name', function() {

  test('return mountPoint when routeName is `application`', function(assert) {
    let mountPoint = 'blog';
    let routeName = 'application';
    let result = namespaceEngineRouteName(mountPoint, routeName);
    assert.equal(result, 'blog');
  });

  test('return engine namespace when routeName is different of `application`', function(assert) {
    let mountPoint = 'blog';
    let routeName = 'new';
    let result = namespaceEngineRouteName(mountPoint, routeName);
    assert.equal(result, 'blog.new');
  });
});
