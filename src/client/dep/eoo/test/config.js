// Test configuration for edp-test 
// Generated on Wed May 21 2014 15:15:11 GMT+0800 (中国标准时间)
module.exports = {

    // base path, that will be used to resolve files and exclude
    basePath: '../',


    // frameworks to use
    frameworks: ['jasmine', 'esl'],


    // list of files / patterns to load in the browser
    files: [
        'test/ooSpec.js'
    ],


    // list of files to exclude
    exclude: [
      
    ],


    // optionally, configure the reporter
    reporter: ['progress', 'coverage'],
    preprocessors: ['oo.js', 'coverage'],
    coverageReporter: {
        // text-summary | text | html | json | teamcity | cobertura | lcov
        // lcovonly | none | teamcity
        type : 'text|html',
        dir : 'coverage/'
    },

    // web server port
    port: 8120,


    // enable / disable watching file and executing tests whenever any file changes
    watch: true,


    // Start these browsers, currently available:
    // - Chrome
    // - ChromeCanary
    // - Firefox
    // - Opera (has to be installed with `npm install karma-opera-launcher`)
    // - Safari (only Mac; has to be installed with `npm install karma-safari-launcher`)
    // - PhantomJS
    // - IE (only Windows; has to be installed with `npm install karma-ie-launcher`)
    browsers: [/*'Chrome', 'Firefox', 'Safari', 'PhantomJS'*/'IE'],


    // Continuous Integration mode
    // if true, it capture browsers, run tests and exit
    singleRun: false
};
