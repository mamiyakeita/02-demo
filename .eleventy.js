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

  // assets をそのままコピー
  eleventyConfig.addPassthroughCopy("game-server/assets");

  // game-server/js もコピーしたいならこれでOK
  eleventyConfig.addPassthroughCopy("game-server/js");

  // 日付フィルタ
  eleventyConfig.addFilter("htmlDateString", (dateObj) => {
    return DateTime.fromJSDate(dateObj, { zone: "utc" }).toFormat(
      "dd LLL yyyy"
    );
  });

  // posts コレクション
  eleventyConfig.addCollection("posts", function (collection) {
    const coll = collection
      .getFilteredByTag("posts")
      .sort((a, b) => b.data.date - a.data.date);

    for (let i = 0; i < coll.length; i++) {
      const prevPost = coll[i - 1];
      const nextPost = coll[i + 1];

      coll[i].data["prevPost"] = prevPost;
      coll[i].data["nextPost"] = nextPost;
    }

    return coll;
  });

  // ★ ここが一番重要：出力先を deploy/_site にする
  return {
    dir: {
      input: "game-server",
      includes: "_layouts",
      data: "_data",
      output: "deploy/_site"
    }
  };
};
