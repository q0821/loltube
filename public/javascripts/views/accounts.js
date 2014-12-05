'use strict';
var app = app || {};

/*
 * Views
 */
app.AccountView = Backbone.View.extend({
  tagName: 'tr',

  initialize: function(){
    this.template = _.template($('#tmplAccount').html());
    this.listenTo(this.model, 'update', this.render);
  },

  events: {
    'click .edit' : 'edit'
  },

  render: function(index){
    var content = this.model.toJSON();
    if(index) {
      this.index = index;
      content.index = index;
    }
    this.$el.html(this.template(content));
    return this;
  },

  edit: function(){
    app.accountEditView.render('編輯帳號', this.model);
  }
/*
  update: function(){
    this.$el.html(this.template(this.model.toJSON));
  }
*/
});

app.AccountListView = Backbone.View.extend({
  initialize: function(){
    this.$body = this.$el.find('tbody');
    this.recycleMode = false;
    this.onlyAdmin = false;
    this.filterText = '';
    this.order = 'created';
    this.collection = new app.AccountCollection();
    this.renderCollection = new app.AccountCollection();
    this.listenTo(this.collection, 'add reset sort', this.render);
    this.collection.fetch({reset: true});
  },

  events: {
    'click .reorder': 'reorder'
  },

  // render all items in the collection
  render: function(){
    var self = this;
    this.$body.empty();
    var renderArray = this.collection.filter(function(account){
      if(self.onlyAdmin && account.get('permission') < 1)
        return false;
      return account.get('username').indexOf(self.filterText ,0) > -1 || account.get('realname').indexOf(self.filterText, 0) > -1;
    });
    renderArray.forEach(function(account, index){
        var view = new app.AccountView({model: account});
        self.$body.append( view.render(index+1).el );
    });
  },

  // toggle the active/inactive accounts
  recycleToggle: function() {
    this.recycleMode = !this.recycleMode;
    if(this.recycleMode)
      this.collection.url = '/api/accounts/recycle';
    else
      this.collection.url = '/api/accounts';
    this.collection.fetch({reset:true});
  },

  // toggle the admin/all accounts
  onlyAdminToggle: function() {
    this.onlyAdmin = !this.onlyAdmin;
    this.render();
  },

  filter: function(filterText){
    this.filterText = filterText;
    this.render();
  },

  reorder: function(e){
    console.log('reorder');
    var newOrder = $(e.currentTarget).data('by');
    var reverser;
    if(this.order === newOrder){
      this.order = -newOrder;
      reverser = -1;
    } else {
      this.order = newOrder;
      reverser = 1;
    }
    this.collection.comparator = function(modelA, modelB){
      if(modelA.get(newOrder).toLowerCase() == modelB.get(newOrder).toLowerCase())
        return 0;
      return modelA.get(newOrder).toLowerCase() > modelB.get(newOrder).toLowerCase() ? reverser : -reverser;
    }
    this.collection.sort();
  },
    
  // When after a successful edit, call this function to check if this 
  // edited account a new account or an exist account. If new, add it
  // into the collection.
  save: function(account){
    this.collection.add(account,{at: 0});
  }

});

app.AccountEditView = Backbone.View.extend({
  initialize: function(){
    this.template = _.template($('#tmplEditBox').html())
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
    this.edittingModel.set({
      realname:   this.$editBody.find('#realname').val(),
      username:   this.$editBody.find('#username').val(),
      email:      this.$editBody.find('#email').val(),
      permission: this.$editBody.find('#permission').val(),
      password:   this.$password.val(),
      active:     true
    });
    this.edittingModel.save({},{
      success: function(account, res){
        app.accountListView.save(new app.Account(account.attributes));
        app.messageBoxView.model.set({
          type: 'success',
          title: 'SUCCESS',
          content: 'Add a new account: ' + account.get('username') + ' success',
          undoable: false
        })
      },
      error: function(account, res){
        app.messageBoxView.model.set({
          type: 'danger',
          title: 'Error',
          content: res.responseText,
          undoable: false
        });
      } 
    });
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
    $('#filter').val('');
    this.filter();
  },

  filter: function(){
    app.accountListView.filter($('#filter').val());
  }
})
