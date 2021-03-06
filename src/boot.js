"use strict";

var _ = require("underscore");

// Creates a Substance instance
var boot = function() {

  // create a clone of the provided module as we store data into it
  var Substance = _.clone(require("./substance.js"));

  var SandboxController = require("./controllers/sandbox_controller");
  var SandboxView = require("./views/sandbox");
  var Keyboard = Substance.Commander.Keyboard;

  var Backbone = require("../lib/backbone");

  var html = Substance.util.html;

  // Compile templates
  html.compileTemplate('test_center');
  html.compileTemplate('test_report');

  Substance.client_type = 'browser';
  Substance.env = 'development';

  // Initialization
  // -----------------

  // Main Application controller
  Substance.app = new SandboxController(Substance.env);

  Substance.appView = Substance.app.view;

  // Substance.app

  // Start the engines
  // Substance.appView = new SandboxView(Substance.app);


  $('body').html(Substance.appView.render().el);

  // Setup router (talks to the main app controller)
  Backbone.history.start();

  // Preliminary keyboard configuration stuff...
  // TODO: discuss where this should be placed...
  // e.g., could be an optional configuration for the session itself

  var keyboard = new Keyboard(Substance.app);

  Substance.app.on("state-changed", keyboard.stateChanged, keyboard);

  // TODO: it would be nice to add a built-in handler for handling 'typed text'
  // and use it in a declarative way e.g.:
  // {"command": "write", keys: "typed-text" }
  keyboard.setDefaultHandler("sandbox.editor.writer", function(character, modifiers, e) {
    if (e.type === "keypress") {
      var str = null;

      // TODO: try to find out which is the best way to detect typed characters
      str = String.fromCharCode(e.charCode);

      if (e.charCode !== 0  && !e.ctrlKey && str !== null && str.length > 0) {
        // TODO: consume the event
        e.preventDefault();
        return {command: "write", args: [str]};
      }
    }
    return false;
  });

  keyboard.set('TRIGGER_PREFIX_COMBOS', true);

  var keymap = require("../config/default.keymap.json");
  if (global.navigator !== undefined) {
    var platform = global.navigator.platform;
    if (platform.toLowerCase().search("linux") >= 0) {
      keymap = require("../config/linux.keymap.json");
    }
    else if (platform.toLowerCase().search("win32") >= 0) {
      keymap = require("../config/windows.keymap.json");
    }
  }

  keyboard.registerBindings(keymap);

  Substance.app.keyboard = keyboard;

  return Substance;
};

module.exports = boot;
