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
    permission: 0
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
    app.accountEditView.render('編輯帳號', this.model);
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
    this.listenTo(this.collection, 'add reset sort', this.render);
    this.collection.fetch({reset: true});
  },

  events: {
  },

  // render all items in the collection
  render: function(){
    var self = this;
    this.$el.empty();
    var renderArray = this.collection.filter(function(account){
      if(self.onlyAdmin && account.get('permission') < 0)
        return false;
      return account.get('username').indexOf(self.filterText ,0) > -1 || account.get('realname').indexOf(self.filterText, 0) > -1;
    });
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
    this.template = _.template($('#tmplEditBox').html());
    this.$editTitle = this.$el.find('#editTitle');
    this.$editBody = this.$el.find('#editBody');
    this.$password = this.$el.find('#password');
    this.$confirm = this.$el.find('#confirm');
  },
  events: {
    'click #save': 'save'
  },
  render: function(title, accountModel){
    if(this.edittingModel != accountModel){
      this.edittingModel = accountModel;
      this.$editTitle.html(title);
      this.$editBody.html(this.template(accountModel.toJSON()));
      this.$el.find('#permission').val(this.edittingModel.get('permission'));
    }
    this.$password.val('');
    this.$confirm.val('');
    
  },
  save: function(){
    alert('save model: ' + this.model.get('username'));
  }
});

app.AccountToolbarView = Backbone.View.extend({
  events: {
    'click #recycleToggle': 'recycleToggle',
    'click #onlyAdminToggle': 'onlyAdminToggle',
    'click #newBtn': 'addAccount',
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

  addAccount: function(){
    var newAccount = new app.Account({ username: $('#filter').val() });
    app.accountEditView.render('新增帳號', newAccount);
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
  app.accountEditView = new app.AccountEditView({ el: '#editBox'});
  app.accountToolbarView = new app.AccountToolbarView({el: '#toolbar'});
  app.messageBoxView = new app.MessageBoxView({ el: '#messageBox'});
});
