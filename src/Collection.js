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

    /**
     * Creates a new mongo collection
     * 
     * @param String name The name of the collection.
     * @param Object data The data in the collection.
     */
    function Collection(name, data) {
        this._name = name;
        this._data = data;
    };

    /**
     * Finds all the documents in the collection that match the where
     * statement.
     * 
     * @param  Object   where    The where statement object.
     * @param  Function callback The callback function that will be called with the result when the data is retrieved.
     */
    Collection.prototype.find = function(where, callback) {
        if(!_.isObject(where)) {
            where = {_id: where};
        }

        callback(_.where(this._data, where));
    };

    /**
     * Finds the first documet that matches the where clause.
     * 
     * @param  Object   where    The where statement object.
     * @param  Function callback The callback function that will be called with the result when the data is retrieved.
     */
    Collection.prototype.findOne = function(where, callback) {
        if(!_.isObject(where)) {
            where = {_id: where};
        }

        callback(_.find(this._data, where));
    };

    /**
     * Insert a document or multiple documents to the collection.
     * 
     * @param  Mixed    data     Document or array of documents that should be inserted.
     * @param  Function callback An optional callback if the data is inserted.
     */
    Collection.prototype.insert = function(data, callback) {
        var dataArray = data;

        if(!_.isArray(data)) {
            dataArray = [data];
        }

        // Iterate over the array
        _.forEach(dataArray, function(item) {
            // Create an id
            item._id = new ObjectId().toString();

            // Push the item to the data stack
            this._data.push(item);
        }, this);

        // Update the localStorage object
        window.localStorage.setObject(this._name, this._data);

        // If we have a callback, call it
        if(callback) callback();
    };

    /**
     * Clear the data out of the table.
     */
    Collection.prototype.remove = function() {
        this._data = [];

        window.localStorage.setObject(this._name, this._data);
    };

    return Collection;
})();