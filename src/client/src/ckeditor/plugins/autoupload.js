/**
 * @file src/ckeditor/plugins/autoupload.js ~ 2014/10/13 16:17:14
 * @author leeight(liyubei@baidu.com)
 * 处理onpaste的时间，自动上传剪贴板里面的数据
 **/
define(function(require) {
var lib = require('esui/lib');

function getPasteImage(e) {
    return e.clipboardData
           && e.clipboardData.items
           && e.clipboardData.items.length == 1
           && /^image\//.test(e.clipboardData.items[0].type) ? e.clipboardData.items : null;
}

function getDropImage(e) {
    return e.dataTransfer && e.dataTransfer.files ? e.dataTransfer.files : null;
}

function insertImages(editor, items) {
    if (!items || !items.length) {
        return false;
    }

    var len = items.length;
    var ok = false;
    while (len --) {
        var file = items[len];
        if (typeof file.getAsFile === 'function') {
            file = file.getAsFile();
        }
        if (file && file.size > 0) {
            sendAndInsertFile(editor, file);
            ok = true;
        }
    }

    return ok;
}

function sendAndInsertFile(editor, file) {
    var xhr = new XMLHttpRequest();
    var fd = new FormData();
    var postUrl, formName;

    if (/^image\//.test(file.type)) {
        postUrl = '/api/upload/controller?action=image';
        formName = 'image';
    }
    else {
        postUrl = '/api/upload/controller?action=file';
        formName = 'file';
    }

    var fileName = file.name || ('blob.' + file.type.split('/')[1]);

    fd.append(formName, file, fileName);
    fd.append('type', 'ajax');

    xhr.open('POST', postUrl, true);
    xhr.onload = function(e) {
        try {
            var json = JSON.parse(e.target.response);
            if (json.state === 'SUCCESS') {
                if (formName === 'image') {
                    var img = CKEDITOR.dom.element.createFromHtml('<img src="' + json.url + '" />');
                    editor.insertElement(img);
                }
                else {
                    editor.fire('newAttachment', { name: fileName, url: json.url });
                }
            }
        }
        catch(ex) {
        }
    }
    xhr.send(fd);
}

function init(editor) {
    if (!window.FormData || !window.FileReader) {
        return;
    }

    editor.on('instanceReady', function(){
        var doc = editor.document.$;
        lib.on(doc, 'paste', function(e){
            var items = getPasteImage(e);
            if (insertImages(editor, items)) {
                e.preventDefault();
            }
        });
        lib.on(doc, 'drop', function(e){
            var items = getDropImage(e);
            if (insertImages(editor, items)) {
                e.preventDefault();
            }
        });
    });
}

CKEDITOR.plugins.add('autoupload', { init: init });

});










/* vim: set ts=4 sw=4 sts=4 tw=120: */
