js.events = (js.events || {});
js.events.EventDispatcher = new js.lang.Class()({
    __init__: function() {
        this._eventListeners = new js.util.ArrayList();
    },
    addEventListener: function(listener) {
        this._eventListeners.add(listener);
    },
    hasEventListener: function(listener) {
        return (this._eventListeners.contains(listener));
    },
    removeEventListener: function(listener) {
        this._eventListeners.remove(listener, this._eventListenerComparator);
    },
    _eventListenerComparator: function(a, b) {
        return (a === b);
    },
    dispatchEvent: function(evt, eventArgs) {
        var dispatcher = this;
        var eventHandle = js.events.EventDispatcher.EVENT_HANDLE_PREFIX + js.events.EventDispatcher.EVENT_HANDLE_SEPARATOR + evt;
        this._eventListeners.iterate(function(k, listener) {
            if ((listener instanceof Object) && (eventHandle in listener)) {
                listener[eventHandle](dispatcher, eventArgs);
            }
        });
    }
}).Static({
    EVENT_HANDLE_PREFIX: 'handle',
    EVENT_HANDLE_SEPARATOR: ':'
});
