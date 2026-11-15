module.exports = function (eleventyConfig) {
  eleventyConfig.addPassthroughCopy("assets");

  return {
    dir: {
      input: "source",
      output: "deploy/_site"
    }
  };
};
