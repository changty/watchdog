module.exports = function(grunt) {

  // Project configuration.
  grunt.initConfig({
    pkg: grunt.file.readJSON('package.json'),
    wiredep: {
     
      task: {
     
        // Point to the files that should be updated when 
        // you run `grunt wiredep` 
        src: [
          'public/*.html',   // .html support... 
  	  'views/*.handlebars',
	  'views/layouts/*handlebars'
        ],
        
        options: {
          // See wiredep's configuration documentation for the options 
          // you may pass: 
     
          // https://github.com/taptapship/wiredep#configuration 
        }
      }
    }

  });
grunt.loadNpmTasks('grunt-wiredep');
};
