app = require "../../index"

assert = require "assert"
request = require "supertest"



# Route settings
route =
  path: "/course/"
  collection: "courses"

# Setup helper functions
createAndTest = require("../helpers").createAndTestFrom(route.collection)
remove = require("../helpers").removeFrom(route.collection)
setup = require("../fixtures/testSetUp")

# Data for tests
invalidId = "000000000000000000000000"
courseSeed =
  title: "Test Course"
  subtitle: "Test Subtitle"
  description: "Testing..."
  price: 10,
  blocks: [
    { type: "title", data: { title: "A Title.", subtitle: "A subtitle..." }},
    { type: "text", data: { text: "Stuff and things." }},
  ]

describe "Course", ->
  describe "GET " + route.path, ->
    it "should return an array of all objects", (done) ->
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

  describe "GET " + route.path + "listCompanyCreatedCourses/:id", ->
    it "should return an array of all created courses", (done) ->
      request(app)
        .get(route.path + "listCompanyCreatedCourses/" + setup.parentTier._id)
        .expect(200)
        .end (err, res) ->
          console.log "ok sir", res.text
          done()


  describe "GET " + route.path + ":id", ->
    describe "when requesting with a valid id", ->
      it "should return the requested object", (done) ->
        createAndTest courseSeed, (course) ->
          request(app)
            .get(route.path + course._id)
            .expect("Content-Type", /json/)
            .expect(200)
            .end (err, res) ->
              result = JSON.parse(res.text)
              assert.equal result._id, course._id
              remove course
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
          remove result
          done()

  describe "PUT " + route.path, ->
    updateCourse =
      title: "Updated Course"
      subtitle: "Updated Subtitle"
      description: "Updated..."
      price: 1000000

    describe "when updating an existing id", ->
      it "should update and respond with 200", (done) ->
        createAndTest courseSeed, (course) ->
          request(app)
            .put(route.path + course._id)
            .send(updateCourse)
            .expect(200)
            .end (err, res) ->
              result = JSON.parse res.text
              assert.equal result.title, updateCourse.title
              remove course
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
          createAndTest courseSeed, (course) ->
            request(app)
              .del(route.path + course._id)
              .expect(204)
              .end (err, res) ->
                request(app)
                  .get(route.path + course._id)
                  .expect("Content-Type", /json/)
                  .expect(404)
                  .end (err, res) ->
                    remove course
                    done()

    describe "when deleting an invlaid id", ->
      it "should respond with 404", (done) ->
        request(app)
          .del(route.path + invalidId)
          .expect("Content-Type", /json/)
          .expect(404, done)
