/**
 * @file tools/dos2unix.js ~ 2014/09/20 20:30:22
 * @author leeight(liyubei@baidu.com)
 **/
var fs = require('fs');
var file = process.argv[2];

var buffer = [];
var src = fs.createReadStream(file);
var dst = fs.createWriteStream(file + '.1');
src.on('data', function(chunk) {
    var last = chunk[chunk.length - 1];
    if (last === 0x0D || last === 0x0A) {
        buffer.push(chunk);
    } else {
        if (buffer.length) {
            buffer.push(chunk);
            dst.write(fix(Buffer.concat(buffer)));
            buffer.length = 0;
        }
        else {
            dst.write(fix(chunk));
        }
    }
});
src.on('end', function() {
    if (buffer.length) {
        dst.write(fix(Buffer.concat(buffer)));
        buffer.length = 0;
    }
});

function fix(buf) {
    var rv = [];
    for (var i = 0, l = buf.length; i < l; i ++) {
        if (buf[i] === 0x0D && (i + 1) < l) {
            if (buf[i + 1] !== 0x0A) {
                // 
                rv.push(0x0A);
            } else {
                // \r\n
                rv.push(0x0A);
                i ++;
            }
        }
        else {
            rv.push(buf[i]);
        }
    }

    return new Buffer(rv);
}

/*

var b = require('replacestream')('\r\n', '');

// src | a | b | dst
src.pipe(b).pipe(dst);
*/










/* vim: set ts=4 sw=4 sts=4 tw=120: */
