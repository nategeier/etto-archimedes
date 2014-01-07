app = require "../../index"

assert = require "assert"
mongoose = require "mongoose"
request = require "supertest"

# Route Settings
route =
  path: "/course/"
  collection: "courses"

courseId = null
invalidId = "000000000000000000000000"

course =
  title: "Test Course"
  subtitle: "Test Subtitle"
  description: "Testing..."
  price: 10,
  blocks: [
    { type: "title", data: { title: "A Title.", subtitle: "A subtitle..." }},
    { type: "text", data: { text: "Stuff and things." }},
  ]

beforeEach (done) ->
  mongoose.connection.collections[route.collection].drop (err) ->
    mongoose.connection.collections[route.collection]
      .insert course, (err, docs) ->
        courseId = docs[0]._id
        done()

describe "Course", ->
  describe "GET " + route.path, ->
    it "should return an array of all objects", (done) ->
      request(app)
        .get(route.path)
        .expect("Content-Type", /json/)
        .expect(200)
        .end (err, res) ->
          result = JSON.parse(res.text)[0]
          assert.equal result._id, courseId
          assert.equal result.title, "Test Course"
          done()

  describe "GET " + route.path + ":id", ->
    describe "when requesting with a valid id", ->
      it "should return the requested object", (done) ->
        request(app)
          .get(route.path + courseId)
          .expect("Content-Type", /json/)
          .expect(200)
          .end (err, res) ->
            result = JSON.parse(res.text)
            assert.equal result._id, courseId
            done()
    describe "when requesting with an invalid id", ->
      it "should return 404", (done) ->
        request(app)
          .get(route.path + invalidId)
          .expect("Content-Type", /json/)
          .expect(404, done)

  describe "POST " + route.path, ->
    it "should respond 201 with the created object", (done) ->
      newCourse =
        title: "New Course"
        subtitle: "New Subtitle"
        description: "New..."
        price: 1

      request(app)
        .post(route.path)
        .send(newCourse)
        .expect("Content-Type", /json/)
        .expect(201)
        .end (err, res) ->
          result = JSON.parse res.text
          assert.equal result.title, newCourse.title
          done()

  describe "PUT " + route.path, ->
    updateCourse =
      title: "Updated Course"
      subtitle: "Updated Subtitle"
      description: "Updated..."
      price: 1000000

    describe "when updating an existing id", ->
      it "should update and respond with 200", (done) ->
        request(app)
          .put(route.path + courseId)
          .send(updateCourse)
          .expect(200)
          .end (err, res) ->
            result = JSON.parse res.text
            assert.equal result.title, updateCourse.title
            done()

    describe "when updating an invalid id", ->
      it "should respond with 404", (done) ->
        request(app)
          .put(route.path + invalidId)
          .send(updateCourse)
          .expect(404, done)

  describe "DELETE " + route.path + ":id", ->
    describe "when deleting an existing id", ->
      it "should respond with 204 and receive 404 upon searching the id",
        (done) ->
          request(app)
            .del(route.path + courseId)
            .expect(204)
            .end (err, res) ->
              request(app)
                .get(route.path + courseId)
                .expect("Content-Type", /json/)
                .expect(404, done)

    describe "when deleting an invlaid id", ->
      it "should respond with 404", (done) ->
        request(app)
          .del(route.path + invalidId)
          .expect("Content-Type", /json/)
          .expect(404, done)
