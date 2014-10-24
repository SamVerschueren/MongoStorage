/**
 * This class provides methods to access or manipulate the data
 * in the database.
 * 
 * @author Sam Verschueren      <sam.verschueren@gmail.com>
 * @since  24 Oct. 2014
 */
var MongoTable = (function() {
    'use strict';

    if(typeof _ === 'undefined') {
        // First test if lodash is included in the project
        console.error('Lodash not found! Please include lodash.');
        return;
    }

    /**
     * Creates a new mongo table
     * 
     * @param String name The name of the table.
     * @param Object data The data in the table.
     */
    function MongoTable(name, data) {
        this._name = name;
        this._data = JSON.parse(data);
    };

    MongoTable.prototype.find = function(where, callback) {
        if(!_.isObject(where)) {
            where = {_id: where};
        }

        callback(_.where(this._data, where));
    };

    MongoTable.prototype.findOne = function(where, callback) {
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
    MongoTable.prototype.insert = function(data, callback) {
        var dataArray = data;

        if(!_.isArray(data)) {
            dataArray = [data];
        }

        // Iterate over the array
        _.forEach(dataArray, function(item) {
            // Create an id
            item._id = (new Date()).getTime() + '' + parseInt(Math.random()*100000);

            // Push the item to the data stack
            this._data.push(item);
        }, this);

        // Update the localStorage object
        window.localStorage[this._name] = JSON.stringify(this._data);

        // If we have a callback, call it
        if(callback) callback();
    };

    /**
     * Clear the data out of the table.
     */
    MongoTable.prototype.remove = function() {
        this._data = [];

        window.localStorage[this._name] = JSON.stringify(this._data);
    };

    return MongoTable;
})();