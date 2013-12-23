var puremvc;
if( !puremvc ) puremvc = { patterns:{} };

// ======================== PATTERNS ====================================
//========================= Notification
puremvc.patterns.Notification = (function getClass() {
    function Notification(name /* String */, body /* Object */, type /* String */) {
        this.name = name;
        this.body = body;
        this.type = type;
    };
    Notification.prototype.getName = function() {
        return this.name;
    };
    Notification.prototype.setBody = function(body /* Object */) {
        this.body = body;
    };
    Notification.prototype.getBody = function() {
        return this.body;
    };
    Notification.prototype.setType = function(type /* String */) {
        this.type = type;
    };
    Notification.prototype.getType = function() {
        return this.type;
    };
    Notification.prototype.toString = function() {
        var msg = "Notification Name: " + this.getName();
        msg += "\nBody:" + (( this.body == null ) ? "null" : this.body.toString());
        msg += "\nType:" + (( this.type == null ) ? "null" : this.type);
        return msg;
    };
    return Notification;
}());
//========================= Notifier
puremvc.patterns.Notifier = (function getClass(){
    function Notifier( f ){
        this.facade = f;
    };
    Notifier.prototype.sendNotification = function(notificationName /* String */, body /* Object */, type /* String */) {
        this.facade.sendNotification(notificationName, body, type);
    };
    return Notifier;
}());
//========================= Observer
puremvc.patterns.Observer = (function getClass(){
    var core = puremvc.core; // import core api

    function Observer( notifyMethod /* Function */, notifyContext /* Object */ ) {
        this.notify = notifyMethod;
        this.context = notifyContext;
    };
    Observer.prototype.setNotifyMethod = function(notifyMethod /* Function */) {
        this.notify = notifyMethod;
    };
    Observer.prototype.setNotifyContext = function(notifyContext /* Object */) {
        this.context = notifyContext;
    };
    Observer.prototype.getNotifyMethod = function() {
        return this.notify;
    };
    Observer.prototype.getNotifyContext = function() {
        return this.context;
    };
    Observer.prototype.notifyObserver = function(notification /* Notification */) {
        this.notify.apply(this.context, [notification]);
    };
    Observer.prototype.compareNotifyContext = function(object /* Object */) {
        return object === this.context;
    };
    return Observer;
}());
// ======================== Facade
puremvc.patterns.Facade = (function(){
    // imports
    var Notification = puremvc.patterns.Notification;

    function Facade(){
        this.view = null;
        this.model = null;
        this.controller = null;
        this.initializeFacade();
    };
    Facade.prototype.initializeFacade = function() {
        this.model = new puremvc.core.Model( this );
        this.view = new puremvc.core.View( this );
        this.controller = new puremvc.core.Controller( this );
    };
    Facade.prototype.registerCommand = function(notificationName /* String */, commandClassRef /* Class */) {
        this.controller.registerCommand(notificationName, commandClassRef);
    };
    Facade.prototype.removeCommand = function(notificationName /* String */) {
        this.controller.removeCommand(notificationName);
    };
    Facade.prototype.hasCommand = function(notificationName /* String */) {
        return this.controller.hasCommand(notificationName);
    };
    Facade.prototype.registerProxy = function(proxy /* Proxy */) {
        this.model.registerProxy(proxy);
    };
    Facade.prototype.retrieveProxy = function(proxyName /* String */) {
        return this.model.retrieveProxy(proxyName);
    };
    Facade.prototype.removeProxy = function(proxyName /* String */) {
        this.model.removeProxy(proxyName);
    };
    Facade.prototype.hasProxy = function(proxyName /* String */) {
        return this.model.hasProxy(proxyName);
    };
    Facade.prototype.registerMediator = function(mediator /* Mediator */) {
        this.view.registerMediator(mediator);
    };
    Facade.prototype.retrieveMediator = function(mediatorName /* String */) {
        return this.view.retrieveMediator(mediatorName);
    };
    Facade.prototype.removeMediator = function(mediatorName /* String */) {
        return this.view.removeMediator(mediatorName);
    };
    Facade.prototype.hasMediator = function(mediatorName /* String */) {
        return this.view.hasMediator(mediatorName);
    };
    Facade.prototype.sendNotification = function(notificationName /* String */, body /* Object */, type /* String */) {
        this.notifyObservers(new Notification(notificationName, body, type));
    };
    Facade.prototype.notifyObservers = function(notification /* Notification */) {
        this.view.notifyObservers(notification);
    };
    //STATICS
    // return class
    return Facade;
}());
// ======================== MacroCommand
puremvc.patterns.MacroCommand = (function(){
    function MacroCommand( f /*Facade*/ ){
        this.subCommands = [];
        this.facade = this.facade || f;
        this.initializeMacroCommand();
    }
    MacroCommand.prototype = {
        initializeMacroCommand: function() {
        },
        addSubCommand: function(commandClassRef /* Class */) {
            this.subCommands.push(commandClassRef);
        },
        execute: function(notification /* Notification */) {
            var len = this.subCommands.length;
            for (var i = 0; i < len; i++) {
                var commandClassRef = this.subCommands[i];
                var commandInstance = new commandClassRef();
                commandInstance.execute(notification);
            }
        }
    }
    return MacroCommand;
}());
// ======================== SimpleCommand
puremvc.patterns.SimpleCommand = (function(){
    function SimpleCommand( f ){ this.facade = f; };
    SimpleCommand.prototype.execute = function(notification /* Notification */) {
    };

    return SimpleCommand;
}());
// ======================== Proxy
puremvc.patterns.Proxy = (function(){
    // imports
    function Proxy( f /*Facade*/, proxyName /* String */, data /* Object */) {
        this.proxyName = (proxyName != null) ? proxyName : Proxy.NAME;
        this.facade = this.facade || f;
        if (data != null) {
            this.data = data;
        }
    };
    Proxy.prototype.getProxyName = function() {
        return this.proxyName;
    };
    Proxy.prototype.setData = function(data /* Object */) {
        this.data = data;
    };
    Proxy.prototype.getData= function() {
        return this.data;
    };
    Proxy.prototype.onRegister = function() {
    };
    Proxy.prototype.onRemove = function() {
    };
    //STATICS
    Proxy.NAME = "Proxy";

    return Proxy;
}());

// ======================== Mediator
puremvc.patterns.Mediator = (function getClass(){
    function Mediator( f /*Facade */, mediatorName /* String */, viewComponent /* Object */) {
        this.mediatorName = (mediatorName != null) ? mediatorName : puremvc.patterns.Mediator.NAME;
        this.facade = this.facade||f;
        this.viewComponent = viewComponent;
    };
    Mediator.prototype.listNotificationInterests = function() {
        return [];
    };
    Mediator.prototype.getMediatorName = function() {
        return this.mediatorName;
    };
    Mediator.prototype.getViewComponent = function() {
        return this.viewComponent;
    };
    Mediator.prototype.setViewComponent = function(viewComponent /* Object */) {
        this.viewComponent = viewComponent;
    };
    Mediator.prototype.handleNotification = function(notification /* Notification */) {
    };
    Mediator.prototype.onRegister = function() {
    };
    Mediator.prototype.onRemove = function() {
    }
    return Mediator;
}());


//========================= CORE API =====================================
puremvc.core = (function returnCoreApi() {
    //==========================    core.Model class
    function Model( f ) {
        this._proxyMap = {};
        this.facade = f;
        this.initializeModel();
    };
    Model.prototype.registerProxy = function( /* Proxy */ proxy ) {
        this._proxyMap[proxy.getProxyName()] = proxy;
        proxy.onRegister();
    };
    Model.prototype.retrieveProxy = function( proxyName /* String */) {
        return this._proxyMap[proxyName];
    };
    Model.prototype.hasProxy = function( proxyName /* String */) {
        return this._proxyMap[proxyName] != null;
    };
    Model.prototype.removeProxy = function( proxyName /* String */ ) {
        var proxy = this._proxyMap[proxyName];
        if (proxy) {
            delete this._proxyMap[proxyName];
            proxy.onRemove();
        }
        return proxy;
    };
    Model.prototype.initializeModel = function() {

    };
    // STATICS

    //==========================    core.View class
    function View( f ){
        this.facade = f;
        this.mediatorMap = {};
        this.observerMap = {};
        this.initializeView();
    };
    View.prototype.initializeView = function(){};
    View.prototype.registerObserver = function( notificationName /* String */, observer /* Observer */) {
        var observers = this.observerMap[notificationName];
        if (observers) {
            observers.push(observer);
        }
        else {
            this.observerMap[notificationName] = [observer];
        }
    };
    View.prototype.notifyObservers = function(notification /* Notification */) {
        var name = notification.getName();
        if (this.observerMap[name] != null) {
            // Copy the array.
            var observers = this.observerMap[name].concat();
            var len = observers.length;
            for (var i = 0; i < len; i++) {
                var observer = observers[i];
                observer.notifyObserver(notification);
            }
        }
    };
    View.prototype.removeObserver = function(notificationName /* String */, notifyContext /* Object */) {
        var observers = this.observerMap[notificationName];
        var i = observers.length;
        while (i--) {
            var observer = observers[i];
            if (observer.compareNotifyContext(notifyContext)) {
                observers.splice(i, 1);
                break;
            }
        }
        // Remove empty observer lists.
        if (!observers.length) {
            delete this.observerMap[notificationName];
        }
    };
    View.prototype.registerMediator = function(mediator /* Mediator */) {
        var name = mediator.getMediatorName();
        if (!this.mediatorMap[name]) {
            this.mediatorMap[name] = mediator;
            var interests = mediator.listNotificationInterests();
            var len = interests.length;
            if (len) {
                var observer = new patterns.Observer(mediator.handleNotification, mediator);
                for (var i = 0; i < len; i++) {
                    this.registerObserver(interests[i], observer);
                }
            }
            mediator.onRegister();
        }
    };
    View.prototype.retrieveMediator = function(mediatorName /* String */) {
        return this.mediatorMap[mediatorName];
    };
    View.prototype.removeMediator = function(mediatorName /* String */) {
        var mediator = this.mediatorMap[mediatorName];
        if (mediator) {
            var interests = mediator.listNotificationInterests();
            var i = interests.length;
            while (i--) {
                this.removeObserver(interests[i], mediator);
            }

            delete this.mediatorMap[mediatorName];
            mediator.onRemove();
        }
        return mediator;
    };
    View.prototype.hasMediator = function(mediatorName /* String */) {
        return this.mediatorMap[mediatorName] != null;
    };
    // STATICS


    //==========================    core.Controller class
    // import
    var patterns = puremvc.patterns;
    function Controller( f /* Facade */ ){
        // set instance fields
        this.facade = f;
        this.commandMap = {};
        this.view = f.view;
    };
    Controller.prototype.executeCommand = function(note /* Notification */) {
        var commandClassRef = this.commandMap[note.getName()];
        if (commandClassRef) {
            var command = new commandClassRef( this.facade );
            command.execute(note);
        }
    };
    Controller.prototype.registerCommand = function(notificationName /* String */, commandClassRef /* Class */) {
        if (!this.commandMap[notificationName]) {
            this.view.registerObserver(notificationName, new patterns.Observer(this.executeCommand, this));
        }
        this.commandMap[notificationName] = commandClassRef;
    };
    Controller.prototype.hasCommand = function(notificationName /* String */) {
        return this.commandMap[notificationName] != null;
    };
    Controller.prototype.removeCommand = function(notificationName /* String */) {
        if (this.hasCommand(notificationName)) {
            this.view.removeObserver(notificationName, this);
            delete this.commandMap[notificationName];
        }
    };
    Controller.prototype.removeCommand = function(notificationName /* String */) {
        if (this.hasCommand(notificationName)) {
            this.view.removeObserver(notificationName, this);
            delete this.commandMap[notificationName];
        }
    };
    // STATICS

    // return core API
    return { Model:Model, View:View, Controller:Controller };
}());


