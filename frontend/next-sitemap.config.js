/** @type {import('next-sitemap').IConfig} */
module.exports = {
  siteUrl: "https://siviacademy.in",
  generateRobotsTxt: true,
  generateIndexSitemap: false,
  changefreq: "weekly",
  priority: 0.7,
  sitemapSize: 5000,

  // Exclude private/admin routes
  exclude: [
    "/admin",
    "/admin/*",
    "/dashboard",
    "/dashboard/*",
    "/login",
    "/api/*",
  ],

  // Custom robot.txt rules
  robotsTxtOptions: {
    policies: [
      {
        userAgent: "*",
        allow: "/",
        disallow: ["/admin", "/dashboard", "/login", "/api"],
      },
    ],
    additionalSitemaps: [
      "https://siviacademy.in/sitemap.xml",
    ],
  },

  // Transform function to customize each URL entry
  transform: async (config, path) => {
    // Set higher priority for important pages
    const priorityMap = {
      "/": 1.0,
      "/courses": 0.9,
      "/test-series": 0.9,
      "/free-tests": 0.8,
      "/current-affairs": 0.8,
    };

    // Set change frequency based on content type
    const changefreqMap = {
      "/": "daily",
      "/current-affairs": "daily",
      "/courses": "weekly",
      "/test-series": "weekly",
      "/free-tests": "weekly",
      "/about": "monthly",
      "/contact": "monthly",
      "/terms": "yearly",
      "/privacy": "yearly",
      "/refund": "yearly",
    };

    return {
      loc: path,
      changefreq: changefreqMap[path] || config.changefreq,
      priority: priorityMap[path] || config.priority,
      lastmod: new Date().toISOString(),
    };
  },
};
