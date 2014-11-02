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
db.collection.insert(documents, [function]);
```

#### Example

```JavaScript
db.users.insert({firstName: 'Foo', name: 'Bar'});
```

```JavaScript
db.users.insert([{firstName: 'Foo 1', name: 'Bar'}, {firstName: 'Foo 2', name: 'Bar'}]);
```

### #update()

### #find()

Retrieves an array of documents that matches the query criteria.

```JavaScript
db.collection.find([query, [options]], function);
```

#### Example

```JavaScript
db.users.find({age: {$gte: 25}}, function(users) {
    // All the users with an age greater then or equal to 25
});
```

```JavaScript
db.users.find({age: {$gte: 25}}, {limit: 5}, function(users) {
    // The first 5 users with an age greater then or equal to 25
});
```

```JavaScript
db.users.find({age: {$gte: 25}}, {limit: 5, skip: 5}, function(users) {
    // The next 5 users with an age greater then or equal to 25
});
```

### #findOne()

Retrieves the first document that matches the query criteria.

```JavaScript
db.collection.findOne([query, [options]], function);
```

#### Example

```JavaScript
db.users.findOne({name: 'Bar', age: {$lt: 24}}, function(user) {
    // The first user with an age less then 24
});
```

```JavaScript
db.users.findOne({name: 'Bar', age: {$lt: 24}}, {sort: {age: -1}}, function(user) {
    // The oldest user with an age less then 24
});
```

### #remove()

To remove data out of a collection, you can use the ```remove()``` method. It has an optional query parameter and an optional callback function that will tell you how many records where removed.

```JavaScript
db.collection.remove([query], [function]);
```

#### Example

```JavaScript
db.users.remove();
```

```JavaScript
db.users.remove(function(nr) {
    // nr holds the number of documents removed out of the collection
});
```

```JavaScript
db.users.remove({age: {$gt: 25}}, function(nr) {
    // nr holds the number of documents removed out of the collection
});
```

### #count()

Counts the number of documents in the collection that matches the query criteria.

```JavaScript
db.collection.count([query], function);
```

#### Example

```JavaScript
db.users.count(function(count) {
    // count holds the total number of users in the database 
});
```

```JavaScript
db.users.count({age: {$gt: 25}}, function(count) {
    // count holds the total number of users with an age greater then 25 
});
```

### #drop()

Drops the collection from the database

```JavaScript
db.collection.drop([function]);
```

#### Example

```JavaScript
db.users.drop();
```

```JavaScript
db.users.drop(function() {
    // The users collection has been removed
});
```