# Probot: Config

[![Downloads][npm-downloads]][npm-url]
[![version][npm-version]][npm-url]
[![License][npm-license]][license-url]
[![Build Status][travis-status]][travis-url]

A [Probot](https://probot.github.io) extension to easily share configs between repositories.

## Setup

Just put common configuration keys in a common repository within your organization.
Then reference this repository from config files with the same name.

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

You can also reference configurations from other organizations:

```yaml
_extends: other/probot-settings
other: DDD
```

Note that the files must be at the **exact same location** within the repositories.
Configs are shallow-merged, nested objects have to be redefined completely.

## Usage

```js
const getConfig = require('probot-config');

module.exports = robot => {
  robot.on('push', context => {
    // Will look for 'test.yml' inside the '.github' folder
    const config = getConfig(context, 'test.yml');
  });
};
```

[license-url]: https://github.com/getsentry/probot-config/blob/master/LICENSE
[npm-url]: https://www.npmjs.com/package/probot-config
[npm-license]: https://img.shields.io/npm/l/probot-config.svg?style=flat
[npm-version]: https://img.shields.io/npm/v/probot-config.svg?style=flat
[npm-downloads]: https://img.shields.io/npm/dm/probot-config.svg?style=flat
[travis-url]: https://travis-ci.org/getsentry/probot-config
[travis-status]: https://travis-ci.org/getsentry/probot-config.svg?branch=master
