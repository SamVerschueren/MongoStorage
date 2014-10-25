var assert = chai.assert,
    expect = chai.expect,

    db = new MongoStorage();

describe('Database', function() {

    beforeEach(function() {
        window.localStorage.clear();
    });

    describe('#createCollection()', function() {
        it('Should create the collection in the database', function() {
            db.createCollection('users');

            expect(window.localStorage['users']).to.exist;
        });

        it('Should create an empty collection', function() {
            db.createCollection('users');

            expect(JSON.parse(window.localStorage['users'])).to.be.empty;
        });
    });
});

describe('Collection', function() {

    beforeEach(function() {
        window.localStorage.clear();

        db.createCollection('users');
    });

    describe('#insert()', function() {
        it('Should insert a document in the collection', function() {
            db.users.insert({firstName: 'Foo', name: 'Bar'});

            expect(JSON.parse(window.localStorage['users']).length).to.equal(1);
        });

        it('Should insert 2 documents at once', function() {
            db.users.insert([
                {firstName: 'Foo 1', name: 'Bar'},
                {firstname: 'Foo 2', name: 'Bar'}
            ]);

            expect(JSON.parse(window.localStorage['users']).length).to.equal(2);
        });

        it('Should add an id to the document', function() {
            db.users.insert({firstName: 'Foo', name: 'Bar'});

            expect(JSON.parse(window.localStorage['users'])[0]._id).to.exist;
        });
    });
});