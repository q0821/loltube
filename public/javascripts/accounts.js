'use strict';
var app = app || {};

/*
 * Setup
 */
$(document).ready(function(){
  app.accountListView = new app.AccountListView({ 
    el: '#contentTable' 
  });
  app.accountEditView = new app.AccountEditView({
    el: '#editBox',
  });
  app.accountToolbarView = new app.AccountToolbarView({
    el: '#toolbar'
  });
  app.messageBoxView = new app.MessageBoxView({ 
    el: '#messageBox'
  });
});
