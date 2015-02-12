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
