 /*
OOP-UTILS ( group of static oop helper functions ( from the book "JavaScript The Definitive Guide" 2011, by David Flanagan  )
 */
 var ooputils = {
     // inherit() returns a newly created object that inherits properties from the
     // prototype object p. It uses ECMASCRIPT5 function Object.create() if
     // it is defined, and otherwise falls back to an older technique.
     inherit:function (p) {
         if (p == null)throw new TypeError(); // p must be a non-null object
         if (Object.create)  // if Object.create() is defined
             return Object.create(p); // thenn use it
         var t = typeof p;             // Otherwise do some more typechecking
         if (t !== "object" && t !== "function") throw new TypeError();
         function f() {
         }

         ;         // Define a dummy constructor function
         f.prototype = p;        // Set its protoype poperty to p.
         return new f();         // Use f() to create an "heir" of p.
     },

     /*
      * Copy the enumerable properties of p to o, and return o.
      * if o and p have a property by the same name, o's property is overwritten.
      * this function does not handle getter and setters ( ECMA 5 ) or copy attributes.
      *
      * We work around an IE bug here: in many versions of IE, the for/in loop
      * won't enumerate an enumerable property of o if the prototype of o has
      * a non-enumerable property by the same name. This means that properties
      * like toString are not handled correctly unless we explicitly check for them.
      */
     extend:(function () {
         // First check for the presence of the bug before patching it
         for (var p in {toString:null}) {
             // If we get here, thenn the for/in loop works and we return
             // a simple version of the extend() function
             return function (o) {
                 for (var i = 1; i < arguments.length; i++) {
                     var source = arguments[i];
                     for (var prop in source) o[prop] = source[prop];
                 }
                 return o;
             };
             // If we get here, it means that the for/in loop did not enumerate
             // the toString property of the test object. So return a version
             // of the extend() function that explicitly tests for the nonenumerable
             // properties of Object.prototype.
             return function (o) {
                 for (var i = 1; i < arguments.length; i++) {
                     var source = arguments[i];
                     // Copy all the enumerable properties
                     for (var prop in source) o[prop] = source[prop];
                     // And now check the special-case properties defined in protoprops
                     for (var j = 0; j < protoprops.length; j++) {
                         prop = protoprops[j];
                         if (source.hasOwnProperty(prop)) o[prop] = source[prop];
                     }
                 }
             }
             var protoprops = ["toString", "valueOf", "constructor", "hasOwnPropery",
                 "isPrototypeOf", "propertyIsEnumerable", "toLocalString" ];
         }


     }()),


     /*
      Copy the enumerable props of p to o, and return o.
      if o and p have a prop by the same name, o's prop is left alone
      */
     merge:function (o, p) {
         for (prop in p) {
             if (o.hasOwnProperty[prop]) continue;
             o[prop] = p[prop];
         }
         return o;
     },
     /*
      Remove props from o if there is not a prop with the same name in p.
      */
     restrict:function (o, p) {
         for (prop in p) {
             if (!prop in p) delete o[prop];
         }
         return o;
     },
     /*
      For each prop of p, delete the prop with the same name from o.
      */
     substract:function (o, p) {
         for (prop in p) {
             delete o[prop];
         }
         return o;
     },

     /*
      Return a new object that holds the props of both o and p.
      If o and p have props of same name, values of o are used.
      */
     union:function (o, p) {
         return extend(extend({}, o), p);
     },

     /*
      Return a new object that holds only the props of o that also appear in p.
      This is something like the intersection of o and p, but the values of the props in p are discarded
      */
     intersection:function (o, p) {
         return restrict(extend({}, o), p);
     },

     /*
      Return an array that holds the names of the enumerable own props of o.
      */
     keys:function (o) {
         if (typeof o !== "object") throw new TypeError();
         var result = [];
         for (var prop in o) {
             if (o.hasOwnProperty(prop)) // if its an own prop
                 result.push(prop);
         }
         return result;                 // return the Array
     },

     classof:function (o) {
         if (o === null)return "Null";
         if (0 === undefined) return "undefined";
         return Object.prototype.toString.call(o).slice(8, -1);
     },

     // This function creates a new enumerated type/class. The argument object specifies
     // the names and values of each instance of the class. The return value
     // is a constructor function that identifes the new class. Note, however
     // that the constructor throws an exception: you can't use it to create new
     // instances of the type. The returned constructor has properties that
     // map the name of a value to the value itself, and also a values array,
     // a foreach() iterator function
     enumeration:function (namesToValues) {
         // This is the dummy constructor function that will be the return value.
         var enumeration = function () {
             throw "Can't Instantiate Enumerations";
         };

         // Enumerated values inherit from this object.
         var proto = enumeration.prototype = {
             constructor:enumeration,
             toString:function () {
                 return this.name;
             }, // Return name
             valueOf:function () {
                 return this.value;
             }, // Return value
             toJSON:function () {
                 return this.name;
             }     // For serialization
         };
         enumeration.values = [];    // An array of the enumerated value objects

         // Now create the instances of this new type.
         for (name in namesToValues) {
             var e = this.inherit(proto);       // Create an object to represent it
             e.name = name;                  // Give it a name
             e.value = namesToValues[name];  // And a value
             enumeration[name] = e;          // Make it a property of constructor
             enumeration.values.push(e);     // And store in the values array
         }
         // A class method fro iterating the instances of the class
         enumeration.foreach = function (f, c) {
             for (var i = 0; i < this.values.length; i++) f.call(c, this.values[i]);
         };
         // Return the constructor that identifies the new type
         return enumeration;
     },
     // Creates a namespace using dot seperated syntax
     // leaves excisting namespaces untouched
     namespace:function (str, context) {
         var ns = str.split(".");
         var c = context;
         for (var i = 0; i < ns.length; i++) {
             if ( c[ns[i]] === undefined) {
                 c[ns[i]] = {};
             }
             c = c[ns[i]];
         }
     }
 };