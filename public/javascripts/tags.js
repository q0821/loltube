'use strict';
/*
 * Setup
 */
var app = app || {};


/*
 * Bootup
 */
$(document).ready(function(){
  app.tagListView = new app.TagListView({
    el: '#contentTable' 
  });
  app.tagEditView = new app.TagEditView({
    el: '#editBox',
  });
  app.tagToolbarView = new app.TagToolbarView({
    el: '#toolbar'
  });
  app.messageBoxView = new app.MessageBoxView({ 
    el: '#messageBox'
  });
});

