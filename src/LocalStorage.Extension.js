/**
 * Adding some extension methods to the LocalStorage for easier
 * data access.
 * 
 * @author Sam Verschueren      <sam.verschueren@gmail.com>
 * @since  25 Oct. 2014
 */
Storage.prototype.setObject = function(key, value) {
    this.setItem(key, JSON.stringify(value));
};

Storage.prototype.getObject = function(key) {
    var item = this.getItem(key);

    return item ? JSON.parse(item) : undefined;
};