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
            
            where = where || {};
            options = options || {};
            callback = callback || noop;
    
            var filtered = _.filter(_.values(self._data), compileDocumentSelector(where));
    
            if(options.sort) {
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
            
            where = where || {};
            options = options || {};
            callback = callback || noop;
    
            var filtered = _.filter(_.values(self._data), compileDocumentSelector(where));
    
            if(options.sort) {
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
            
            options = options || {};
            callback = callback || noop;
    
            var updatedDocuments = 0;
    
            self.find(query, function(documents) {
                if(!options.multi) {
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
