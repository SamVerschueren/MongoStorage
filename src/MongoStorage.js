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
