app = require "../../index"

assert = require "assert"
request = require "supertest"

# Route settings
route =
  path: "/coursemeta/"
  collection: "courses"

# Setup helper functions
createAndTest = require("../helpers").createAndTestFrom(route.collection)
remove = require("../helpers").removeFrom(route.collection)

# Data for tests
invalidId = "000000000000000000000000"

courseSeed =
  title: "Test Course"
  subtitle: "Test Subtitle"
  description: "Testing..."
  price: 10

describe "CourseMeta", ->
  describe "GET " + route.path, ->
    it "should return an array of all CourseMeta objects", (done) ->
      createAndTest courseSeed, (course) ->
        request(app)
          .get(route.path)
          .expect("Content-Type", /json/)
          .expect(200)
          .end (err, res) ->
            isInList = JSON.parse(res.text).some (c) ->
              c._id.toString() == course._id.toString()

            assert.equal isInList, true
            remove course
            done()

  describe "GET " + route.path + ":id", ->
    describe "when requesting with a valid id", ->
      it "should return the requested CourseMeta object", (done) ->
        createAndTest courseSeed, (course) ->
          request(app)
            .get(route.path + course._id)
            .expect("Content-Type", /json/)
            .expect(200)
            .end (err, res) ->
              result = JSON.parse(res.text)
              assert.equal result._id, course._id
              done()

    describe "when requesting with an invalid id", ->
      it "should return 404", (done) ->
        request(app)
          .get(route.path + invalidId)
          .expect("Content-Type", /json/)
          .expect(404, done)

  describe "PUT " + route.path, ->
    updateMeta =
      title: "Updated Course"
      subtitle: "Updated Subtitle"
      description: "Updated..."
      price: 1000000

    describe "when updating an existing id", ->
      it "should update and respond with 200", (done) ->
        createAndTest courseSeed, (course) ->
          request(app)
            .put(route.path + course._id)
            .send(updateMeta)
            .expect(200)
            .end (err, res) ->
              result = JSON.parse res.text
              assert.equal result.title, updateMeta.title
              remove course
              done()

    describe "when updating an invalid id", ->
      it "should respond with 404", (done) ->
        request(app)
          .put(route.path + invalidId)
          .send(updateMeta)
          .expect(404, done)
