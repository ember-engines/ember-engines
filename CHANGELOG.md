## v0.6.3 (2019-03-26)

#### :bug: Bug Fix
* [#631](https://github.com/ember-engines/ember-engines/pull/631) Avoid errors when keywords array is not present. ([@rwjblue](https://github.com/rwjblue))

#### Committers: 1
- Robert Jackson ([@rwjblue](https://github.com/rwjblue))

## v0.6.2 (2019-03-26)

#### :bug: Bug Fix
* [#588](https://github.com/ember-engines/ember-engines/pull/588) [Closes [#546](https://github.com/ember-engines/ember-engines/issues/546)] respects it’s host apps source-map config. ([@stefanpenner](https://github.com/stefanpenner))

#### Committers: 1
- Stefan Penner ([@stefanpenner](https://github.com/stefanpenner))


## v0.6.1 (2019-03-12)

#### :rocket: Enhancement
* [#623](https://github.com/ember-engines/ember-engines/pull/623) upgrade ember-asset-loader ([@stefanpenner](https://github.com/stefanpenner))

#### Committers: 1
- Stefan Penner ([@stefanpenner](https://github.com/stefanpenner))

## 0.6.0 (2019-03-12)

#### :boom: Breaking Change
* [#622](https://github.com/ember-engines/ember-engines/pull/622) Drop Node 4 support. ([@rwjblue](https://github.com/rwjblue))
* [#619](https://github.com/ember-engines/ember-engines/pull/619) Upgrade dependencies and addon blueprint to match ember-cli 3.8 ([@dgeb](https://github.com/dgeb))

#### :rocket: Enhancement
* [#605](https://github.com/ember-engines/ember-engines/pull/605) Issue warning when an engine does not have ember-addon and ember-engine keywords in package.json ([@villander](https://github.com/villander))

#### :bug: Bug Fix
* [#621](https://github.com/ember-engines/ember-engines/pull/621) fix(deps): move ember-try to devDependencies ([@dfreeman](https://github.com/dfreeman))
* [#615](https://github.com/ember-engines/ember-engines/pull/615) Fix typos ([@dgeb](https://github.com/dgeb))
* [#610](https://github.com/ember-engines/ember-engines/pull/610) Fix find-host utils with lazyLoading hash ([@villander](https://github.com/villander))

#### :house: Internal
* [#618](https://github.com/ember-engines/ember-engines/pull/618) Remove unnecessary file ([@astronomersiva](https://github.com/astronomersiva))
* [#612](https://github.com/ember-engines/ember-engines/pull/612) Add more to npmignore file. ([@rwjblue](https://github.com/rwjblue))

#### Committers: 5
- Dan Freeman ([@dfreeman](https://github.com/dfreeman))
- Dan Gebhardt ([@dgeb](https://github.com/dgeb))
- Michael Villander ([@villander](https://github.com/villander))
- Robert Jackson ([@rwjblue](https://github.com/rwjblue))
- Sivasubramanyam A ([@astronomersiva](https://github.com/astronomersiva))

## v0.5.26 (2019-01-14)

#### :bug: Bug Fix
* [#609](https://github.com/ember-engines/ember-engines/pull/609) fix(engine-addon): only call `_requireBuildPackages`, if it exists ([@buschtoens](https://github.com/buschtoens))
* [#607](https://github.com/ember-engines/ember-engines/pull/607) fix(route-ext): try `Route#_router` and `Route#router` ([@buschtoens](https://github.com/buschtoens))

#### Committers: 1
- Jan Buschtöns ([@buschtoens](https://github.com/buschtoens))


## v0.5.25 (2018-12-21)

#### :bug: Bug Fix
* [#600](https://github.com/ember-engines/ember-engines/pull/600) fix(router-ext): hook into `getRoute`, if exsits ([@buschtoens](https://github.com/buschtoens))

#### Committers: 1
- Jan Buschtöns ([@buschtoens](https://github.com/buschtoens))


## v0.5.24 (2018-10-09)

#### :bug: Bug Fix
* [#597](https://github.com/ember-engines/ember-engines/pull/597) Don’t accidentally re-include the compact reexport plugin more then once ([@stefanpenner](https://github.com/stefanpenner))

#### Committers: 1
- Stefan Penner ([@stefanpenner](https://github.com/stefanpenner))


## v0.5.23 (2018-10-04)

#### :rocket: Enhancement
* [#598](https://github.com/ember-engines/ember-engines/pull/598) Remove Usage of `Ember.Logger` ([@jherdman](https://github.com/jherdman))
* [#589](https://github.com/ember-engines/ember-engines/pull/589) Allow compact reexports with import as namespace. ([@stefanpenner](https://github.com/stefanpenner))

#### :bug: Bug Fix
* [#593](https://github.com/ember-engines/ember-engines/pull/593) Fix router setup ([@chadhietala](https://github.com/chadhietala))

#### :house: Internal
* [#591](https://github.com/ember-engines/ember-engines/pull/591) don’t troll with file://, which copies into node_modules causing sadn… ([@stefanpenner](https://github.com/stefanpenner))

#### Committers: 3
- Chad Hietala ([@chadhietala](https://github.com/chadhietala))
- James Herdman ([@jherdman](https://github.com/jherdman))
- Stefan Penner ([@stefanpenner](https://github.com/stefanpenner))


## v0.5.22 (2018-08-27)

#### :rocket: Enhancement
* [#586](https://github.com/ember-engines/ember-engines/pull/586) Ensure babel transpilation can be parallelized  ([@arthirm](https://github.com/arthirm))

#### Committers: 1
- Arthi ([@arthirm](https://github.com/arthirm))

