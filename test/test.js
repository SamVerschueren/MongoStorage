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
        it('Should create the collection in the database', function() {
            db.createCollection('users');

            expect(localStorage.getObject('users')).to.exist;
        });

        it('Should create an empty collection', function() {
            db.createCollection('users');

            expect(localStorage.getObject('users')).to.be.empty;
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

        it('Should remove all documents if no parameters are provided', function() {
            db.users.remove();

            expect(localStorage.getObject('users')).to.be.empty;
        });

        it('Should remove all the documents if only the callback is provided', function() {
            db.users.remove(function() {
                expect(localStorage.getObject('users')).to.be.empty;
            });
        });

        it('Should return the number of deleted rows', function() {
            db.users.remove(function(rows) {
                expect(rows).to.be.equal(2);
            });  
        });

        it('Should remove the documents that match the criteria', function() {
            db.users.remove({firstName: 'Foo 1'}, function() {
                expect(localStorage.getObject('users')).to.have.length(1);
            });
        });
    });
});