/**
 * @file diff_ids.js ~ 2014/09/23 21:40:09
 * @author leeight(liyubei@baidu.com)
 **/
var fs = require('fs');
var messages = require('./messages.json');
var msgids = {};
var all = {};
messages.forEach(function(msg){
    all[msg.uidl] = true;
    msgids[msg.id] = true;
});

var m0 = buildMap(fs.readFileSync('0.txt', 'utf-8'));
var m1 = buildMap(fs.readFileSync('1.txt', 'utf-8'));

Object.keys(all).forEach(function(id){
    if (!m1[id]) {
        console.log(id);
    }
});

function buildMap(text) {
    var map = {};
    text.trim().split(/\n/g).forEach(function(line){
        var chunks = line.split(/(\s*=>\s*)/g);
        chunks[chunks.length - 1].split(',').forEach(function(id){
            map[id] = true;
        });
    });

    return map;
}

console.log('Message Count = [%s]', Object.keys(msgids).length);








/* vim: set ts=4 sw=4 sts=4 tw=120: */
