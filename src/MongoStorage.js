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
        for(var name in window.localStorage) {
            this[name] = new Collection(name, window.localStorage.getObject(name));
        }
    };

    /**
     * Creates a new collection in the database.
     * 
     * @param  String name The name of the collection.
     */
    MongoStorage.prototype.createCollection = function(name) {
        window.localStorage.setObject(name, []);

        this[name] = new Collection(name, []);
    };

    return MongoStorage;
})();

// Extension methods for the local storage
Storage.prototype.setObject = function(key, value) {
    this.setItem(key, JSON.stringify(value));
};

Storage.prototype.getObject = function(key) {
    var item = this.getItem(key);

    return item ? JSON.parse(item) : undefined;
};