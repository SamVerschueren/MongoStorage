/**
 * This class knows how to generate random object id's for our documents.
 * 
 * @author Sam Verschueren      <sam.verschueren@gmail.com>
 * @since  25 Oct. 2014
 */
var ObjectId = (function() {
    'use strict';

    var startIndex = _.random(0, 5592405);
    
    function ObjectId() {
        this._timestamp = parseInt(Date.now()/1000);
        this._index = (startIndex++).toString(16);

        // left pad the index
        while(this._index.length < 6) {
            this._index = '0' + this._index;
        }
    };

    ObjectId.prototype.getTimestamp = function() {
        return this._timestamp;
    };

    ObjectId.prototype.toString = function() {
        var machineID = _.random(1048576, 16777215).toString(16),   // 3 bytes
            processID = _.random(4096, 65535).toString(16);         // 2 bytes

        return this._timestamp.toString(16) + machineID + processID + this._index;
    };

    ObjectId.prototype.toJSON = function() {
        return 'ObjectId("' + this.toString() + '")';
    };

    return ObjectId;
})();