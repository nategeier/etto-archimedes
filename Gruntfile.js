"use strict";
var LIVERELOAD_PORT = 35731;
var lrSnippet = require("connect-livereload")({
  port: LIVERELOAD_PORT
});
var mountFolder = function (connect, dir) {
  return connect.static(require("path").resolve(dir));
};

module.exports = function (grunt) {
  require("load-grunt-tasks")(grunt);
  require("time-grunt")(grunt);

  grunt.initConfig({
    env: {
      development: {
        NODE_ENV: "development",
      },
      test: {
        NODE_ENV: "test",
      },
      production: {
        NODE_ENV: "production",
      },
    },
    _watch: {
      js: {
        options: {
          spawn: false,
        },
        files: ["lib/**/*.js", "test/**/*.{coffee,js}"],
        tasks: ["mochaTest"],
      },
      dox: {
        options: {
          livereload: LIVERELOAD_PORT
        },
        files: [
          "lib/**/*.js",
        ],
        tasks: ["dox"],
      },
    },
    mochaTest: {
      test: {
        options: {
          reporter: "spec",
          ui: "bdd",
          clearRequireCache: true,
          require: [],
        },
        src: ["test/**/*.{coffee,js}"],
      },
    },
    dox: {
      options: {
        template: "dox/views/template.jade",
      },
      files: {
        src: ["lib/"],
        dest: "docs",
      },
    },
    jshint: {
      options: grunt.util._.defaults({
        // Ignore these outside of an editor
        "unused": false,
        "camelcase": false,
      }, grunt.file.readJSON(".jshintrc")),
      all: [
        "Gruntfile.js",
        "lib/**/*.js",
      ],
    },
    jsbeautifier: {
      modify: {
        src: ["Gruntfile.js", "lib/**/*.js"],
        options: {
          config: ".jsbeautifyrc"
        }
      },
      verify: {
        src: ["Gruntfile.js", "lib/**/*.js"],
        options: {
          mode: "VERIFY_ONLY",
          config: ".jsbeautifyrc",
        }
      }
    },
    connect: {
      options: {
        hostname: "0.0.0.0",
      },
      dox: {
        options: {
          port: 8080,
          middleware: function (connect) {
            return [
              lrSnippet,
              mountFolder(connect, "docs"),
            ];
          },
        },
      },
    },
  });

  // Rename watch task so the environment can be changed to `test` before watching
  grunt.renameTask("watch", "_watch");
  grunt.registerTask("watch", ["env:test", "_watch"]);

  grunt.registerTask("serve", function (target) {
    if (target === "dox") {
      return grunt.task.run([
        "dox",
        "connect:dox",
        "_watch:dox",
      ]);
    }
  });

  grunt.registerTask("default", ["env:test", "jshint", "jsbeautifier:verify", "mochaTest"]);
};
