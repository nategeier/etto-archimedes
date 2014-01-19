var app = require("../../index"),
  assert = require("assert"),
  request = require("supertest");

var route = {
  path: "/tier/",
  collection: "tiers"
};

describe("Tier", function() {
  describe("POST " + route.path, function() {

    var loadedTier = {
      _id: '52d436dfcdf742900d220b7a'
    }

    var new_tier = {
      title: 'Galaxy',
      _id: '52cdd0dbf930a97e28363d52'
    }


    var childTier = {
      parent: '52cdd0dbf930a97e28363d52',
      title: 'Earth',
      _id: '52cdd0dbf930a97e28363d59'
    }

    it("should add a tier", function(done) {
      request(app)
        .post('/tier/add')
        .send(new_tier)
        .expect('Content-Type', /json/)
        .expect(200)
        .end(function(err, res) {
          assert.equal(res.body.title, "Galaxy");
          done();
        })
    });



    it("should add same tier and throw 500", function(done) {
      request(app)
        .post("/tier/add")
        .send(new_tier)
        .expect('Content-Type', /json/)
        .expect(500, done)

    });



    it("should add a child tier to student tier", function(done) {

      request(app)
        .post('/tier/add')
        .send(childTier)
        .expect('Content-Type', /json/)
        .expect(200)
        .end(function(err, res) {

          assert.equal(res.body.title, 'Earth');
          done();
        })
    });


    it("should find a tier", function(done) {
      request(app)
        .get('/tier/52cdd0dbf930a97e28363d52')
        .expect('Content-Type', /json/)
        .expect(200)
        .end(function(err, res) {
          assert.equal(res.body.title, 'Galaxy');
          done();
        })
    });


    it("should list tiers children and count users", function(done) {

      request(app)
        .post('/tier/list_children_and_count_users')
        .send(loadedTier)
        .expect('Content-Type', /json/)
        .expect(200)
        .end(function(err, res) {

          assert.equal(err, null);
          done();
        })

    });

    it("should remove a tier", function(done) {

      request(app)
        .post('/tier/remove').send(new_tier)
        .expect('Content-Type', /json/)
        .expect(200, done)
    });


    it("should remove child tier", function(done) {

      request(app)
        .post('/tier/remove').send(childTier)
        .expect('Content-Type', /json/)
        .expect(200)
        .end(function(err, res) {
          assert.equal(err, null);
          done();
        })

    });

  });
});