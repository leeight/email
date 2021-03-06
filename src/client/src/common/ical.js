/**
 * @file ical.js ~ 2014/09/04 16:33:47
 * @author leeight(liyubei@baidu.com)
 **/
define(function(require) {
var u = require('underscore');
var moment = require('moment');

function VCalendar(contents) {
  this.index = 0;
  this.lines = contents.trim().split(/(\r?\n)+/g);
}

VCalendar.prototype.parse = function() {
  this._feedLine();
  return this._parseBlock('VCALENDAR', 'END:VCALENDAR');
};

VCalendar.prototype._feedLine = function() {
  var line = this.lines[this.index++];
  return line;
};

VCalendar.prototype._parseBlock = function(key, end) {
  var count = this.lines.count;
  var pools = [];
  var arraysIndexMap = {};

  while(true) {
    if (this.index >= count) {
      break;
    }

    var line = this._feedLine();
    if (line === end) {
      break;
    }

    if (/^\s/.test(line)) {
      // 如果这一行是空白字符开头的，说明是上一行换行下来的，合并过去
      var last = pools[pools.length - 1];
      if (last) {
        if (u.isString(last[1])) {
          last[1] += line.trim();
          last[1] = last[1].replace(/\\n/g, '\n');
        } else if (u.isArray(last[1])) {
          var v = last[1];
          // 处理ATTENDEE的情况
          v[v.length - 1] += line.trim();
        }
      }
    } else {
      var parts = line.split(/[;:]/);
      var k = parts[0];
      var v = parts[1];
      if (k === 'BEGIN') {
        pools.push([v, this._parseBlock(k, 'END:' + v)]);
      } else if (k === 'ATTENDEE') {
        v = parts.slice(1).join(':');

        var index = arraysIndexMap[k];
        if (!index) {
          pools.push([k, [v]])
          arraysIndexMap[k] = pools.length - 1;
        } else {
          pools[index][1].push(v);
        }
      } else {
        v = parts.slice(1).join(':');
        pools.push([k, v])
      }
    }
  }

  var block = {};
  for(var i = 0; i < pools.length; i ++) {
    var k = pools[i][0];
    var v = pools[i][1];
    block[k] = v;
  }
  return block;
};

var exports = {};
exports.parse = function(contents) {
  return new VCalendar(contents).parse();
};

exports.format = function(calendar) {
  if (calendar.METHOD === 'CANCEL') {
    return calendar;
  }

  // 格式化开始时间和结束时间
  var start = calendar.VEVENT.DTSTART.replace(/\D/g, '');
  var end = calendar.VEVENT.DTEND.replace(/\D/g, '');
  var format = 'YYYYMMDDHHmmss';
  calendar.VEVENT.DTSTART = moment(start, format).format('YYYY-MM-DD HH:mm:ss');
  calendar.VEVENT.DTEND = moment(end, format).format('YYYY-MM-DD HH:mm:ss');

  function _(x) {
    return x.replace(/&#34;?/g, '"');
  }

  // 格式化 组织者 和 参与人员
  // CN=":Kong,Liying(BIT)"::MAILTO:kongliying@baidu.com
  var pattern = /CN=(")?:?([^":]+)\1:+MAILTO:(.*)$/;
  var match = pattern.exec(_(calendar.VEVENT.ORGANIZER));
  if (match) {
    calendar.VEVENT.ORGANIZER = {
      name: match[2],
      email: match[3]
    };
  }
  var attendees = [];
  u.each(calendar.VEVENT.ATTENDEE, function(item) {
    var match = pattern.exec(_(item));
    if (match) {
      attendees.push({
        name: match[2],
        email: match[3]
      });
    }
  });
  calendar.VEVENT.ATTENDEE = attendees;

  // 处理位置信息
  var location = calendar.VEVENT.LOCATION;
  calendar.VEVENT.LOCATION = location.split(':')[1] || location;

  // 处理描述信息
  calendar.VEVENT.DESCRIPTION = u.trim(calendar.VEVENT.DESCRIPTION);

  return calendar;
};

return exports;

});






/* vim: set ts=4 sw=4 sts=4 tw=120: */
