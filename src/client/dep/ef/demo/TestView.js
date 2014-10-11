define(function (require) {
    var View = require('er/View');
    var util = require('er/util');

    function TestView() {
        View.apply(this, arguments);
    }

    TestView.prototype.render = function () {
        this.getContainerElement().innerHTML = 'Hello World, it\'s now ' + (new Date()).toLocaleTimeString();;
    };

    util.inherits(TestView, View);
    return TestView;
})