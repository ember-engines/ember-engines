#!/bin/bash

rm -rf node_modules/ember-blog
ln -s ../tests/dummy/lib/ember-blog node_modules/ember-blog

rm -rf node_modules/ember-chat
ln -s ../tests/dummy/lib/ember-chat node_modules/ember-chat
