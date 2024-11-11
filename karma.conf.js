module.exports = function (config) {
  config.set({
    basePath: '',
    frameworks: [
      'jasmine',
      '@angular-devkit/build-angular'
    ],
    plugins: [
      require('karma-jasmine'),
      require('karma-firefox-launcher'),
      require('@angular-devkit/build-angular/plugins/karma'),
    ],
    client: {
      clearContext: false // leave Jasmine Spec Runner output visible in browser
    },
    port: 9876,
    colors: true,
    logLevel: config.LOG_INFO,
    autoWatch: true,
    browsers: ['Firefox'],
    singleRun: false
  });
};
