!function(e){if("object"==typeof exports&&"undefined"!=typeof module)module.exports=e();else if("function"==typeof define&&define.amd)define([],e);else{var f;"undefined"!=typeof window?f=window:"undefined"!=typeof global?f=global:"undefined"!=typeof self&&(f=self),f.icalendar=e()}}(function(){var define,module,exports;return (function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
(function (Buffer){
// Copyright (C) 2011 Tri Tech Computers Ltd.
// 
// Permission is hereby granted, free of charge, to any person obtaining a copy of
// this software and associated documentation files (the "Software"), to deal in
// the Software without restriction, including without limitation the rights to
// use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies
// of the Software, and to permit persons to whom the Software is furnished to do
// so, subject to the following conditions:
// 
// The above copyright notice and this permission notice shall be included in all
// copies or substantial portions of the Software.
// 
// THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
// IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
// FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
// AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
// LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
// OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
// SOFTWARE.
// 
//

var format_value = require('./types').format_value;

var schema = exports.schema = { };

var properties = exports.properties = {
    // Calendar properties
    CALSCALE:       { type: 'TEXT' },
    METHOD:         { type: 'TEXT' },
    PRODID:         { type: 'TEXT' },
    VERSION:        { type: 'TEXT' },

    // Descriptive component properties
    ATTACH:             { type: 'URI' },
    CATEGORIES:         { type: 'TEXT', list: true },
    CLASS:              { type: 'TEXT' },
    COMMENT:            { type: 'TEXT' },
    DESCRIPTION:        { type: 'TEXT' },
    GEO:                { type: 'FLOAT', list: true },
    LOCATION:           { type: 'TEXT' },
    'PERCENT-COMPLETE': { type: 'INTEGER' },
    PRIORITY:           { type: 'INTEGER' },
    RESOURCES:          { type: 'TEXT' },
    STATUS:             { type: 'TEXT' },
    SUMMARY:            { type: 'TEXT' },

    // Date and Time component properties
    COMPLETED: { type: 'DATE-TIME' },
    DTEND:     { type: 'DATE-TIME' },
    DUE:       { type: 'DATE-TIME' },
    DTSTART:   { type: 'DATE-TIME' },
    DURATION:  { type: 'DURATION' },
    FREEBUSY:  { type: 'PERIOD' },
    TRANSP:    { type: 'TEXT' },

    // Time Zone component properties
    TZID:         { type: 'TEXT' },
    TZNAME:       { type: 'TEXT' },
    TZOFFSETFROM: { type: 'UTC-OFFSET' },
    TZOFFSETTO:   { type: 'UTC-OFFSET' },
    TZURL:        { type: 'URI' },

    // Relationship component properties
    ATTENDEE:        { type: 'CAL-ADDRESS' },
    CONTACT:         { type: 'TEXT' },
    ORGANIZER:       { type: 'CAL-ADDRESS' },
    'RECURRENCE-ID': { type: 'DATE-TIME' },
    'RELATED-TO':    { type: 'TEXT' },
    URL:             { type: 'URI' },
    UID:             { type: 'TEXT' },

    // Recurrence component properties
    EXDATE: { type: 'DATE-TIME', list: true },
    RDATE:  { type: 'DATE-TIME', list: true },
    RRULE:  { type: 'RECUR' },

    // Alarm component properties
    ACTION:  { type: 'TEXT' },
    REPEAT:  { type: 'INTEGER' },
    TRIGGER: { type: 'DURATION' },

    // Change Management component properties
    CREATED:         { type: 'DATE-TIME' },
    DTSTAMP:         { type: 'DATE-TIME' },
    'LAST-MODIFIED': { type: 'DATE-TIME' },
    SEQUENCE:        { type: 'INTEGER' },

    // Miscellaneous component properties
    'REQUEST-STATUS': { type: 'TEXT' }
};



// Maximum number of octets in a single iCalendar line
var MAX_LINE = 75;



var CalendarObject = exports.CalendarObject = function(calendar, element) {
    this.calendar = calendar;
    this.element = element;
    this.components = {};
    this.properties = {};
}

// Create an element of the correct type
CalendarObject.create = function(element, calendar) {
    var factory = (schema[element] || {}).factory;
    return (factory !== undefined
             ? new factory(calendar)
             : new CalendarObject(calendar, element));
}

// Recursively generates a clone of some calendar object
CalendarObject.prototype.clone = function() {
    var obj = CalendarObject.create(this.element, this.calendar);

    for(var prop in this.properties)
        obj.addProperties(this.properties[prop]);

    var comp = this.getComponents();
    for(var i=0; i<comp.length; ++i)
        obj.addComponent(comp[i]);

    return obj;
}

CalendarObject.prototype.addProperties = function(props) {
    props.forEach(this.addProperty.bind(this));
}

CalendarObject.prototype.addProperty = function(prop, value, parameters) {
    if(!(prop instanceof CalendarProperty)) {
        if(value === undefined) return;
        prop = new CalendarProperty(prop, value, parameters);
    }
    else
        prop = prop.clone();

    this.properties[prop.name] = this.properties[prop.name] || [];
    this.properties[prop.name].push(prop);
    return prop;
}

// Replace an existing property or properties
CalendarObject.prototype.setProperty = function(prop, value, parameters) {
    this.removeProperty(prop instanceof CalendarProperty ? prop.name : prop);
    this.addProperty(prop, value, parameters);
}

CalendarObject.prototype.addComponent = function(comp) {
    if(!(comp instanceof CalendarObject)) {
        var factory = (schema[comp] || {}).factory;
        comp = factory !== undefined
                 ? new factory(this.calendar)
                 : new CalendarObject(this.calendar, comp);
    }

    // Create a copy of the component if it's from a different
    // calendar object to prevent changes from one place happening 
    // somewhere else as well
    if(comp.calendar && comp.calendar !== this.calendar)
        comp = comp.clone();

    this.components[comp.element] = this.components[comp.element] || [];
    this.components[comp.element].push(comp);
    comp.calendar = this.calendar;
    return comp;
}

CalendarObject.prototype.addComponents = function(comps) {
    comps.forEach(this.addComponent.bind(this));
}

CalendarObject.prototype.getComponents = function(type) {
    if(type === undefined) {
        var all = [];
        for(var c in this.components)
            all = all.concat(this.components[c]);

        return all;
    }

    return this.components[type] || [];
}

CalendarObject.prototype.getProperty = function(prop, i) {
    return (this.properties[prop] || [])[i || 0];
}

CalendarObject.prototype.getProperties = function(prop) {
    return this.properties[prop] || [];
}

CalendarObject.prototype.getPropertyValue = function(prop, i) {
    return (this.getProperty(prop, i) || {}).value;
}

CalendarObject.prototype.removeProperty = function(prop) {
    delete this.properties[prop];
}

CalendarObject.prototype.validate = function() {
    var self = this;
    var _schema = schema[self.element];
    if(_schema && _schema.required_properties) {
        _schema.required_properties.forEach(function(req) {
            if(!self.getPropertyValue(req))
                throw new Error(req+" is a required property of "+self.element);
        });
    }

    for(var type in self.components) {
        self.components[type].forEach(function(comp) {
            comp.validate();
        });
    }
}

CalendarObject.prototype.toString = function() {
    // Make sure output always includes a VCALENDAR object
    var output;
    if(this.element == 'VCALENDAR')
        output = this.format();
    else {
        var ical = new (require('./icalendar').iCalendar)();
        ical.addComponent(this);
        output = ical.format()
    }

    output.push(''); // <-- Add empty element to ensure trailing CRLF
    return output.join('\r\n');
}

CalendarObject.prototype.format = function() {
    var lines = ['BEGIN:'+this.element];
    for(var i in this.properties) {
        this.properties[i].forEach(function(prop) {
            lines.push.apply(lines, prop.format());
        });
    }

    for(var comp in this.components) {
        var comp = this.components[comp];
        for(var i=0; i < comp.length; ++i)
            lines.push.apply(lines, comp[i].format());
    }

    lines.push('END:'+this.element);
    return lines;
}




var CalendarProperty = exports.CalendarProperty = function(name, value, parameters) {
    var propdef = properties[name];

    this.type = propdef && propdef.type ? propdef.type : 'TEXT';
    this.name = name;
    this.value = value;
    this.parameters = parameters || {};
}

CalendarProperty.prototype.clone = function() {
    var obj = new CalendarProperty(this.name, this.value);
    obj.type = this.type;

    // TODO: Copy type and value instances in the case of objects, dates, arrays
    for(var param in this.parameters)
        obj.parameters[param] = this.parameters[param];

    return obj;
}

CalendarProperty.prototype.getParameter = function(param) {
    return this.parameters[param];
}

CalendarProperty.prototype.setParameter = function(param, value) {
    this.parameters[param] = value;
}

CalendarProperty.prototype.format = function() {
    var params = [];
    for(var k in this.parameters)
        params.push(k+'='+this.parameters[k]);

    if(params.length)
        params = ';'+params.join(';');

    var data = new Buffer(this.name+params+':'+format_value(this.type, this.value, this.parameters));
    var pos = 0, len;
    var output = [];
    while(true) {
        len = MAX_LINE;
        if(pos+len >= data.length)
            len = data.length-pos;

        // We're in the middle of a unicode character if the high bit is set and
        // the next byte is 10xxxxxx (or 0x80).  Don't split it in half.
        // Wind backward until we find the start character...
        while((data[pos+len] & 0xc0) == 0x80)
            len--;

        output.push(data.toString('utf8', pos, pos+len));

        if(pos+len >= data.length)
            break;

        // Insert the space for the start of the next line...
        pos += len-1;
        data[pos] = 0x20;
    }

    return output;
}

}).call(this,require("buffer").Buffer)
},{"./icalendar":3,"./types":8,"buffer":10}],2:[function(require,module,exports){
"use strict";
// Copyright (C) 2011 Tri Tech Computers Ltd.
// 
// Permission is hereby granted, free of charge, to any person obtaining a copy of
// this software and associated documentation files (the "Software"), to deal in
// the Software without restriction, including without limitation the rights to
// use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies
// of the Software, and to permit persons to whom the Software is furnished to do
// so, subject to the following conditions:
// 
// The above copyright notice and this permission notice shall be included in all
// copies or substantial portions of the Software.
// 
// THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
// IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
// FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
// AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
// LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
// OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
// SOFTWARE.
// 
// 

var util = require('util');

var CalendarObject = require('./base').CalendarObject;
var schema = require('./base').schema;

var iCalendar = require('./icalendar').iCalendar;

var RRule = require('./rrule').RRule;



var VEvent = exports.VEvent = function(calendar, uid) {
    if(!(calendar instanceof iCalendar) && calendar != null) {
        uid = calendar;
        calendar = null;
    }
    CalendarObject.call(this, calendar, 'VEVENT');

//    TODO: Move validation to its own method
//    if(uid === undefined)
//        throw Error("UID is a required parameter");

    if(uid !== undefined) {
        this.addProperty('DTSTAMP', new Date());
        this.addProperty('UID', uid);
    }
}
util.inherits(VEvent, CalendarObject);

VEvent.prototype.setSummary = function(summ) {
    this.addProperty('SUMMARY', summ);
}

VEvent.prototype.setLocation = function(loc) {
    this.addProperty('LOCATION', loc);
}

VEvent.prototype.setDescription = function(desc) {
    this.addProperty('DESCRIPTION', desc);
}

VEvent.prototype.setDate = function(start, end) {
    this.addProperty('DTSTART', start);
    if(end instanceof Date)
        this.addProperty('DTEND', end);
    else
        this.addProperty('DURATION', end);
}

VEvent.prototype.rrule = function() {
    var rr = this.getPropertyValue('RRULE');
    if(!rr) return null;

    var exceptions = [];
    var ex, i=0;
    while(ex = this.getPropertyValue('EXDATE', i++))
        exceptions.push.apply(exceptions, ex);

    return new RRule(rr, {
        DTSTART: this.getPropertyValue('DTSTART'),
        DTEND: this.getPropertyValue('DTEND'),
        EXDATE: exceptions
    });
}

VEvent.prototype.inTimeRange = function(start, end) {
    var rr = this.rrule();
    if(rr) {
        var next = rr.next(start);
        return (next !== null && (!end || next <= end));
    }

    var dtstart = this.getPropertyValue('DTSTART');
    var dtend = this.getPropertyValue('DTEND');
    if(!dtend) {
        var duration = this.getPropertyValue('DURATION');
        if(duration === 0)
            // Special case for zero-duration, as per RFC4791
            return (!start || start <= dtstart) && (!end || end > dtstart);

        else if(duration)
            dtend = new Date(dtstart.valueOf() + this.getPropertyValue('DURATION')*1000);
        else 
            dtend = new Date(dtstart.valueOf() + 24*60*60*1000); // +1 day
    }

    return (!start || start < dtend) && (!end || end > dtstart);
}

// Respond to this invitation (assumes this is an invitation)
//
// fromuser: URL for the user, usually in the form mailto:bob@example.com
// status: true, false, 'ACCEPTED', 'DECLINED', 'TENTATIVE', or as per RFC5545
VEvent.prototype.reply = function(fromuser, status, options) {
    var resp = this.clone(true);
    options = options || {};

    if(status === true || status === undefined)
        status = 'ACCEPTED';
    else if(status === false)
        status = 'DECLINED';

    resp.setProperty('ATTENDEE', fromuser, {
        'PARTSTAT': status,
        'CN': options['CN'] || fromuser
    });

    resp.setProperty('DTSTAMP', new Date());
    resp.setProperty('LAST-MODIFIED', new Date());

    var ics = new iCalendar();
    // TODO: Support REFRESH/COUNTER
    ics.addProperty('METHOD', 'REPLY');

    // Copy VTIMEZONE components...
    if(this.calendar)
        ics.addComponents(this.calendar.getComponents('VTIMEZONE'));

    ics.addComponent(resp);

    return ics;
}


schema.VEVENT = {
    factory: VEvent,
    valid_properties: [],
    required_properties: ['DTSTAMP','UID'],
    valid_children: [],
    required_children: []
};

},{"./base":1,"./icalendar":3,"./rrule":6,"util":17}],3:[function(require,module,exports){
// Copyright (C) 2011 Tri Tech Computers Ltd.
// 
// Permission is hereby granted, free of charge, to any person obtaining a copy of
// this software and associated documentation files (the "Software"), to deal in
// the Software without restriction, including without limitation the rights to
// use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies
// of the Software, and to permit persons to whom the Software is furnished to do
// so, subject to the following conditions:
// 
// The above copyright notice and this permission notice shall be included in all
// copies or substantial portions of the Software.
// 
// THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
// IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
// FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
// AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
// LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
// OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
// SOFTWARE.
// 
// 
// 
// Implement RFC5545 (iCalendar)
// see: http://tools.ietf.org/html/rfc5545
//

var assert = require('assert');
var util = require('util');

var CalendarObject = require('./base').CalendarObject;
var CalendarProperty = require('./base').CalendarProperty;
var schema = require('./base').schema;



var iCalendar = exports.iCalendar = function(empty) {
    CalendarObject.call(this, this, 'VCALENDAR');
    this.calendar = this;

    if(!empty) {
        this.addProperty('VERSION', '2.0');
        this.addProperty('PRODID', require('./index').PRODID);      
    }
}
util.inherits(iCalendar, CalendarObject);

iCalendar.prototype.events = function() { return this.components['VEVENT'] || []; }

iCalendar.prototype.timezone = function(tzid) {
    for(var i=0; i<this.components['VTIMEZONE'].length; ++i) {
        var tz = this.components['VTIMEZONE'][i];
        if(tz.getPropertyValue('TZID') == tzid)
            return tz;
    }
}



schema.VCALENDAR = {
    factory: iCalendar,
    valid_properties: [],
    required_properties: ['PRODID','VERSION'],
    valid_children: ['VEVENT'],
    required_children: []
};

// Unimplemented components...
schema.VTODO = {
    required_properties: ['DTSTAMP','UID']
};
schema.VJOURNAL = {
    required_properties: ['DTSTAMP','UID']
};
schema.VFREEBUSY = {
    required_properties: ['DTSTAMP','UID']
};
schema.VALARM = {
    required_properties: ['ACTION','TRIGGER']
};

},{"./base":1,"./index":4,"assert":9,"util":17}],4:[function(require,module,exports){
// Copyright (C) 2011 Tri Tech Computers Ltd.
// 
// Permission is hereby granted, free of charge, to any person obtaining a copy of
// this software and associated documentation files (the "Software"), to deal in
// the Software without restriction, including without limitation the rights to
// use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies
// of the Software, and to permit persons to whom the Software is furnished to do
// so, subject to the following conditions:
// 
// The above copyright notice and this permission notice shall be included in all
// copies or substantial portions of the Software.
// 
// THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
// IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
// FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
// AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
// LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
// OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
// SOFTWARE.
// 
// 
// 
// Implement RFC5545 (iCalendar)
// see: http://tools.ietf.org/html/rfc5545
//


exports.format_value = require('./types').format_value;
exports.parse_value = require('./types').parse_value;
exports.RRule = require('./rrule').RRule;

exports.parse_calendar = require('./parser').parse_calendar;
exports.ParseError = require('./parser').ParseError;

exports.CalendarObject = require('./base').CalendarObject;
exports.CalendarProperty = require('./base').CalendarProperty;


exports.iCalendar = require('./icalendar').iCalendar;
exports.VEvent = require('./event').VEvent;
exports.VTimezone = require('./timezone').VTimezone;



exports.PRODID = '-//Tri Tech Computers//node-icalendar//EN';

},{"./base":1,"./event":2,"./icalendar":3,"./parser":5,"./rrule":6,"./timezone":7,"./types":8}],5:[function(require,module,exports){
// Copyright (C) 2011 Tri Tech Computers Ltd.
// 
// Permission is hereby granted, free of charge, to any person obtaining a copy of
// this software and associated documentation files (the "Software"), to deal in
// the Software without restriction, including without limitation the rights to
// use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies
// of the Software, and to permit persons to whom the Software is furnished to do
// so, subject to the following conditions:
// 
// The above copyright notice and this permission notice shall be included in all
// copies or substantial portions of the Software.
// 
// THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
// IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
// FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
// AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
// LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
// OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
// SOFTWARE.
// 
//

var assert = require('assert');
var util = require('util');
var types = require('./types');

var CalendarObject = require('./base').CalendarObject;
var schema = require('./base').schema;
var properties = require('./base').properties;

var iCalendar = require('./icalendar').iCalendar;

var parse_value = types.parse_value;
var format_value = types.format_value;



var ParseError = exports.ParseError = function() {
    Error.apply(this, arguments);
}
util.inherits(ParseError, Error);



function expect(expect_element, expect_value, next_state) {
    // Return a function that expects a certain element and value
    return function(element, value, parameters) {
        if(element != expect_element)
            throw new ParseError("Expected "+expect_element+" got "+element);

        if(expect_value && expect_value != value)
            throw new ParseError("Expected "+expect_value+" got "+value);
       
        return next_state;
    }
}

function parse_component(component, next_state) {
    // Parse an icalendar object
    var cal = component.calendar;
    return function this_state(element, value, parameters) {
        if(element == 'BEGIN') {
            var factory = (schema[value] || {}).factory;
            var child = factory !== undefined
                    ? new factory(cal)
                    : new CalendarObject(cal, value);

            return parse_component(child, function() {
                component.addComponent(child);
                // Forward this call onto our next state to process
                //  the current input record
                return this_state.apply(this, arguments);
            });
        }

        else if(element == 'END') {
            return next_state;
        }

        else {
            var prop = properties[element] || {};
            value = parse_value(prop.type, value, parameters, cal, prop.list);
            component.addProperty(element, value, parameters);
            return this_state;
        }
    }
}

PROP_NAME = 0;
PARAM_NAME = 1;
PARAM_VALUE = 2;
MAYBE_QUOTED_PARAM = 3;
QUOTED_PARAM_VALUE = 4;
PARAM_OR_VALUE = 5;
PROP_VALUE = 6;

function parse_record(rec) {
    var propname;
    var params = {};
    var state = PROP_NAME;
    var lastpos = 0;

    var current_param;

    // Switch state and bookmark the current position
    function newstate(s) {
        state = s;
        lastpos = i+1;
    }
    
    // Return the accumulated string since the last state change
    function str() {
        return rec.substr(lastpos, i - lastpos);
    }

    var i=0, j=rec.length;
    for(; i<j; ++i) {
        var ch = rec[i];
        switch(state) {
        case PROP_NAME:
            if(ch == ':' || ch == ';') {
                propname = str();
                state = PARAM_OR_VALUE;
                --i; // Re-evaluate
            }
            break;

        case PARAM_OR_VALUE:
            if(ch == ':')
                newstate(PROP_VALUE);
            else if(ch == ';')
                newstate(PARAM_NAME);
            else
                throw new Error("Parse error");
            break;

        case PARAM_NAME:
            if(ch == '=') {
                current_param = str();
                newstate(MAYBE_QUOTED_PARAM);
            }
            break;

        case MAYBE_QUOTED_PARAM:
            if(ch == '"')
                newstate(QUOTED_PARAM_VALUE);
            else
                state = PARAM_VALUE;

            break;

        case PARAM_VALUE:
            if(ch == ':' || ch == ';') {
                params[current_param] = str();
                state = PARAM_OR_VALUE;
                --i; // Re-evaluate
            }
            break;

        case QUOTED_PARAM_VALUE:
            if(ch == '"') {
                params[current_param] = str();
                state = PARAM_OR_VALUE;
            }
            break;

        case PROP_VALUE:
            // Done...
            i=j;
            break;

        default:
            throw new Error("Invalid parser state");
        }
    }

    return [ propname, str(), params ];
}

// Parse iCalendar formatted data and return an iCalendar object
//
// The second argument is an optional calendar object containing VTIMEZONE
// data to aid in the correct conversion of dates
exports.parse_calendar = function(data, timezone) {
    data = data.split(/\r?\n/);
    var calendar = new iCalendar(true);
    if(timezone) {
        if(typeof timezone === 'string')
            timezone = exports.parse_calendar(timezone);

        if(timezone instanceof iCalendar) {
            var tzs = timezone.getComponents('VTIMEZONE');
            for(var i=0; i<tzs.length; ++i)
                calendar.addComponent(tzs[i]);
        }
        else
            calendar.addComponent(tzs[i]);
    }
    var state = expect("BEGIN", "VCALENDAR", parse_component(calendar));

    for(var i=0; i<data.length-1; ++i) {
        if(!data[i].length)
            continue;
            
        if(state === undefined)
            throw new ParseError("Mismatched BEGIN/END tags");

        // Peek ahead to find line continuations...
        var j = i;
        while(j+1<data.length && (data[j+1][0] === ' ' || data[j+1][0] === '\t'))
            ++j;

        var record = data[i];
        if(j != i) {
            var d = data.slice(i, j+1);
            for(var k=1; k<d.length; ++k)
                // Strip out the extra space...
                d[k] = d[k].substr(1);
            record = d.join('');
            i = j;
        }

        state = state.apply(null, parse_record(record));
    }

    if(state !== undefined)
        throw new ParseError("Unable to parse calendar data; END:VCALENDAR not found!");

    return calendar;
}

},{"./base":1,"./icalendar":3,"./types":8,"assert":9,"util":17}],6:[function(require,module,exports){
// Copyright (C) 2011 Tri Tech Computers Ltd.
// 
// Permission is hereby granted, free of charge, to any person obtaining a copy of
// this software and associated documentation files (the "Software"), to deal in
// the Software without restriction, including without limitation the rights to
// use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies
// of the Software, and to permit persons to whom the Software is furnished to do
// so, subject to the following conditions:
// 
// The above copyright notice and this permission notice shall be included in all
// copies or substantial portions of the Software.
// 
// THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
// IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
// FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
// AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
// LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
// OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
// SOFTWARE.
// 
//
//
// NB: All calculations here happen using the UTC portion of a datetime object
//   as if it were the local time. This is done to reuse the TZ-agnostic date
//   calculations provided to us. Without this, performing date calculations
//   across local DST boundaries would yield surprising results.
//


var types = require('./types');

var SUPPORTED_PARTS = ['FREQ','INTERVAL','COUNT','UNTIL','BYDAY','BYMONTH','BYMONTHDAY'];
var WKDAYS = ['SU','MO','TU','WE','TH','FR','SA'];

function to_utc_date(dt) {
    if(Array.isArray(dt)) {
        dt = dt.slice(0); // Make a copy...
        dt[1]--; // Fixup month for Date.UTC()
    }
    else
        dt = [dt.getFullYear(), dt.getMonth(), dt.getDate(),
        dt.getHours(), dt.getMinutes(), dt.getSeconds(), dt.getMilliseconds()];

    return new Date(Date.UTC.apply(null, dt));
    //udt.date_only = dt.date_only;
    return udt;
}

function from_utc_date(udt) {
    var dt = new Date(udt.getUTCFullYear(), udt.getUTCMonth(), udt.getUTCDate(),
        udt.getUTCHours(), udt.getUTCMinutes(), udt.getUTCSeconds(), udt.getUTCMilliseconds());
    //dt.date_only = udt.date_only;
    return dt;
}

// Return only the whole number portion of a number
function trunc(n) {
    return n < 0 ? Math.ceil(n) : Math.floor(n);
}

// These are more comfy to type...
function y(dt)   {  return dt.getUTCFullYear();     }
function m(dt)   {  return dt.getUTCMonth()+1;      }
function d(dt)   {  return dt.getUTCDate();         }
function hr(dt)  {  return dt.getUTCHours();        }
function min(dt) {  return dt.getUTCMinutes();      }
function sec(dt) {  return dt.getUTCSeconds();      }
function ms(dt)  {  return dt.getUTCMilliseconds(); }

function set_y(dt, v)   {  dt.setUTCFullYear(v);     return dt;  }
function set_m(dt, v)   {  dt.setUTCMonth(v-1);      return dt;  }
function set_d(dt, v)   {  dt.setUTCDate(v);         return dt;  }
function set_hr(dt, v)  {  dt.setUTCHours(v);        return dt;  }
function set_min(dt, v) {  dt.setUTCMinutes(v);      return dt;  }
function set_sec(dt, v) {  dt.setUTCSeconds(v);      return dt;  }
function set_ms(dt, v)  {  dt.setUTCMilliseconds(v); return dt;  }

function add_y(dt, v)   {  return set_y(dt, y(dt)+v);      }
function add_m(dt, v)   {  return set_m(dt, m(dt)+v);      }
function add_d(dt, v)   {  return set_d(dt, d(dt)+v);      }
function add_hr(dt, v)  {  return set_hr(dt, hr(dt)+v);    }
function add_min(dt, v) {  return set_min(dt, min(dt)+v);  }
function add_sec(dt, v) {  return set_sec(dt, sec(dt)+v);  }

// First of the month
function fst(dt)    {
    return new Date(y(dt), m(dt)-1, 1);
}

// Day of week (0-6), adjust for the start of week
function wkday(dt) {
    return dt.getUTCDay();
}

// Return the number of days between dt1 and dt2
function daydiff(dt1, dt2) {
    return (dt2-dt1)/(1000*60*60*24);
}

// Week of year
function wk(dt)  {  
    var jan1 = new Date(Date.UTC(y(dt), 0, 1));
    return trunc(daydiff(jan1, dt)/7);
}

// Week of month
function m_wk(dt, wkst) {
    return (0 | d(dt)/7) + (d(dt) % 7 === 0 ? 0 : 1);
}


var RRule = exports.RRule = function(rule, options, dtend) {
    if(options instanceof Date)
        options = { DTSTART: options, DTEND: dtend };

    options = options || {};
    this.start = options.DTSTART ? to_utc_date(options.DTSTART) : null;
    this.end = options.DTEND ? to_utc_date(options.DTEND) : null;

    this.exceptions = options.EXDATE || [];

    if(typeof rule === 'string')
        rule = RRule.parse(rule);

    this.rule = {};
    for(var i in (rule||{})) {
        if(SUPPORTED_PARTS.indexOf(i) == -1)
            throw new Error(i+" is not currently supported!");

        this.rule[i] = RULE_PARTS[i]
                ? RULE_PARTS[i].parse(rule[i])
                : rule[i];
    }
}

RRule.parse = function(value) {
    var parts = value.split(/=|;/);
    var rrule = {};
    for(var i=0; i<parts.length; i+=2) {
        rrule[parts[i]] = parts[i+1];
    }
    return rrule;
}

RRule.prototype.setFrequency = function(freq) {
    this.rule.FREQ = freq;
}

RRule.prototype.valueOf = function() { return this.rule; }

RRule.prototype.toString = function() {
    // FREQ comes first, as per spec
    var out = [ 'FREQ='+this.rule.FREQ ];
    for(var k in this.rule) {
        if(k=='FREQ') continue;

        out.push(k+'='+((RULE_PARTS[k] || {}).format
                ? RULE_PARTS[k].format(this.rule[k])
                : this.rule[k]));
    }
    return out.join(';');
}

// Return the next occurrence after dt
RRule.prototype.next = function(after) {
    after = after && to_utc_date(after);

    // Events don't occur before the start or after the end...
    if(!after || after < this.start)
        after = new Date(this.start.valueOf() - 1);
    if(this.until && after > this.until) return null;

    var freq = FREQ[this.rule.FREQ];
    if(!freq)
        throw new Error(this.rule.FREQ+' recurrence is not supported');

    NextOccurs:
    while(true) {
        var next = freq.next(this.rule, this.start, after);

        // Exclude EXDATES
        var nextInLocal = from_utc_date(next);
        for(var i=0; i < this.exceptions.length; i++) {
            var exdate = this.exceptions[i];
            if((exdate.valueOf() == nextInLocal.valueOf())
                    || (exdate.date_only && y(to_utc_date(exdate)) == y(nextInLocal)
                    && m(to_utc_date(exdate)) == m(nextInLocal) && d(to_utc_date(exdate)) == d(nextInLocal))) {
                after = next;
                continue NextOccurs;
            }
        }

        break;
    }

    // Date is off the end of the spectrum...
    if(this.until && next > this.until)
        return null;

    if(this.rule.COUNT && this.count_end !== null) {
        if(this.count_end === undefined) {
            // Don't check this while we're trying to compute it...
            this.count_end = null;
            this.count_end = this.nextOccurences(this.rule.COUNT).pop();
        }

        if(next > to_utc_date(this.count_end))
            return null;
    }

    if(this.rule.UNTIL && next > to_utc_date(this.rule.UNTIL))
        return null;

    return from_utc_date(next);
}

RRule.prototype.nextOccurences = function(after, count_or_until) {
    if(arguments.length === 1) {
        count_or_until = after;
        after = undefined;
    }

    var arr = [];
    if(count_or_until instanceof Date) {
        while(true) {
            after = this.next(after);
            if(after && after <= count_or_until)
                arr.push(after);
            else
                break;
        }
    }
    else {
        while(count_or_until-- && after !== null) {
            after = this.next(after);
            if(after)
                arr.push(after);
        }
    }
    return arr;
}


var RULE_PARTS = {
    INTERVAL: {
        parse: function(v) { return parseInt(v,10); }
    },
    UNTIL: {
        parse: function(v) {
            if(v instanceof Date) return v;
            return types.parse_value('DATE-TIME', v);
        },
        format: function(v) { return types.format_value('DATE-TIME', v); }
    },
    FREQ: {
        parse: function(v) { return v; },
    },
    BYMONTH: {
        parse: function(v) {
            if(typeof v === 'number') return [v];

            return v.split(',').map(function(mo) {
                return parseInt(mo,10);
            });
        },
        format: function(v) {
            return v.join(',');
        }
    },
    BYDAY: {  // 2TH (second thursday) -> [2,4]
        parse: function(v) {
            var days = v.split(',').map(function(day) {
                var m = day.match(/([+-]?\d)?(SU|MO|TU|WE|TH|FR|SA)/);
                return [parseInt(m[1],10)||0, WKDAYS.indexOf(m[2])];
            });

            days.sort(function(d1, d2) {
                // Sort by week, day of week
                if(d1[0] == d2[0])
                    return d1[1] - d2[1];
                else
                    return d1[0] - d2[0];
            });

            return days;
        },
        format: function(v) {
            return v.map(function(day) {
                return (day[0] || '')+WKDAYS[day[1]];
            }).join(',');
        }
    },
    EXDATE: {
      parse: function(v) {
        return v.split(',').map(function(dt) {
          return dt.length == 8 ? types.parse_value('DATE', dt) : types.parse_value('DATE-TIME', dt);
        });
      },
      format: function(v) {
        return v.map(function(dt) {
            return types.format_value(dt.date_only ? 'DATE' : 'DATE-TIME', dt);
        }).join(',');
      }
    }
};

// These parts use the same format...
RULE_PARTS['BYMONTHDAY'] = RULE_PARTS['BYMONTH'];
RULE_PARTS['COUNT'] = RULE_PARTS['INTERVAL'];

var FREQ = {
    DAILY: {
        next: function(rule, start, after) {
            var next = new Date(after);
            set_hr(next, hr(start));
            set_min(next, min(start));
            set_sec(next, sec(start));
            set_ms(next, ms(start));

            var interval = rule.INTERVAL || 1;

            // Adjust for interval...
            var mod_days = trunc(daydiff(next, start)) % interval;
            if(mod_days)
                add_d(next, interval - mod_days);

            for(var i=0; i<2; ++i) {
                next = byday(rule.BYDAY, next, after);

                if(next.valueOf() > after.valueOf())
                    break;

                add_d(next, interval);
            }

            return next;
        }
    },
    WEEKLY: {
        next: function(rule, start, after) {
            var next = new Date(after);
            set_hr(next, hr(start));
            set_min(next, min(start));
            set_sec(next, sec(start));
            set_ms(next, ms(start));

            var interval = rule.INTERVAL || 1;

            // Adjust for interval...
            var mod_weeks = trunc(daydiff(start, next) / 7) % interval;
            if(mod_weeks)
                add_d(next, (interval - mod_weeks) * 7);

            while(true) {
                next = byday(rule.BYDAY, next, after);

                // Fall back to the start day of the week
                if (!rule.BYDAY || !rule.BYDAY.length) {
                  startDayOfWeek = wkday(start);
                  nextDayOfWeek = wkday(next);

                  // Always move backwards to the start day of week
                  if (nextDayOfWeek > startDayOfWeek)
                    add_d(next, startDayOfWeek - nextDayOfWeek);
                  else if (startDayOfWeek > nextDayOfWeek)
                    add_d(next, startDayOfWeek - nextDayOfWeek - 7);
                }


                if(next.valueOf() > after.valueOf()
                        && check_bymonth(rule.BYMONTH, next))
                    break;

                add_d(next, interval * 7);
            }

            return next;
        }
    },
    MONTHLY: {
        next: function(rule, start, after) {
            var next = new Date(after);
            set_hr(next, hr(start));
            set_min(next, min(start));
            set_sec(next, sec(start));
            set_ms(next, ms(start));

            var interval = rule.INTERVAL || 1;

            // Adjust interval to be correct
            var delta = (m(next) - m(start)) + (y(next) - y(start)) * 12;
            if(delta % interval)
                add_m(next, interval - (delta % interval));


            for(var i=0; i<2; ++i) {
                if (i) set_d(next, 1); // Start at the beginning of the month for subsequent months
                next = byday(rule.BYDAY, next, after);
                next = bymonthday(rule.BYMONTHDAY, next, after);

                // Fall back to the start day of the month
                if ((!rule.BYDAY || !rule.BYDAY.length) && (!rule.BYMONTHDAY || !rule.BYMONTHDAY.length))
                  set_d(next, d(start));

                if(next.valueOf() > after.valueOf())
                    break;

                add_m(next, interval);
            }

            return next;
        }
    },
    YEARLY: {
        next: function(rule, start, after) {
            // Occurs every N years...
            var next = new Date(after);
            // TODO: Add actual byhour/minute/second methods
            set_hr(next, hr(start));
            set_min(next, min(start));
            set_sec(next, sec(start));
            set_ms(next, ms(start));

            var interval = rule.INTERVAL || 1;

            var mod_year = (y(after) - y(start)) % interval;
            if(mod_year)
                // We're not in a valid year, move to the next valid year
                add_y(next, interval - mod_year);


            for(var i=0; i<2; ++i) {
                next = bymonth(rule.BYMONTH, next);
                next = bymonthday(rule.BYMONTHDAY, next, after);
                next = byday(rule.BYDAY, next, after);

                // Fall back the the start month and day of the month
                if (!rule.BYMONTH || !rule.BYMONTH.length)
                  set_m(next, m(start));
                if ((!rule.BYDAY || !rule.BYDAY.length) && (!rule.BYMONTHDAY || !rule.BYMONTHDAY.length))
                  set_d(next, d(start));

                // Don't loop back again if we found a new date
                if(next.valueOf() > after.valueOf())
                    break;

                set_d(set_m(add_y(next, interval), 1), 1);
            }

            return next;
        }
    }
};

function sort_dates(dateary) {
    return dateary.sort(function(dt1, dt2) {
        if(dt1 === null && dt2 === null) return 0;
        if(dt1 === null) return 1;
        if(dt2 === null) return -1;

        return dt1.valueOf() - dt2.valueOf();
    });
}

// Check that a particular date is within the limits
// designated by the BYMONTH rule
function check_bymonth(rules, dt) {
    if(!rules || !rules.length) return true;
    return rules.indexOf(m(dt)) !== -1;
}

// Advance to the next month that satisfies the rule...
function bymonth(rules, dt) {
    if(!rules || !rules.length) return dt;

    var candidates = rules.map(function(rule) {
        var delta = rule-m(dt);
        if(delta < 0) delta += 12;

        var newdt = add_m(new Date(dt), delta);
        set_d(newdt, 1);
        return newdt;
    });
    
    var newdt = sort_dates(candidates).shift();
    return newdt || dt;
}


function bymonthday(rules, dt, after) {
    if(!rules || !rules.length) return dt;

    var candidates = rules.map(function(rule) {
        var newdt = set_d(new Date(dt), rule);
        return (newdt.valueOf() <= after.valueOf() ? null : newdt);
    });

    var newdt = sort_dates(candidates).shift();
    return newdt || dt;
}


// Advance to the next day that satisfies the byday rule...
function byday(rules, dt, after) {
    if(!rules || !rules.length) return dt;

    // Generate a list of candiDATES. (HA!)
    var candidates = rules.map(function(rule) {
        // Align on the correct day of the week...
        var days = rule[1]-wkday(dt);
        if(days < 0) days += 7;
        var newdt = add_d(new Date(dt), days);

        if(rule[0] > 0) {
            var wk = 0 | ((d(newdt) - 1) / 7) + 1;
            if(wk > rule[0]) return null;

            add_d(newdt, (rule[0] - wk) * 7);
        }
        else if(rule[0] < 0) {
            // Find all the matching days in the month...
            var dt2 = new Date(newdt);
            var days = [];
            while(m(dt2) === m(newdt)) {
                days.push(d(dt2));
                add_d(dt2, 7);
            }

            // Then grab the nth from the end...
            set_d(newdt, days.reverse()[(-rule[0])-1]);
        }

        // Ignore if it's a past date...
        if (newdt.valueOf() <= after.valueOf()) return null;

        return newdt;
    });

    // Select the date occurring next...
    var newdt = sort_dates(candidates).shift();
    return newdt || dt;
}

},{"./types":8}],7:[function(require,module,exports){
// Copyright (C) 2011 Tri Tech Computers Ltd.
// 
// Permission is hereby granted, free of charge, to any person obtaining a copy of
// this software and associated documentation files (the "Software"), to deal in
// the Software without restriction, including without limitation the rights to
// use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies
// of the Software, and to permit persons to whom the Software is furnished to do
// so, subject to the following conditions:
// 
// The above copyright notice and this permission notice shall be included in all
// copies or substantial portions of the Software.
// 
// THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
// IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
// FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
// AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
// LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
// OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
// SOFTWARE.
// 
// 

var assert = require('assert');
var util = require('util');

var CalendarObject = require('./base').CalendarObject;
var schema = require('./base').schema;

var RRule = require('./rrule').RRule;



var VTimezone = exports.VTimezone = function(calendar, tzid) {
    CalendarObject.call(this, calendar, 'VTIMEZONE');
    this.addProperty('TZID', tzid);
}
util.inherits(VTimezone, CalendarObject);

VTimezone.prototype.getRRule = function(section) {
    var comp = this.getComponents(section)[0];
    if(!comp || !comp.getPropertyValue('RRULE'))
        return null;

    return new RRule(comp.getPropertyValue('RRULE'),
        comp.getPropertyValue('DTSTART'),
        comp.getPropertyValue('DTEND'));
}

// Find the UTC offset for this timezone for a given date, which can
// be supplied as a Date object or an array of date components.
//
// NB: Supplying the parameter as a Date object can lead to problems, as there
//     is no way to represent 0200 on the day DST comes into effect.
VTimezone.prototype.getOffsetForDate = function(dt) {
    if(!this.getComponents('DAYLIGHT').length)
        return this.getComponents('STANDARD')[0].getPropertyValue('TZOFFSETTO');

    // Right now we're only supporting a single element
    assert.equal(1, this.components['STANDARD'].length);
    assert.equal(1, this.components['DAYLIGHT'].length);

    var next_std = this.getRRule('STANDARD');
    var next_dst = this.getRRule('DAYLIGHT'); 
    if (next_std === null || next_dst === null) {
        var comp = this.getComponents('STANDARD')[0];
        return comp.getPropertyValue('TZOFFSETTO');
    }

    next_std = next_std.next(dt);
    next_dst = next_dst.next(dt);

    // TODO: Using prevOccurs would be a better solution
    // If the NEXT DST/STD crossover after `dt` is DST,
    //   then `dt` must be in STD and vice-versa
    return this.getComponents(next_dst < next_std ? 'STANDARD' : 'DAYLIGHT')[0]
            .getPropertyValue('TZOFFSETTO');
}

// Convert a parsed date in localtime to a UTC date object
VTimezone.prototype.fromLocalTime = function(dtarray) {
    var hrs = this.getOffsetForDate(dtarray);
    var min = hrs % 100;
    hrs = (hrs-min) / 100;

    return new Date(Date.UTC(dtarray[0], dtarray[1]-1, dtarray[2],
                    dtarray[3]-hrs, dtarray[4]-min, dtarray[5]));
}


schema.VTIMEZONE = {
    factory: VTimezone,
}

},{"./base":1,"./rrule":6,"assert":9,"util":17}],8:[function(require,module,exports){
(function (Buffer){
// Copyright (C) 2011 Tri Tech Computers Ltd.
// 
// Permission is hereby granted, free of charge, to any person obtaining a copy of
// this software and associated documentation files (the "Software"), to deal in
// the Software without restriction, including without limitation the rights to
// use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies
// of the Software, and to permit persons to whom the Software is furnished to do
// so, subject to the following conditions:
// 
// The above copyright notice and this permission notice shall be included in all
// copies or substantial portions of the Software.
// 
// THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
// IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
// FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
// AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
// LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
// OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
// SOFTWARE.
// 
//

var RRule = require('./rrule').RRule;

function pad(n,d) {
    d = d || 2;
    var neg = n < 0;
    if(neg) n *= -1;
    n = n.toString();

    var zeroes = '000000000000000000';
    return (neg ? '-' : '')+zeroes.substr(0,d-n.length)+n;
}

var _types = {
    'BINARY': {
        format: function(value) {
            return value.toString('base64');
        },
        parse: function(value) {
            return new Buffer(value, 'base64');
        }
    },
    'BOOLEAN': {
        format: function(value) {
            return value ? "TRUE" : "FALSE";
        },
        parse: function(value) {
            return value.toUpperCase() == "TRUE";
        }
    },
    'CAL-ADDRESS': {
        format: function(value) {
            var v = value.toString();
            if(v.lastIndexOf("mailto:") != 0)
                v = "mailto:"+v;
            return v;
        }
    },
    'DATE': {
        format: function(value) {
            if(!(value instanceof Date))
                value = new Date(value);

            return value.getFullYear()
                    +pad(value.getMonth()+1)
                    +pad(value.getDate());
        },
        parse: function(value) {
            var dt = new Date(
                        parseInt(value.substr(0,4), 10),
                        parseInt(value.substr(4,2), 10)-1,
                        parseInt(value.substr(6,2), 10), 0,0,0);
            dt.date_only = true;
            return dt;
        }
    },
    'DATE-TIME': {
        // YYYYMMDDTHHMMSS
        //  TODO: Support local time with TZID values
        format: function(value, parameters) {
            if(!(value instanceof Date))
                value = new Date(value);

            if(value.date_only || parameters['VALUE'] === 'DATE')
                return format_value('DATE', value);

            return value.getUTCFullYear()
                    +pad(value.getUTCMonth()+1)
                    +pad(value.getUTCDate())
                    +'T'+format_value('TIME', value);
        },
        parse: function(value, parameters, calendar) {
            if(parameters['VALUE'] === 'DATE' || value.length <= 8)
                return _types['DATE'].parse(value);

            var tz = parameters['TZID'];
            var d = [parseInt(value.substr(0,4), 10),
                         parseInt(value.substr(4,2), 10),
                         parseInt(value.substr(6,2), 10),
                         parseInt(value.substr(9,2), 10),
                         parseInt(value.substr(11,2), 10),
                         parseInt(value.substr(13,2), 10)];
            var utc = value.length > 15 ? value[15] === 'Z' : false;

            if(tz !== undefined) {
                var tzobj = calendar.timezone(tz);
                if(!tzobj)
                    throw new Error("Unable to load TZ data for "+tz);
                return tzobj.fromLocalTime(d);
            }

            // Adjust month to make JS date happy...
            d[1] -= 1;

            if(utc)
                return new Date(Date.UTC.apply(null, d));
            else
                return new Date(d[0], d[1], d[2], d[3], d[4], d[5]);
        }
    },
    'DURATION': {
        format: function(value) {
            // Duration values from JS should be an integer number of seconds
            var neg = value < 0;
            if(neg) value *= -1;

            var w = Math.floor(value/(60*60*24*7)); value -= w*60*60*24*7;
            var d = Math.floor(value/(60*60*24));   value -= d*60*60*24;
            var h = Math.floor(value/(60*60));      value -= h*60*60;
            var m = Math.floor(value/60);           value -= m*60;
            var s = value;

            var dur = ['P'];
            if(neg) dur.unshift('-');
            if(w) dur.push(w+'W');
            if(d) dur.push(d+'D');
            if((h||m||s)) dur.push('T');
            if(h) dur.push(h+'H');
            if(m) dur.push(m+'M');
            if(s) dur.push(s+'S');
            return dur.join('');
        },
        parse: function(value) {
            var match = /(-)?P(\d+W)?(\d+D)?(?:T(\d+H)?(\d+M)?(\d+S)?)?/.exec(value).slice(1);
            var mul = [ -1, 60*60*24*7, 60*60*24, 60*60, 60, 1 ];
            var dur = 0;

            for(var i=1; i < match.length; ++i) {
                if(match[i] !== undefined) dur += parseInt(match[i], 10) * mul[i];
            }

            if(match[0] !== undefined) dur *= mul[0];

            return dur;
        }
    },
    'FLOAT': {
        format: function(value) { return value.toString(); },
    },
    'INTEGER': {
        format: function(value) { return value.toString(); },
    },
    'PERIOD': {
        format: function(value) {
            var start = format_value('DATE-TIME', value[0]);
            var end = format_value(value[1] instanceof Date ? 'DATE-TIME' : 'DURATION', value[1]);
            return start+'/'+end;
        }
    },
    'RECUR': {
        format: function(value) {
            return (value instanceof RRule ? value : new RRule(value)).toString();
        },
        parse: function(value) { return RRule.parse(value); }
    },
    'TEXT': {
        format: function(value) {
            return (value || '').toString().replace(/([\\,;])/g, "\\$1").replace(/\n/g, "\\n");
        },
        parse: function(value) {
            return value.replace(/\\([\\,;])/g, "$1")
                        .replace(/\\[nN]/g, '\n');
        }
    },
    'TIME': {
        format: function(value) {
            if(!(value instanceof Date))
                value = new Date(value);

            return pad(value.getUTCHours())
                    +pad(value.getUTCMinutes())
                    +pad(value.getUTCSeconds())
                    +'Z';
        },
        parse: function(value) {
            var utc = value.length > 6 ? value[6] === 'Z' : false;
            if(utc)
                return new Date(Date.UTC(0,0,0,
                        parseInt(value.substr(0, 2), 10),
                        parseInt(value.substr(2, 2), 10),
                        parseInt(value.substr(4, 2), 10)));
            else
                return new Date(0,0,0,
                        parseInt(value.substr(0, 2), 10),
                        parseInt(value.substr(2, 2), 10),
                        parseInt(value.substr(4, 2), 10));
        }
    },
    'URI': {
        format: function(value) { return value.toString(); },
    },
    'UTC-OFFSET': {
        format: function(value) {
            var west = value < 0;
            if(west) value *= -1;
            return (west ? '-' : '+')+pad(value, 4);
        }
    }
};


var format_value = exports.format_value = function(type, value, parameters) {
    if(value === undefined)
        return '';

    var fmt = _types[type || 'TEXT'];
    if(fmt === undefined)
        throw Error("Invalid iCalendar datatype: "+type);

    // PERIOD is a corner case here; it's an array of two values
    if(Array.isArray(value) && type !== 'PERIOD'
            || type === 'PERIOD' && value[0] && Array.isArray(value[0]))
        return value.map(function(v) { return fmt.format(v, parameters || {}); }).join(',');
    else
        return fmt.format(value, parameters || {});
}

var parse_value = exports.parse_value = function(type, value, parameters, calendar, expect_list) {
    if(expect_list)
        return value.split(',').map(function(x) { return parse_value(type, x, parameters, calendar); });

    var fmt = _types[type || 'TEXT'];
    if(fmt === undefined)
        throw Error("Invalid iCalendar datatype: "+type);

    // Handle wrong value type
    parameters = parameters || {};
    var otherFmt = parameters.VALUE && _types[parameters.VALUE];
    if (otherFmt) fmt = otherFmt;
    return fmt.parse ? fmt.parse(value, parameters, calendar) : value;
}

}).call(this,require("buffer").Buffer)
},{"./rrule":6,"buffer":10}],9:[function(require,module,exports){
// http://wiki.commonjs.org/wiki/Unit_Testing/1.0
//
// THIS IS NOT TESTED NOR LIKELY TO WORK OUTSIDE V8!
//
// Originally from narwhal.js (http://narwhaljs.org)
// Copyright (c) 2009 Thomas Robinson <280north.com>
//
// Permission is hereby granted, free of charge, to any person obtaining a copy
// of this software and associated documentation files (the 'Software'), to
// deal in the Software without restriction, including without limitation the
// rights to use, copy, modify, merge, publish, distribute, sublicense, and/or
// sell copies of the Software, and to permit persons to whom the Software is
// furnished to do so, subject to the following conditions:
//
// The above copyright notice and this permission notice shall be included in
// all copies or substantial portions of the Software.
//
// THE SOFTWARE IS PROVIDED 'AS IS', WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
// IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
// FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
// AUTHORS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN
// ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION
// WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.

// when used in node, this will actually load the util module we depend on
// versus loading the builtin util module as happens otherwise
// this is a bug in node module loading as far as I am concerned
var util = require('util/');

var pSlice = Array.prototype.slice;
var hasOwn = Object.prototype.hasOwnProperty;

// 1. The assert module provides functions that throw
// AssertionError's when particular conditions are not met. The
// assert module must conform to the following interface.

var assert = module.exports = ok;

// 2. The AssertionError is defined in assert.
// new assert.AssertionError({ message: message,
//                             actual: actual,
//                             expected: expected })

assert.AssertionError = function AssertionError(options) {
  this.name = 'AssertionError';
  this.actual = options.actual;
  this.expected = options.expected;
  this.operator = options.operator;
  if (options.message) {
    this.message = options.message;
    this.generatedMessage = false;
  } else {
    this.message = getMessage(this);
    this.generatedMessage = true;
  }
  var stackStartFunction = options.stackStartFunction || fail;

  if (Error.captureStackTrace) {
    Error.captureStackTrace(this, stackStartFunction);
  }
  else {
    // non v8 browsers so we can have a stacktrace
    var err = new Error();
    if (err.stack) {
      var out = err.stack;

      // try to strip useless frames
      var fn_name = stackStartFunction.name;
      var idx = out.indexOf('\n' + fn_name);
      if (idx >= 0) {
        // once we have located the function frame
        // we need to strip out everything before it (and its line)
        var next_line = out.indexOf('\n', idx + 1);
        out = out.substring(next_line + 1);
      }

      this.stack = out;
    }
  }
};

// assert.AssertionError instanceof Error
util.inherits(assert.AssertionError, Error);

function replacer(key, value) {
  if (util.isUndefined(value)) {
    return '' + value;
  }
  if (util.isNumber(value) && (isNaN(value) || !isFinite(value))) {
    return value.toString();
  }
  if (util.isFunction(value) || util.isRegExp(value)) {
    return value.toString();
  }
  return value;
}

function truncate(s, n) {
  if (util.isString(s)) {
    return s.length < n ? s : s.slice(0, n);
  } else {
    return s;
  }
}

function getMessage(self) {
  return truncate(JSON.stringify(self.actual, replacer), 128) + ' ' +
         self.operator + ' ' +
         truncate(JSON.stringify(self.expected, replacer), 128);
}

// At present only the three keys mentioned above are used and
// understood by the spec. Implementations or sub modules can pass
// other keys to the AssertionError's constructor - they will be
// ignored.

// 3. All of the following functions must throw an AssertionError
// when a corresponding condition is not met, with a message that
// may be undefined if not provided.  All assertion methods provide
// both the actual and expected values to the assertion error for
// display purposes.

function fail(actual, expected, message, operator, stackStartFunction) {
  throw new assert.AssertionError({
    message: message,
    actual: actual,
    expected: expected,
    operator: operator,
    stackStartFunction: stackStartFunction
  });
}

// EXTENSION! allows for well behaved errors defined elsewhere.
assert.fail = fail;

// 4. Pure assertion tests whether a value is truthy, as determined
// by !!guard.
// assert.ok(guard, message_opt);
// This statement is equivalent to assert.equal(true, !!guard,
// message_opt);. To test strictly for the value true, use
// assert.strictEqual(true, guard, message_opt);.

function ok(value, message) {
  if (!value) fail(value, true, message, '==', assert.ok);
}
assert.ok = ok;

// 5. The equality assertion tests shallow, coercive equality with
// ==.
// assert.equal(actual, expected, message_opt);

assert.equal = function equal(actual, expected, message) {
  if (actual != expected) fail(actual, expected, message, '==', assert.equal);
};

// 6. The non-equality assertion tests for whether two objects are not equal
// with != assert.notEqual(actual, expected, message_opt);

assert.notEqual = function notEqual(actual, expected, message) {
  if (actual == expected) {
    fail(actual, expected, message, '!=', assert.notEqual);
  }
};

// 7. The equivalence assertion tests a deep equality relation.
// assert.deepEqual(actual, expected, message_opt);

assert.deepEqual = function deepEqual(actual, expected, message) {
  if (!_deepEqual(actual, expected)) {
    fail(actual, expected, message, 'deepEqual', assert.deepEqual);
  }
};

function _deepEqual(actual, expected) {
  // 7.1. All identical values are equivalent, as determined by ===.
  if (actual === expected) {
    return true;

  } else if (util.isBuffer(actual) && util.isBuffer(expected)) {
    if (actual.length != expected.length) return false;

    for (var i = 0; i < actual.length; i++) {
      if (actual[i] !== expected[i]) return false;
    }

    return true;

  // 7.2. If the expected value is a Date object, the actual value is
  // equivalent if it is also a Date object that refers to the same time.
  } else if (util.isDate(actual) && util.isDate(expected)) {
    return actual.getTime() === expected.getTime();

  // 7.3 If the expected value is a RegExp object, the actual value is
  // equivalent if it is also a RegExp object with the same source and
  // properties (`global`, `multiline`, `lastIndex`, `ignoreCase`).
  } else if (util.isRegExp(actual) && util.isRegExp(expected)) {
    return actual.source === expected.source &&
           actual.global === expected.global &&
           actual.multiline === expected.multiline &&
           actual.lastIndex === expected.lastIndex &&
           actual.ignoreCase === expected.ignoreCase;

  // 7.4. Other pairs that do not both pass typeof value == 'object',
  // equivalence is determined by ==.
  } else if (!util.isObject(actual) && !util.isObject(expected)) {
    return actual == expected;

  // 7.5 For all other Object pairs, including Array objects, equivalence is
  // determined by having the same number of owned properties (as verified
  // with Object.prototype.hasOwnProperty.call), the same set of keys
  // (although not necessarily the same order), equivalent values for every
  // corresponding key, and an identical 'prototype' property. Note: this
  // accounts for both named and indexed properties on Arrays.
  } else {
    return objEquiv(actual, expected);
  }
}

function isArguments(object) {
  return Object.prototype.toString.call(object) == '[object Arguments]';
}

function objEquiv(a, b) {
  if (util.isNullOrUndefined(a) || util.isNullOrUndefined(b))
    return false;
  // an identical 'prototype' property.
  if (a.prototype !== b.prototype) return false;
  //~~~I've managed to break Object.keys through screwy arguments passing.
  //   Converting to array solves the problem.
  if (isArguments(a)) {
    if (!isArguments(b)) {
      return false;
    }
    a = pSlice.call(a);
    b = pSlice.call(b);
    return _deepEqual(a, b);
  }
  try {
    var ka = objectKeys(a),
        kb = objectKeys(b),
        key, i;
  } catch (e) {//happens when one is a string literal and the other isn't
    return false;
  }
  // having the same number of owned properties (keys incorporates
  // hasOwnProperty)
  if (ka.length != kb.length)
    return false;
  //the same set of keys (although not necessarily the same order),
  ka.sort();
  kb.sort();
  //~~~cheap key test
  for (i = ka.length - 1; i >= 0; i--) {
    if (ka[i] != kb[i])
      return false;
  }
  //equivalent values for every corresponding key, and
  //~~~possibly expensive deep test
  for (i = ka.length - 1; i >= 0; i--) {
    key = ka[i];
    if (!_deepEqual(a[key], b[key])) return false;
  }
  return true;
}

// 8. The non-equivalence assertion tests for any deep inequality.
// assert.notDeepEqual(actual, expected, message_opt);

assert.notDeepEqual = function notDeepEqual(actual, expected, message) {
  if (_deepEqual(actual, expected)) {
    fail(actual, expected, message, 'notDeepEqual', assert.notDeepEqual);
  }
};

// 9. The strict equality assertion tests strict equality, as determined by ===.
// assert.strictEqual(actual, expected, message_opt);

assert.strictEqual = function strictEqual(actual, expected, message) {
  if (actual !== expected) {
    fail(actual, expected, message, '===', assert.strictEqual);
  }
};

// 10. The strict non-equality assertion tests for strict inequality, as
// determined by !==.  assert.notStrictEqual(actual, expected, message_opt);

assert.notStrictEqual = function notStrictEqual(actual, expected, message) {
  if (actual === expected) {
    fail(actual, expected, message, '!==', assert.notStrictEqual);
  }
};

function expectedException(actual, expected) {
  if (!actual || !expected) {
    return false;
  }

  if (Object.prototype.toString.call(expected) == '[object RegExp]') {
    return expected.test(actual);
  } else if (actual instanceof expected) {
    return true;
  } else if (expected.call({}, actual) === true) {
    return true;
  }

  return false;
}

function _throws(shouldThrow, block, expected, message) {
  var actual;

  if (util.isString(expected)) {
    message = expected;
    expected = null;
  }

  try {
    block();
  } catch (e) {
    actual = e;
  }

  message = (expected && expected.name ? ' (' + expected.name + ').' : '.') +
            (message ? ' ' + message : '.');

  if (shouldThrow && !actual) {
    fail(actual, expected, 'Missing expected exception' + message);
  }

  if (!shouldThrow && expectedException(actual, expected)) {
    fail(actual, expected, 'Got unwanted exception' + message);
  }

  if ((shouldThrow && actual && expected &&
      !expectedException(actual, expected)) || (!shouldThrow && actual)) {
    throw actual;
  }
}

// 11. Expected to throw an error:
// assert.throws(block, Error_opt, message_opt);

assert.throws = function(block, /*optional*/error, /*optional*/message) {
  _throws.apply(this, [true].concat(pSlice.call(arguments)));
};

// EXTENSION! This is annoying to write outside this module.
assert.doesNotThrow = function(block, /*optional*/message) {
  _throws.apply(this, [false].concat(pSlice.call(arguments)));
};

assert.ifError = function(err) { if (err) {throw err;}};

var objectKeys = Object.keys || function (obj) {
  var keys = [];
  for (var key in obj) {
    if (hasOwn.call(obj, key)) keys.push(key);
  }
  return keys;
};

},{"util/":17}],10:[function(require,module,exports){
/*!
 * The buffer module from node.js, for the browser.
 *
 * @author   Feross Aboukhadijeh <feross@feross.org> <http://feross.org>
 * @license  MIT
 */

var base64 = require('base64-js')
var ieee754 = require('ieee754')
var isArray = require('is-array')

exports.Buffer = Buffer
exports.SlowBuffer = Buffer
exports.INSPECT_MAX_BYTES = 50
Buffer.poolSize = 8192 // not used by this implementation

var kMaxLength = 0x3fffffff

/**
 * If `Buffer.TYPED_ARRAY_SUPPORT`:
 *   === true    Use Uint8Array implementation (fastest)
 *   === false   Use Object implementation (most compatible, even IE6)
 *
 * Browsers that support typed arrays are IE 10+, Firefox 4+, Chrome 7+, Safari 5.1+,
 * Opera 11.6+, iOS 4.2+.
 *
 * Note:
 *
 * - Implementation must support adding new properties to `Uint8Array` instances.
 *   Firefox 4-29 lacked support, fixed in Firefox 30+.
 *   See: https://bugzilla.mozilla.org/show_bug.cgi?id=695438.
 *
 *  - Chrome 9-10 is missing the `TypedArray.prototype.subarray` function.
 *
 *  - IE10 has a broken `TypedArray.prototype.subarray` function which returns arrays of
 *    incorrect length in some situations.
 *
 * We detect these buggy browsers and set `Buffer.TYPED_ARRAY_SUPPORT` to `false` so they will
 * get the Object implementation, which is slower but will work correctly.
 */
Buffer.TYPED_ARRAY_SUPPORT = (function () {
  try {
    var buf = new ArrayBuffer(0)
    var arr = new Uint8Array(buf)
    arr.foo = function () { return 42 }
    return 42 === arr.foo() && // typed array instances can be augmented
        typeof arr.subarray === 'function' && // chrome 9-10 lack `subarray`
        new Uint8Array(1).subarray(1, 1).byteLength === 0 // ie10 has broken `subarray`
  } catch (e) {
    return false
  }
})()

/**
 * Class: Buffer
 * =============
 *
 * The Buffer constructor returns instances of `Uint8Array` that are augmented
 * with function properties for all the node `Buffer` API functions. We use
 * `Uint8Array` so that square bracket notation works as expected -- it returns
 * a single octet.
 *
 * By augmenting the instances, we can avoid modifying the `Uint8Array`
 * prototype.
 */
function Buffer (subject, encoding, noZero) {
  if (!(this instanceof Buffer))
    return new Buffer(subject, encoding, noZero)

  var type = typeof subject

  // Find the length
  var length
  if (type === 'number')
    length = subject > 0 ? subject >>> 0 : 0
  else if (type === 'string') {
    if (encoding === 'base64')
      subject = base64clean(subject)
    length = Buffer.byteLength(subject, encoding)
  } else if (type === 'object' && subject !== null) { // assume object is array-like
    if (subject.type === 'Buffer' && isArray(subject.data))
      subject = subject.data
    length = +subject.length > 0 ? Math.floor(+subject.length) : 0
  } else
    throw new TypeError('must start with number, buffer, array or string')

  if (this.length > kMaxLength)
    throw new RangeError('Attempt to allocate Buffer larger than maximum ' +
      'size: 0x' + kMaxLength.toString(16) + ' bytes')

  var buf
  if (Buffer.TYPED_ARRAY_SUPPORT) {
    // Preferred: Return an augmented `Uint8Array` instance for best performance
    buf = Buffer._augment(new Uint8Array(length))
  } else {
    // Fallback: Return THIS instance of Buffer (created by `new`)
    buf = this
    buf.length = length
    buf._isBuffer = true
  }

  var i
  if (Buffer.TYPED_ARRAY_SUPPORT && typeof subject.byteLength === 'number') {
    // Speed optimization -- use set if we're copying from a typed array
    buf._set(subject)
  } else if (isArrayish(subject)) {
    // Treat array-ish objects as a byte array
    if (Buffer.isBuffer(subject)) {
      for (i = 0; i < length; i++)
        buf[i] = subject.readUInt8(i)
    } else {
      for (i = 0; i < length; i++)
        buf[i] = ((subject[i] % 256) + 256) % 256
    }
  } else if (type === 'string') {
    buf.write(subject, 0, encoding)
  } else if (type === 'number' && !Buffer.TYPED_ARRAY_SUPPORT && !noZero) {
    for (i = 0; i < length; i++) {
      buf[i] = 0
    }
  }

  return buf
}

Buffer.isBuffer = function (b) {
  return !!(b != null && b._isBuffer)
}

Buffer.compare = function (a, b) {
  if (!Buffer.isBuffer(a) || !Buffer.isBuffer(b))
    throw new TypeError('Arguments must be Buffers')

  var x = a.length
  var y = b.length
  for (var i = 0, len = Math.min(x, y); i < len && a[i] === b[i]; i++) {}
  if (i !== len) {
    x = a[i]
    y = b[i]
  }
  if (x < y) return -1
  if (y < x) return 1
  return 0
}

Buffer.isEncoding = function (encoding) {
  switch (String(encoding).toLowerCase()) {
    case 'hex':
    case 'utf8':
    case 'utf-8':
    case 'ascii':
    case 'binary':
    case 'base64':
    case 'raw':
    case 'ucs2':
    case 'ucs-2':
    case 'utf16le':
    case 'utf-16le':
      return true
    default:
      return false
  }
}

Buffer.concat = function (list, totalLength) {
  if (!isArray(list)) throw new TypeError('Usage: Buffer.concat(list[, length])')

  if (list.length === 0) {
    return new Buffer(0)
  } else if (list.length === 1) {
    return list[0]
  }

  var i
  if (totalLength === undefined) {
    totalLength = 0
    for (i = 0; i < list.length; i++) {
      totalLength += list[i].length
    }
  }

  var buf = new Buffer(totalLength)
  var pos = 0
  for (i = 0; i < list.length; i++) {
    var item = list[i]
    item.copy(buf, pos)
    pos += item.length
  }
  return buf
}

Buffer.byteLength = function (str, encoding) {
  var ret
  str = str + ''
  switch (encoding || 'utf8') {
    case 'ascii':
    case 'binary':
    case 'raw':
      ret = str.length
      break
    case 'ucs2':
    case 'ucs-2':
    case 'utf16le':
    case 'utf-16le':
      ret = str.length * 2
      break
    case 'hex':
      ret = str.length >>> 1
      break
    case 'utf8':
    case 'utf-8':
      ret = utf8ToBytes(str).length
      break
    case 'base64':
      ret = base64ToBytes(str).length
      break
    default:
      ret = str.length
  }
  return ret
}

// pre-set for values that may exist in the future
Buffer.prototype.length = undefined
Buffer.prototype.parent = undefined

// toString(encoding, start=0, end=buffer.length)
Buffer.prototype.toString = function (encoding, start, end) {
  var loweredCase = false

  start = start >>> 0
  end = end === undefined || end === Infinity ? this.length : end >>> 0

  if (!encoding) encoding = 'utf8'
  if (start < 0) start = 0
  if (end > this.length) end = this.length
  if (end <= start) return ''

  while (true) {
    switch (encoding) {
      case 'hex':
        return hexSlice(this, start, end)

      case 'utf8':
      case 'utf-8':
        return utf8Slice(this, start, end)

      case 'ascii':
        return asciiSlice(this, start, end)

      case 'binary':
        return binarySlice(this, start, end)

      case 'base64':
        return base64Slice(this, start, end)

      case 'ucs2':
      case 'ucs-2':
      case 'utf16le':
      case 'utf-16le':
        return utf16leSlice(this, start, end)

      default:
        if (loweredCase)
          throw new TypeError('Unknown encoding: ' + encoding)
        encoding = (encoding + '').toLowerCase()
        loweredCase = true
    }
  }
}

Buffer.prototype.equals = function (b) {
  if(!Buffer.isBuffer(b)) throw new TypeError('Argument must be a Buffer')
  return Buffer.compare(this, b) === 0
}

Buffer.prototype.inspect = function () {
  var str = ''
  var max = exports.INSPECT_MAX_BYTES
  if (this.length > 0) {
    str = this.toString('hex', 0, max).match(/.{2}/g).join(' ')
    if (this.length > max)
      str += ' ... '
  }
  return '<Buffer ' + str + '>'
}

Buffer.prototype.compare = function (b) {
  if (!Buffer.isBuffer(b)) throw new TypeError('Argument must be a Buffer')
  return Buffer.compare(this, b)
}

// `get` will be removed in Node 0.13+
Buffer.prototype.get = function (offset) {
  console.log('.get() is deprecated. Access using array indexes instead.')
  return this.readUInt8(offset)
}

// `set` will be removed in Node 0.13+
Buffer.prototype.set = function (v, offset) {
  console.log('.set() is deprecated. Access using array indexes instead.')
  return this.writeUInt8(v, offset)
}

function hexWrite (buf, string, offset, length) {
  offset = Number(offset) || 0
  var remaining = buf.length - offset
  if (!length) {
    length = remaining
  } else {
    length = Number(length)
    if (length > remaining) {
      length = remaining
    }
  }

  // must be an even number of digits
  var strLen = string.length
  if (strLen % 2 !== 0) throw new Error('Invalid hex string')

  if (length > strLen / 2) {
    length = strLen / 2
  }
  for (var i = 0; i < length; i++) {
    var byte = parseInt(string.substr(i * 2, 2), 16)
    if (isNaN(byte)) throw new Error('Invalid hex string')
    buf[offset + i] = byte
  }
  return i
}

function utf8Write (buf, string, offset, length) {
  var charsWritten = blitBuffer(utf8ToBytes(string), buf, offset, length)
  return charsWritten
}

function asciiWrite (buf, string, offset, length) {
  var charsWritten = blitBuffer(asciiToBytes(string), buf, offset, length)
  return charsWritten
}

function binaryWrite (buf, string, offset, length) {
  return asciiWrite(buf, string, offset, length)
}

function base64Write (buf, string, offset, length) {
  var charsWritten = blitBuffer(base64ToBytes(string), buf, offset, length)
  return charsWritten
}

function utf16leWrite (buf, string, offset, length) {
  var charsWritten = blitBuffer(utf16leToBytes(string), buf, offset, length)
  return charsWritten
}

Buffer.prototype.write = function (string, offset, length, encoding) {
  // Support both (string, offset, length, encoding)
  // and the legacy (string, encoding, offset, length)
  if (isFinite(offset)) {
    if (!isFinite(length)) {
      encoding = length
      length = undefined
    }
  } else {  // legacy
    var swap = encoding
    encoding = offset
    offset = length
    length = swap
  }

  offset = Number(offset) || 0
  var remaining = this.length - offset
  if (!length) {
    length = remaining
  } else {
    length = Number(length)
    if (length > remaining) {
      length = remaining
    }
  }
  encoding = String(encoding || 'utf8').toLowerCase()

  var ret
  switch (encoding) {
    case 'hex':
      ret = hexWrite(this, string, offset, length)
      break
    case 'utf8':
    case 'utf-8':
      ret = utf8Write(this, string, offset, length)
      break
    case 'ascii':
      ret = asciiWrite(this, string, offset, length)
      break
    case 'binary':
      ret = binaryWrite(this, string, offset, length)
      break
    case 'base64':
      ret = base64Write(this, string, offset, length)
      break
    case 'ucs2':
    case 'ucs-2':
    case 'utf16le':
    case 'utf-16le':
      ret = utf16leWrite(this, string, offset, length)
      break
    default:
      throw new TypeError('Unknown encoding: ' + encoding)
  }
  return ret
}

Buffer.prototype.toJSON = function () {
  return {
    type: 'Buffer',
    data: Array.prototype.slice.call(this._arr || this, 0)
  }
}

function base64Slice (buf, start, end) {
  if (start === 0 && end === buf.length) {
    return base64.fromByteArray(buf)
  } else {
    return base64.fromByteArray(buf.slice(start, end))
  }
}

function utf8Slice (buf, start, end) {
  var res = ''
  var tmp = ''
  end = Math.min(buf.length, end)

  for (var i = start; i < end; i++) {
    if (buf[i] <= 0x7F) {
      res += decodeUtf8Char(tmp) + String.fromCharCode(buf[i])
      tmp = ''
    } else {
      tmp += '%' + buf[i].toString(16)
    }
  }

  return res + decodeUtf8Char(tmp)
}

function asciiSlice (buf, start, end) {
  var ret = ''
  end = Math.min(buf.length, end)

  for (var i = start; i < end; i++) {
    ret += String.fromCharCode(buf[i])
  }
  return ret
}

function binarySlice (buf, start, end) {
  return asciiSlice(buf, start, end)
}

function hexSlice (buf, start, end) {
  var len = buf.length

  if (!start || start < 0) start = 0
  if (!end || end < 0 || end > len) end = len

  var out = ''
  for (var i = start; i < end; i++) {
    out += toHex(buf[i])
  }
  return out
}

function utf16leSlice (buf, start, end) {
  var bytes = buf.slice(start, end)
  var res = ''
  for (var i = 0; i < bytes.length; i += 2) {
    res += String.fromCharCode(bytes[i] + bytes[i + 1] * 256)
  }
  return res
}

Buffer.prototype.slice = function (start, end) {
  var len = this.length
  start = ~~start
  end = end === undefined ? len : ~~end

  if (start < 0) {
    start += len;
    if (start < 0)
      start = 0
  } else if (start > len) {
    start = len
  }

  if (end < 0) {
    end += len
    if (end < 0)
      end = 0
  } else if (end > len) {
    end = len
  }

  if (end < start)
    end = start

  if (Buffer.TYPED_ARRAY_SUPPORT) {
    return Buffer._augment(this.subarray(start, end))
  } else {
    var sliceLen = end - start
    var newBuf = new Buffer(sliceLen, undefined, true)
    for (var i = 0; i < sliceLen; i++) {
      newBuf[i] = this[i + start]
    }
    return newBuf
  }
}

/*
 * Need to make sure that buffer isn't trying to write out of bounds.
 */
function checkOffset (offset, ext, length) {
  if ((offset % 1) !== 0 || offset < 0)
    throw new RangeError('offset is not uint')
  if (offset + ext > length)
    throw new RangeError('Trying to access beyond buffer length')
}

Buffer.prototype.readUInt8 = function (offset, noAssert) {
  if (!noAssert)
    checkOffset(offset, 1, this.length)
  return this[offset]
}

Buffer.prototype.readUInt16LE = function (offset, noAssert) {
  if (!noAssert)
    checkOffset(offset, 2, this.length)
  return this[offset] | (this[offset + 1] << 8)
}

Buffer.prototype.readUInt16BE = function (offset, noAssert) {
  if (!noAssert)
    checkOffset(offset, 2, this.length)
  return (this[offset] << 8) | this[offset + 1]
}

Buffer.prototype.readUInt32LE = function (offset, noAssert) {
  if (!noAssert)
    checkOffset(offset, 4, this.length)

  return ((this[offset]) |
      (this[offset + 1] << 8) |
      (this[offset + 2] << 16)) +
      (this[offset + 3] * 0x1000000)
}

Buffer.prototype.readUInt32BE = function (offset, noAssert) {
  if (!noAssert)
    checkOffset(offset, 4, this.length)

  return (this[offset] * 0x1000000) +
      ((this[offset + 1] << 16) |
      (this[offset + 2] << 8) |
      this[offset + 3])
}

Buffer.prototype.readInt8 = function (offset, noAssert) {
  if (!noAssert)
    checkOffset(offset, 1, this.length)
  if (!(this[offset] & 0x80))
    return (this[offset])
  return ((0xff - this[offset] + 1) * -1)
}

Buffer.prototype.readInt16LE = function (offset, noAssert) {
  if (!noAssert)
    checkOffset(offset, 2, this.length)
  var val = this[offset] | (this[offset + 1] << 8)
  return (val & 0x8000) ? val | 0xFFFF0000 : val
}

Buffer.prototype.readInt16BE = function (offset, noAssert) {
  if (!noAssert)
    checkOffset(offset, 2, this.length)
  var val = this[offset + 1] | (this[offset] << 8)
  return (val & 0x8000) ? val | 0xFFFF0000 : val
}

Buffer.prototype.readInt32LE = function (offset, noAssert) {
  if (!noAssert)
    checkOffset(offset, 4, this.length)

  return (this[offset]) |
      (this[offset + 1] << 8) |
      (this[offset + 2] << 16) |
      (this[offset + 3] << 24)
}

Buffer.prototype.readInt32BE = function (offset, noAssert) {
  if (!noAssert)
    checkOffset(offset, 4, this.length)

  return (this[offset] << 24) |
      (this[offset + 1] << 16) |
      (this[offset + 2] << 8) |
      (this[offset + 3])
}

Buffer.prototype.readFloatLE = function (offset, noAssert) {
  if (!noAssert)
    checkOffset(offset, 4, this.length)
  return ieee754.read(this, offset, true, 23, 4)
}

Buffer.prototype.readFloatBE = function (offset, noAssert) {
  if (!noAssert)
    checkOffset(offset, 4, this.length)
  return ieee754.read(this, offset, false, 23, 4)
}

Buffer.prototype.readDoubleLE = function (offset, noAssert) {
  if (!noAssert)
    checkOffset(offset, 8, this.length)
  return ieee754.read(this, offset, true, 52, 8)
}

Buffer.prototype.readDoubleBE = function (offset, noAssert) {
  if (!noAssert)
    checkOffset(offset, 8, this.length)
  return ieee754.read(this, offset, false, 52, 8)
}

function checkInt (buf, value, offset, ext, max, min) {
  if (!Buffer.isBuffer(buf)) throw new TypeError('buffer must be a Buffer instance')
  if (value > max || value < min) throw new TypeError('value is out of bounds')
  if (offset + ext > buf.length) throw new TypeError('index out of range')
}

Buffer.prototype.writeUInt8 = function (value, offset, noAssert) {
  value = +value
  offset = offset >>> 0
  if (!noAssert)
    checkInt(this, value, offset, 1, 0xff, 0)
  if (!Buffer.TYPED_ARRAY_SUPPORT) value = Math.floor(value)
  this[offset] = value
  return offset + 1
}

function objectWriteUInt16 (buf, value, offset, littleEndian) {
  if (value < 0) value = 0xffff + value + 1
  for (var i = 0, j = Math.min(buf.length - offset, 2); i < j; i++) {
    buf[offset + i] = (value & (0xff << (8 * (littleEndian ? i : 1 - i)))) >>>
      (littleEndian ? i : 1 - i) * 8
  }
}

Buffer.prototype.writeUInt16LE = function (value, offset, noAssert) {
  value = +value
  offset = offset >>> 0
  if (!noAssert)
    checkInt(this, value, offset, 2, 0xffff, 0)
  if (Buffer.TYPED_ARRAY_SUPPORT) {
    this[offset] = value
    this[offset + 1] = (value >>> 8)
  } else objectWriteUInt16(this, value, offset, true)
  return offset + 2
}

Buffer.prototype.writeUInt16BE = function (value, offset, noAssert) {
  value = +value
  offset = offset >>> 0
  if (!noAssert)
    checkInt(this, value, offset, 2, 0xffff, 0)
  if (Buffer.TYPED_ARRAY_SUPPORT) {
    this[offset] = (value >>> 8)
    this[offset + 1] = value
  } else objectWriteUInt16(this, value, offset, false)
  return offset + 2
}

function objectWriteUInt32 (buf, value, offset, littleEndian) {
  if (value < 0) value = 0xffffffff + value + 1
  for (var i = 0, j = Math.min(buf.length - offset, 4); i < j; i++) {
    buf[offset + i] = (value >>> (littleEndian ? i : 3 - i) * 8) & 0xff
  }
}

Buffer.prototype.writeUInt32LE = function (value, offset, noAssert) {
  value = +value
  offset = offset >>> 0
  if (!noAssert)
    checkInt(this, value, offset, 4, 0xffffffff, 0)
  if (Buffer.TYPED_ARRAY_SUPPORT) {
    this[offset + 3] = (value >>> 24)
    this[offset + 2] = (value >>> 16)
    this[offset + 1] = (value >>> 8)
    this[offset] = value
  } else objectWriteUInt32(this, value, offset, true)
  return offset + 4
}

Buffer.prototype.writeUInt32BE = function (value, offset, noAssert) {
  value = +value
  offset = offset >>> 0
  if (!noAssert)
    checkInt(this, value, offset, 4, 0xffffffff, 0)
  if (Buffer.TYPED_ARRAY_SUPPORT) {
    this[offset] = (value >>> 24)
    this[offset + 1] = (value >>> 16)
    this[offset + 2] = (value >>> 8)
    this[offset + 3] = value
  } else objectWriteUInt32(this, value, offset, false)
  return offset + 4
}

Buffer.prototype.writeInt8 = function (value, offset, noAssert) {
  value = +value
  offset = offset >>> 0
  if (!noAssert)
    checkInt(this, value, offset, 1, 0x7f, -0x80)
  if (!Buffer.TYPED_ARRAY_SUPPORT) value = Math.floor(value)
  if (value < 0) value = 0xff + value + 1
  this[offset] = value
  return offset + 1
}

Buffer.prototype.writeInt16LE = function (value, offset, noAssert) {
  value = +value
  offset = offset >>> 0
  if (!noAssert)
    checkInt(this, value, offset, 2, 0x7fff, -0x8000)
  if (Buffer.TYPED_ARRAY_SUPPORT) {
    this[offset] = value
    this[offset + 1] = (value >>> 8)
  } else objectWriteUInt16(this, value, offset, true)
  return offset + 2
}

Buffer.prototype.writeInt16BE = function (value, offset, noAssert) {
  value = +value
  offset = offset >>> 0
  if (!noAssert)
    checkInt(this, value, offset, 2, 0x7fff, -0x8000)
  if (Buffer.TYPED_ARRAY_SUPPORT) {
    this[offset] = (value >>> 8)
    this[offset + 1] = value
  } else objectWriteUInt16(this, value, offset, false)
  return offset + 2
}

Buffer.prototype.writeInt32LE = function (value, offset, noAssert) {
  value = +value
  offset = offset >>> 0
  if (!noAssert)
    checkInt(this, value, offset, 4, 0x7fffffff, -0x80000000)
  if (Buffer.TYPED_ARRAY_SUPPORT) {
    this[offset] = value
    this[offset + 1] = (value >>> 8)
    this[offset + 2] = (value >>> 16)
    this[offset + 3] = (value >>> 24)
  } else objectWriteUInt32(this, value, offset, true)
  return offset + 4
}

Buffer.prototype.writeInt32BE = function (value, offset, noAssert) {
  value = +value
  offset = offset >>> 0
  if (!noAssert)
    checkInt(this, value, offset, 4, 0x7fffffff, -0x80000000)
  if (value < 0) value = 0xffffffff + value + 1
  if (Buffer.TYPED_ARRAY_SUPPORT) {
    this[offset] = (value >>> 24)
    this[offset + 1] = (value >>> 16)
    this[offset + 2] = (value >>> 8)
    this[offset + 3] = value
  } else objectWriteUInt32(this, value, offset, false)
  return offset + 4
}

function checkIEEE754 (buf, value, offset, ext, max, min) {
  if (value > max || value < min) throw new TypeError('value is out of bounds')
  if (offset + ext > buf.length) throw new TypeError('index out of range')
}

function writeFloat (buf, value, offset, littleEndian, noAssert) {
  if (!noAssert)
    checkIEEE754(buf, value, offset, 4, 3.4028234663852886e+38, -3.4028234663852886e+38)
  ieee754.write(buf, value, offset, littleEndian, 23, 4)
  return offset + 4
}

Buffer.prototype.writeFloatLE = function (value, offset, noAssert) {
  return writeFloat(this, value, offset, true, noAssert)
}

Buffer.prototype.writeFloatBE = function (value, offset, noAssert) {
  return writeFloat(this, value, offset, false, noAssert)
}

function writeDouble (buf, value, offset, littleEndian, noAssert) {
  if (!noAssert)
    checkIEEE754(buf, value, offset, 8, 1.7976931348623157E+308, -1.7976931348623157E+308)
  ieee754.write(buf, value, offset, littleEndian, 52, 8)
  return offset + 8
}

Buffer.prototype.writeDoubleLE = function (value, offset, noAssert) {
  return writeDouble(this, value, offset, true, noAssert)
}

Buffer.prototype.writeDoubleBE = function (value, offset, noAssert) {
  return writeDouble(this, value, offset, false, noAssert)
}

// copy(targetBuffer, targetStart=0, sourceStart=0, sourceEnd=buffer.length)
Buffer.prototype.copy = function (target, target_start, start, end) {
  var source = this

  if (!start) start = 0
  if (!end && end !== 0) end = this.length
  if (!target_start) target_start = 0

  // Copy 0 bytes; we're done
  if (end === start) return
  if (target.length === 0 || source.length === 0) return

  // Fatal error conditions
  if (end < start) throw new TypeError('sourceEnd < sourceStart')
  if (target_start < 0 || target_start >= target.length)
    throw new TypeError('targetStart out of bounds')
  if (start < 0 || start >= source.length) throw new TypeError('sourceStart out of bounds')
  if (end < 0 || end > source.length) throw new TypeError('sourceEnd out of bounds')

  // Are we oob?
  if (end > this.length)
    end = this.length
  if (target.length - target_start < end - start)
    end = target.length - target_start + start

  var len = end - start

  if (len < 100 || !Buffer.TYPED_ARRAY_SUPPORT) {
    for (var i = 0; i < len; i++) {
      target[i + target_start] = this[i + start]
    }
  } else {
    target._set(this.subarray(start, start + len), target_start)
  }
}

// fill(value, start=0, end=buffer.length)
Buffer.prototype.fill = function (value, start, end) {
  if (!value) value = 0
  if (!start) start = 0
  if (!end) end = this.length

  if (end < start) throw new TypeError('end < start')

  // Fill 0 bytes; we're done
  if (end === start) return
  if (this.length === 0) return

  if (start < 0 || start >= this.length) throw new TypeError('start out of bounds')
  if (end < 0 || end > this.length) throw new TypeError('end out of bounds')

  var i
  if (typeof value === 'number') {
    for (i = start; i < end; i++) {
      this[i] = value
    }
  } else {
    var bytes = utf8ToBytes(value.toString())
    var len = bytes.length
    for (i = start; i < end; i++) {
      this[i] = bytes[i % len]
    }
  }

  return this
}

/**
 * Creates a new `ArrayBuffer` with the *copied* memory of the buffer instance.
 * Added in Node 0.12. Only available in browsers that support ArrayBuffer.
 */
Buffer.prototype.toArrayBuffer = function () {
  if (typeof Uint8Array !== 'undefined') {
    if (Buffer.TYPED_ARRAY_SUPPORT) {
      return (new Buffer(this)).buffer
    } else {
      var buf = new Uint8Array(this.length)
      for (var i = 0, len = buf.length; i < len; i += 1) {
        buf[i] = this[i]
      }
      return buf.buffer
    }
  } else {
    throw new TypeError('Buffer.toArrayBuffer not supported in this browser')
  }
}

// HELPER FUNCTIONS
// ================

var BP = Buffer.prototype

/**
 * Augment a Uint8Array *instance* (not the Uint8Array class!) with Buffer methods
 */
Buffer._augment = function (arr) {
  arr._isBuffer = true

  // save reference to original Uint8Array get/set methods before overwriting
  arr._get = arr.get
  arr._set = arr.set

  // deprecated, will be removed in node 0.13+
  arr.get = BP.get
  arr.set = BP.set

  arr.write = BP.write
  arr.toString = BP.toString
  arr.toLocaleString = BP.toString
  arr.toJSON = BP.toJSON
  arr.equals = BP.equals
  arr.compare = BP.compare
  arr.copy = BP.copy
  arr.slice = BP.slice
  arr.readUInt8 = BP.readUInt8
  arr.readUInt16LE = BP.readUInt16LE
  arr.readUInt16BE = BP.readUInt16BE
  arr.readUInt32LE = BP.readUInt32LE
  arr.readUInt32BE = BP.readUInt32BE
  arr.readInt8 = BP.readInt8
  arr.readInt16LE = BP.readInt16LE
  arr.readInt16BE = BP.readInt16BE
  arr.readInt32LE = BP.readInt32LE
  arr.readInt32BE = BP.readInt32BE
  arr.readFloatLE = BP.readFloatLE
  arr.readFloatBE = BP.readFloatBE
  arr.readDoubleLE = BP.readDoubleLE
  arr.readDoubleBE = BP.readDoubleBE
  arr.writeUInt8 = BP.writeUInt8
  arr.writeUInt16LE = BP.writeUInt16LE
  arr.writeUInt16BE = BP.writeUInt16BE
  arr.writeUInt32LE = BP.writeUInt32LE
  arr.writeUInt32BE = BP.writeUInt32BE
  arr.writeInt8 = BP.writeInt8
  arr.writeInt16LE = BP.writeInt16LE
  arr.writeInt16BE = BP.writeInt16BE
  arr.writeInt32LE = BP.writeInt32LE
  arr.writeInt32BE = BP.writeInt32BE
  arr.writeFloatLE = BP.writeFloatLE
  arr.writeFloatBE = BP.writeFloatBE
  arr.writeDoubleLE = BP.writeDoubleLE
  arr.writeDoubleBE = BP.writeDoubleBE
  arr.fill = BP.fill
  arr.inspect = BP.inspect
  arr.toArrayBuffer = BP.toArrayBuffer

  return arr
}

var INVALID_BASE64_RE = /[^+\/0-9A-z]/g

function base64clean (str) {
  // Node strips out invalid characters like \n and \t from the string, base64-js does not
  str = stringtrim(str).replace(INVALID_BASE64_RE, '')
  // Node allows for non-padded base64 strings (missing trailing ===), base64-js does not
  while (str.length % 4 !== 0) {
    str = str + '='
  }
  return str
}

function stringtrim (str) {
  if (str.trim) return str.trim()
  return str.replace(/^\s+|\s+$/g, '')
}

function isArrayish (subject) {
  return isArray(subject) || Buffer.isBuffer(subject) ||
      subject && typeof subject === 'object' &&
      typeof subject.length === 'number'
}

function toHex (n) {
  if (n < 16) return '0' + n.toString(16)
  return n.toString(16)
}

function utf8ToBytes (str) {
  var byteArray = []
  for (var i = 0; i < str.length; i++) {
    var b = str.charCodeAt(i)
    if (b <= 0x7F) {
      byteArray.push(b)
    } else {
      var start = i
      if (b >= 0xD800 && b <= 0xDFFF) i++
      var h = encodeURIComponent(str.slice(start, i+1)).substr(1).split('%')
      for (var j = 0; j < h.length; j++) {
        byteArray.push(parseInt(h[j], 16))
      }
    }
  }
  return byteArray
}

function asciiToBytes (str) {
  var byteArray = []
  for (var i = 0; i < str.length; i++) {
    // Node's code seems to be doing this and not & 0x7F..
    byteArray.push(str.charCodeAt(i) & 0xFF)
  }
  return byteArray
}

function utf16leToBytes (str) {
  var c, hi, lo
  var byteArray = []
  for (var i = 0; i < str.length; i++) {
    c = str.charCodeAt(i)
    hi = c >> 8
    lo = c % 256
    byteArray.push(lo)
    byteArray.push(hi)
  }

  return byteArray
}

function base64ToBytes (str) {
  return base64.toByteArray(str)
}

function blitBuffer (src, dst, offset, length) {
  for (var i = 0; i < length; i++) {
    if ((i + offset >= dst.length) || (i >= src.length))
      break
    dst[i + offset] = src[i]
  }
  return i
}

function decodeUtf8Char (str) {
  try {
    return decodeURIComponent(str)
  } catch (err) {
    return String.fromCharCode(0xFFFD) // UTF 8 invalid char
  }
}

},{"base64-js":11,"ieee754":12,"is-array":13}],11:[function(require,module,exports){
var lookup = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/';

;(function (exports) {
	'use strict';

  var Arr = (typeof Uint8Array !== 'undefined')
    ? Uint8Array
    : Array

	var PLUS   = '+'.charCodeAt(0)
	var SLASH  = '/'.charCodeAt(0)
	var NUMBER = '0'.charCodeAt(0)
	var LOWER  = 'a'.charCodeAt(0)
	var UPPER  = 'A'.charCodeAt(0)

	function decode (elt) {
		var code = elt.charCodeAt(0)
		if (code === PLUS)
			return 62 // '+'
		if (code === SLASH)
			return 63 // '/'
		if (code < NUMBER)
			return -1 //no match
		if (code < NUMBER + 10)
			return code - NUMBER + 26 + 26
		if (code < UPPER + 26)
			return code - UPPER
		if (code < LOWER + 26)
			return code - LOWER + 26
	}

	function b64ToByteArray (b64) {
		var i, j, l, tmp, placeHolders, arr

		if (b64.length % 4 > 0) {
			throw new Error('Invalid string. Length must be a multiple of 4')
		}

		// the number of equal signs (place holders)
		// if there are two placeholders, than the two characters before it
		// represent one byte
		// if there is only one, then the three characters before it represent 2 bytes
		// this is just a cheap hack to not do indexOf twice
		var len = b64.length
		placeHolders = '=' === b64.charAt(len - 2) ? 2 : '=' === b64.charAt(len - 1) ? 1 : 0

		// base64 is 4/3 + up to two characters of the original data
		arr = new Arr(b64.length * 3 / 4 - placeHolders)

		// if there are placeholders, only get up to the last complete 4 chars
		l = placeHolders > 0 ? b64.length - 4 : b64.length

		var L = 0

		function push (v) {
			arr[L++] = v
		}

		for (i = 0, j = 0; i < l; i += 4, j += 3) {
			tmp = (decode(b64.charAt(i)) << 18) | (decode(b64.charAt(i + 1)) << 12) | (decode(b64.charAt(i + 2)) << 6) | decode(b64.charAt(i + 3))
			push((tmp & 0xFF0000) >> 16)
			push((tmp & 0xFF00) >> 8)
			push(tmp & 0xFF)
		}

		if (placeHolders === 2) {
			tmp = (decode(b64.charAt(i)) << 2) | (decode(b64.charAt(i + 1)) >> 4)
			push(tmp & 0xFF)
		} else if (placeHolders === 1) {
			tmp = (decode(b64.charAt(i)) << 10) | (decode(b64.charAt(i + 1)) << 4) | (decode(b64.charAt(i + 2)) >> 2)
			push((tmp >> 8) & 0xFF)
			push(tmp & 0xFF)
		}

		return arr
	}

	function uint8ToBase64 (uint8) {
		var i,
			extraBytes = uint8.length % 3, // if we have 1 byte left, pad 2 bytes
			output = "",
			temp, length

		function encode (num) {
			return lookup.charAt(num)
		}

		function tripletToBase64 (num) {
			return encode(num >> 18 & 0x3F) + encode(num >> 12 & 0x3F) + encode(num >> 6 & 0x3F) + encode(num & 0x3F)
		}

		// go through the array every three bytes, we'll deal with trailing stuff later
		for (i = 0, length = uint8.length - extraBytes; i < length; i += 3) {
			temp = (uint8[i] << 16) + (uint8[i + 1] << 8) + (uint8[i + 2])
			output += tripletToBase64(temp)
		}

		// pad the end with zeros, but make sure to not forget the extra bytes
		switch (extraBytes) {
			case 1:
				temp = uint8[uint8.length - 1]
				output += encode(temp >> 2)
				output += encode((temp << 4) & 0x3F)
				output += '=='
				break
			case 2:
				temp = (uint8[uint8.length - 2] << 8) + (uint8[uint8.length - 1])
				output += encode(temp >> 10)
				output += encode((temp >> 4) & 0x3F)
				output += encode((temp << 2) & 0x3F)
				output += '='
				break
		}

		return output
	}

	exports.toByteArray = b64ToByteArray
	exports.fromByteArray = uint8ToBase64
}(typeof exports === 'undefined' ? (this.base64js = {}) : exports))

},{}],12:[function(require,module,exports){
exports.read = function(buffer, offset, isLE, mLen, nBytes) {
  var e, m,
      eLen = nBytes * 8 - mLen - 1,
      eMax = (1 << eLen) - 1,
      eBias = eMax >> 1,
      nBits = -7,
      i = isLE ? (nBytes - 1) : 0,
      d = isLE ? -1 : 1,
      s = buffer[offset + i];

  i += d;

  e = s & ((1 << (-nBits)) - 1);
  s >>= (-nBits);
  nBits += eLen;
  for (; nBits > 0; e = e * 256 + buffer[offset + i], i += d, nBits -= 8);

  m = e & ((1 << (-nBits)) - 1);
  e >>= (-nBits);
  nBits += mLen;
  for (; nBits > 0; m = m * 256 + buffer[offset + i], i += d, nBits -= 8);

  if (e === 0) {
    e = 1 - eBias;
  } else if (e === eMax) {
    return m ? NaN : ((s ? -1 : 1) * Infinity);
  } else {
    m = m + Math.pow(2, mLen);
    e = e - eBias;
  }
  return (s ? -1 : 1) * m * Math.pow(2, e - mLen);
};

exports.write = function(buffer, value, offset, isLE, mLen, nBytes) {
  var e, m, c,
      eLen = nBytes * 8 - mLen - 1,
      eMax = (1 << eLen) - 1,
      eBias = eMax >> 1,
      rt = (mLen === 23 ? Math.pow(2, -24) - Math.pow(2, -77) : 0),
      i = isLE ? 0 : (nBytes - 1),
      d = isLE ? 1 : -1,
      s = value < 0 || (value === 0 && 1 / value < 0) ? 1 : 0;

  value = Math.abs(value);

  if (isNaN(value) || value === Infinity) {
    m = isNaN(value) ? 1 : 0;
    e = eMax;
  } else {
    e = Math.floor(Math.log(value) / Math.LN2);
    if (value * (c = Math.pow(2, -e)) < 1) {
      e--;
      c *= 2;
    }
    if (e + eBias >= 1) {
      value += rt / c;
    } else {
      value += rt * Math.pow(2, 1 - eBias);
    }
    if (value * c >= 2) {
      e++;
      c /= 2;
    }

    if (e + eBias >= eMax) {
      m = 0;
      e = eMax;
    } else if (e + eBias >= 1) {
      m = (value * c - 1) * Math.pow(2, mLen);
      e = e + eBias;
    } else {
      m = value * Math.pow(2, eBias - 1) * Math.pow(2, mLen);
      e = 0;
    }
  }

  for (; mLen >= 8; buffer[offset + i] = m & 0xff, i += d, m /= 256, mLen -= 8);

  e = (e << mLen) | m;
  eLen += mLen;
  for (; eLen > 0; buffer[offset + i] = e & 0xff, i += d, e /= 256, eLen -= 8);

  buffer[offset + i - d] |= s * 128;
};

},{}],13:[function(require,module,exports){

/**
 * isArray
 */

var isArray = Array.isArray;

/**
 * toString
 */

var str = Object.prototype.toString;

/**
 * Whether or not the given `val`
 * is an array.
 *
 * example:
 *
 *        isArray([]);
 *        // > true
 *        isArray(arguments);
 *        // > false
 *        isArray('');
 *        // > false
 *
 * @param {mixed} val
 * @return {bool}
 */

module.exports = isArray || function (val) {
  return !! val && '[object Array]' == str.call(val);
};

},{}],14:[function(require,module,exports){
if (typeof Object.create === 'function') {
  // implementation from standard node.js 'util' module
  module.exports = function inherits(ctor, superCtor) {
    ctor.super_ = superCtor
    ctor.prototype = Object.create(superCtor.prototype, {
      constructor: {
        value: ctor,
        enumerable: false,
        writable: true,
        configurable: true
      }
    });
  };
} else {
  // old school shim for old browsers
  module.exports = function inherits(ctor, superCtor) {
    ctor.super_ = superCtor
    var TempCtor = function () {}
    TempCtor.prototype = superCtor.prototype
    ctor.prototype = new TempCtor()
    ctor.prototype.constructor = ctor
  }
}

},{}],15:[function(require,module,exports){
// shim for using process in browser

var process = module.exports = {};

process.nextTick = (function () {
    var canSetImmediate = typeof window !== 'undefined'
    && window.setImmediate;
    var canMutationObserver = typeof window !== 'undefined'
    && window.MutationObserver;
    var canPost = typeof window !== 'undefined'
    && window.postMessage && window.addEventListener
    ;

    if (canSetImmediate) {
        return function (f) { return window.setImmediate(f) };
    }

    var queue = [];

    if (canMutationObserver) {
        var hiddenDiv = document.createElement("div");
        var observer = new MutationObserver(function () {
            var queueList = queue.slice();
            queue.length = 0;
            queueList.forEach(function (fn) {
                fn();
            });
        });

        observer.observe(hiddenDiv, { attributes: true });

        return function nextTick(fn) {
            if (!queue.length) {
                hiddenDiv.setAttribute('yes', 'no');
            }
            queue.push(fn);
        };
    }

    if (canPost) {
        window.addEventListener('message', function (ev) {
            var source = ev.source;
            if ((source === window || source === null) && ev.data === 'process-tick') {
                ev.stopPropagation();
                if (queue.length > 0) {
                    var fn = queue.shift();
                    fn();
                }
            }
        }, true);

        return function nextTick(fn) {
            queue.push(fn);
            window.postMessage('process-tick', '*');
        };
    }

    return function nextTick(fn) {
        setTimeout(fn, 0);
    };
})();

process.title = 'browser';
process.browser = true;
process.env = {};
process.argv = [];

function noop() {}

process.on = noop;
process.addListener = noop;
process.once = noop;
process.off = noop;
process.removeListener = noop;
process.removeAllListeners = noop;
process.emit = noop;

process.binding = function (name) {
    throw new Error('process.binding is not supported');
};

// TODO(shtylman)
process.cwd = function () { return '/' };
process.chdir = function (dir) {
    throw new Error('process.chdir is not supported');
};

},{}],16:[function(require,module,exports){
module.exports = function isBuffer(arg) {
  return arg && typeof arg === 'object'
    && typeof arg.copy === 'function'
    && typeof arg.fill === 'function'
    && typeof arg.readUInt8 === 'function';
}
},{}],17:[function(require,module,exports){
(function (process,global){
// Copyright Joyent, Inc. and other Node contributors.
//
// Permission is hereby granted, free of charge, to any person obtaining a
// copy of this software and associated documentation files (the
// "Software"), to deal in the Software without restriction, including
// without limitation the rights to use, copy, modify, merge, publish,
// distribute, sublicense, and/or sell copies of the Software, and to permit
// persons to whom the Software is furnished to do so, subject to the
// following conditions:
//
// The above copyright notice and this permission notice shall be included
// in all copies or substantial portions of the Software.
//
// THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS
// OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
// MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN
// NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM,
// DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR
// OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE
// USE OR OTHER DEALINGS IN THE SOFTWARE.

var formatRegExp = /%[sdj%]/g;
exports.format = function(f) {
  if (!isString(f)) {
    var objects = [];
    for (var i = 0; i < arguments.length; i++) {
      objects.push(inspect(arguments[i]));
    }
    return objects.join(' ');
  }

  var i = 1;
  var args = arguments;
  var len = args.length;
  var str = String(f).replace(formatRegExp, function(x) {
    if (x === '%%') return '%';
    if (i >= len) return x;
    switch (x) {
      case '%s': return String(args[i++]);
      case '%d': return Number(args[i++]);
      case '%j':
        try {
          return JSON.stringify(args[i++]);
        } catch (_) {
          return '[Circular]';
        }
      default:
        return x;
    }
  });
  for (var x = args[i]; i < len; x = args[++i]) {
    if (isNull(x) || !isObject(x)) {
      str += ' ' + x;
    } else {
      str += ' ' + inspect(x);
    }
  }
  return str;
};


// Mark that a method should not be used.
// Returns a modified function which warns once by default.
// If --no-deprecation is set, then it is a no-op.
exports.deprecate = function(fn, msg) {
  // Allow for deprecating things in the process of starting up.
  if (isUndefined(global.process)) {
    return function() {
      return exports.deprecate(fn, msg).apply(this, arguments);
    };
  }

  if (process.noDeprecation === true) {
    return fn;
  }

  var warned = false;
  function deprecated() {
    if (!warned) {
      if (process.throwDeprecation) {
        throw new Error(msg);
      } else if (process.traceDeprecation) {
        console.trace(msg);
      } else {
        console.error(msg);
      }
      warned = true;
    }
    return fn.apply(this, arguments);
  }

  return deprecated;
};


var debugs = {};
var debugEnviron;
exports.debuglog = function(set) {
  if (isUndefined(debugEnviron))
    debugEnviron = process.env.NODE_DEBUG || '';
  set = set.toUpperCase();
  if (!debugs[set]) {
    if (new RegExp('\\b' + set + '\\b', 'i').test(debugEnviron)) {
      var pid = process.pid;
      debugs[set] = function() {
        var msg = exports.format.apply(exports, arguments);
        console.error('%s %d: %s', set, pid, msg);
      };
    } else {
      debugs[set] = function() {};
    }
  }
  return debugs[set];
};


/**
 * Echos the value of a value. Trys to print the value out
 * in the best way possible given the different types.
 *
 * @param {Object} obj The object to print out.
 * @param {Object} opts Optional options object that alters the output.
 */
/* legacy: obj, showHidden, depth, colors*/
function inspect(obj, opts) {
  // default options
  var ctx = {
    seen: [],
    stylize: stylizeNoColor
  };
  // legacy...
  if (arguments.length >= 3) ctx.depth = arguments[2];
  if (arguments.length >= 4) ctx.colors = arguments[3];
  if (isBoolean(opts)) {
    // legacy...
    ctx.showHidden = opts;
  } else if (opts) {
    // got an "options" object
    exports._extend(ctx, opts);
  }
  // set default options
  if (isUndefined(ctx.showHidden)) ctx.showHidden = false;
  if (isUndefined(ctx.depth)) ctx.depth = 2;
  if (isUndefined(ctx.colors)) ctx.colors = false;
  if (isUndefined(ctx.customInspect)) ctx.customInspect = true;
  if (ctx.colors) ctx.stylize = stylizeWithColor;
  return formatValue(ctx, obj, ctx.depth);
}
exports.inspect = inspect;


// http://en.wikipedia.org/wiki/ANSI_escape_code#graphics
inspect.colors = {
  'bold' : [1, 22],
  'italic' : [3, 23],
  'underline' : [4, 24],
  'inverse' : [7, 27],
  'white' : [37, 39],
  'grey' : [90, 39],
  'black' : [30, 39],
  'blue' : [34, 39],
  'cyan' : [36, 39],
  'green' : [32, 39],
  'magenta' : [35, 39],
  'red' : [31, 39],
  'yellow' : [33, 39]
};

// Don't use 'blue' not visible on cmd.exe
inspect.styles = {
  'special': 'cyan',
  'number': 'yellow',
  'boolean': 'yellow',
  'undefined': 'grey',
  'null': 'bold',
  'string': 'green',
  'date': 'magenta',
  // "name": intentionally not styling
  'regexp': 'red'
};


function stylizeWithColor(str, styleType) {
  var style = inspect.styles[styleType];

  if (style) {
    return '\u001b[' + inspect.colors[style][0] + 'm' + str +
           '\u001b[' + inspect.colors[style][1] + 'm';
  } else {
    return str;
  }
}


function stylizeNoColor(str, styleType) {
  return str;
}


function arrayToHash(array) {
  var hash = {};

  array.forEach(function(val, idx) {
    hash[val] = true;
  });

  return hash;
}


function formatValue(ctx, value, recurseTimes) {
  // Provide a hook for user-specified inspect functions.
  // Check that value is an object with an inspect function on it
  if (ctx.customInspect &&
      value &&
      isFunction(value.inspect) &&
      // Filter out the util module, it's inspect function is special
      value.inspect !== exports.inspect &&
      // Also filter out any prototype objects using the circular check.
      !(value.constructor && value.constructor.prototype === value)) {
    var ret = value.inspect(recurseTimes, ctx);
    if (!isString(ret)) {
      ret = formatValue(ctx, ret, recurseTimes);
    }
    return ret;
  }

  // Primitive types cannot have properties
  var primitive = formatPrimitive(ctx, value);
  if (primitive) {
    return primitive;
  }

  // Look up the keys of the object.
  var keys = Object.keys(value);
  var visibleKeys = arrayToHash(keys);

  if (ctx.showHidden) {
    keys = Object.getOwnPropertyNames(value);
  }

  // IE doesn't make error fields non-enumerable
  // http://msdn.microsoft.com/en-us/library/ie/dww52sbt(v=vs.94).aspx
  if (isError(value)
      && (keys.indexOf('message') >= 0 || keys.indexOf('description') >= 0)) {
    return formatError(value);
  }

  // Some type of object without properties can be shortcutted.
  if (keys.length === 0) {
    if (isFunction(value)) {
      var name = value.name ? ': ' + value.name : '';
      return ctx.stylize('[Function' + name + ']', 'special');
    }
    if (isRegExp(value)) {
      return ctx.stylize(RegExp.prototype.toString.call(value), 'regexp');
    }
    if (isDate(value)) {
      return ctx.stylize(Date.prototype.toString.call(value), 'date');
    }
    if (isError(value)) {
      return formatError(value);
    }
  }

  var base = '', array = false, braces = ['{', '}'];

  // Make Array say that they are Array
  if (isArray(value)) {
    array = true;
    braces = ['[', ']'];
  }

  // Make functions say that they are functions
  if (isFunction(value)) {
    var n = value.name ? ': ' + value.name : '';
    base = ' [Function' + n + ']';
  }

  // Make RegExps say that they are RegExps
  if (isRegExp(value)) {
    base = ' ' + RegExp.prototype.toString.call(value);
  }

  // Make dates with properties first say the date
  if (isDate(value)) {
    base = ' ' + Date.prototype.toUTCString.call(value);
  }

  // Make error with message first say the error
  if (isError(value)) {
    base = ' ' + formatError(value);
  }

  if (keys.length === 0 && (!array || value.length == 0)) {
    return braces[0] + base + braces[1];
  }

  if (recurseTimes < 0) {
    if (isRegExp(value)) {
      return ctx.stylize(RegExp.prototype.toString.call(value), 'regexp');
    } else {
      return ctx.stylize('[Object]', 'special');
    }
  }

  ctx.seen.push(value);

  var output;
  if (array) {
    output = formatArray(ctx, value, recurseTimes, visibleKeys, keys);
  } else {
    output = keys.map(function(key) {
      return formatProperty(ctx, value, recurseTimes, visibleKeys, key, array);
    });
  }

  ctx.seen.pop();

  return reduceToSingleString(output, base, braces);
}


function formatPrimitive(ctx, value) {
  if (isUndefined(value))
    return ctx.stylize('undefined', 'undefined');
  if (isString(value)) {
    var simple = '\'' + JSON.stringify(value).replace(/^"|"$/g, '')
                                             .replace(/'/g, "\\'")
                                             .replace(/\\"/g, '"') + '\'';
    return ctx.stylize(simple, 'string');
  }
  if (isNumber(value))
    return ctx.stylize('' + value, 'number');
  if (isBoolean(value))
    return ctx.stylize('' + value, 'boolean');
  // For some reason typeof null is "object", so special case here.
  if (isNull(value))
    return ctx.stylize('null', 'null');
}


function formatError(value) {
  return '[' + Error.prototype.toString.call(value) + ']';
}


function formatArray(ctx, value, recurseTimes, visibleKeys, keys) {
  var output = [];
  for (var i = 0, l = value.length; i < l; ++i) {
    if (hasOwnProperty(value, String(i))) {
      output.push(formatProperty(ctx, value, recurseTimes, visibleKeys,
          String(i), true));
    } else {
      output.push('');
    }
  }
  keys.forEach(function(key) {
    if (!key.match(/^\d+$/)) {
      output.push(formatProperty(ctx, value, recurseTimes, visibleKeys,
          key, true));
    }
  });
  return output;
}


function formatProperty(ctx, value, recurseTimes, visibleKeys, key, array) {
  var name, str, desc;
  desc = Object.getOwnPropertyDescriptor(value, key) || { value: value[key] };
  if (desc.get) {
    if (desc.set) {
      str = ctx.stylize('[Getter/Setter]', 'special');
    } else {
      str = ctx.stylize('[Getter]', 'special');
    }
  } else {
    if (desc.set) {
      str = ctx.stylize('[Setter]', 'special');
    }
  }
  if (!hasOwnProperty(visibleKeys, key)) {
    name = '[' + key + ']';
  }
  if (!str) {
    if (ctx.seen.indexOf(desc.value) < 0) {
      if (isNull(recurseTimes)) {
        str = formatValue(ctx, desc.value, null);
      } else {
        str = formatValue(ctx, desc.value, recurseTimes - 1);
      }
      if (str.indexOf('\n') > -1) {
        if (array) {
          str = str.split('\n').map(function(line) {
            return '  ' + line;
          }).join('\n').substr(2);
        } else {
          str = '\n' + str.split('\n').map(function(line) {
            return '   ' + line;
          }).join('\n');
        }
      }
    } else {
      str = ctx.stylize('[Circular]', 'special');
    }
  }
  if (isUndefined(name)) {
    if (array && key.match(/^\d+$/)) {
      return str;
    }
    name = JSON.stringify('' + key);
    if (name.match(/^"([a-zA-Z_][a-zA-Z_0-9]*)"$/)) {
      name = name.substr(1, name.length - 2);
      name = ctx.stylize(name, 'name');
    } else {
      name = name.replace(/'/g, "\\'")
                 .replace(/\\"/g, '"')
                 .replace(/(^"|"$)/g, "'");
      name = ctx.stylize(name, 'string');
    }
  }

  return name + ': ' + str;
}


function reduceToSingleString(output, base, braces) {
  var numLinesEst = 0;
  var length = output.reduce(function(prev, cur) {
    numLinesEst++;
    if (cur.indexOf('\n') >= 0) numLinesEst++;
    return prev + cur.replace(/\u001b\[\d\d?m/g, '').length + 1;
  }, 0);

  if (length > 60) {
    return braces[0] +
           (base === '' ? '' : base + '\n ') +
           ' ' +
           output.join(',\n  ') +
           ' ' +
           braces[1];
  }

  return braces[0] + base + ' ' + output.join(', ') + ' ' + braces[1];
}


// NOTE: These type checking functions intentionally don't use `instanceof`
// because it is fragile and can be easily faked with `Object.create()`.
function isArray(ar) {
  return Array.isArray(ar);
}
exports.isArray = isArray;

function isBoolean(arg) {
  return typeof arg === 'boolean';
}
exports.isBoolean = isBoolean;

function isNull(arg) {
  return arg === null;
}
exports.isNull = isNull;

function isNullOrUndefined(arg) {
  return arg == null;
}
exports.isNullOrUndefined = isNullOrUndefined;

function isNumber(arg) {
  return typeof arg === 'number';
}
exports.isNumber = isNumber;

function isString(arg) {
  return typeof arg === 'string';
}
exports.isString = isString;

function isSymbol(arg) {
  return typeof arg === 'symbol';
}
exports.isSymbol = isSymbol;

function isUndefined(arg) {
  return arg === void 0;
}
exports.isUndefined = isUndefined;

function isRegExp(re) {
  return isObject(re) && objectToString(re) === '[object RegExp]';
}
exports.isRegExp = isRegExp;

function isObject(arg) {
  return typeof arg === 'object' && arg !== null;
}
exports.isObject = isObject;

function isDate(d) {
  return isObject(d) && objectToString(d) === '[object Date]';
}
exports.isDate = isDate;

function isError(e) {
  return isObject(e) &&
      (objectToString(e) === '[object Error]' || e instanceof Error);
}
exports.isError = isError;

function isFunction(arg) {
  return typeof arg === 'function';
}
exports.isFunction = isFunction;

function isPrimitive(arg) {
  return arg === null ||
         typeof arg === 'boolean' ||
         typeof arg === 'number' ||
         typeof arg === 'string' ||
         typeof arg === 'symbol' ||  // ES6 symbol
         typeof arg === 'undefined';
}
exports.isPrimitive = isPrimitive;

exports.isBuffer = require('./support/isBuffer');

function objectToString(o) {
  return Object.prototype.toString.call(o);
}


function pad(n) {
  return n < 10 ? '0' + n.toString(10) : n.toString(10);
}


var months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep',
              'Oct', 'Nov', 'Dec'];

// 26 Feb 16:19:34
function timestamp() {
  var d = new Date();
  var time = [pad(d.getHours()),
              pad(d.getMinutes()),
              pad(d.getSeconds())].join(':');
  return [d.getDate(), months[d.getMonth()], time].join(' ');
}


// log is just a thin wrapper to console.log that prepends a timestamp
exports.log = function() {
  console.log('%s - %s', timestamp(), exports.format.apply(exports, arguments));
};


/**
 * Inherit the prototype methods from one constructor into another.
 *
 * The Function.prototype.inherits from lang.js rewritten as a standalone
 * function (not on Function.prototype). NOTE: If this file is to be loaded
 * during bootstrapping this function needs to be rewritten using some native
 * functions as prototype setup using normal JavaScript does not work as
 * expected during bootstrapping (see mirror.js in r114903).
 *
 * @param {function} ctor Constructor function which needs to inherit the
 *     prototype.
 * @param {function} superCtor Constructor function to inherit prototype from.
 */
exports.inherits = require('inherits');

exports._extend = function(origin, add) {
  // Don't do anything if add isn't an object
  if (!add || !isObject(add)) return origin;

  var keys = Object.keys(add);
  var i = keys.length;
  while (i--) {
    origin[keys[i]] = add[keys[i]];
  }
  return origin;
};

function hasOwnProperty(obj, prop) {
  return Object.prototype.hasOwnProperty.call(obj, prop);
}

}).call(this,require('_process'),typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})
},{"./support/isBuffer":16,"_process":15,"inherits":14}]},{},[4])(4)
});