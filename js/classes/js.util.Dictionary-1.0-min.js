js.util = (js.util || {});
js.util.Dictionary = new js.lang.Class()({
    __init__: function(map) {
        this.clear();
        if (map) {
            this.putAll(map);
        }
    },
    clear: function() {
        this._size = 0;
        this._dictionary = {};
    },
    containsKey: function(key) {
        return (this._dictionary.hasOwnProperty(key));
    },
    containsValue: function(value) {
        var key;
        this.iterate(function(k, v) {
            if (value === v) {
                key = k;
                return (true);
            }
        });
        return (key !== undefined);
    },
    entrySet: function() {
        var items = [];
        this.iterate(function(k, v) {
            items.push(v);
        });
        return (new js.util.Set(items));
    },
    get: function(key) {
        return (this._dictionary[key]);
    },
    isEmpty: function() {
        return (this.size() === 0);
    },
    keySet: function() {
        var keys = [];
        this.iterate(function(k, v) {
            keys.push(k);
        });
        return (new js.util.Set(keys));
    },
    put: function(key, value) {
        if (!this._dictionary.hasOwnProperty(key)) {
            this._size++;
        }
        this._dictionary[key] = value;
        return (this);
    },
    putAll: function(map) {
        var that = this;
        map.iterate(function(k, v) {
            that.put(k, v);
        });
    },
    iterate: function(callback) {
        var dictionary = this._dictionary;
        for (var property in dictionary) {
            if (!dictionary.hasOwnProperty(property)) {
                continue;
            }
            if (callback(property, dictionary[property])) {
                break;
            }
        }
    },
    remove: function(key) {
        var success = false;
        if (this._dictionary.hasOwnProperty(key)) {
            success = delete(this._dictionary[key]);
            this._size--;
        }
        return (success);
    },
    size: function() {
        return (this._size);
    },
    values: function() {
        var values = [];
        for (var key in this._dictionary) {
            if (!this._dictionary.hasOwnProperty(key)) {
                continue;
            }
            values.push(key);
        }
        return (new js.util.ArrayList(values));
    },
    clone: function() {
        var dictionary = new js.util.Dictionary();
        this.iterate(function(k, v) {
            dictionary.put(k, (v && (v.clone instanceof Function) ? v.clone() : v));
        });
        return (dictionary);
    },
    toDict: function() {
        return (this.clone()._dictionary);
    }
}).Static({
    Iterate: function(dictionary, callback) {
        js.util.Dictionary.prototype.iterate.call({
            _dictionary: dictionary
        },
        callback);
    },
    Iterator: function(dictionary) {
        return ({
            iterate: function(callback) {
                js.util.Dictionary.prototype.iterate.call({
                    _dictionary: dictionary
                },
                callback);
            }
        });
    }
});
