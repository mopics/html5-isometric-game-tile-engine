js.events = (js.events || {});

js.events.EventDispatcher = new js.lang.Class()  ({
    /** Class which encapsulates logic for storing and notifying implicitl declared event-listeners. **/
    __init__ : function()  {
        /** Initializer for EventDispatcher **/
        this._eventListeners = new js.util.ArrayList();
    },
    
    addEventListener : function( listener )  {
        /** Add given listener to listeners. **/
        this._eventListeners.add( listener );
    },
    
    hasEventListener : function( listener )  {
        /** Check if this dispatcher already contains given listener. **/
        return( this._eventListeners.contains( listener ) );
    },
    
    removeEventListener : function( listener )  {
        /** Remove given listener from listeners, using a comparator. **/
        this._eventListeners.remove( listener, this._eventListenerComparator );
    },
    
    _eventListenerComparator : function( a, b )  {
        /** Default method of comparing two listeners; explicit, for the case where 
            this logic needs to be overriden in child classes. **/
        return( a === b );
    },
    
    dispatchEvent : function( evt, eventArgs )  {
        /** Notify all listeners that given event has occurred, relaying given arguments.
            Listener method-name must correspond to ('handle:' + event). **/
        //  TODO: event-args is extended and optional params are added on a per-type basis
        //  TODO: add CancelBubble (return false?  or throw new js.events.EventDispatcher.Events.CancelEvent())
        var dispatcher = this;
        var eventHandle = js.events.EventDispatcher.EVENT_HANDLE_PREFIX + 
                js.events.EventDispatcher.EVENT_HANDLE_SEPARATOR + evt;
        
        this._eventListeners.iterate( function( k, listener )  {
            if( (listener instanceof Object) && (eventHandle in listener) )  {
                listener[ eventHandle ]( dispatcher, eventArgs );
            }
        });
    }
})
.Static({
    EVENT_HANDLE_PREFIX : 'handle',
    EVENT_HANDLE_SEPARATOR : ':'
});
