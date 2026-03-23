const { DateTime } = require("luxon");
const pluginNavigation = require("@11ty/eleventy-navigation");

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

  // ★ これだけでOK（input=game-server なので assets は game-server/assets）
  eleventyConfig.addPassthroughCopy("game-server/assets");

  return {
    dir: {
      input: "game-server",
      includes: "_layouts",
      data: "_data",
      output: "deploy/_site"
    }
  };
};
