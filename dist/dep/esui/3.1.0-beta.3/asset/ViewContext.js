define('esui/ViewContext', [
    'require',
    './ControlCollection',
    './lib',
    './SafeWrapper'
], function (require) {
    var ControlCollection = require('./ControlCollection');
    function ControlGroup(name) {
        ControlCollection.apply(this, arguments);
        this.name = name;
    }
    require('./lib').inherits(ControlGroup, ControlCollection);
    ControlGroup.prototype.add = undefined;
    ControlGroup.prototype.remove = undefined;
    ControlGroup.prototype.disposeGroup = function () {
        for (var i = 0; i < this.length; i++) {
            delete this[i];
        }
        this.length = 0;
    };
    function addToGroup(control, group) {
        ControlCollection.prototype.add.call(group, control);
    }
    function removeFromGroup(control, group) {
        ControlCollection.prototype.remove.call(group, control);
    }
    function getGroupNames(control) {
        var group = control.get('group');
        return group ? group.split(/[\t\r\n ]/) : [];
    }
    var counter = 8587523;
    function getGUID() {
        return 'vt' + counter++;
    }
    var pool = {};
    function ViewContext(id) {
        this.controls = {};
        this.groups = {};
        id = id || getGUID();
        if (pool.hasOwnProperty(id)) {
            var i = 1;
            var prefix = id + '-';
            while (pool.hasOwnProperty(prefix + i)) {
                i++;
            }
            id = prefix + i;
        }
        this.id = id;
        pool[this.id] = this;
    }
    ViewContext.get = function (id) {
        return pool[id] || null;
    };
    ViewContext.prototype.add = function (control) {
        var exists = this.controls[control.id];
        if (exists) {
            if (exists === control) {
                return;
            }
            exists.setViewContext(null);
        }
        this.controls[control.id] = control;
        var groups = getGroupNames(control);
        for (var i = 0; i < groups.length; i++) {
            var groupName = groups[i];
            if (!groupName) {
                continue;
            }
            var group = this.getGroup(groupName);
            addToGroup(control, group);
        }
        control.setViewContext(this);
    };
    ViewContext.prototype.remove = function (control) {
        delete this.controls[control.id];
        var groups = getGroupNames(control);
        for (var i = 0; i < groups.length; i++) {
            var groupName = groups[i];
            if (!groupName) {
                continue;
            }
            var group = this.getGroup(groupName);
            removeFromGroup(control, group);
        }
        control.setViewContext(null);
    };
    ViewContext.prototype.get = function (id) {
        return this.controls[id];
    };
    var SafeWrapper = require('./SafeWrapper');
    ViewContext.prototype.getSafely = function (id) {
        var control = this.get(id);
        if (!control) {
            control = new SafeWrapper();
            control.id = id;
            control.viewContext = this;
        }
        return control;
    };
    ViewContext.prototype.getGroup = function (name) {
        if (!name) {
            throw new Error('name is unspecified');
        }
        var group = this.groups[name];
        if (!group) {
            group = this.groups[name] = new ControlGroup(name);
        }
        return group;
    };
    ViewContext.prototype.clean = function () {
        for (var id in this.controls) {
            if (this.controls.hasOwnProperty(id)) {
                var control = this.controls[id];
                control.dispose();
                if (control.viewContext && control.viewContext === this) {
                    this.remove(control);
                }
            }
        }
        for (var name in this.groups) {
            if (this.groups.hasOwnProperty(name)) {
                this.groups[name].disposeGroup();
                this.groups[name] = undefined;
            }
        }
    };
    ViewContext.prototype.dispose = function () {
        this.clean();
        delete pool[this.id];
    };
    return ViewContext;
});