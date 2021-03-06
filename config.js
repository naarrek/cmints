"use strict";

const argv = require("minimist")(process.argv.slice(2));
const path = require("path");
const os   = require("os");

const src = argv.src || argv._.shift();
// Directories
const srcPath = src ? path.relative("", src) : ".";
const contentDir = `${srcPath}/content`;
const themeDir = `${srcPath}/theme`;
const publicDir = `${srcPath}/public`;
const userConfigFile = `${srcPath}/config.js`;

const dirs =
{
  srcPath, contentDir, publicDir, themeDir,
  pageDir: `${srcPath}/pages`,
  layoutsDir: `${themeDir}/layouts`,
  lessDir: `${themeDir}/less`,
  lessTargetDir: `${publicDir}/css`,
  browserifyDir: `${themeDir}/js`,
  browserifyTargetDir: `${publicDir}/js`,
  localesDir: `${srcPath}/locales`,
  tempDir: `${os.tmpdir()}/${process.pid}`
};

// Default port
let port = {
  https: 4000,
  http: 3000
};
let hostname = "127.0.0.1";
let root = "";

// Create gzip files
let gzip = false;

// i18n configuration
let i18nOptions = {
  type: "Index", // "Index", "Double"
  detectLang: false,
  defaultLocale: "en",
  prefix: "{",
  postfix: "}",
  // crowdinProject
  crowdin: {
    id: null,
    updateOption: "update_as_unapproved"
  }
};

let deployment =
{
  where: "git",
  branch: "gh-pages",
  gitDir: srcPath
};

// Supported Page extensions
const pageExtensions = [".md", ".ejs", ".html"];

// Default data passed to the template
let templateData =
{
  site: {
    title: "CMintS",
    description: "CMS created with the internationalization in mind"
  },
  page: {},
  i18n: {}
};

// Markdown configuration
// See https://markdown-it.github.io/markdown-it/#MarkdownIt.new
let markdownOptions =
{
  html:         true,
  xhtmlOut:     false,
  breaks:       false,
  langPrefix:   "language-",
  linkify:      false,
  typographer:  false,
  quotes: '“”‘’',
  plugins: [require("markdown-it-html-entities")]
};

// Browserify configuration
// see https://github.com/browserify/browserify#browserifyfiles--opts
let jsModuleOptions = {};

// LESS configuration
// see http://lesscss.org/usage/#less-options
let lessOptions =
{
  sourceMap: {
    sourceMapFileInline: true
  }
};

// Link to the example project ZIP file
let example = {
  default: "https://github.com/cmints/multi-lang-starter/archive/master.zip",
  single: "https://github.com/cmints/single-lang-starter/archive/master.zip",
  multi: "https://github.com/cmints/multi-lang-starter/archive/master.zip"
};

// Files to watch for configuration reload
let configReloadWatchers = [userConfigFile];

const loadUserConfig = () =>
{
  delete require.cache[path.resolve(userConfigFile)];
  // Loading user configurations
  try {
    // Use workspace path in order to load config when installed globally
    const userConfig = require(path.resolve(userConfigFile));
    if (userConfig.templateData)
      templateData = Object.assign(templateData, userConfig.templateData);
    if (userConfig.markdownOptions)
    {
      const {plugins} = markdownOptions;
      markdownOptions = Object.assign(markdownOptions, userConfig.markdownOptions);
      if (userConfig.markdownOptions.plugins && plugins)
        markdownOptions.plugins = [plugins, ...userConfig.markdownOptions.plugins];
    }
    if (userConfig.jsModuleOptions)
      jsModuleOptions = Object.assign(jsModuleOptions, userConfig.jsModuleOptions);
    if (userConfig.lessOptions)
      lessOptions = Object.assign(lessOptions, userConfig.lessOptions);
    if (userConfig.i18nOptions)
    {
      const {crowdin} = i18nOptions;
      i18nOptions = Object.assign(i18nOptions, userConfig.i18nOptions);
      if (crowdin)
        i18nOptions.crowdin = Object.assign(crowdin, userConfig.i18nOptions.crowdin);
    }
    if (userConfig.deployment)
      deployment = Object.assign(deployment, userConfig.deployment);
    if (userConfig.dirs)
      dirs = Object.assign(dirs, userConfig.dirs);
    if (userConfig.port)
      port = userConfig.port;
    if (userConfig.hostname)
      hostname = userConfig.hostname;
    if (userConfig.root)
      root = userConfig.root;
    if (userConfig.gzip === true)
      gzip = true;
    if (userConfig.example)
      example = userConfig.example;
    if (userConfig.configReloadWatchers)
      configReloadWatchers = configReloadWatchers.concat(userConfig.configReloadWatchers);
  }
  catch (e) {
    if (e.code == "MODULE_NOT_FOUND")
      console.log("Info: No custom config setup, see: https://cmints.io/documentation/getting-started/configuration");
    else
      console.error(e)
  }
}

loadUserConfig();

// When localesDir doesn't exist make a single language website
const multiLang = require("fs").existsSync(dirs.localesDir);

module.exports = {dirs, templateData, markdownOptions, pageExtensions, port,
  hostname, i18nOptions, multiLang, gzip, example, loadUserConfig,
  configReloadWatchers, deployment, root, lessOptions, jsModuleOptions};
