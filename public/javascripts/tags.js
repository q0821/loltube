'use strict';
/*
 * Setup
 */
var app = app || {};


/*
 * Models
 */


/*
 * Views
 */
app.TagListView = Backbone.View.extend({
  el: '#tagList',
  events:{},
  get: function(){
    alert('get the tag list');
  },
  initialize: function(){
    this.get();
  }
});


/*
 * Bootup
 */
$(document).ready(function(){
  app.tagListView = new app.TagListView();    
});

