MongoStorage
=====================
This library is a work-in-progress for a client-side MongoDB implementation.

Create a collection
---------------------
```JavaScript
var db = new MongoStorage();
db.createCollection('users');
```

Insert a document
---------------------
It's possible to insert document per document or insert multiple documents at once.

```JavaScript
db.users.insert({firstName: 'Foo', name: 'Bar'});
db.users.insert([{firstName: 'Foo 1', name: 'Bar'}, {firstName: 'Foo 2', name: 'Bar'}]);
```

Clear a collection
---------------------
```JavaScript
db.users.remove();
```

Find collections
---------------------
For now the finders are very limited. It's only possible to use a simple and-where clause. More complex queries will become available in the future.

```JavaScript
db.users.find({firstName: 'Foo'}, function(users) {
    // ...
});

db.users.find({firstName: 'Foo', name: 'Bar'}, function(users) {
    // ... 
});
```