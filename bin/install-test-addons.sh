#!/bin/bash

rm -rf node_modules/common-components
ln -s ../tests/dummy/lib/common-components node_modules/common-components

rm -rf node_modules/eager-blog
ln -s ../tests/dummy/lib/eager-blog node_modules/eager-blog

rm -rf node_modules/ember-blog
ln -s ../tests/dummy/lib/ember-blog node_modules/ember-blog

rm -rf node_modules/ember-chat
ln -s ../tests/dummy/lib/ember-chat node_modules/ember-chat
