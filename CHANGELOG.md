## v0.8.3 (2019-11-27)

#### :rocket: Enhancement

- [#679](https://github.com/ember-engines/ember-engines/pull/679) [namespacing] update link-to-external-component to be called link-to-external so references to it are not confused ([@gabrielcsapo](https://github.com/gabrielcsapo))

#### :memo: Documentation

- [#670](https://github.com/ember-engines/ember-engines/pull/670) Fix "Mounting" typo in README.md ([@camerondubas](https://github.com/camerondubas))

#### :house: Internal

- [#684](https://github.com/ember-engines/ember-engines/pull/684) Update dependencies ([@dgeb](https://github.com/dgeb))
- [#663](https://github.com/ember-engines/ember-engines/pull/663) Migrate Ember Tests to new API ([@villander](https://github.com/villander))

#### Committers: 4

- Cameron Dubas ([@camerondubas](https://github.com/camerondubas))
- Dan Gebhardt ([@dgeb](https://github.com/dgeb))
- Gabriel Csapo ([@gabrielcsapo](https://github.com/gabrielcsapo))
- Michael Villander ([@villander](https://github.com/villander))

## v0.8.2 (2019-06-22)

#### :bug: Bug Fix

- [#666](https://github.com/ember-engines/ember-engines/pull/666) Use ember-asset-loader v0.6.1 at a minimum ([@ecoutlee-hortau](https://github.com/ecoutlee-hortau))

#### Committers: 1

- [@ecoutlee-hortau](https://github.com/ecoutlee-hortau)

## v0.8.1 (2019-06-21)

#### :bug: Bug Fix

- [#665](https://github.com/ember-engines/ember-engines/pull/665) Avoid shipping regenerator-runtime to production ([@scalvert](https://github.com/scalvert))

#### :house: Internal

- [#661](https://github.com/ember-engines/ember-engines/pull/661) Update deps that were blocked on dropping Node 6. ([@rwjblue](https://github.com/rwjblue))

#### Committers: 2

- Robert Jackson ([@rwjblue](https://github.com/rwjblue))
- Steve Calvert ([@scalvert](https://github.com/scalvert))

## v0.8.0 (2019-06-19)

#### :boom: Breaking Change

- [#659](https://github.com/ember-engines/ember-engines/pull/659) Drop support for Node 6 and 11. ([@rwjblue](https://github.com/rwjblue))

#### :rocket: Enhancement

- [#630](https://github.com/ember-engines/ember-engines/pull/630) Allow `app.import`ing from `node_modules` in lazy engines ([@villander](https://github.com/villander))

#### :bug: Bug Fix

- [#646](https://github.com/ember-engines/ember-engines/pull/646) Fix vendor tree usage inside a nested lazy loaded engine ([@2hu12](https://github.com/2hu12))

#### :memo: Documentation

- [#654](https://github.com/ember-engines/ember-engines/pull/654) Removes label `experimental` of ember-engines ([@villander](https://github.com/villander))

#### :house: Internal

- [#660](https://github.com/ember-engines/ember-engines/pull/660) Update ember-asset-loader to ^0.6.0 ([@villander](https://github.com/villander))
- [#658](https://github.com/ember-engines/ember-engines/pull/658) Update dependencies to latest versions. ([@rwjblue](https://github.com/rwjblue))
- [#657](https://github.com/ember-engines/ember-engines/pull/657) Add Ember 3.8 LTS to CI configuration. ([@rwjblue](https://github.com/rwjblue))

#### Committers: 3

- 2hu ([@2hu12](https://github.com/2hu12))
- Michael Villander ([@villander](https://github.com/villander))
- Robert Jackson ([@rwjblue](https://github.com/rwjblue))

## v0.7.2 (2019-06-18)

#### :bug: Bug Fix

- [#642](https://github.com/ember-engines/ember-engines/pull/642) Fix issues with `{{link-to}}` and `{{link-to-external}}` with Ember 3.10 ([@buschtoens](https://github.com/buschtoens))
- [#640](https://github.com/ember-engines/ember-engines/pull/640) Update blueprints to avoid linting errors with recent versions of eslint-plugin-ember ([@villander](https://github.com/villander))

#### :memo: Documentation

- [#641](https://github.com/ember-engines/ember-engines/pull/641) Update README with table of contents ([@villander](https://github.com/villander))
- [#650](https://github.com/ember-engines/ember-engines/pull/650) Update {{mount}} documentation to indicate a `model` named argument can be passed ([@garjust](https://github.com/garjust))

#### Committers: 3

- Jan Buschtöns ([@buschtoens](https://github.com/buschtoens))
- Justin Garbutt ([@garjust](https://github.com/garjust))
- Michael Villander ([@villander](https://github.com/villander))

## v0.7.1 (2019-05-11)

#### :rocket: Enhancement

- [#595](https://github.com/ember-engines/ember-engines/pull/595) Deduplicate addons in lazy engines that are nested dependencies of the engine (behind the EMBER_ENGINES_ADDON_DEDUPE environment flag ) ([@2hu12](https://github.com/2hu12))

#### Committers: 1

- 2hu ([@2hu12](https://github.com/2hu12))

## v0.7.0 (2019-04-01)

#### :boom: Breaking Change

- [#629](https://github.com/ember-engines/ember-engines/pull/629) Removes useDeprecatedIncorrectCSSProcessing ([@villander](https://github.com/villander))

#### Committers: 1

- Michael Villander ([@villander](https://github.com/villander))
-

## v0.6.3 (2019-03-26)

#### :bug: Bug Fix

- [#631](https://github.com/ember-engines/ember-engines/pull/631) Avoid errors when keywords array is not present. ([@rwjblue](https://github.com/rwjblue))

#### Committers: 1

- Robert Jackson ([@rwjblue](https://github.com/rwjblue))

## v0.6.2 (2019-03-26)

#### :bug: Bug Fix

- [#588](https://github.com/ember-engines/ember-engines/pull/588) [Closes [#546](https://github.com/ember-engines/ember-engines/issues/546)] respects it’s host apps source-map config. ([@stefanpenner](https://github.com/stefanpenner))

#### Committers: 1

- Stefan Penner ([@stefanpenner](https://github.com/stefanpenner))

## v0.6.1 (2019-03-12)

#### :rocket: Enhancement

- [#623](https://github.com/ember-engines/ember-engines/pull/623) upgrade ember-asset-loader ([@stefanpenner](https://github.com/stefanpenner))

#### Committers: 1

- Stefan Penner ([@stefanpenner](https://github.com/stefanpenner))

## 0.6.0 (2019-03-12)

#### :boom: Breaking Change

- [#622](https://github.com/ember-engines/ember-engines/pull/622) Drop Node 4 support. ([@rwjblue](https://github.com/rwjblue))
- [#619](https://github.com/ember-engines/ember-engines/pull/619) Upgrade dependencies and addon blueprint to match ember-cli 3.8 ([@dgeb](https://github.com/dgeb))

#### :rocket: Enhancement

- [#605](https://github.com/ember-engines/ember-engines/pull/605) Issue warning when an engine does not have ember-addon and ember-engine keywords in package.json ([@villander](https://github.com/villander))

#### :bug: Bug Fix

- [#621](https://github.com/ember-engines/ember-engines/pull/621) fix(deps): move ember-try to devDependencies ([@dfreeman](https://github.com/dfreeman))
- [#615](https://github.com/ember-engines/ember-engines/pull/615) Fix typos ([@dgeb](https://github.com/dgeb))
- [#610](https://github.com/ember-engines/ember-engines/pull/610) Fix find-host utils with lazyLoading hash ([@villander](https://github.com/villander))

#### :house: Internal

- [#618](https://github.com/ember-engines/ember-engines/pull/618) Remove unnecessary file ([@astronomersiva](https://github.com/astronomersiva))
- [#612](https://github.com/ember-engines/ember-engines/pull/612) Add more to npmignore file. ([@rwjblue](https://github.com/rwjblue))

#### Committers: 5

- Dan Freeman ([@dfreeman](https://github.com/dfreeman))
- Dan Gebhardt ([@dgeb](https://github.com/dgeb))
- Michael Villander ([@villander](https://github.com/villander))
- Robert Jackson ([@rwjblue](https://github.com/rwjblue))
- Sivasubramanyam A ([@astronomersiva](https://github.com/astronomersiva))

## v0.5.26 (2019-01-14)

#### :bug: Bug Fix

- [#609](https://github.com/ember-engines/ember-engines/pull/609) fix(engine-addon): only call `_requireBuildPackages`, if it exists ([@buschtoens](https://github.com/buschtoens))
- [#607](https://github.com/ember-engines/ember-engines/pull/607) fix(route-ext): try `Route#_router` and `Route#router` ([@buschtoens](https://github.com/buschtoens))

#### Committers: 1

- Jan Buschtöns ([@buschtoens](https://github.com/buschtoens))

## v0.5.25 (2018-12-21)

#### :bug: Bug Fix

- [#600](https://github.com/ember-engines/ember-engines/pull/600) fix(router-ext): hook into `getRoute`, if exsits ([@buschtoens](https://github.com/buschtoens))

#### Committers: 1

- Jan Buschtöns ([@buschtoens](https://github.com/buschtoens))

## v0.5.24 (2018-10-09)

#### :bug: Bug Fix

- [#597](https://github.com/ember-engines/ember-engines/pull/597) Don’t accidentally re-include the compact reexport plugin more then once ([@stefanpenner](https://github.com/stefanpenner))

#### Committers: 1

- Stefan Penner ([@stefanpenner](https://github.com/stefanpenner))

## v0.5.23 (2018-10-04)

#### :rocket: Enhancement

- [#598](https://github.com/ember-engines/ember-engines/pull/598) Remove Usage of `Ember.Logger` ([@jherdman](https://github.com/jherdman))
- [#589](https://github.com/ember-engines/ember-engines/pull/589) Allow compact reexports with import as namespace. ([@stefanpenner](https://github.com/stefanpenner))

#### :bug: Bug Fix

- [#593](https://github.com/ember-engines/ember-engines/pull/593) Fix router setup ([@chadhietala](https://github.com/chadhietala))

#### :house: Internal

- [#591](https://github.com/ember-engines/ember-engines/pull/591) don’t troll with file://, which copies into node_modules causing sadn… ([@stefanpenner](https://github.com/stefanpenner))

#### Committers: 3

- Chad Hietala ([@chadhietala](https://github.com/chadhietala))
- James Herdman ([@jherdman](https://github.com/jherdman))
- Stefan Penner ([@stefanpenner](https://github.com/stefanpenner))

## v0.5.22 (2018-08-27)

#### :rocket: Enhancement

- [#586](https://github.com/ember-engines/ember-engines/pull/586) Ensure babel transpilation can be parallelized ([@arthirm](https://github.com/arthirm))

#### Committers: 1

- Arthi ([@arthirm](https://github.com/arthirm))
