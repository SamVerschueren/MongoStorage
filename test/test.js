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

        it('Should clear the collection', function() {
            db.users.remove();

            expect(localStorage.getObject('users')).to.be.empty;
        });
    });
});