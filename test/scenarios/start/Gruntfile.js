module.exports = function(grunt) {
  // Add our custom tasks.
  grunt.loadTasks('../../../tasks');

  // Project configuration.
  grunt.initConfig({
    zaproxyStart: {
      options: {
        port: 8080
      }
    }
  });
  // Default task.
  grunt.registerTask('default', ['zaproxyStart']);
};