/*! promise-polyfill 2.0.1 */
!function(a){function b(a,b){return function(){a.apply(b,arguments)}}function c(a){if("object"!=typeof this)throw new TypeError("Promises must be constructed via new");if("function"!=typeof a)throw new TypeError("not a function");this._state=null,this._value=null,this._deferreds=[],i(a,b(e,this),b(f,this))}function d(a){var b=this;return null===this._state?void this._deferreds.push(a):void j(function(){var c=b._state?a.onFulfilled:a.onRejected;if(null===c)return void(b._state?a.resolve:a.reject)(b._value);var d;try{d=c(b._value)}catch(e){return void a.reject(e)}a.resolve(d)})}function e(a){try{if(a===this)throw new TypeError("A promise cannot be resolved with itself.");if(a&&("object"==typeof a||"function"==typeof a)){var c=a.then;if("function"==typeof c)return void i(b(c,a),b(e,this),b(f,this))}this._state=!0,this._value=a,g.call(this)}catch(d){f.call(this,d)}}function f(a){this._state=!1,this._value=a,g.call(this)}function g(){for(var a=0,b=this._deferreds.length;b>a;a++)d.call(this,this._deferreds[a]);this._deferreds=null}function h(a,b,c,d){this.onFulfilled="function"==typeof a?a:null,this.onRejected="function"==typeof b?b:null,this.resolve=c,this.reject=d}function i(a,b,c){var d=!1;try{a(function(a){d||(d=!0,b(a))},function(a){d||(d=!0,c(a))})}catch(e){if(d)return;d=!0,c(e)}}var j=c.immediateFn||"function"==typeof setImmediate&&setImmediate||function(a){setTimeout(a,1)},k=Array.isArray||function(a){return"[object Array]"===Object.prototype.toString.call(a)};c.prototype["catch"]=function(a){return this.then(null,a)},c.prototype.then=function(a,b){var e=this;return new c(function(c,f){d.call(e,new h(a,b,c,f))})},c.all=function(){var a=Array.prototype.slice.call(1===arguments.length&&k(arguments[0])?arguments[0]:arguments);return new c(function(b,c){function d(f,g){try{if(g&&("object"==typeof g||"function"==typeof g)){var h=g.then;if("function"==typeof h)return void h.call(g,function(a){d(f,a)},c)}a[f]=g,0===--e&&b(a)}catch(i){c(i)}}if(0===a.length)return b([]);for(var e=a.length,f=0;f<a.length;f++)d(f,a[f])})},c.resolve=function(a){return a&&"object"==typeof a&&a.constructor===c?a:new c(function(b){b(a)})},c.reject=function(a){return new c(function(b,c){c(a)})},c.race=function(a){return new c(function(b,c){for(var d=0,e=a.length;e>d;d++)a[d].then(b,c)})},"undefined"!=typeof module&&module.exports?module.exports=c:a.Promise||(a.Promise=c)}(this);
/**
 * This class represents a mongo collection and provides methods to access,
 * manipulate or insert documents.
 *
 * @author Sam Verschueren      <sam.verschueren@gmail.com>
 * @since  24 Oct. 2014
 */
var Collection = (function() {
    'use strict';

    if(typeof _ === 'undefined') {
        // First test if lodash is included in the project
        console.error('Lodash not found! Please include lodash.');
        return;
    }
    
    var noop = function() {};

    /**
     * Creates a new mongo collection
     *
     * @param String name The name of the collection.
     * @param Object data The data in the collection.
     */
    function Collection(name, data) {
        this._name = name;
        this._data = data;
    }

    /**
     * Finds all the documents in the collection that match the where
     * statement.
     *
     * @param  Object   where    The where statement object.
     * @param  Object   options  The options like to sort and all.
     * @param  Function callback The callback function that will be called with the result when the data is retrieved.
     */
    Collection.prototype.find = function(where, options, callback) {
        var self = this;
        
        return new Promise(function(resolve) {
            if(_.isFunction(where)) {
                callback = where;
                options = {};
                where = {};
            }
    
            if(_.isFunction(options)) {
                callback = options;
                options = {};
            }
            
            callback = callback || noop;
    
            var filtered = _.filter(_.values(self._data), compileDocumentSelector(where));
    
            if(options && options.sort) {
                filtered = filtered.sort(Collection._compileSort(options.sort));
            }
    
            var start = options.skip || 0,
                end = options.limit ? (options.limit + start) : filtered.length;
    
            var result = filtered.slice(start, end);

            callback(result);
            resolve(result);
        });
    };

    /**
     * Finds the first documet that matches the where clause.
     *
     * @param  Object   where    The where statement object.
     * @param  Object   options  The options like to sort and all.
     * @param  Function callback The callback function that will be called with the result when the data is retrieved.
     */
    Collection.prototype.findOne = function(where, options, callback) {
        var self = this;
        
        return new Promise(function(resolve) {
            if(_.isFunction(where)) {
                callback = where;
                options = undefined;
                where = {};
            }
    
            if(_.isFunction(options)) {
                callback = options;
                options = undefined;
            }
            
            callback = callback || noop;
    
            var filtered = _.filter(_.values(self._data), compileDocumentSelector(where));
    
            if(options && options.sort) {
                filtered = filtered.sort(Collection._compileSort(options.sort));
            }
    
            var result = filtered[0];
            
            callback(result);
            resolve(result);
        });
    };

    /**
     * Modifies an existing document or documents in a collection. The method can modify specific fields
     * of an existing document or documents or replace an existing document entirely, depending on the
     * update parameter.
     *
     * By default, the update() method updates a single document. Set the Multi Parameter to update all
     * documents that match the query criteria.
     *
     * @param  Object   query    The selection criteria for the update. Use the same query selectors as used in the find() method.
     * @param  Object   update   The modifications to apply.
     * @param  Object   options  Extra options like upsert or multi.
     * @param  Function callback The function that is called when the update was completed with the number of updated documents.
     */
    Collection.prototype.update = function(query, update, options, callback) {
        var self = this;
        
        return new Promise(function(resolve) {
            if(_.isFunction(options)) {
                callback = options;
                options = {};
            }
            
            callback = callback || noop;
    
            var updatedDocuments = 0;
    
            self.find(query, function(documents) {
                if(!options || !options.multi) {
                    // If multi is not set to true, only update the first record
                    documents = documents.length === 0 ? [] : [documents[0]];
                }
    
                _.forEach(documents, function(doc) {
                    Collection._modify(doc, update, options);
    
                    var index = _.findIndex(self._data, {_id: doc._id});
    
                    self._data[index] = doc;
    
                    window.localStorage.setObject(self._name, self._data);
    
                    ++updatedDocuments;
                });
            });
    
            // If we are here, we did not update any documents yet, we should check for an upsert
            if(updatedDocuments === 0 && options.upsert) {
                // TODO remove dollar operators
                var newDoc = query;
                Collection._modify(newDoc, update, {isInsert: true});
    
                // Create an id
                try {
                    newDoc._id = new ObjectId(newDoc._id).toJSONValue();
                }
                catch(e) {
                    newDoc._id = new ObjectId().toJSONValue();
                }
    
                self._data.push(newDoc);
    
                window.localStorage.setObject(self._name, self._data);
    
                updatedDocuments = 1;
            }
    
            callback(updatedDocuments);
            resolve(updatedDocuments);
        });
    };

    /**
     * Insert a document or multiple documents to the collection.
     *
     * @param  Mixed    data     Document or array of documents that should be inserted.
     * @param  Function callback An optional callback if the data is inserted.
     */
    Collection.prototype.insert = function(data, callback) {
        var self = this;
        
        return new Promise(function(resolve) {
            var dataArray = _.cloneDeep(data);
            
            callback = callback || noop;
    
            if(!_.isArray(data)) {
                dataArray = [data];
            }
    
            // Iterate over the array
            _.forEach(dataArray, function(item) {
                // Create an id
                item._id = new ObjectId().toJSONValue();
    
                // Push the item to the data stack
                self._data.push(item);
            });
    
            // Update the localStorage object
            window.localStorage.setObject(self._name, self._data);
    
            // If we have a callback, call it
            callback();
            resolve();
        });
    };

    /**
     * Clear the data out of the table.
     *
     * @param  Object   query     Specifies deletion criteria using query operators
     * @param  Function callback  The callback that will be called with the number of removed rows.
     */
    Collection.prototype.remove = function(query, callback) {
        var self = this;
        
        return new Promise(function(resolve) {
            if(_.isFunction(query)) {
                callback = query;
                query = undefined;
            }
            
            callback = callback || noop;
    
            var result = self._data.length;
    
            if(!query) {
                self._data = [];
            }
            else {    
                self.find(query, function(documents) {
                    result = documents.length;
    
                    _.each(documents, function(doc) {
                        var index = _.findIndex(self._data, {_id: doc._id});
    
                        self._data.splice(index, 1);
                    });
                });
            }
    
            window.localStorage.setObject(self._name, self._data);
    
            callback(result);
            resolve(result);
        });
    };

    /**
     * Returns the count of documents that would match a find() query.
     *
     * @param  Object   query    The query selection criteria.
     * @param  Function callback Called when the number of documents are found with the count as parameter.
     */
    Collection.prototype.count = function(query, callback) {
        var self = this;
        
        return new Promise(function(resolve) {
            if(_.isFunction(query)) {
                callback = query;
                query = {};
            }
    
            self.find(query, function(result) {
                callback(result.length);
                resolve(result.length);
            });
        });
    };

    /**
     * Removes a collection from the database.
     *
     * @param  Function callback Optional callback that will be called after the collection has been dropped.
     */
    Collection.prototype.drop = function(callback) {
        var self = this;
        
        return new Promise(function(resolve) {
            callback = callback || noop;
        
            window.localStorage.removeItem(self._name);

            callback();
            resolve();
        });
    };

    return Collection;
})();

if(typeof module !== 'undefined')
    module.exports = Collection;

// XXX need a strategy for passing the binding of $ into this
// function, from the compiled selector
//
// maybe just {key.up.to.just.before.dollarsign: array_index}
//
// XXX atomicity: if one modification fails, do we roll back the whole
// change?
//
// options:
//     - isInsert is set when _modify is being called to compute the document to
//         insert as part of an upsert operation. We use this primarily to figure
//         out when to set the fields in $setOnInsert, if present.
Collection._modify = function (doc, mod, options) {
    options = options || {};
    if (!_.isObject(mod))
        throw Error("Modifier must be an object");
    var isModifier = isOperatorObject(mod);

    var newDoc;

    if (!isModifier) {
        if (mod._id && !EJSON.equals(doc._id, mod._id))
            throw Error("Cannot change the _id of a document");

        // replace the whole document
        for (var k in mod) {
            if (/\./.test(k))
                throw Error(
                    "When replacing document, field name may not contain '.'");
        }
        newDoc = mod;
    } else {
        // apply modifiers to the doc.
        newDoc = EJSON.clone(doc);

        _.each(mod, function (operand, op) {
            var modFunc = MODIFIERS[op];
            // Treat $setOnInsert as $set if this is an insert.
            if (options.isInsert && op === '$setOnInsert')
                modFunc = MODIFIERS['$set'];
            if (!modFunc)
                throw Error("Invalid modifier specified " + op);
            _.each(operand, function (arg, keypath) {
                // XXX mongo doesn't allow mod field names to end in a period,
                // but I don't see why.. it allows '' as a key, as does JS
                if (keypath.length && keypath[keypath.length-1] === '.')
                    throw Error(
                        "Invalid mod field name, may not end in a period");

                if (keypath === '_id')
                    throw Error("Mod on _id not allowed");

                var keyparts = keypath.split('.');
                var noCreate = _.has(NO_CREATE_MODIFIERS, op);
                var forbidArray = (op === "$rename");
                var target = findModTarget(newDoc, keyparts, {
                    noCreate: NO_CREATE_MODIFIERS[op],
                    forbidArray: (op === "$rename"),
                    arrayIndices: options.arrayIndices
                });
                var field = keyparts.pop();
                modFunc(target, field, arg, keypath, newDoc);
            });
        });
    }

    // move new document into place.
    _.each(_.keys(doc), function (k) {
        // Note: this used to be for (var k in doc) however, this does not
        // work right in Opera. Deleting from a doc while iterating over it
        // would sometimes cause opera to skip some keys.

        // isInsert: if we're constructing a document to insert (via upsert)
        // and we're in replacement mode, not modify mode, DON'T take the
        // _id from the query.    This matches mongo's behavior.
        if (k !== '_id' || options.isInsert)
            delete doc[k];
    });
    _.each(newDoc, function (v, k) {
        doc[k] = v;
    });
};

// for a.b.c.2.d.e, keyparts should be ['a', 'b', 'c', '2', 'd', 'e'],
// and then you would operate on the 'e' property of the returned
// object.
//
// if options.noCreate is falsey, creates intermediate levels of
// structure as necessary, like mkdir -p (and raises an exception if
// that would mean giving a non-numeric property to an array.) if
// options.noCreate is true, return undefined instead.
//
// may modify the last element of keyparts to signal to the caller that it needs
// to use a different value to index into the returned object (for example,
// ['a', '01'] -> ['a', 1]).
//
// if forbidArray is true, return null if the keypath goes through an array.
//
// if options.arrayIndices is set, use its first element for the (first) '$' in
// the path.
var findModTarget = function (doc, keyparts, options) {
    options = options || {};
    var usedArrayIndex = false;
    for (var i = 0; i < keyparts.length; i++) {
        var last = (i === keyparts.length - 1);
        var keypart = keyparts[i];
        var indexable = isIndexable(doc);
        if (!indexable) {
            if (options.noCreate)
                return undefined;
            var e = Error(
                "cannot use the part '" + keypart + "' to traverse " + doc);
            e.setPropertyError = true;
            throw e;
        }
        if (doc instanceof Array) {
            if (options.forbidArray)
                return null;
            if (keypart === '$') {
                if (usedArrayIndex)
                    throw Error("Too many positional (i.e. '$') elements");
                if (!options.arrayIndices || !options.arrayIndices.length) {
                    throw Error("The positional operator did not find the " +
                                                             "match needed from the query");
                }
                keypart = options.arrayIndices[0];
                usedArrayIndex = true;
            } else if (isNumericKey(keypart)) {
                keypart = parseInt(keypart);
            } else {
                if (options.noCreate)
                    return undefined;
                throw Error(
                    "can't append to array using string field name ["
                                        + keypart + "]");
            }
            if (last)
                // handle 'a.01'
                keyparts[i] = keypart;
            if (options.noCreate && keypart >= doc.length)
                return undefined;
            while (doc.length < keypart)
                doc.push(null);
            if (!last) {
                if (doc.length === keypart)
                    doc.push({});
                else if (typeof doc[keypart] !== "object")
                    throw Error("can't modify field '" + keyparts[i + 1] +
                                            "' of list value " + JSON.stringify(doc[keypart]));
            }
        } else {
            if (keypart.length && keypart.substr(0, 1) === '$')
                throw Error("can't set field named " + keypart);
            if (!(keypart in doc)) {
                if (options.noCreate)
                    return undefined;
                if (!last)
                    doc[keypart] = {};
            }
        }

        if (last)
            return doc;
        doc = doc[keypart];
    }

    // notreached
};

var NO_CREATE_MODIFIERS = {
    $unset: true,
    $pop: true,
    $rename: true,
    $pull: true,
    $pullAll: true
};

var MODIFIERS = {
    $inc: function (target, field, arg) {
        if (typeof arg !== "number")
            throw Error("Modifier $inc allowed for numbers only");
        if (field in target) {
            if (typeof target[field] !== "number")
                throw Error("Cannot apply $inc modifier to non-number");
            target[field] += arg;
        } else {
            target[field] = arg;
        }
    },
    $set: function (target, field, arg) {
        if (!_.isObject(target)) { // not an array or an object
            var e = Error("Cannot set property on non-object field");
            e.setPropertyError = true;
            throw e;
        }
        if (target === null) {
            var e = Error("Cannot set property on null");
            e.setPropertyError = true;
            throw e;
        }
        target[field] = EJSON.clone(arg);
    },
    $setOnInsert: function (target, field, arg) {
        // converted to `$set` in `_modify`
    },
    $unset: function (target, field, arg) {
            console.log('unset');
        if (target !== undefined) {
            if (target instanceof Array) {
                if (field in target)
                    target[field] = null;
            } else
                delete target[field];
        }
    },
    $push: function (target, field, arg) {
        if (target[field] === undefined)
            target[field] = [];
        if (!(target[field] instanceof Array))
            throw Error("Cannot apply $push modifier to non-array");

        if (!(arg && arg.$each)) {
            // Simple mode: not $each
            target[field].push(EJSON.clone(arg));
            return;
        }

        // Fancy mode: $each (and maybe $slice and $sort)
        var toPush = arg.$each;
        if (!(toPush instanceof Array))
            throw Error("$each must be an array");

        // Parse $slice.
        var slice = undefined;
        if ('$slice' in arg) {
            if (typeof arg.$slice !== "number")
                throw Error("$slice must be a numeric value");
            // XXX should check to make sure integer
            if (arg.$slice > 0)
                throw Error("$slice in $push must be zero or negative");
            slice = arg.$slice;
        }

        // Parse $sort.
        var sortFunction = undefined;
        if (arg.$sort) {
            if (slice === undefined)
                throw Error("$sort requires $slice to be present");
            // XXX this allows us to use a $sort whose value is an array, but that's
            // actually an extension of the Node driver, so it won't work
            // server-side. Could be confusing!
            // XXX is it correct that we don't do geo-stuff here?
            sortFunction = new Minimongo.Sorter(arg.$sort).getComparator();
            for (var i = 0; i < toPush.length; i++) {
                if (Collection._f._type(toPush[i]) !== 3) {
                    throw Error("$push like modifiers using $sort " +
                                            "require all elements to be objects");
                }
            }
        }

        // Actually push.
        for (var j = 0; j < toPush.length; j++)
            target[field].push(EJSON.clone(toPush[j]));

        // Actually sort.
        if (sortFunction)
            target[field].sort(sortFunction);

        // Actually slice.
        if (slice !== undefined) {
            if (slice === 0)
                target[field] = [];    // differs from Array.slice!
            else
                target[field] = target[field].slice(slice);
        }
    },
    $pushAll: function (target, field, arg) {
        if (!(typeof arg === "object" && arg instanceof Array))
            throw Error("Modifier $pushAll/pullAll allowed for arrays only");
        var x = target[field];
        if (x === undefined)
            target[field] = arg;
        else if (!(x instanceof Array))
            throw Error("Cannot apply $pushAll modifier to non-array");
        else {
            for (var i = 0; i < arg.length; i++)
                x.push(arg[i]);
        }
    },
    $addToSet: function (target, field, arg) {
        var isEach = false;
        if (typeof arg === "object") {
            //check if first key is '$each'
            for (var k in arg) {
                if (k === "$each")
                    isEach = true;
                break;
            }
        }
        var values = isEach ? arg["$each"] : [arg];
        var x = target[field];
        if (x === undefined)
            target[field] = values;
        else if (!(x instanceof Array))
            throw Error("Cannot apply $addToSet modifier to non-array");
        else {
            _.each(values, function (value) {
                for (var i = 0; i < x.length; i++)
                    if (Collection._f._equal(value, x[i]))
                        return;
                x.push(EJSON.clone(value));
            });
        }
    },
    $pop: function (target, field, arg) {
        if (target === undefined)
            return;
        var x = target[field];
        if (x === undefined)
            return;
        else if (!(x instanceof Array))
            throw Error("Cannot apply $pop modifier to non-array");
        else {
            if (typeof arg === 'number' && arg < 0)
                x.splice(0, 1);
            else
                x.pop();
        }
    },
    $pull: function (target, field, arg) {
        if (target === undefined)
            return;
        var x = target[field];
        if (x === undefined)
            return;
        else if (!(x instanceof Array))
            throw Error("Cannot apply $pull/pullAll modifier to non-array");
        else {
            var out = [];
            if (typeof arg === "object" && !(arg instanceof Array)) {
                // XXX would be much nicer to compile this once, rather than
                // for each document we modify.. but usually we're not
                // modifying that many documents, so we'll let it slide for
                // now

                // XXX Minimongo.Matcher isn't up for the job, because we need
                // to permit stuff like {$pull: {a: {$gt: 4}}}.. something
                // like {$gt: 4} is not normally a complete selector.
                // same issue as $elemMatch possibly?
                var matcher = new Minimongo.Matcher(arg);
                for (var i = 0; i < x.length; i++)
                    if (!matcher.documentMatches(x[i]).result)
                        out.push(x[i]);
            } else {
                for (var i = 0; i < x.length; i++)
                    if (!Collection._f._equal(x[i], arg))
                        out.push(x[i]);
            }
            target[field] = out;
        }
    },
    $pullAll: function (target, field, arg) {
        if (!(typeof arg === "object" && arg instanceof Array))
            throw Error("Modifier $pushAll/pullAll allowed for arrays only");
        if (target === undefined)
            return;
        var x = target[field];
        if (x === undefined)
            return;
        else if (!(x instanceof Array))
            throw Error("Cannot apply $pull/pullAll modifier to non-array");
        else {
            var out = [];
            for (var i = 0; i < x.length; i++) {
                var exclude = false;
                for (var j = 0; j < arg.length; j++) {
                    if (Collection._f._equal(x[i], arg[j])) {
                        exclude = true;
                        break;
                    }
                }
                if (!exclude)
                    out.push(x[i]);
            }
            target[field] = out;
        }
    },
    $rename: function (target, field, arg, keypath, doc) {
        if (keypath === arg)
            // no idea why mongo has this restriction..
            throw Error("$rename source must differ from target");
        if (target === null)
            throw Error("$rename source field invalid");
        if (typeof arg !== "string")
            throw Error("$rename target must be a string");
        if (target === undefined)
            return;
        var v = target[field];
        delete target[field];

        var keyparts = arg.split('.');
        var target2 = findModTarget(doc, keyparts, {forbidArray: true});
        if (target2 === null)
            throw Error("$rename target field invalid");
        var field2 = keyparts.pop();
        target2[field2] = v;
    },
    $bit: function (target, field, arg) {
        // XXX mongo only supports $bit on integers, and we only support
        // native javascript numbers (doubles) so far, so we can't support $bit
        throw Error("$bit is not supported");
    }
};

// Like _.isArray, but doesn't regard polyfilled Uint8Arrays on old browsers as
// arrays.
// XXX maybe this should be EJSON.isArray
isArray = function (x) {
    return _.isArray(x) && !EJSON.isBinary(x);
};

// XXX maybe this should be EJSON.isObject, though EJSON doesn't know about
// RegExp
// XXX note that _type(undefined) === 3!!!!
isPlainObject = Collection._isPlainObject = function (x) {
    return x && _.isObject(x);
};

isIndexable = function (x) {
    return isArray(x) || isPlainObject(x);
};

// Returns true if this is an object with at least one key and all keys begin
// with $.    Unless inconsistentOK is set, throws if some keys begin with $ and
// others don't.
isOperatorObject = function (valueSelector, inconsistentOK) {
    if (!isPlainObject(valueSelector))
        return false;

    var theseAreOperators = undefined;
    _.each(valueSelector, function (value, selKey) {
        var thisIsOperator = selKey.substr(0, 1) === '$';
        if (theseAreOperators === undefined) {
            theseAreOperators = thisIsOperator;
        } else if (theseAreOperators !== thisIsOperator) {
            if (!inconsistentOK)
                throw new Error("Inconsistent operator: " +
                                                JSON.stringify(valueSelector));
            theseAreOperators = false;
        }
    });
    return !!theseAreOperators;    // {} has no operators
};


// string can be converted to integer
isNumericKey = function (s) {
    return /^[0-9]+$/.test(s);
};
/*
========================================
Meteor is licensed under the MIT License
========================================

Copyright (C) 2011--2012 Meteor Development Group

Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the "Software"), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.


====================================================================
This license applies to all code in Meteor that is not an externally
maintained library. Externally maintained libraries have their own
licenses, included below:
====================================================================

*/

// Like _.isArray, but doesn't regard polyfilled Uint8Arrays on old browsers as
// arrays.
var isArray = function (x) {
  return _.isArray(x) && !EJSON.isBinary(x);
};

var _anyIfArray = function (x, f) {
  if (isArray(x))
    return _.any(x, f);
  return f(x);
};

var _anyIfArrayPlus = function (x, f) {
  if (f(x))
    return true;
  return isArray(x) && _.any(x, f);
};

var hasOperators = function(valueSelector) {
  var theseAreOperators = undefined;
  for (var selKey in valueSelector) {
    var thisIsOperator = selKey.substr(0, 1) === '$';
    if (theseAreOperators === undefined) {
      theseAreOperators = thisIsOperator;
    } else if (theseAreOperators !== thisIsOperator) {
      throw new Error("Inconsistent selector: " + valueSelector);
    }
  }
  return !!theseAreOperators;  // {} has no operators
};

var compileValueSelector = function (valueSelector) {
  if (valueSelector == null) {  // undefined or null
    return function (value) {
      return _anyIfArray(value, function (x) {
        return x == null;  // undefined or null
      });
    };
  }

  // Selector is a non-null primitive (and not an array or RegExp either).
  if (!_.isObject(valueSelector)) {
    return function (value) {
      return _anyIfArray(value, function (x) {
        return x === valueSelector;
      });
    };
  }

  if (valueSelector instanceof RegExp) {
    return function (value) {
      if (value === undefined)
        return false;
      return _anyIfArray(value, function (x) {
        return valueSelector.test(x);
      });
    };
  }

  // Arrays match either identical arrays or arrays that contain it as a value.
  if (isArray(valueSelector)) {
    return function (value) {
      if (!isArray(value))
        return false;
      return _anyIfArrayPlus(value, function (x) {
        return Collection._f._equal(valueSelector, x);
      });
    };
  }

  // It's an object, but not an array or regexp.
  if (hasOperators(valueSelector)) {
    var operatorFunctions = [];
    _.each(valueSelector, function (operand, operator) {
      if (!_.has(VALUE_OPERATORS, operator))
        throw new Error("Unrecognized operator: " + operator);
      operatorFunctions.push(VALUE_OPERATORS[operator](
        operand, valueSelector.$options));
    });
    return function (value) {
      return _.all(operatorFunctions, function (f) {
        return f(value);
      });
    };
  }

  // It's a literal; compare value (or element of value array) directly to the
  // selector.
  return function (value) {
    return _anyIfArray(value, function (x) {
      return Collection._f._equal(valueSelector, x);
    });
  };
};

// XXX can factor out common logic below
var LOGICAL_OPERATORS = {
  "$and": function(subSelector) {
    if (!isArray(subSelector) || _.isEmpty(subSelector))
      throw Error("$and/$or/$nor must be nonempty array");
    var subSelectorFunctions = _.map(
      subSelector, compileDocumentSelector);
    return function (doc) {
      return _.all(subSelectorFunctions, function (f) {
        return f(doc);
      });
    };
  },

  "$or": function(subSelector) {
    if (!isArray(subSelector) || _.isEmpty(subSelector))
      throw Error("$and/$or/$nor must be nonempty array");
    var subSelectorFunctions = _.map(
      subSelector, compileDocumentSelector);
    return function (doc) {
      return _.any(subSelectorFunctions, function (f) {
        return f(doc);
      });
    };
  },

  "$nor": function(subSelector) {
    if (!isArray(subSelector) || _.isEmpty(subSelector))
      throw Error("$and/$or/$nor must be nonempty array");
    var subSelectorFunctions = _.map(
      subSelector, compileDocumentSelector);
    return function (doc) {
      return _.all(subSelectorFunctions, function (f) {
        return !f(doc);
      });
    };
  },

  "$where": function(selectorValue) {
    if (!(selectorValue instanceof Function)) {
      selectorValue = Function("return " + selectorValue);
    }
    return function (doc) {
      return selectorValue.call(doc);
    };
  }
};

var VALUE_OPERATORS = {
  "$in": function (operand) {
    if (!isArray(operand))
      throw new Error("Argument to $in must be array");
    return function (value) {
      return _anyIfArrayPlus(value, function (x) {
        return _.any(operand, function (operandElt) {
          return Collection._f._equal(operandElt, x);
        });
      });
    };
  },

  "$all": function (operand) {
    if (!isArray(operand))
      throw new Error("Argument to $all must be array");
    return function (value) {
      if (!isArray(value))
        return false;
      return _.all(operand, function (operandElt) {
        return _.any(value, function (valueElt) {
          return Collection._f._equal(operandElt, valueElt);
        });
      });
    };
  },

  "$lt": function (operand) {
    return function (value) {
      return _anyIfArray(value, function (x) {
        return Collection._f._cmp(x, operand) < 0;
      });
    };
  },

  "$lte": function (operand) {
    return function (value) {
      return _anyIfArray(value, function (x) {
        return Collection._f._cmp(x, operand) <= 0;
      });
    };
  },

  "$gt": function (operand) {
    return function (value) {
      return _anyIfArray(value, function (x) {
        return Collection._f._cmp(x, operand) > 0;
      });
    };
  },

  "$gte": function (operand) {
    return function (value) {
      return _anyIfArray(value, function (x) {
        return Collection._f._cmp(x, operand) >= 0;
      });
    };
  },

  "$ne": function (operand) {
    return function (value) {
      return ! _anyIfArrayPlus(value, function (x) {
        return Collection._f._equal(x, operand);
      });
    };
  },

  "$nin": function (operand) {
    if (!isArray(operand))
      throw new Error("Argument to $nin must be array");
    var inFunction = VALUE_OPERATORS.$in(operand);
    return function (value) {
      // Field doesn't exist, so it's not-in operand
      if (value === undefined)
        return true;
      return !inFunction(value);
    };
  },

  "$exists": function (operand) {
    return function (value) {
      return operand === (value !== undefined);
    };
  },

  "$mod": function (operand) {
    var divisor = operand[0],
        remainder = operand[1];
    return function (value) {
      return _anyIfArray(value, function (x) {
        return x % divisor === remainder;
      });
    };
  },

  "$size": function (operand) {
    return function (value) {
      return isArray(value) && operand === value.length;
    };
  },

  "$type": function (operand) {
    return function (value) {
      // A nonexistent field is of no type.
      if (value === undefined)
        return false;
      // Definitely not _anyIfArrayPlus: $type: 4 only matches arrays that have
      // arrays as elements according to the Mongo docs.
      return _anyIfArray(value, function (x) {
        return Collection._f._type(x) === operand;
      });
    };
  },

  "$regex": function (operand, options) {
    if (options !== undefined) {
      // Options passed in $options (even the empty string) always overrides
      // options in the RegExp object itself.

      // Be clear that we only support the JS-supported options, not extended
      // ones (eg, Mongo supports x and s). Ideally we would implement x and s
      // by transforming the regexp, but not today...
      if (/[^gim]/.test(options))
        throw new Error("Only the i, m, and g regexp options are supported");

      var regexSource = operand instanceof RegExp ? operand.source : operand;
      operand = new RegExp(regexSource, options);
    } else if (!(operand instanceof RegExp)) {
      operand = new RegExp(operand);
    }

    return function (value) {
      if (value === undefined)
        return false;
      return _anyIfArray(value, function (x) {
        return operand.test(x);
      });
    };
  },

  "$options": function (operand) {
    // evaluation happens at the $regex function above
    return function (value) { return true; };
  },

  "$elemMatch": function (operand) {
    var matcher = compileDocumentSelector(operand);
    return function (value) {
      if (!isArray(value))
        return false;
      return _.any(value, function (x) {
        return matcher(x);
      });
    };
  },

  "$not": function (operand) {
    var matcher = compileValueSelector(operand);
    return function (value) {
      return !matcher(value);
    };
  },

  "$near": function (operand) {
    // Always returns true. Must be handled in post-filter/sort/limit
    return function (value) {
      return true;
    }
  },

  "$geoIntersects": function (operand) {
    // Always returns true. Must be handled in post-filter/sort/limit
    return function (value) {
      return true;
    }
  }

};

// helpers used by compiled selector code
Collection._f = {
  // XXX for _all and _in, consider building 'inquery' at compile time..

  _type: function (v) {
    if (typeof v === "number")
      return 1;
    if (typeof v === "string")
      return 2;
    if (typeof v === "boolean")
      return 8;
    if (isArray(v))
      return 4;
    if (v === null)
      return 10;
    if (v instanceof RegExp)
      return 11;
    if (typeof v === "function")
      // note that typeof(/x/) === "function"
      return 13;
    if (v instanceof Date)
      return 9;
    if (EJSON.isBinary(v))
      return 5;
    if (v instanceof Meteor.Collection.ObjectID)
      return 7;
    return 3; // object

    // XXX support some/all of these:
    // 14, symbol
    // 15, javascript code with scope
    // 16, 18: 32-bit/64-bit integer
    // 17, timestamp
    // 255, minkey
    // 127, maxkey
  },

  // deep equality test: use for literal document and array matches
  _equal: function (a, b) {
    return EJSON.equals(a, b, {keyOrderSensitive: true});
  },

  // maps a type code to a value that can be used to sort values of
  // different types
  _typeorder: function (t) {
    // http://www.mongodb.org/display/DOCS/What+is+the+Compare+Order+for+BSON+Types
    // XXX what is the correct sort position for Javascript code?
    // ('100' in the matrix below)
    // XXX minkey/maxkey
    return [-1,  // (not a type)
            1,   // number
            2,   // string
            3,   // object
            4,   // array
            5,   // binary
            -1,  // deprecated
            6,   // ObjectID
            7,   // bool
            8,   // Date
            0,   // null
            9,   // RegExp
            -1,  // deprecated
            100, // JS code
            2,   // deprecated (symbol)
            100, // JS code
            1,   // 32-bit int
            8,   // Mongo timestamp
            1    // 64-bit int
           ][t];
  },

  // compare two values of unknown type according to BSON ordering
  // semantics. (as an extension, consider 'undefined' to be less than
  // any other value.) return negative if a is less, positive if b is
  // less, or 0 if equal
  _cmp: function (a, b) {
    if (a === undefined)
      return b === undefined ? 0 : -1;
    if (b === undefined)
      return 1;
    var ta = Collection._f._type(a);
    var tb = Collection._f._type(b);
    var oa = Collection._f._typeorder(ta);
    var ob = Collection._f._typeorder(tb);
    if (oa !== ob)
      return oa < ob ? -1 : 1;
    if (ta !== tb)
      // XXX need to implement this if we implement Symbol or integers, or
      // Timestamp
      throw Error("Missing type coercion logic in _cmp");
    if (ta === 7) { // ObjectID
      // Convert to string.
      ta = tb = 2;
      a = a.toHexString();
      b = b.toHexString();
    }
    if (ta === 9) { // Date
      // Convert to millis.
      ta = tb = 1;
      a = a.getTime();
      b = b.getTime();
    }

    if (ta === 1) // double
      return a - b;
    if (tb === 2) // string
      return a < b ? -1 : (a === b ? 0 : 1);
    if (ta === 3) { // Object
      // this could be much more efficient in the expected case ...
      var to_array = function (obj) {
        var ret = [];
        for (var key in obj) {
          ret.push(key);
          ret.push(obj[key]);
        }
        return ret;
      };
      return Collection._f._cmp(to_array(a), to_array(b));
    }
    if (ta === 4) { // Array
      for (var i = 0; ; i++) {
        if (i === a.length)
          return (i === b.length) ? 0 : -1;
        if (i === b.length)
          return 1;
        var s = Collection._f._cmp(a[i], b[i]);
        if (s !== 0)
          return s;
      }
    }
    if (ta === 5) { // binary
      // Surprisingly, a small binary blob is always less than a large one in
      // Mongo.
      if (a.length !== b.length)
        return a.length - b.length;
      for (i = 0; i < a.length; i++) {
        if (a[i] < b[i])
          return -1;
        if (a[i] > b[i])
          return 1;
      }
      return 0;
    }
    if (ta === 8) { // boolean
      if (a) return b ? 0 : 1;
      return b ? -1 : 0;
    }
    if (ta === 10) // null
      return 0;
    if (ta === 11) // regexp
      throw Error("Sorting not supported on regular expression"); // XXX
    // 13: javascript code
    // 14: symbol
    // 15: javascript code with scope
    // 16: 32-bit integer
    // 17: timestamp
    // 18: 64-bit integer
    // 255: minkey
    // 127: maxkey
    if (ta === 13) // javascript code
      throw Error("Sorting not supported on Javascript code"); // XXX
    throw Error("Unknown type to sort");
  }
};

// For unit tests. True if the given document matches the given
// selector.
Collection._matches = function (selector, doc) {
  return (Collection._compileSelector(selector))(doc);
};

// _makeLookupFunction(key) returns a lookup function.
//
// A lookup function takes in a document and returns an array of matching
// values.  This array has more than one element if any segment of the key other
// than the last one is an array.  ie, any arrays found when doing non-final
// lookups result in this function "branching"; each element in the returned
// array represents the value found at this branch. If any branch doesn't have a
// final value for the full key, its element in the returned list will be
// undefined. It always returns a non-empty array.
//
// _makeLookupFunction('a.x')({a: {x: 1}}) returns [1]
// _makeLookupFunction('a.x')({a: {x: [1]}}) returns [[1]]
// _makeLookupFunction('a.x')({a: 5})  returns [undefined]
// _makeLookupFunction('a.x')({a: [{x: 1},
//                                 {x: [2]},
//                                 {y: 3}]})
//   returns [1, [2], undefined]
Collection._makeLookupFunction = function (key) {
  var dotLocation = key.indexOf('.');
  var first, lookupRest, nextIsNumeric;
  if (dotLocation === -1) {
    first = key;
  } else {
    first = key.substr(0, dotLocation);
    var rest = key.substr(dotLocation + 1);
    lookupRest = Collection._makeLookupFunction(rest);
    // Is the next (perhaps final) piece numeric (ie, an array lookup?)
    nextIsNumeric = /^\d+(\.|$)/.test(rest);
  }

  return function (doc) {
    if (doc == null)  // null or undefined
      return [undefined];
    var firstLevel = doc[first];

    // We don't "branch" at the final level.
    if (!lookupRest)
      return [firstLevel];

    // It's an empty array, and we're not done: we won't find anything.
    if (isArray(firstLevel) && firstLevel.length === 0)
      return [undefined];

    // For each result at this level, finish the lookup on the rest of the key,
    // and return everything we find. Also, if the next result is a number,
    // don't branch here.
    //
    // Technically, in MongoDB, we should be able to handle the case where
    // objects have numeric keys, but Mongo doesn't actually handle this
    // consistently yet itself, see eg
    // https://jira.mongodb.org/browse/SERVER-2898
    // https://github.com/mongodb/mongo/blob/master/jstests/array_match2.js
    if (!isArray(firstLevel) || nextIsNumeric)
      firstLevel = [firstLevel];
    return Array.prototype.concat.apply([], _.map(firstLevel, lookupRest));
  };
};

// The main compilation function for a given selector.
var compileDocumentSelector = function (docSelector) {
  var perKeySelectors = [];
  _.each(docSelector, function (subSelector, key) {
    if (key.substr(0, 1) === '$') {
      // Outer operators are either logical operators (they recurse back into
      // this function), or $where.
      if (!_.has(LOGICAL_OPERATORS, key))
        throw new Error("Unrecognized logical operator: " + key);
      perKeySelectors.push(LOGICAL_OPERATORS[key](subSelector));
    } else {
      var lookUpByIndex = Collection._makeLookupFunction(key);
      var valueSelectorFunc = compileValueSelector(subSelector);
      perKeySelectors.push(function (doc) {
        var branchValues = lookUpByIndex(doc);
        // We apply the selector to each "branched" value and return true if any
        // match. This isn't 100% consistent with MongoDB; eg, see:
        // https://jira.mongodb.org/browse/SERVER-8585
        return _.any(branchValues, valueSelectorFunc);
      });
    }
  });


  return function (doc) {
    return _.all(perKeySelectors, function (f) {
      return f(doc);
    });
  };
};

// Given a selector, return a function that takes one argument, a
// document, and returns true if the document matches the selector,
// else false.
Collection._compileSelector = function (selector) {
  // you can pass a literal function instead of a selector
  if (selector instanceof Function)
    return function (doc) {return selector.call(doc);};

  // shorthand -- scalars match _id
  if (Collection._selectorIsId(selector)) {
    return function (doc) {
      return EJSON.equals(doc._id, selector);
    };
  }

  // protect against dangerous selectors.  falsey and {_id: falsey} are both
  // likely programmer error, and not what you want, particularly for
  // destructive operations.
  if (!selector || (('_id' in selector) && !selector._id))
    return function (doc) {return false;};

  // Top level can't be an array or true or binary.
  if (typeof(selector) === 'boolean' || isArray(selector) ||
      EJSON.isBinary(selector))
    throw new Error("Invalid selector: " + selector);

  return compileDocumentSelector(selector);
};

// Give a sort spec, which can be in any of these forms:
//   {"key1": 1, "key2": -1}
//   [["key1", "asc"], ["key2", "desc"]]
//   ["key1", ["key2", "desc"]]
//
// (.. with the first form being dependent on the key enumeration
// behavior of your javascript VM, which usually does what you mean in
// this case if the key names don't look like integers ..)
//
// return a function that takes two objects, and returns -1 if the
// first object comes first in order, 1 if the second object comes
// first, or 0 if neither object comes before the other.

Collection._compileSort = function (spec) {
  var sortSpecParts = [];

  if (spec instanceof Array) {
    for (var i = 0; i < spec.length; i++) {
      if (typeof spec[i] === "string") {
        sortSpecParts.push({
          lookup: Collection._makeLookupFunction(spec[i]),
          ascending: true
        });
      } else {
        sortSpecParts.push({
          lookup: Collection._makeLookupFunction(spec[i][0]),
          ascending: spec[i][1] !== "desc"
        });
      }
    }
  } else if (typeof spec === "object") {
    for (var key in spec) {
      sortSpecParts.push({
        lookup: Collection._makeLookupFunction(key),
        ascending: spec[key] >= 0
      });
    }
  } else {
    throw Error("Bad sort specification: ", JSON.stringify(spec));
  }

  if (sortSpecParts.length === 0)
    return function () {return 0;};

  // reduceValue takes in all the possible values for the sort key along various
  // branches, and returns the min or max value (according to the bool
  // findMin). Each value can itself be an array, and we look at its values
  // too. (ie, we do a single level of flattening on branchValues, then find the
  // min/max.)
  var reduceValue = function (branchValues, findMin) {
    var reduced;
    var first = true;
    // Iterate over all the values found in all the branches, and if a value is
    // an array itself, iterate over the values in the array separately.
    _.each(branchValues, function (branchValue) {
      // Value not an array? Pretend it is.
      if (!isArray(branchValue))
        branchValue = [branchValue];
      // Value is an empty array? Pretend it was missing, since that's where it
      // should be sorted.
      if (isArray(branchValue) && branchValue.length === 0)
        branchValue = [undefined];
      _.each(branchValue, function (value) {
        // We should get here at least once: lookup functions return non-empty
        // arrays, so the outer loop runs at least once, and we prevented
        // branchValue from being an empty array.
        if (first) {
          reduced = value;
          first = false;
        } else {
          // Compare the value we found to the value we found so far, saving it
          // if it's less (for an ascending sort) or more (for a descending
          // sort).
          var cmp = Collection._f._cmp(reduced, value);
          if ((findMin && cmp > 0) || (!findMin && cmp < 0))
            reduced = value;
        }
      });
    });
    return reduced;
  };

  return function (a, b) {
    for (var i = 0; i < sortSpecParts.length; ++i) {
      var specPart = sortSpecParts[i];
      var aValue = reduceValue(specPart.lookup(a), specPart.ascending);
      var bValue = reduceValue(specPart.lookup(b), specPart.ascending);
      var compare = Collection._f._cmp(aValue, bValue);
      if (compare !== 0)
        return specPart.ascending ? compare : -compare;
    };
    return 0;
  };
};
EJSON = {}; // Global!
var customTypes = {};
// Add a custom type, using a method of your choice to get to and
// from a basic JSON-able representation.  The factory argument
// is a function of JSON-able --> your object
// The type you add must have:
// - A clone() method, so that Meteor can deep-copy it when necessary.
// - A equals() method, so that Meteor can compare it
// - A toJSONValue() method, so that Meteor can serialize it
// - a typeName() method, to show how to look it up in our type table.
// It is okay if these methods are monkey-patched on.
EJSON.addType = function (name, factory) {
  if (_.has(customTypes, name))
    throw new Error("Type " + name + " already present");
  customTypes[name] = factory;
};

var builtinConverters = [
  { // Date
    matchJSONValue: function (obj) {
      return _.has(obj, '$date') && _.size(obj) === 1;
    },
    matchObject: function (obj) {
      return obj instanceof Date;
    },
    toJSONValue: function (obj) {
      return {$date: obj.getTime()};
    },
    fromJSONValue: function (obj) {
      return new Date(obj.$date);
    }
  },
  { // Binary
    matchJSONValue: function (obj) {
      return _.has(obj, '$binary') && _.size(obj) === 1;
    },
    matchObject: function (obj) {
      return typeof Uint8Array !== 'undefined' && obj instanceof Uint8Array
        || (obj && _.has(obj, '$Uint8ArrayPolyfill'));
    },
    toJSONValue: function (obj) {
      return {$binary: EJSON._base64Encode(obj)};
    },
    fromJSONValue: function (obj) {
      return EJSON._base64Decode(obj.$binary);
    }
  },
  { // Escaping one level
    matchJSONValue: function (obj) {
      return _.has(obj, '$escape') && _.size(obj) === 1;
    },
    matchObject: function (obj) {
      if (_.isEmpty(obj) || _.size(obj) > 2) {
        return false;
      }
      return _.any(builtinConverters, function (converter) {
        return converter.matchJSONValue(obj);
      });
    },
    toJSONValue: function (obj) {
      var newObj = {};
      _.each(obj, function (value, key) {
        newObj[key] = EJSON.toJSONValue(value);
      });
      return {$escape: newObj};
    },
    fromJSONValue: function (obj) {
      var newObj = {};
      _.each(obj.$escape, function (value, key) {
        newObj[key] = EJSON.fromJSONValue(value);
      });
      return newObj;
    }
  },
  { // Custom
    matchJSONValue: function (obj) {
      return _.has(obj, '$type') && _.has(obj, '$value') && _.size(obj) === 2;
    },
    matchObject: function (obj) {
      return EJSON._isCustomType(obj);
    },
    toJSONValue: function (obj) {
      return {$type: obj.typeName(), $value: obj.toJSONValue()};
    },
    fromJSONValue: function (obj) {
      var typeName = obj.$type;
      var converter = customTypes[typeName];
      return converter(obj.$value);
    }
  }
];

EJSON._isCustomType = function (obj) {
  return obj &&
    typeof obj.toJSONValue === 'function' &&
    typeof obj.typeName === 'function' &&
    _.has(customTypes, obj.typeName());
};


//for both arrays and objects, in-place modification.
var adjustTypesToJSONValue =
EJSON._adjustTypesToJSONValue = function (obj) {
  if (obj === null)
    return null;
  var maybeChanged = toJSONValueHelper(obj);
  if (maybeChanged !== undefined)
    return maybeChanged;
  _.each(obj, function (value, key) {
    if (typeof value !== 'object' && value !== undefined)
      return; // continue
    var changed = toJSONValueHelper(value);
    if (changed) {
      obj[key] = changed;
      return; // on to the next key
    }
    // if we get here, value is an object but not adjustable
    // at this level.  recurse.
    adjustTypesToJSONValue(value);
  });
  return obj;
};

// Either return the JSON-compatible version of the argument, or undefined (if
// the item isn't itself replaceable, but maybe some fields in it are)
var toJSONValueHelper = function (item) {
  for (var i = 0; i < builtinConverters.length; i++) {
    var converter = builtinConverters[i];
    if (converter.matchObject(item)) {
      return converter.toJSONValue(item);
    }
  }
  return undefined;
};

EJSON.toJSONValue = function (item) {
  var changed = toJSONValueHelper(item);
  if (changed !== undefined)
    return changed;
  if (typeof item === 'object') {
    item = EJSON.clone(item);
    adjustTypesToJSONValue(item);
  }
  return item;
};

//for both arrays and objects. Tries its best to just
// use the object you hand it, but may return something
// different if the object you hand it itself needs changing.
var adjustTypesFromJSONValue =
EJSON._adjustTypesFromJSONValue = function (obj) {
  if (obj === null)
    return null;
  var maybeChanged = fromJSONValueHelper(obj);
  if (maybeChanged !== obj)
    return maybeChanged;
  _.each(obj, function (value, key) {
    if (typeof value === 'object') {
      var changed = fromJSONValueHelper(value);
      if (value !== changed) {
        obj[key] = changed;
        return;
      }
      // if we get here, value is an object but not adjustable
      // at this level.  recurse.
      adjustTypesFromJSONValue(value);
    }
  });
  return obj;
};

// Either return the argument changed to have the non-json
// rep of itself (the Object version) or the argument itself.

// DOES NOT RECURSE.  For actually getting the fully-changed value, use
// EJSON.fromJSONValue
var fromJSONValueHelper = function (value) {
  if (typeof value === 'object' && value !== null) {
    if (_.size(value) <= 2
        && _.all(value, function (v, k) {
          return typeof k === 'string' && k.substr(0, 1) === '$';
        })) {
      for (var i = 0; i < builtinConverters.length; i++) {
        var converter = builtinConverters[i];
        if (converter.matchJSONValue(value)) {
          return converter.fromJSONValue(value);
        }
      }
    }
  }
  return value;
};

EJSON.fromJSONValue = function (item) {
  var changed = fromJSONValueHelper(item);
  if (changed === item && typeof item === 'object') {
    item = EJSON.clone(item);
    adjustTypesFromJSONValue(item);
    return item;
  } else {
    return changed;
  }
};

EJSON.stringify = function (item) {
  return JSON.stringify(EJSON.toJSONValue(item));
};

EJSON.parse = function (item) {
  return EJSON.fromJSONValue(JSON.parse(item));
};

EJSON.isBinary = function (obj) {
  return (typeof Uint8Array !== 'undefined' && obj instanceof Uint8Array) ||
    (obj && obj.$Uint8ArrayPolyfill);
};

EJSON.equals = function (a, b, options) {
  var i;
  var keyOrderSensitive = !!(options && options.keyOrderSensitive);
  if (a === b)
    return true;
  if (!a || !b) // if either one is falsy, they'd have to be === to be equal
    return false;
  if (!(typeof a === 'object' && typeof b === 'object'))
    return false;
  if (a instanceof Date && b instanceof Date)
    return a.valueOf() === b.valueOf();
  if (EJSON.isBinary(a) && EJSON.isBinary(b)) {
    if (a.length !== b.length)
      return false;
    for (i = 0; i < a.length; i++) {
      if (a[i] !== b[i])
        return false;
    }
    return true;
  }
  if (typeof (a.equals) === 'function')
    return a.equals(b, options);
  if (a instanceof Array) {
    if (!(b instanceof Array))
      return false;
    if (a.length !== b.length)
      return false;
    for (i = 0; i < a.length; i++) {
      if (!EJSON.equals(a[i], b[i], options))
        return false;
    }
    return true;
  }
  // fall back to structural equality of objects
  var ret;
  if (keyOrderSensitive) {
    var bKeys = [];
    _.each(b, function (val, x) {
        bKeys.push(x);
    });
    i = 0;
    ret = _.all(a, function (val, x) {
      if (i >= bKeys.length) {
        return false;
      }
      if (x !== bKeys[i]) {
        return false;
      }
      if (!EJSON.equals(val, b[bKeys[i]], options)) {
        return false;
      }
      i++;
      return true;
    });
    return ret && i === bKeys.length;
  } else {
    i = 0;
    ret = _.all(a, function (val, key) {
      if (!_.has(b, key)) {
        return false;
      }
      if (!EJSON.equals(val, b[key], options)) {
        return false;
      }
      i++;
      return true;
    });
    return ret && _.size(b) === i;
  }
};

EJSON.clone = function (v) {
  var ret;
  if (typeof v !== "object")
    return v;
  if (v === null)
    return null; // null has typeof "object"
  if (v instanceof Date)
    return new Date(v.getTime());
  if (EJSON.isBinary(v)) {
    ret = EJSON.newBinary(v.length);
    for (var i = 0; i < v.length; i++) {
      ret[i] = v[i];
    }
    return ret;
  }
  if (_.isArray(v) || _.isArguments(v)) {
    // For some reason, _.map doesn't work in this context on Opera (weird test
    // failures).
    ret = [];
    for (i = 0; i < v.length; i++)
      ret[i] = EJSON.clone(v[i]);
    return ret;
  }
  // handle general user-defined typed Objects if they have a clone method
  if (typeof v.clone === 'function') {
    return v.clone();
  }
  // handle other objects
  ret = {};
  _.each(v, function (value, key) {
    ret[key] = EJSON.clone(value);
  });
  return ret;
};
/**
 * Adding some extension methods to the LocalStorage for easier
 * data access.
 * 
 * @author Sam Verschueren      <sam.verschueren@gmail.com>
 * @since  25 Oct. 2014
 */
Storage.prototype.setObject = function(key, value) {
    this.setItem(key, EJSON.stringify(value));
};

Storage.prototype.getObject = function(key) {
    var item = this.getItem(key);

    return item ? EJSON.parse(item) : undefined;
};
/**
 * This class represents the mongo database.
 *
 * @author Sam Verschueren      <sam.verschueren@gmail.com>
 * @since  24 Oct. 2014
 */
var MongoStorage = (function() {
    'use strict';

    if(typeof _ === 'undefined') {
        // First test if lodash is included in the project
        console.error('Lodash not found! Please include lodash.');
        return;
    }

    /**
     * Creates the database
     */
    function MongoStorage() {

    }

    MongoStorage.prototype.use = function(database) {
        // Remove all the properties first
        _.forEach(Object.keys(this), function(key) {
            delete this[key];
        }, this);

        // Set the database
        this._database = database;

        // Load the correct collections
        for(var name in window.localStorage) {
            if(name.split('.')[0] === this._database) {
                this[name.substring(this._database.length+1)] = new Collection(name, window.localStorage.getObject(name));
            }
        }
    };

    /**
     * Creates a new collection in the database.
     *
     * @param  String name The name of the collection.
     */
    MongoStorage.prototype.createCollection = function(name) {
        if(this._database === undefined) {
            throw { errmsg: 'no database selected', 'ok': 0 };
        }

        var fullName = this._database + '.' + name;

        if(window.localStorage[fullName] !== undefined) {
            throw { errmsg: 'collection already exists', 'ok' : 0 };
        }

        window.localStorage.setObject(fullName, []);

        this[name] = new Collection(fullName, []);
    };

    /**
     * The dropDatabase command drops the current database.
     */
    MongoStorage.prototype.dropDatabase = function() {
        if(this._database === undefined) {
            throw { errmsg: 'no database selected', 'ok': 0 };
        }

        // Iterate over the collections and remove them
        _.forEach(this.collections(), function(collection) {
            delete window.localStorage[this._database + '.' + collection];
        }, this);

        // Clear the collections by selecting no database
        this.use();
    };

    /**
     * Returns an array of all the collections in the current database.
     *
     * @return {String[]}       Array of collections.
     */
    MongoStorage.prototype.collections = function() {
        if(this._database === undefined) {
            throw { errmsg: 'no database selected', 'ok': 0 };
        }

        var collections = [];

        // Iterate over all the storage properties
        for(var name in window.localStorage) {
            var splitted = name.split('.');

            if(splitted.shift() === this._database) {
                // Remove the collection if it is part of the database
                collections.push(splitted.join('.'));
            }
        }

        return collections;
    };

    return MongoStorage;
})();

/**
 * This class knows how to generate random object id's for our documents.
 *
 * @author Sam Verschueren      <sam.verschueren@gmail.com>
 * @since  25 Oct. 2014
 */
var ObjectId = (function() {
    'use strict';

    var startIndex = _.random(0, 5592405),
        machineID = _.random(1048576, 16777215).toString(16),   // 3 bytes
        processID = _.random(4096, 65535).toString(16);         // 2 bytes

    function ObjectId(hexString) {
        if(!hexString) {
            this._timestamp = parseInt(Date.now()/1000);
            this._index = (startIndex++).toString(16);

            // left pad the index
            while(this._index.length < 6) {
                this._index = '0' + this._index;
            }

            this._id = this._timestamp.toString(16) + machineID + processID + this._index;
        }
        else {
            hexString = hexString.toLowerCase();

            if(!this._isObjectId(hexString)) {
                throw new Error('Could not parse ' + hexString + ' as a hexadecimal string');
            }

            this._timestamp = parseInt(hexString.substr(0, 8), 16);

            this._id = hexString;
        }
    }

    ObjectId.prototype._isObjectId = function(str) {
        return str.length === 24 && !!str.match(/^[0-9a-f]*$/);
    };

    ObjectId.prototype.getTimestamp = function() {
        return this._timestamp;
    };

    ObjectId.prototype.toString = function() {
        return 'ObjectId("' + this._id + '")';
    };

    ObjectId.prototype.valueOf = ObjectId.prototype.toJSONValue = ObjectId.prototype.toHexString = function () {
        return this._id;
    };

    return ObjectId;
})();
