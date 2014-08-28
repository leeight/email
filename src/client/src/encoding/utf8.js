/**
 * @file utf8.js ~ 2014/08/28 15:32:35
 * @author leeight(liyubei@baidu.com)
 **/
define(function(require) {

function encode(string) {
    if (typeof string !== 'string') {
        return string;
    }
    else {
        string = string.replace(/\r\n/g, "\n");
    }

    var output = "";
    for (var i = 0; i < string.length; i++) {
        var charCode = string.charCodeAt(i);

        if (charCode < 128) {
            output += String.fromCharCode(charCode);
        }
        else if ((charCode > 127) && (charCode < 2048)) {
            output += String.fromCharCode((charCode >> 6) | 192),
            output += String.fromCharCode((charCode & 63) | 128);
        }
        else {
            output += String.fromCharCode((charCode >> 12) | 224),
            output += String.fromCharCode(((charCode >> 6) & 63) | 128),
            output += String.fromCharCode((charCode & 63) | 128);
        }
    }

    return output;
}

function decode(string) {
    if (typeof string !== 'string') {
        return string;
    }

    var output = "";
    var i = 0;
    while (i < string.length) {
        var charCode = string.charCodeAt(i);

        if (charCode < 128) {
            output += String.fromCharCode(charCode);
            i++;
        }
        else if ((charCode > 191) && (charCode < 224)) {
            output += String.fromCharCode(((charCode & 31) << 6) | (string.charCodeAt(i + 1) & 63));
            i += 2;
        }
        else {
            output += String.fromCharCode(((charCode & 15) << 12) | ((string.charCodeAt(i + 1) & 63) << 6) | (string.charCodeAt(i + 2) & 63));
            i += 3;
        }
    }

    return output;
}

return {
    encode: encode,
    decode: decode
};

});










/* vim: set ts=4 sw=4 sts=4 tw=120: */
