'use strict';

var app = app || {};

/*
 * Models & Collections
 */

app.Account = Backbone.Model.extend({
  urlRoot: '/api/accounts',
  defaults: {
    username: '',
    created: '',
    lastLogin: '',
    lastModifier: '',
    lastModified: '',
    promission: 0
  },

  idAttribute: '_id',

  initialize: function(){
    this.toLocaleTime('lastLogin');
    this.toLocaleTime('lastModified');
  },

  toLocaleTime: function(attr){
    if(this.get(attr).length > 0){
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

  tagName: 'tr',

  initialize: function(){
    this.template = _.template($('#tmplAccount').html());
  },

  events: {
    'click .edit' : 'edit'
  },

  render: function(index){
    var content = this.model.toJSON();
    if(index) {
      content.index = index;
    }
    this.$el.html(this.template(content));
    return this;
  },

  edit: function(){
    var view = new app.AccountEditView({model: this.model});
  }
});

app.AccountListView = Backbone.View.extend({
  initialize: function(){
    this.recycleMode = false;
    this.onlyAdmin = false;
    this.filterText = '';
    this.order = '';
    this.collection = new app.AccountCollection();
    this.renderCollection = new app.AccountCollection();
    this.listenTo(this.collection, 'add reset', this.render);
    this.collection.fetch({reset: true});
  },

  events: {
  },

  // render all items in the collection
  render: function(){
    var self = this;
    this.$el.empty();
    var renderArray = this.collection.filter(function(account){
      var check = true;
      if(self.onlyAdmin)
        check = account.get('promission') < 0;
      check = check && account.get('username').indexOf(self.filterText ,0) > -1
      return check;
    });
    //this.renderCollection.reset(renderArray); 
    renderArray.forEach(function(account, index){
        var view = new app.AccountView({model: account});
        self.$el.append( view.render(index+1).el );
    });
  },

  // toggle the recycle/list mode
  recycleToggle: function() {
    this.recycleMode = !this.recycleMode;
    /*
    if(recycleMode)
      this.collection.url = '';
    else
      this.collection.url = '';
    this.collection.fetch({reset:true});
    */
  },

  onlyAdminToggle: function() {
    this.onlyAdmin = !this.onlyAdmin;
    this.render();
  },

  filter: function(filterText){
    this.filterText = filterText;
    this.render();
  }

});

app.AccountEditView = Backbone.View.extend({
  initialize: function(){
    this.render(this);
  },
  render: function(){
    alert(this.model.get('username'));
  }
});

app.ToolbarView = Backbone.View.extend({
  events: {
    'click #recycleToggle': 'recycleToggle',
    'click #onlyAdminToggle': 'onlyAdminToggle',
    'input #filter': 'filter'
  },

  recycleToggle: function(){
    $('#recycleToggle').toggleClass('active');
    app.accountListView.recycleToggle(); 
  },

  onlyAdminToggle: function(){
    $('#onlyAdminToggle').toggleClass('active');
    app.accountListView.onlyAdminToggle();
  },

  filter: function(){
    app.accountListView.filter($('#filter').val());
  }
})

/*
 * Setup
 */
$(document).ready(function(){
  app.accountListView = new app.AccountListView({ el: '#accountList' });
  app.toolbarView = new app.ToolbarView({el: '#toolbar'});
});
