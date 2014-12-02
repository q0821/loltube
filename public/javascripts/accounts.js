'use strict';

var app = app || {};

/*
 * Models & Collections
 */

app.Account = Backbone.Model.extend({
  urlRoot: '/api/accounts',
  defaults: {
    username: '',
    password: '',
    created: '',
    lastLogin: '',
    lastModifier: '',
    lastModified: ''
  },

  idAttribute: '_id',

  initialize: function(){
    this.toLocaleTime('lastLogin');
    //this.toLocaleTime('lastModified');
  },

  toLocaleTime: function(attr){
    if(this.has(attr)){
      var time = new Date(this.get(attr));
      var hours = time.getHours();
      var minutes = time.getMinutes();
      if(hours < 10) 
        hours = '0' + hours;
      if(minutes < 10) 
        minutes = '0' + minutes;
      var dateString = time.toLocaleDateString() + ' ' + hours + ':' + minutes;
      this.set(attr, dateString);
    }
  },

  validate: function(attrs, option){}

});

app.AccountCollection = Backbone.Collection.extend({
  model: app.Account,
  url: '/api/accounts'
});

/*
 * Views
 */

app.AccountView = Backbone.View.extend({
  render: function(index){
    var content = this.model.toJSON();
    if(index)
      content.index = index;
    return this.template(content);
  },
  initialize: function(){
    this.template = _.template($('#tmplAccount').html());
  }
});

app.AccountListView = Backbone.View.extend({
  initialize: function(){
    this.collection = new app.AccountCollection();
    this.listenTo(this.collection, 'add', this.addOne);
    this.listenTo(this.collection, 'reset', this.addAll);
    this.collection.fetch({reset: true});
  },

  // add an item on the top of the list
  addOne: function(item, index){
    var view = new app.AccountView({model: item});
    var content = view.render(index+1);
    this.$el.prepend( content );
  },

  // reset all items in the view
  addAll: function(){
    this.$el.empty();
    this.collection.each(this.addOne, this);
  }
});

/*
 * Setup
 */
$(document).ready(function(){
  app.accountListView = new app.AccountListView({
    el: '#accountList'
  });
});
