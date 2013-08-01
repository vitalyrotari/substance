"use strict";

var Substance = require("../substance");
var Controller = Substance.Application.Controller;
var Document = Substance.Document;
var EditorView = require('../views/editor');
//var util = require('substance-util');


// Line Behavior Mixin
// -----------------
//

var addLineBehavior = function(selection, surface) {

  var __find__ = selection.find;
  var __set__ = selection.set;

  var verticalNav = false;
  var iniX;

  var getX = function (el) {
    var rect = el.getClientRects();
    return rect[0].left;
  };

  var getY = function (el) {
    var rect = el.getClientRects();
    return rect[0].top;
  };

  var getNodeElement = function(nodePos) {
    return surface.$('.nodes')[0].children[nodePos];
  };

  var getContent = function(nodePos) {
    var nodeEl = getNodeElement(nodePos);
    var content = nodeEl.children[0]; // [1] is the cursor div
    return content;
  };

  var getSpan = function(sel) {
    sel = sel || selection.getCursor();
    if (!sel) return;

    var content = getContent(sel[0]);
    var span = content.children[sel[1]];
    return span;
  };

  // Retrieves the current cursor position
  // --------
  // If there is no cursor it takes the sṕan of the given position
  var getCursorRect = function() {
    var el = surface.$('.cursor')[0];
    // if there is no cursor we try to find other ways
    //  - the span of the current char position
    //  - the current node
    if (!el) {
      // Get the element of the current position
      var pos = selection.getCursor();
      el = getSpan(pos);

      // this happens if we are at the end of a node or in an empty node
      if (!el) {
        if(pos[1] > 0) {
          // use the element for the previous position
          pos[1] -= 1;
          el = getSpan(pos);
        } else {
          // use the node element (~empty node)
          el = getNodeElement(pos[0]);
        }
      }
    }

    return el.getClientRects()[0];
  };

  // Expose as an API
  selection.getCursorRect = getCursorRect;

  var resetCursor = function() {
    if (selection.isNull()) return;
    var rect = getCursorRect();
    iniX = rect.left;
  };

  var upDown = function(pos, direction) {

    var newPos;
    var initialNodePos;
    var span;

    // return the first position if there is no selection yet.
    if (!pos) {
      return [0,0];
    }

    // we have to keep the initial node position
    // to detect the number of skipped nodes.
    initialNodePos = pos[0];

    // we take the absolute position of the cursor element as reference position
    var cursorRect = getCursorRect();

    var initialY = cursorRect.top;
    if (iniX === undefined) {
      iniX = cursorRect.left;
    }

    var lineSteps = 0;
    var lastY = initialY;

    while (true) {

      if (direction === "down") {
        // enter the next node and start iterating from left to right
        newPos = selection.nextChar(pos);
      } else {
        // enter the previous node and start iterating from right to left
        newPos = selection.prevChar(pos);
      }

      // Stop if we reach the end of document
      // or the end of the next node (not stepping over a whole node)
      if (newPos === pos || Math.abs(newPos[0]-initialNodePos) > 1) {
        break;
      }

      pos = newPos;
      span = getSpan(pos);

      // at the end of a node we won't get a span element for the position,
      // as the selection has an extra position after the last character
      if (!span) {
        continue;
      }

      var x = getX(span);
      var y = getY(span);

      if (y !== lastY) {
        lineSteps++;
        lastY = y;
      }

      if (lineSteps === 0) {
        continue;
      }

      if (direction === "down") {
        // only skip one line at once.
        // E.g, this happens when there are shorter wrapped lines than the one we started
        // As we have proceeded to the next line already we have to put the cursor one back
        if (lineSteps > 1) {
          pos = selection.prevChar(pos);
        }
        if (x >= iniX || lineSteps > 1) break;
      } else {
        // only skip one line at once.
        if (x <= iniX || lineSteps > 1) break;
      }
    }

    // As we haved stopped left to the reference position and the cursor gets rendered on the left side
    // of the current element, we need to put the position to the next char.
    // However, we do not do this at the begin of line and end of line (otherwise cursor gets rendered in the wrong row).

    if (direction === "up") {

      //var content = getContent(pos[0]);

      span = getSpan(pos);
      y = getY(span);

      var prevPos = selection.prevChar(pos);
      var prevSpan = getSpan(prevPos);
      var nextPos = selection.nextChar(pos);
      var nextSpan = getSpan(nextPos);

      var beginOfLine = (!prevSpan || (prevPos === pos) || getY(prevSpan) !== y);
      var endOfLine = ((nextPos === pos) || (nextSpan && getY(nextSpan) !== y));

      if (!beginOfLine && !endOfLine) {
        pos = nextPos;
      }
    }

    return pos;
  };

  

  selection.prevLine = function(pos) {
    return upDown(pos, 'up');
  };

  selection.nextLine = function(pos) {
    return upDown(pos, 'down');
  };

  selection.set = function(pos, direction, granularity) {

    __set__.call(this, pos, direction, granularity);

    // resetting the c
    if(!verticalNav) {
      resetCursor();
    }

    verticalNav = false;
  };

  selection.find = function(pos, direction, granularity) {
    if (granularity === "line") {

      // setting a flag that lets `selection.set` detect
      // whether the position was set after find('line')
      verticalNav = true;

      if (direction === "left") {
        return this.prevLine(pos);
      } else {
        return this.nextLine(pos);
      }
    } else {
      return __find__.call(this, pos, direction, granularity);
    }
  };
};


// Substance.Editor.Controller
// -----------------
//
// Controls the Editor.View

var EditorController = function(document) {

  // Private reference to the document
  this.__document = document;

  // Main controls
  this.on('show:comments', this.showComments);

};

EditorController.Prototype = function() {

  this.createView = function() {
    this.writer = new Document.Writer(this.__document);
    var view = new EditorView(this);
    this.view = view;
    var surface = view.surface;

    // Mixin Line behavior into selection object
    addLineBehavior(this.writer.selection, surface);
    return view;
  };


  // Assumes there is a view already
  // 

  this.toggleNodeInserter = function() {
    this.view.toggleNodeInserter();
  };


  // Transitions
  // ===================================

  this.showComments = function() {
    var that = this;

    this.comments = new Document.Comments.Controller();
    that.updateState('comments');
  };

  this.getActiveControllers = function() {
    var result = [];
    result.push(["editor", this]);
    result.push(["writer", this.writer]);
    // result = result.concat(this.comments.getActiveControllers());
    return result;
  };

};

EditorController.Prototype.prototype = Controller.prototype;
EditorController.prototype = new EditorController.Prototype();

module.exports = EditorController;
