var assert = chai.assert,
    expect = chai.expect,

    db = new MongoStorage();

after(function() {
    // Clean up everything afterwards
    window.localStorage.clear();
});

describe('Database', function() {

    beforeEach(function() {
        localStorage.clear();
    });

    describe('#createCollection()', function() {

        it('Should create a collection in the database', function() {
            db.createCollection('users');

            expect(localStorage.getObject('users')).to.exist;
        });

        it('Should create an empty collection in the database', function() {
            db.createCollection('users');

            expect(localStorage.getObject('users')).to.be.empty;
        });

        it('Should throw an error if ran twice', function() {
            function fn() { db.createCollection('users'); }

            fn();
            expect(fn).to.throw;
        });
    });
});

describe('Collection', function() {

    beforeEach(function() {
        localStorage.clear();

        db.createCollection('users');
    });

    describe('#insert()', function() {
        it('Should insert a document in the collection', function() {
            db.users.insert({firstName: 'Foo', name: 'Bar'});

            expect(localStorage.getObject('users')).to.not.be.empty;
        });

        it('Should insert 2 documents at once', function() {
            db.users.insert([
                {firstName: 'Foo 1', name: 'Bar'},
                {firstname: 'Foo 2', name: 'Bar'}
            ]);

            expect(localStorage.getObject('users').length).to.equal(2);
        });

        it('Should add an id to the document', function() {
            db.users.insert({firstName: 'Foo', name: 'Bar'});

            expect(localStorage.getObject('users')[0]._id).to.exist;
        });

        it('Should insert the correct document', function() {
            db.users.insert({firstName: 'Foo', name: 'Bar'});

            var databaseDoc = localStorage.getObject('users')[0];
            delete databaseDoc._id;

            expect(databaseDoc).to.be.deep.equal({firstName: 'Foo', name: 'Bar'});
        });
    });

    describe('#find()', function() {
        beforeEach(function() {
            db.users.insert([{firstName: 'Foo 1', name: 'Bar', age: 20}, {firstName: 'Foo 2', name: 'Bar', age: 25}]);
        });

        it('Should return all documents when an empty where clause is provided', function() {
            db.users.find({}, function(users) {
                expect(users).to.have.length(2);
            });
        });

        it('Should return an array', function() {
            db.users.find(function(users) {
                expect(users).to.be.an.array;
            });
        });

        it('Should accept where clause', function() {
            db.users.find({firstName: 'Foo 1'}, function(users) {
                expect(users).to.have.length(1);
            });
        });

        it('Should be possible to order the data ascending', function() {
            db.users.find({}, {sort: {age: 1}}, function(users) {
                expect(users[0].age).to.be.equal(20);
                expect(users[1].age).to.be.equal(25);
            });
        });

        it('Should be possible to order the data descending', function() {
            db.users.find({}, {sort: {age: -1}}, function(users) {
                expect(users[0].age).to.be.equal(25);
                expect(users[1].age).to.be.equal(20);
            });
        });
    });

    describe('#findOne()', function() {
        beforeEach(function() {
            db.users.insert([{firstName: 'Foo 1', name: 'Bar'}, {firstName: 'Foo 2', name: 'Bar'}]);
        });

        it('Should return an object', function() {
            db.users.findOne({name: 'Bar'}, function(user) {
                expect(user).to.be.an.object;
            });
        });

        it('Should return the first match', function() {
            db.users.findOne({name: 'Bar'}, function(user) {
                expect(user.firstName).to.be.equal('Foo 1');
            });
        });
    });

    describe('#remove()', function() {
        beforeEach(function() {
            db.users.insert([{firstName: 'Foo 1', name: 'Bar'}, {firstName: 'Foo 2', name: 'Bar'}]);
        });

        describe('remove()', function() {
            it('Should remove all documents', function() {
                db.users.remove();

                expect(localStorage.getObject('users')).to.be.empty;
            });
        });

        describe("remove(callback)", function() {
            it('Should remove all documents', function() {
                db.users.remove(function() {
                    expect(localStorage.getObject('users')).to.be.empty;
                });
            });

            it('Should return the number of deleted rows', function() {
                db.users.remove(function(rows) {
                    expect(rows).to.be.equal(2);
                });  
            });
        });

        describe('remove(query, callback)', function() {
            it('Should remove the documents that match the criteria', function() {
                db.users.remove({firstName: 'Foo 1'}, function() {
                    expect(localStorage.getObject('users')).to.have.length(1);
                });
            });

            it('Should return the number of delete rows', function() {
                db.users.remove({firstName: 'Foo 1'}, function(rows) {
                    expect(localStorage.getObject('users')).to.have.length(1);
                    expect(rows).to.be.equal(1);
                });
            });
        });
    });

    describe('#count()', function() {
        beforeEach(function() {
            db.users.insert([
                {
                    firstName: 'Foo 1',
                    name: 'Bar'
                }, 
                {
                    firstName: 'Foo 2',
                    name: 'Bar'
                }
            ]);
        });

        it('Should return all users when no query is provided', function() {
            db.users.count(function(count) {
                expect(count).to.be.equal(2);
            });
        });

        it('Should return 1 user with firstname Foo 1', function() {
            db.users.count({firstName: 'Foo 1'}, function(count) {
                expect(count).to.be.equal(1);
            });
        });
    });

    describe('#drop()', function() {
        it('Should drop the users collection from the database', function() {
            db.users.drop(function() {
                expect(window.localStorage['users']).to.not.exist;
            });
        });
    });
});

describe('Query Operators', function() {
    beforeEach(function() {
        localStorage.clear();

        db.createCollection('users');

        db.users.insert([
            {
                firstName: 'Foo 3',
                name: 'Bar',
                age: 16,
                hobbies: ['Soccer', 'Cycling', 'Climbing']
            },
            {
                firstName: 'Foo 1',
                name: 'Bar',
                age: 25,
                hobbies: ['Soccer', 'Swimming']
            },
            {
                firstName: 'Foo 2',
                name: 'Bar',
                age: 36,
                hobbies: ['Swimming', 'Cycling']
            }
        ]);
    });

    describe('Comparison Query Operators', function() {

        describe('$gt', function() {
            it('Should return 0 users with an age greater then 36', function() {
                db.users.find({age: {$gt: 36}}, function(users) {
                    expect(users).to.be.empty;
                });
            });

            it('Should return 1 users with an age greater then 35', function() {
                db.users.find({age: {$gt: 35}}, function(users) {
                    expect(users).to.have.length(1);
                });
            });

            it('Should return 1 user with an age greater then 25', function() {
                db.users.find({age: {$gt: 25}}, function(users) {
                    expect(users).to.have.length(1);
                });
            });

            it('Should return 2 users with an age greater then 24', function() {
                db.users.find({age: {$gt: 24}}, function(users) {
                    expect(users).to.have.length(2);
                });
            });
        });

        describe('$gte', function() {
            it('Should return 0 users with an age greater then or equal to 37', function() {
                db.users.find({age: {$gte: 37}}, function(users) {
                    expect(users).to.be.empty;
                });
            });

            it('Should return 1 users with an age greater then or equal to 36', function() {
                db.users.find({age: {$gte: 36}}, function(users) {
                    expect(users).to.have.length(1);;
                });
            });

            it('Should return 1 users with an age greater then or equal to 35', function() {
                db.users.find({age: {$gte: 35}}, function(users) {
                    expect(users).to.have.length(1);
                });
            });

            it('Should return 2 users with an age greater then or equal to 25', function() {
                db.users.find({age: {$gte: 25}}, function(users) {
                    expect(users).to.have.length(2);
                });
            });

            it('Should return 2 users with an age greater then or equal to 24', function() {
                db.users.find({age: {$gte: 24}}, function(users) {
                    expect(users).to.have.length(2);
                });
            });
        });

        describe('$lt', function() {
            it('Should return 0 users with an age less then 16', function() {
                db.users.find({age: {$lt: 16}}, function(users) {
                    expect(users).to.be.empty;
                });
            });

            it('Should return 1 user with an age less then 17', function() {
                db.users.find({age: {$lt: 17}}, function(users) {
                    expect(users).to.have.length(1);
                });
            });

            it('Should return 2 users with an age less then 30', function() {
                db.users.find({age: {$lt: 30}}, function(users) {
                    expect(users).to.have.length(2);
                });
            });

            it('Should return 3 users with an age less then 37', function() {
                db.users.find({age: {$lt: 37}}, function(users) {
                    expect(users).to.have.length(3);
                });
            });
        });

        describe('$lte', function() {
            it('Should return 0 users with an age less then or equal to 14', function() {
                db.users.find({age: {$lte: 14}}, function(users) {
                    expect(users).to.be.empty;
                });
            });

            it('Should return 1 user with an age less then or equal to 16', function() {
                db.users.find({age: {$lte: 16}}, function(users) {
                    expect(users).to.have.length(1);
                });
            });

            it('Should return 2 users with an age less then or equal to 30', function() {
                db.users.find({age: {$lte: 30}}, function(users) {
                    expect(users).to.have.length(2);
                });
            });

            it('Should return 3 users with an age less then or equal to 36', function() {
                db.users.find({age: {$lte: 36}}, function(users) {
                    expect(users).to.have.length(3);
                });
            });
        });

        describe('$ne', function() {
            it('Should return 2 users with an age not equal to 16', function() {
                db.users.find({age: {$ne: 16}}, function(users) {
                    expect(users).to.have.length(2);
                });
            });

            it('Should return 3 users with an age not equal to 20', function() {
                db.users.find({age: {$ne: 20}}, function(users) {
                    expect(users).to.have.length(3);
                });
            }); 
        });

        describe('$in', function() {
            it('Should return 0 users with hobby dancing or drawing', function() {
                db.users.find({hobbies: {$in: ['Dancing', 'Drawing']}}, function(users) {
                    expect(users).to.be.empty;
                });
            });

            it('Should return 1 user with hobby climbing or drawing', function() {
                db.users.find({hobbies: {$in: ['Climbing', 'Drawing']}}, function(users) {
                    expect(users).to.have.length(1);
                });
            });

            it('Should return 2 users with hobby cycling or dancing', function() {
                db.users.find({hobbies: {$in: ['Cycling', 'Dancing']}}, function(users) {
                    expect(users).to.have.length(2);
                });
            });

            it('Should return 3 users with hobby swimming or climbing', function() {
                db.users.find({hobbies: {$in: ['Swimming', 'Climbing']}}, function(users) {
                    expect(users).to.have.length(3);
                });
            });
        });

        describe('$nin', function() {
            it('Should return 0 users that don\'t swim or climb', function() {
                db.users.find({hobbies: {$nin: ['Swimming', 'Climbing']}}, function(users) {
                    expect(users).to.be.empty;
                });
            });

            it('Should return 1 user that don\'t swim', function() {
                db.users.find({hobbies: {$nin: ['Swimming']}}, function(users) {
                    expect(users).to.have.length(1);
                });
            });
        });
    });
});