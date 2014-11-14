/**
 * @file ps.js ~ 2014/09/22 16:32:57
 * @author leeight(liyubei@baidu.com)
 **/
var fs = require('fs');
var subjects = [];
var lines = fs.readFileSync('bar.txt', 'utf-8').trim().split(/\n/g);
var subject = '';
for (var i = 0; i < lines.length; i ++) {
    var line = lines[i];
    if (/^Subject:/.test(line) && line.indexOf('?=') !== -1) {
        if (subject) {
            subjects.push(subject.substr(9));
        }
        subject = line;
    } else {
        if (/^\s/.test(line)) {
            subject += line;
        }
    }
}
if (subject) {
    subjects.push(subject.substr(9));
}
console.log(subjects.join('\n'));









/* vim: set ts=4 sw=4 sts=4 tw=120: */
