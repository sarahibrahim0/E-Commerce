module.exports = function (config) {
  config.set({
    frameworks: ['jasmine'],
    plugins: ['karma-jasmine', 'karma-chrome-launcher', 'karma-jasmine-html-reporter'],
    browsers: ['ChromeHeadlessCustom'],
    customLaunchers: {
      ChromeHeadlessCustom: {
        base: 'ChromeHeadless',
        flags: ['--headless', '--disable-gpu', '--no-sandbox', '--disable-dev-shm-usage'],
      },
    },
    reporters: ['progress', 'kjhtml'],
    singleRun: true,
  });
};
