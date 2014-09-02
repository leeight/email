define('esui/helper/html', ['require'], function (require) {
    var helper = {};
    var SELF_CLOSING_TAGS = {
            area: true,
            base: true,
            br: true,
            col: true,
            embed: true,
            hr: true,
            img: true,
            input: true,
            keygen: true,
            link: true,
            meta: true,
            param: true,
            source: true,
            track: true,
            wbr: true
        };
    helper.getPartBeginTag = function (part, nodeName) {
        var html = '<' + nodeName + ' id="' + this.getId(part) + '" ' + 'class="' + this.getPartClassName(part) + '">';
        return html;
    };
    helper.getPartEndTag = function (part, nodeName) {
        var html = SELF_CLOSING_TAGS.hasOwnProperty(nodeName) ? ' />' : '</' + nodeName + '>';
        return html;
    };
    helper.getPartHTML = function (part, nodeName) {
        return this.getPartBeginTag(part, nodeName) + this.getPartEndTag(part, nodeName);
    };
    return helper;
});