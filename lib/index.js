const path = require('path');
const yaml = require('js-yaml');
const merge = require('deepmerge');

const CONFIG_PATH = '.github';
const BASE_KEY = '_extends';
const BASE_REGEX = new RegExp(
  '^' +
  '(?:([a-z\\d](?:[a-z\\d]|-(?=[a-z\\d])){0,38})/)?' + // org
  '([-_.\\w\\d]+)' + // project
  '(?::([-_./\\w\\d]+\\.ya?ml))?' + // filename
    '$',
  'i'
);
const DEFAULT_BASE = '.github';

/**
 * Decodes and parses a YAML config file
 *
 * @param {string} content Base64 encoded YAML contents
 * @returns {object} The parsed YAML file as native object
 */
function parseConfig(content) {
  return yaml.safeLoad(Buffer.from(content, 'base64').toString()) || {};
}

/**
 * Merges an array of configs
 *
 * @param {array<config>} configs The configs to merge
 * @param {object} options https://github.com/KyleAMathews/deepmerge#options
 * @returns {object} The merged configuration
 */
function deepMergeConfigs(configs, options) {
  return merge.all(configs.filter(config => config), options);
}

/**
 * Loads a file from GitHub
 *
 * @param {Context} context A Probot context
 * @param {object} params Params to fetch the file with
 * @returns {Promise<object>} The parsed YAML file
 * @async
 */
async function loadYaml(context, params) {
  try {
    const response = await context.github.repos.getContent(params);
    return parseConfig(response.data.content);
  } catch (e) {
    if (e.code === 404) {
      return null;
    }

    throw e;
  }
}

/**
 * Computes parameters for the repository specified in base
 *
 * Base can either be the name of a repository in the same organization or
 * a full slug "organization/repo".
 *
 * @param {object} params An object containing owner, repo and path
 * @param {string} base A string specifying the base repository
 * @returns {object} The params of the base configuration
 */
function getBaseParams(params, base) {
  if (typeof base !== 'string') {
    throw new Error(`Invalid repository name in key "${BASE_KEY}"`);
  }

  const match = base.match(BASE_REGEX);
  if (match == null) {
    throw new Error(`Invalid repository name in key "${BASE_KEY}": ${base}`);
  }

  return {
    owner: match[1] || params.owner,
    repo: match[2],
    path: match[3] || params.path,
  };
}

/**
 * Loads the specified config file from the context's repository
 *
 * If the config file contains a top-level key "_extends", it is merged
 * with a config of the same name in the repository specified by the
 * _extends key.  The repository of the base configuration can either be
 * given as "repository" or as "organization/repository".
 *
 * If the config file does not exist in the context's repository, `null`
 * is returned. If the base repository does not exist or does not contain
 * the config file, it is ignored.
 *
 * If a default config is given, it is merged with the config from the
 * repository, if it exists.
 *
 * @param {Context} context A Probot context
 * @param {string} fileName Name of the config file
 * @param {object} defaultConfig A default config that is merged in
 * @param {object} deepMergeOptions from deepmerge
 * @returns {object} The merged configuration
 * @async
 */
async function getConfig(context, fileName, defaultConfig, deepMergeOptions) {
  const filePath = path.posix.join(CONFIG_PATH, fileName);
  const params = context.repo({
    path: filePath,
  });

  const config = await loadYaml(context, params);
  let baseRepo;
  if (config == null) {
    baseRepo = DEFAULT_BASE;
  } else if (config != null && BASE_KEY in config) {
    baseRepo = config[BASE_KEY];
    delete config[BASE_KEY];
  }

  let baseConfig;
  if (baseRepo) {
    const baseParams = getBaseParams(params, baseRepo);
    baseConfig = await loadYaml(context, baseParams);
  }

  if (config == null && baseConfig == null && !defaultConfig) {
    return null;
  }

  return deepMergeConfigs(
    [defaultConfig, baseConfig, config],
    deepMergeOptions
  );
}

module.exports = getConfig;
