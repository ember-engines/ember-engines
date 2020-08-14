# tree-invocation-order

This Engine exists to test that building trees is done in the correct order for
types of trees that depend on ordering. In particular, it can be used to verify
that the styles tree is built before the public tree, which some addons depend
on.

To verify that styles before public is working, run `ember build` and ensure
that dist/engines-dist/tree-invocation-order/assets/circle.svg exists.
