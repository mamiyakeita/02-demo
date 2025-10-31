const { DateTime } = require("luxon");
const pluginNavigation = require("@11ty/eleventy-navigation");

/**
 * This is the JavaScript code that sets the config for your Eleventy site
 *
 * You can add customizations here to define how the site builds your content
 * Try extending it to suit your needs!
 */

module.exports = function (eleventyConfig) {
  eleventyConfig.setTemplateFormats([
    // Templates:
    "html",
    "njk",
    "md",
    // Static Assets:
    "css",
    "jpeg",
    "jpg",
    "png",
    "svg",
  ]);

  eleventyConfig.addPlugin(pluginNavigation);
  eleventyConfig.addPassthroughCopy("assets");
  eleventyConfig.setBrowserSyncConfig({ ghostMode: false });

  // Filters let you modify the content https://www.11ty.dev/docs/filters/
  eleventyConfig.addFilter("htmlDateString", (dateObj) => {
    return DateTime.fromJSDate(dateObj, { zone: "utc" }).toFormat(
      "dd LLL yyyy"
    );
  });

  // Build the collection of posts to list in the site
  eleventyConfig.addCollection("posts", function (collection) {
    /* The posts collection includes all posts that list 'posts' in the front matter 'tags'
         - https://www.11ty.dev/docs/collections/
      */

    const coll = collection
      .getFilteredByTag("posts")
      .sort((a, b) => b.data.date - a.data.date);

    // Adds {{ prevPost.url }} {{ prevPost.data.title }}, etc, to our njks templates
    for (let i = 0; i < coll.length; i++) {
      const prevPost = coll[i - 1];
      const nextPost = coll[i + 1];

      coll[i].data["prevPost"] = prevPost;
      coll[i].data["nextPost"] = nextPost;
    }

    return coll;
  });

  return {
    dir: {
      input: "game-server",
      includes: "_layouts",
      data: "_data",
      output: "./deploy/_site",
    },
  };
};
module.exports = function(eleventyConfig) {
  eleventyConfig.addPassthroughCopy("game-server/js");
  return {
    dir: {
      input: "game-server",
      output: "deploy/_site"
    }
  };
};
