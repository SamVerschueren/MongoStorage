# MongoStorage

This library is a work-in-progress for a client-side MongoDB implementation.

## Database

### #createCollection()

To create a new collection, you should call the ```createCollection()``` method of the database.

```JavaScript
var db = new MongoStorage();
db.createCollection('users');
```

This will expose a new user property in the database that can be used to access or modify the data in that collection.

## Collection

### #insert()

It's possible to insert document per document or insert multiple documents at once.

```JavaScript
db.users.insert({firstName: 'Foo', name: 'Bar'});
db.users.insert([{firstName: 'Foo 1', name: 'Bar'}, {firstName: 'Foo 2', name: 'Bar'}]);
```

### #update()

### #find()

### #findOne()

Retrieves the first document that matches the query parameter.

```JavaScript
db.users.findOne({name: 'Bar', age: {$lt: 24}}, function(user) {
    // The first user with an age less then 24
});

db.users.findOne({name: 'Bar', age: {$lt: 24}}, {sort: {age: -1}}, function(user) {
    // The oldest user with an age less then 24
});
```

### #remove()

To remove data out of a collection, you can use the ```remove()``` method. It has an optional query parameter and an optional callback function that will tell you how many records where removed.

```JavaScript
db.users.remove();

db.users.remove(function(nr) {
    console.log(nr + ' users where removed out of the collection.');
});

db.users.remove({age: {$gt: 24}}, function(nr) {
    console.log(nr + ' user had an age greater then 24.'); 
});
```