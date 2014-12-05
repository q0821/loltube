'use strict';

var app = app || {};

/*
 * Models & Collections
 */

app.Account = Backbone.Model.extend({
  urlRoot: '/api/accounts',
  defaults: {
    realname: '',
    username: '',     //use for login
    email: '',
    created: '',
    lastLogin: '',
    lastModifier: '',
    lastModified: '',
    permission: 0,
    password: ''
  },

  idAttribute: '_id',

  initialize: function(){
    this.toLocaleTime('lastLogin');
    this.toLocaleTime('lastModified');
  },

  toLocaleTime: function(attr){
    if(this.get(attr) && this.get(attr).length > 0){
      var time = new Date(this.get(attr));
      var hours = time.getHours();
      var minutes = time.getMinutes();
      if(hours < 10) 
        hours = '0' + hours;
      if(minutes < 10) 
        minutes = '0' + minutes;
      var dateString = time.toLocaleDateString() + ' ' + hours + ':' + minutes;
      this.set(attr, dateString);
    } else {
      this.set(attr, '');
    }
  },

  validate: function(attrs, option){}

});

app.AccountCollection = Backbone.Collection.extend({
  model: app.Account,
  url: '/api/accounts'
});
