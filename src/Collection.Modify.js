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