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
     * @param  Object   options  The options like to sort and all.
     * @param  Function callback The callback function that will be called with the result when the data is retrieved.
     */
    Collection.prototype.find = function(where, options, callback) {
        if(_.isString(where)) {
            where = {_id: where};
        }

        if(_.isFunction(where)) {
            callback = where;
            options = undefined;
            where = {};
        }

        if(_.isFunction(options)) {
            callback = options;
            options = undefined;
        }

        var filtered = _.filter(_.values(this._data), compileDocumentSelector(where));

        if(options && options.sort) {
            filtered = filtered.sort(compileSort(options.sort));
        }

        callback(filtered);
    };

    /**
     * Finds the first documet that matches the where clause.
     * 
     * @param  Object   where    The where statement object.
     * @param  Object   options  The options like to sort and all.
     * @param  Function callback The callback function that will be called with the result when the data is retrieved.
     */
    Collection.prototype.findOne = function(where, options, callback) {
        if(_.isString(where)) {
            where = {_id: where};
        }

        if(_.isFunction(where)) {
            callback = where;
            options = undefined;
            where = {};
        }

        if(_.isFunction(options)) {
            callback = options;
            options = undefined;
        }

        var filtered = _.filter(_.values(this._data), compileDocumentSelector(where));

        if(options && options.sort) {
            filtered = filtered.sort(compileSort(options.sort));
        }

        callback(filtered[0]);
    };

    Collection.prototype.update = function(query, update, options, callback) {
        if(_.isFunction(options)) {
            callback = options;
            options = undefined;
        }

        var self = this;

        self.find(query, function(data) {
            if(data.length == 0) {
                // If no records where found, callback that no records where updated
                return callback(0);
            }

            if(!options || !options.multi) {
                // If multi is not set to true, only update the first record
                data = [data[0]];
            }

            // Iterate over the resultset
            _.each(data, function(doc) {
                var id = doc._id;

                if(update.$set) {
                    // Update the document
                    doc = _.extend(doc, update.$set);
                }
                if(update.$inc) {

                }

                // Make sure the original id was not overrided
                doc._id = id;

                var index = _.findIndex(self._data, {_id: id});

                self._data[index] = doc;
            });

            window.localStorage.setObject(self._name, self._data);

            callback(data.length);
        });
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
            item._id = new ObjectId().toJSONValue();

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
     *
     * @param  Object   query     Specifies deletion criteria using query operators
     * @param  Function callback  The callback that will be called with the number of removed rows.
     */
    Collection.prototype.remove = function(query, callback) {
        if(_.isFunction(query)) {
            callback = query;
            query = undefined;
        }

        var result = this._data.length;

        if(!query) {
            this._data = [];
        }
        else {
            var self = this;

            this.find(query, function(documents) {
                result = documents.length;

                _.each(documents, function(doc) {
                    var index = _.findIndex(self._data, {_id: doc._id});

                    self._data.splice(index, 1);
                }, this);
            }, this);
        }

        window.localStorage.setObject(this._name, this._data);

        if(callback) callback(result);
    };

    return Collection;
})();