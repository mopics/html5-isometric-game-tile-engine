js.util = (js.util || {});
js.util.ArrayList = new js.lang.Class()({
    __init__: function(array) {
        this._array = (array ? array.slice() : []);
    },
    add: function(element) {
        this._array.push(element);
    },
    addAll: function(collection) {
        var that = this;
        collection.iterate(function(k, v) {
            that.add(v);
        });
    },
    clear: function() {
        this._array = [];
    },
    contains: function(element, comparator) {
        return (this.indexOf(element, comparator) !== -1);
    },
    containsAll: function(collection, comparator) {
        var that = this,
        containsAll = true;
        collection.iterate(function(k, v) {
            if (!that.contains(v, comparator)) {
                containsAll = false;
                return (true);
            }
        });
        return (containsAll);
    },
    get: function(index) {
        return (this._array[index]);
    },
    indexOf: function(element, comparator) {
        var index = -1,
        compare = this.getComparator(comparator);
        this.iterate(function(k, v) {
            if (compare(element, v)) {
                index = k;
                return (true);
            }
        });
        return (index);
    },
    isEmpty: function() {
        return (this._array.length === 0);
    },
    removeAt: function(index) {
        this._array.splice(index, 1);
    },
    remove: function(element, comparator) {
        var key,
        compare = this.getComparator(comparator);
        this.iterate(function(k, v) {
            if (compare(element, v)) {
                key = k;
                return (true);
            }
        });
        this.removeAt(key);
    },
    removeAll: function(collection, comparator) {
        var that = this;
        collection.iterate(function(k, v) {
            that.remove(v, comparator);
        });
    },
    retainAll: function(collection, comparator) {
        var that = this;
        this.iterate(function(k, v) {
            if (!collection.contains(v, comparator)) {
                that.remove(v, comparator);
            }
        });
    },
    set: function(index, element) {
        this._array[index] = element;
    },
    size: function() {
        return (this._array.length);
    },
    subList: function(fromIndex, toIndex) {
        return (new js.util.ArrayList(this._array.slice(fromIndex, toIndex)));
    },
    toArray: function() {
        return (this._array.slice());
    },
    getComparator: function(comparator) {
        return ((comparator !== undefined) ? comparator: this._defaultComparator);
    },
    _defaultComparator: function(a, b) {
        return (a === b);
    },
    iterate: function(callback) {
        var array = this._array;
        for (var i = (array.length - 1); i >= 0; i--) {
            if (callback(i, array[i])) {
                break;
            }
        }
    },
    reduce: function(callback) {
        var that = this;
        this.iterate(function(k, v) {
            if (!callback(k, v)) {
                that.removeAt(k);
            }
        });
    }
}).Static({
    Iterate: function(list, callback) {
        js.util.ArrayList.prototype.iterate.call({
            _array: list
        },
        callback);
    }
});
js.util.Set = new js.lang.Class(js.util.ArrayList)({
    __init__: function(array) {
        js.util.ArrayList.__init__.call(this);
        if (array) {
            this.addAll(new js.util.ArrayList(array));
        }
    },
    add: function(element, comparator) {
        if (!this.contains(element, comparator)) {
            js.util.ArrayList.prototype.add.call(this, element);
        }
    },
    addAll: function(collection, comparator) {
        var that = this;
        collection.iterate(function(k, v) {
            that.add(v, comparator);
        });
    }
});
