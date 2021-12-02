# Contributing to Drafter

## Quickstart and tooling

To quickly get developing:
  - Make sure you have [Yarn](https://yarnpkg.com/) installed
  - Set up an [EditorConfig](https://editorconfig.org/) plugin for your text editor
    - Links for:
      - [VSCode](https://marketplace.visualstudio.com/items?itemName=EditorConfig.EditorConfig)
      - [Vim](https://github.com/editorconfig/editorconfig-vim#readme)
      - [Emacs](https://github.com/editorconfig/editorconfig-emacs#readme)
      - [others](https://editorconfig.org/#download)
  - run `yarn --dev` to install all development dependencies

Drafter uses [ESLint](https://eslint.org/) for project linting. ESLint will automatically be
installed when you run `yarn --dev`. In order to lint your project, run:

```sh
$ yarn lint --fix
```

## Branching model

There are two principal branches, `develop`, and `main`. `develop` is upstream of `main`, so the
latest changes land there first. However, direct commiting to the `develop` branch is not allowed.

In order to contribute create a branch from `develop` as follows:

```sh
$ git checkout develop
$ git checkout -b feat-my-new-feature
```

Then, do your work on this branch. Once you are ready, run

```sh
$ yarn lint --fix
```

This will clean up your code and prepare it for merging into `develop`. Then, open a pull request
from your branch onto `develop`. The CI will run an action to confirm that your code lints
properly. When this succeeds, squash-merge your code into `develop`. This will combine all commits
you made into one in order to prevent from polluting the `develop` commit history.

## Releasing

When you are ready for release, follow the process above to create a PR that bumps the `version`
in the [`package.json`](./package.json) file to a higher version number. Then, open a pull request
from `develop` onto `main`. Do not squash-merge this PR. Instead, use a traditional merge commit.
This will prevent merge conflicts between the two branches and keep a clear record of what
features were added and what changes were made since the previous release. By convention, every
such merge to `main` is considered a release.

If you wish to deploy, make sure you are on the `main` branch with

```sh
git checkout main
```

Then run `yarn build` to build a production-grade version of this project, and deploy that to
hosting services as you see fit.
