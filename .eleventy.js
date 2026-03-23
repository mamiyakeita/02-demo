const { DateTime } = require("luxon");
const pluginNavigation = require("@11ty/eleventy-navigation");
const path = require("path");

module.exports = function (eleventyConfig) {
  eleventyConfig.setTemplateFormats([
    "html",
    "njk",
    "md",
    "css",
    "jpeg",
    "jpg",
    "png",
    "svg",
  ]);

  eleventyConfig.addPlugin(pluginNavigation);
  eleventyConfig.setBrowserSyncConfig({ ghostMode: false });

  // assets をそのままコピー（input=game-server なので assets は game-server/assets）
  eleventyConfig.addPassthroughCopy("assets");

  return {
    dir: {
      input: "game-server",
      includes: "_layouts",
      data: "_data",
      output: path.join(__dirname, "deploy/_site")
    }
  };
};
