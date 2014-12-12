'use strict';

var app = app || {};

/*
 * Models & Collections
 */

app.Item = Backbone.Model.extend({
  urlRoot: '/api/items',
  defaults: {
    // data from server
    
    itemName: '',
    lastModifier: '',
    lastModified: '',
    published: false,
    active: true,

    // only within client
    lastModifiedLocale: ''
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
      this.set(attr+'Locale', dateString);
    } else {
      this.set(attr, '');
    }
  },

  validate: function(attrs, option){}

});

app.ItemCollection = Backbone.Collection.extend({
  model: app.Item,
  url: '/api/items'
});
