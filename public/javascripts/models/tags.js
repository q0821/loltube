'use strict';
/*
 * Setup
 */
var app = app || {};


/*
 * Models & Collections
 */
app.Tag = Backbone.Model.extend({
  urlRoot: '/api/tags',
  idAttribute: '_id',
  defaults: {
    active: true,
    name: ''
  },
  initialize: function(){
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
  }
});

app.TagCollection = Backbone.Collection.extend({
  model: app.Tag, 
  initialize: function(){
    this.page = 1;
    this.perPage = 50;
    this.order = '-_id';
  },
  url: function(){
    //return '/api/tags/page/' + this.page + '/order/' + this.order;
    return '/api/tags';
  }
});   

app.Tags = Backbone.PageableCollection.extend({
  model: app.Took,
  url: '/api/tags'
});


