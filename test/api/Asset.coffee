app = require "../../index"

assert = require "assert"
request = require "supertest"

# Route settings
route =
  path: "/asset/"
  collection: "assets"

# Setup helper functions
createAndTest = require("../helpers").createAndTestFrom(route.collection)
remove = require("../helpers").removeFrom(route.collection)

# Data for tests
invalidId = "000000000000000000000000"
assetSeed =
  s3: { s3Signature: "stuff" }

describe "Asset", ->
  describe "GET " + route.path, ->
    it "should return an array of all objects", (done) ->
      createAndTest assetSeed, (asset) ->
        request(app)
          .get(route.path)
          .expect("Content-Type", /json/)
          .expect(200)
          .end (err, res) ->
            isInList = JSON.parse(res.text).some (c) ->
              c._id.toString() == asset._id.toString()
            assert.equal isInList, true
            remove asset
            done()

  describe "GET " + route.path + ":id", ->
    describe "when requesting with a valid id", ->
      it "should return the requested object", (done) ->
        createAndTest assetSeed, (asset) ->
          request(app)
            .get(route.path + asset._id)
            .expect("Content-Type", /json/)
            .expect(200)
            .end (err, res) ->
              result = JSON.parse(res.text)
              assert.equal result._id, asset._id
              remove asset
              done()
    describe "when requesting with an invalid id", ->
      it "should return 404", (done) ->
        request(app)
          .get(route.path + invalidId)
          .expect("Content-Type", /json/)
          .expect(404, done)

  describe "POST " + route.path, ->
    it "should respond 201 with the created object", (done) ->
      newAsset =
        s3: { s3Signature: "etc" }

      request(app)
        .post(route.path)
        .send(newAsset)
        .expect("Content-Type", /json/)
        .expect(201)
        .end (err, res) ->
          result = JSON.parse res.text
          assert.equal result.s3.s3Signature, newAsset.s3.s3Signature
          remove result
          done()

  describe "PUT " + route.path, ->
    updateAsset =
      s3: { s3Signature: "things" }

    describe "when updating an existing id", ->
      it "should update and respond with 200", (done) ->
        createAndTest assetSeed, (asset) ->
          request(app)
            .put(route.path + asset._id)
            .send(updateAsset)
            .expect(200)
            .end (err, res) ->
              result = JSON.parse res.text
              assert.equal result.title, updateAsset.title
              remove asset
              done()

    describe "when updating an invalid id", ->
      it "should respond with 404", (done) ->
        request(app)
          .put(route.path + invalidId)
          .send(updateAsset)
          .expect(404, done)

  describe "DELETE " + route.path + ":id", ->
    describe "when deleting an existing id", ->
      it "should respond with 204 and receive 404 upon searching the id",
        (done) ->
          createAndTest assetSeed, (asset) ->
            request(app)
              .del(route.path + asset._id)
              .expect(204)
              .end (err, res) ->
                request(app)
                  .get(route.path + asset._id)
                  .expect("Content-Type", /json/)
                  .expect(404)
                  .end (err, res) ->
                    remove asset
                    done()

    describe "when deleting an invlaid id", ->
      it "should respond with 404", (done) ->
        request(app)
          .del(route.path + invalidId)
          .expect("Content-Type", /json/)
          .expect(404, done)
