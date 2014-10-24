/**
 *
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

    function MongoStorage() {
        for(var key in window.localStorage) {
            this[key] = new MongoTable(key, window.localStorage[key]);
        }
    }

    return MongoStorage;
})();