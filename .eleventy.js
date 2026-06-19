module.exports = function(eleventyConfig) {

  // assetsフォルダをそのままコピー
  eleventyConfig.addPassthroughCopy("source/assets");

  return {
    dir: {
      input: "source",      // 入力フォルダ
      output: "deploy/_site" // 出力フォルダ
    }
  };
};
