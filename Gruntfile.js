module.exports = function(grunt) {
  require('load-grunt-tasks')(grunt);
  grunt.initConfig({
    // Configure a mochaTest task
    mochaTest: {
      test: {
        options: {
          reporter: 'spec'
        },
        src: ['test/**/*.js']
      }
    },
    watch: {
      options: {
        livereload: true,
      },
      express: {
        files:  [ '*.js','routes/*.js', 'models/*.js', 'config/*.js','api/*.js'  ],
        tasks:  [ 'express:dev' ],
        options: {
          spawn: false // Without this option specified express won't be reloaded
        }
      }
    },
    express: {
      options: {
        port : 3000,
        node_env: 'development'
      },
      dev: {
        options: {
          script: 'app.js',
          node_env: 'development'
        }
      },
      prod: {
        options: {
          script: 'app.js',
          node_env: 'production'
        }
      }
    },
    open: {
      server: {
        url: 'http://localhost:' + grunt.config.get('express.options.port')
      }
    },
    jsdoc : {
        dist : {
            src: ['*.js','routes/*.js', 'models/*.js', 'config/*.js','api/*.js', 'README.md'],
            options: {
                destination : 'documentation',
                   template : "node_modules/ink-docstrap/template",
                  configure : "node_modules/ink-docstrap/template/jsdoc.conf.json"
            }
        }
    }
  });

  grunt.registerTask('test', 'mochaTest');

  grunt.registerTask('server', function(arg) {
    if(arg && arg == 'prod')
    {
      grunt.task.run([
        'express:prod',
        //'open',
        'watch'
      ]);
    }
    else
    {
      grunt.task.run([
        'express:dev',
        //'open',
        'watch'
      ]);
    }
  });

  grunt.registerTask('default', [ 
    'test',
    'jsdoc' 
    ]);

  grunt.registerTask('serve', [ 
    'server', 
    'jsdoc' 
    ]);
  grunt.registerTask('dist', [ 
    'server:prod', 
    'jsdoc' ]);
    };
