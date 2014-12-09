'use strict';
var app = app || {};

/*
 * Views
 */
app.AccountView = Backbone.View.extend({
  tagName: 'tr',

  initialize: function(){
    this.template = _.template($('#tmplAccount').html());
    this.listenTo(this.model, 'change', this.update);
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
  },

  update: function(){
    var content = this.model.toJSON();
    content.index = this.index;
    this.$el.html(this.template(content));
  }

});

app.AccountListView = Backbone.View.extend({
  initialize: function(){
    this.$body = this.$el.find('tbody');
    this.$selectAll = this.$el.find('#selectAll');
    this.recycleMode = false;
    this.onlyAdmin = false;
    this.filterText = '';
    this.order = 'created';
    this.collection = new app.AccountCollection();
    this.renderCollection = new app.AccountCollection();
    this.listenTo(this.collection, 'add reset sort remove', this.render);
    this.collection.fetch({reset: true});
  },

  events: {
    'click .reorder': 'reorder',
    'click #selectAll': 'selectAll'
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
    this.$selectAll.prop('checked', false);
    this.recycleMode = !this.recycleMode;
    $('#newBtn').prop('disabled', this.recycleMode);
    if(this.recycleMode)
      this.collection.url = '/api/accounts/recycle';
    else
      this.collection.url = '/api/accounts';
    this.collection.fetch({reset:true});
  },

  // toggle the admin/all accounts
  onlyAdminToggle: function() {
    this.$selectAll.prop('checked', false);
    this.onlyAdmin = !this.onlyAdmin;
    this.render();
  },

  filter: function(filterText){
    this.$selectAll.prop('checked', false);
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
  addOne: function(account){
    this.collection.add(account,{at: 0});
  },

  selectAll: function(e){
    var checks = this.$el.find('input[name="index[]"]');
    var isSelect = e.currentTarget.checked;
    console.log(isSelect);
    checks.each(function(index){
      $(this).prop('checked', isSelect);
    });
  },

/*             
  copy: function(){
    console.log('going to copy');    
    var self = this;
    var selected = this.$el.find('input[name="index[]"]:checked');
    selected.each(function(index){
      var id = $(this).val();
      var copy = new app.Account(self.collection.get(id).attributes);
      copy.unset('_id');
      copy.save({},{
        success: function(model, res){
          
        },
        error: function(model, res){
          console.log('error');
          console.log('');
        }  
      })
    });
  },
*/

  remove: function(){
    var self = this;
    var selected = this.$el.find('input[name="index[]"]:checked');
    var isSuccess = true;
    if(this.recycleMode){
      // in the recycleMode, account would be deleted
      selected.each(function(index){
        var id = $(this).val();
        var account = self.collection.get(id);
        account.destroy({
          success: function(model, res){
            self.collection.remove(model);
            app.messageBoxView.model.set({
              type: 'success',
              title: 'SUCCESS',
              content: 'Remove account: <strong><u>' + model.get('username') + '</u></strong> success'
            })
          },
          error: function(model, res){
            isSuccess = false;
            app.messageBoxView.model.set({
              type: 'danger',
              title: 'ERROR',
              content: res.responseText
            })
          }  
        });
        return isSuccess;
      });
    } else {
      // without the recycleMode, account would be unactive
      selected.each(function(index){
        var id = $(this).val();
        var account = self.collection.get(id);
        account.save({active: false}, {
          success: function(model, res){
            self.collection.remove(model);
            app.messageBoxView.model.set({
              type: 'success',
              title: 'SUCCESS',
              content: 'Unactive accounts: <strong><u>' + model.get('username') + '</u></strong> success'
            })
          },
          error: function(model, res){
            isSuccess = false
            app.messageBoxView.model.set({
              type: 'danger',
              title: 'ERROR',
              content: res.responseText
            })
          }  
        });
        return isSuccess;
      });
    }
  }
});


app.AccountToolbarView = Backbone.View.extend({
  initialize: function(){
    this.recycleMode = false;
  },

  events: {
    'click #recycleToggle': 'recycleToggle',
    'click #onlyAdminToggle': 'onlyAdminToggle',
    'click #newBtn': 'add',
    'click #removeBtn': 'remove',
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
  },

  add: function(){
    var newUserName = this.$el.find('#filter').val()
    var newAccount = new app.Account({ username: newUserName });
    app.accountEditView.render('新增帳號', newAccount);
    $('#filter').val('');
    this.filter();
  },

  remove: function(){
    app.accountListView.remove();
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
      password:   this.$password.val()
    });
    this.edittingModel.save({},{
      success: function(account, res){
        app.accountListView.addOne(new app.Account(account.attributes));
        app.messageBoxView.model.set({
          type: 'success',
          title: 'SUCCESS',
          content: 'Edit account: <strong><u>' + account.get('username') + '</u></strong> success',
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
