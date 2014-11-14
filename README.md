# MongoStorage

This library is work-in-progress for a client-side MongoDB implementation.

## Table of contents

* [Database](#database)
    * [use()](#use)
    * [createCollection()](#createcollection)
* [Collection](#collection)
    * [insert()](#insert)
    * [update()](#update)
    * [find()](#find)
    * [findOne()](#findone)
    * [remove()](#remove)
    * [count()](#count)
    * [drop()](#drop)
* [Query Operators](#query-operators)
    * [Comparison Query Operators](#comparison-query-operators)
        * [$gt](#gt)
        * [$gte](#gte)
        * [$lt](#lt)
        * [$lte](#lte)
        * [$ne](#ne)
        * [$ni](#ni)
        * [$nin](#nin)
    * [Logical Query Operators](#logical-query-operators)
        * [$and](#and)
        * [$or](#or)
        * [$nor](#nor)
        * [$not](#not)

## Database

### #use()

Before we can actually start creating or retrieving documents, we should select the database we wish to use. You should call the ```use()``` method to change the selected database.

```JavaScript
var db = new MongoStorage();
db.use('foo_dev');
```

This will load all the collections from the foo_dev database.

### #createCollection()

To create a new collection, you should call the ```createCollection()``` method of the database.

```JavaScript
var db = new MongoStorage();
db.use('foo_dev');
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

## Query Operators

### Comparison query operators
For comparison of different type values.

#### $gt
Matches values that are greater than the value specified in the query.

#### $gte
Matches values that are greater than or equal to the value specified in the query.

#### $lt
Matches values that are less than the value specified in the query.

#### $lte
Matches values that are less than or equal to the value specified in the query.

#### $ne
Matches all values that are not equal to the value specified in the query.

#### $in
Matches any of the values that exist in an array specified in the query.

#### $nin
Matches values that do not exist in an array specified to the query.

### Logical query operators

#### $and
Joins query clauses with a logical AND returns all documents that match the conditions of both clauses.

#### $or
Joins query clauses with a logical OR returns all documents that match the conditions of either clause.

#### $nor
Joins query clauses with a logical NOR returns all documents that fail to match both clauses.

#### $not
Inverts the effect of a query expression and returns documents that do not match the query expression.

# Contributors
* Sam Verschueren   [sam.verschueren@gmail.com]

# MIT License
Copyright © 2014 Sam Verschueren <sam.verschueren@gmail.com>

Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the “Software”), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED “AS IS”, WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.