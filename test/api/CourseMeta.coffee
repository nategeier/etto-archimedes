app = require "../../index"

assert = require "assert"
mongoose = require "mongoose"
request = require "supertest"

id = null
invalidId = "52c888f3c664991234567890"

metadata =
  title: "Test Course"
  subtitle: "Test Subtitle"
  description: "Testing..."
  price: 10

beforeEach (done) ->
  mongoose.connection.collections["coursemetas"].drop (err) ->
    mongoose.connection.collections["coursemetas"]
      .insert metadata, (err, docs) ->
        id = docs[0]._id
        done()

describe "CourseMeta", ->
  describe "GET /coursemeta", ->
    it "should return an array of all CourseMeta objects", (done) ->
      request(app)
        .get("/coursemeta")
        .expect("Content-Type", /json/)
        .expect(200)
        .end (err, res) ->
          result = JSON.parse(res.text)[0]
          assert.equal result._id, id
          assert.equal result.title, "Test Course"
          done()

  describe "GET /coursemeta/:id", ->
    describe "when requesting with a valid id", ->
      it "should return the requested CourseMeta object", (done) ->
        request(app)
          .get("/coursemeta/" + id)
          .expect("Content-Type", /json/)
          .expect(200)
          .end (err, res) ->
            result = JSON.parse(res.text)
            assert.equal result._id, id
            done()
    describe "when requesting with an invalid id", ->
      it "should return 404", (done) ->
        request(app)
          .get("/coursemeta/" + invalidId)
          .expect("Content-Type", /json/)
          .expect(404, done)

  describe "POST /coursemeta", ->
    it "should respond 201 with the created object", (done) ->
      newMeta =
        title: "New Course"
        subtitle: "New Subtitle"
        description: "New..."
        price: 1

      request(app)
        .post("/coursemeta")
        .send(newMeta)
        .expect("Content-Type", /json/)
        .expect(201)
        .end (err, res) ->
          result = JSON.parse res.text
          assert.equal result.title, newMeta.title
          done()

  describe "PUT /coursemeta", ->
    updateMeta =
      title: "Updated Course"
      subtitle: "Updated Subtitle"
      description: "Updated..."
      price: 1000000

    describe "when updating an existing id", ->
      it "should update and respond with 200", (done) ->
        request(app)
          .put("/coursemeta/" + id)
          .send(updateMeta)
          .expect(200)
          .end (err, res) ->
            result = JSON.parse res.text
            assert.equal result.title, updateMeta.title
            done()

    describe "when updating an invalid id", ->
      it "should respond with 404", (done) ->
        request(app)
          .put("/coursemeta/" + invalidId)
          .send(updateMeta)
          .expect(404, done)

  describe "DELETE /coursemeta/:id", ->
    describe "when deleting an existing id", ->
      it "should respond with 204 and receive 404 upon searching the id",
        (done) ->
          request(app)
            .del("/coursemeta/" + id)
            .expect(204)
            .end (err, res) ->
              request(app)
                .get("/coursemeta/" + id)
                .expect("Content-Type", /json/)
                .expect(404, done)

    describe "when deleting an invlaid id", ->
      it "should respond with 404", (done) ->
        request(app)
          .del("/coursemeta/" + invalidId)
          .expect("Content-Type", /json/)
          .expect(404, done)
