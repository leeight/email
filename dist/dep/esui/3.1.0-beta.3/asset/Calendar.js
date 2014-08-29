define('esui/Calendar', [
    'require',
    './MonthView',
    'underscore',
    'moment',
    './lib',
    './main',
    './InputControl',
    './Layer',
    './painters'
], function (require) {
    require('./MonthView');
    var u = require('underscore');
    var moment = require('moment');
    var lib = require('./lib');
    var ui = require('./main');
    var InputControl = require('./InputControl');
    var Layer = require('./Layer');
    function CalendarLayer() {
        Layer.apply(this, arguments);
    }
    lib.inherits(CalendarLayer, Layer);
    CalendarLayer.prototype.render = function (element) {
        document.body.appendChild(element);
        element.innerHTML = '<div data-ui-type="MonthView" ' + 'data-ui-child-name="monthView"></div>';
        var calendar = this.control;
        calendar.helper.initChildren(element);
        var monthView = calendar.getChild('monthView');
        monthView.setProperties({
            'rawValue': calendar.rawValue,
            'range': calendar.range
        });
        monthView.on('change', syncMonthViewValue, calendar);
        if (calendar.autoHideLayer) {
            monthView.on('itemclick', u.bind(calendar.layer.toggle, calendar.layer));
        }
    };
    CalendarLayer.prototype.toggle = function () {
        var element = this.getElement();
        if (!element || this.control.helper.isPart(element, 'layer-hidden')) {
            var calendar = this.control;
            var monthView = calendar.getChild('monthView');
            monthView.setProperties({
                'rawValue': calendar.rawValue,
                'range': calendar.range
            });
            this.show();
        } else {
            this.hide();
        }
    };
    function Calendar() {
        InputControl.apply(this, arguments);
        this.layer = new CalendarLayer(this);
    }
    function syncMonthViewValue() {
        var monthView = this.getChild('monthView');
        var date = monthView.getRawValue();
        if (!date) {
            return;
        }
        this.rawValue = date;
        updateDisplayText(this);
        this.fire('change');
    }
    function updateDisplayText(calendar) {
        var textHolder = calendar.helper.getPart('text');
        textHolder.innerHTML = u.escape(calendar.getValue());
    }
    Calendar.prototype = {
        type: 'Calendar',
        initOptions: function (options) {
            var now = new Date();
            var properties = {
                    range: {
                        begin: new Date(1983, 8, 3),
                        end: new Date(2046, 10, 4)
                    },
                    dateFormat: 'YYYY-MM-DD',
                    paramFormat: 'YYYY-MM-DD',
                    rawValue: now,
                    autoHideLayer: false
                };
            if (options.autoHideLayer === 'false') {
                options.autoHideLayer = false;
            }
            u.extend(properties, options);
            if (lib.isInput(this.main)) {
                this.helper.extractOptionsFromInput(this.main, properties);
            }
            this.paramFormat = properties.paramFormat;
            if (properties.value) {
                properties.rawValue = this.parseValue(properties.value);
            }
            var range = properties.range;
            if (typeof range === 'string') {
                var beginAndEnd = range.split(',');
                var begin = this.parseValue(beginAndEnd[0]);
                var end = this.parseValue(beginAndEnd[1]);
                properties.range = {
                    begin: begin,
                    end: end
                };
            }
            this.setProperties(properties);
        },
        initStructure: function () {
            if (lib.isInput(this.main)) {
                this.helper.replaceMain();
            }
            var template = [
                    '<div class="${classes}" id="${id}">${value}</div>',
                    '<div class="${arrow}"></div>'
                ];
            this.main.innerHTML = lib.format(template.join(''), {
                classes: this.helper.getPartClassName('text'),
                id: this.helper.getId('text'),
                arrow: this.helper.getPartClassName('arrow')
            });
        },
        initEvents: function () {
            this.helper.addDOMEvent(this.main, 'click', u.bind(this.layer.toggle, this.layer));
        },
        repaint: require('./painters').createRepaint(InputControl.prototype.repaint, {
            name: [
                'rawValue',
                'range'
            ],
            paint: function (calendar, rawValue, range) {
                if (calendar.disabled || calendar.readOnly) {
                    return;
                }
                updateDisplayText(calendar);
                var monthView = calendar.getChild('monthView');
                if (monthView) {
                    monthView.setProperties({
                        rawValue: rawValue,
                        range: range
                    });
                }
            }
        }, {
            name: [
                'disabled',
                'hidden',
                'readOnly'
            ],
            paint: function (calendar, disabled, hidden, readOnly) {
                if (disabled || hidden || readOnly) {
                    calendar.layer.hide();
                }
            }
        }),
        setRange: function (range) {
            this.setProperties({ 'range': range });
        },
        stringifyValue: function (rawValue) {
            return moment(rawValue).format(this.dateFormat) || '';
        },
        parseValue: function (value) {
            var date = moment(value, this.paramFormat).toDate();
            return date;
        },
        dispose: function () {
            if (this.helper.isInStage('DISPOSED')) {
                return;
            }
            if (this.layer) {
                this.layer.dispose();
                this.layer = null;
            }
            InputControl.prototype.dispose.apply(this, arguments);
        }
    };
    lib.inherits(Calendar, InputControl);
    ui.register(Calendar);
    return Calendar;
});