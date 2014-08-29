define('er/permission', [], function () {
    var authorities = {};
    var permssion = {
            add: function (data) {
                for (var key in data) {
                    if (data.hasOwnProperty(key)) {
                        var value = data[key];
                        if (typeof value === 'object') {
                            this.add(value);
                        } else {
                            authorities[key] = value;
                        }
                    }
                }
            },
            isAllow: function (name) {
                return !!authorities[name];
            }
        };
    return permssion;
});