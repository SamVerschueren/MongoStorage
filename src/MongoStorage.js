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
        this._database = database;

        for(var name in window.localStorage) {
            if(name.indexOf(this._database) === 0) {
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

        if(window.localStorage.getObject(fullName) !== undefined) {
            throw { errmsg: 'collection already exists', 'ok' : 0 };
        }

        window.localStorage.setObject(fullName, []);

        this[name] = new Collection(fullName, []);
    };

    return MongoStorage;
})();
