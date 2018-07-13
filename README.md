# Probot: Config

[![Downloads][npm-downloads]][npm-url] [![version][npm-version]][npm-url]
[![License][npm-license]][license-url]
[![Build Status][travis-status]][travis-url]

A [Probot](https://probot.github.io) extension to easily share configs between
repositories.

## Setup

Just put common configuration keys in a common repository within your
organization. Then reference this repository from config files with the same
name.

```yaml
# octocat/probot-settings:.github/test.yaml
shared1: will be merged
shared2: will also be merged

# octocat/repo1:.github/test.yaml
_extends: probot-settings
other: AAA

# octocat/repo2:.github/test.yaml
_extends: probot-settings
shared2: overrides shared2
other: BBB

# octocat/repo3:.github/test.yaml
other: CCC # standalone, does not extend other configs
```

Configs are shallow-merged, nested objects have to be redefined
completely.

You can also reference configurations from other organizations:

```yaml
_extends: other/probot-settings
other: DDD
```

Additionally, you can specify a specific path for the configuration by
appending a colon after the project.

```yaml
_extends: probot-settings:.github/other_test.yaml
other: FFF
```

Note that by default, inherited configurations are in the **exact same
location** within the repositories.  However, if a base repository is named
`.github`, the default config path is relative to the root of the repository
rather than relative to a `.github/` directory.

```yaml
# octocat/repo1:.github/test.yaml
_extends: .github
other: GGG

# octocat/.github:test.yaml
other: HHH
```

Additionally, if there is no config file, but there is a repo in the org named
`.github`, it will be used as a base repository.

```yaml
# octocat/repo1:.github/test.yaml <-- missing!
# octocat/.github:test.yaml
other: III
```

## Recipes

### An opt-in pattern

You may want to create a configuration that other projects in your org inherit
from on an explicit opt-in basis.  Example:

```yaml
# octocat/.github:_test.yaml
shared1: Will be inherited by repo1 and not repo2

# octocat/repo1:.github/test.yaml
# Inherits from octocat/.github:_test.yaml
_extends: .github:_test.yaml

# octocat/repo3:.github/test.yaml <--missing!
# Is not merged with another config.
```

### An opt-out pattern

Alternatively, you may want to default to the config in your `.github` project
and occasionally opt-out.  Example:

```yaml
# octocat/.github:test.yaml
shared1: Will be inherited by repo1 and not repo2

# octocat/repo1:.github/test.yaml <-- missing!
# Uses octocat/.github:test.yaml instead

# octocat/repo3:.github/test.yaml <-- either empty or populated
# Will not inherit shared1, since no _extends field is specified
```

## Usage

```js
const getConfig = require('probot-config');

module.exports = robot => {
  robot.on('push', async context => {
    // Will look for 'test.yml' inside the '.github' folder
    const config = await getConfig(context, 'test.yml');
  });
};
```

## Development

```sh
# Install dependencies
yarn

# Run the bot
yarn start

# Run test watchers
yarn test:watch
```

We use [prettier](https://prettier.io/) for auto-formatting and
[eslint](https://eslint.org/) as linter. Both tools can automatically fix a lot
of issues for you. To invoke them, simply run:

```sh
yarn fix
```

It is highly recommended to use VSCode and install the suggested extensions.
They will configure your IDE to match the coding style, invoke auto formatters
every time you save and run tests in the background for you. No need to run the
watchers manually.

[license-url]: https://github.com/getsentry/probot-config/blob/master/LICENSE
[npm-url]: https://www.npmjs.com/package/probot-config
[npm-license]: https://img.shields.io/npm/l/probot-config.svg?style=flat
[npm-version]: https://img.shields.io/npm/v/probot-config.svg?style=flat
[npm-downloads]: https://img.shields.io/npm/dm/probot-config.svg?style=flat
[travis-url]: https://travis-ci.org/getsentry/probot-config
[travis-status]: https://travis-ci.org/getsentry/probot-config.svg?branch=master
