exports.input = __dirname;

var path = require( 'path' );
exports.output = path.resolve( __dirname, 'output' );

// var moduleEntries = 'html,htm,phtml,tpl,vm,js';
// var pageEntries = 'html,htm,phtml,tpl,vm';

exports.getProcessors = function () {
    var lessProcessor = new LessCompiler({
        files: [
            'src/common/css/main.less',
            'src/common/css/preview.less'
        ],
        pageFiles: [
            'index.html',
            'preview.html'
        ]
    });
    var cssProcessor = new CssCompressor();
    var moduleProcessor = new ModuleCompiler({
        files: [
            '*.js',
            '!customShim.js',
            '!src/third_party/**'
        ]
    });
    var jsProcessor = new JsCompressor();
    var pathMapperProcessor = new PathMapper();
    var addCopyright = new AddCopyright();

    return {
        'default': [ lessProcessor, moduleProcessor, pathMapperProcessor ],
        'release': [
            lessProcessor, cssProcessor, moduleProcessor,
            jsProcessor, pathMapperProcessor, addCopyright
        ]
    };
};

exports.exclude = [
    'tool',
    'doc',
    'test',
    'module.conf',
    'dep/packages.manifest',
    'dep/*/*/test',
    'dep/*/*/doc',
    'dep/*/*/demo',
    'dep/*/*/tool',
    'dep/*/*/*.md',
    'dep/*/*/package.json',
    'node_modules',
    'edp-*',
    '.edpproj',
    '.svn',
    '.git',
    '.gitignore',
    '.idea',
    '.project',
    'Desktop.ini',
    'Thumbs.db',
    '.DS_Store',
    '*.tmp',
    '*.bak',
    '*.swp'
];

exports.injectProcessor = function ( processors ) {
    for ( var key in processors ) {
        global[ key ] = processors[ key ];
    }
};

