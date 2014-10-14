exports.port = 8848;
exports.directoryIndexes = true;
exports.documentRoot = __dirname;

exports.proxyMap = {
    '127.0.0.1:8848': 'localhost:8765',
    '10.95.42.43:8848': 'localhost:8765',
    '172.17.237.30:8848': 'localhost:8765'
};

var mockup = require('bat-ria-tool/mockup');
var upload = require('bat-ria-tool/upload');
var cors = require('bat-ria-tool/cors');
var css2file = require('bat-ria-tool/css2file');

exports.getLocations = function () {
    return [
        {
            location: function(request) {
                return /\/$/.test(request.pathname);
            },
            handler: home( 'index.html' )
        },
        {
            location: /^\/redirect-local/,
            handler: redirect('redirect-target', false)
        },
        {
            location: /^\/redirect-remote/,
            handler: redirect('http://www.baidu.com', false)
        },
        {
            location: /^\/redirect-target/,
            handler: content('redirectd!')
        },
        {
            location: '/empty',
            handler: empty()
        },
        {
            location: /\.css($|\?)/,
            handler: [
                autocss(),
                css2file.getHandler()
            ]
        },
        {
            location: /\.less($|\?)/,
            handler: [
                file(),
                less()
            ]
        },
        {
            location: /\.styl($|\?)/,
            handler: [
                file(),
                stylus()
            ]
        },
        {
            location: /^(\/api|\/downloads)/,
            handler: [
                proxy()
            ]
        },
        { 
            location: upload.getLocation(), 
            handler: upload.getHandlers()
        },
        {
            location: mockup.getLocation(),
            handler: mockup.getHandlers()
        },
        { 
            location: cors.getLocation(), 
            handler: cors.getHandlers()
        }
    ];
};

exports.injectResource = function ( res ) {
    for ( var key in res ) {
        global[ key ] = res[ key ];
    }
};
