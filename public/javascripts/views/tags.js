'use strict';
/*
 * Setup
 */
var app = app || {};


/*
 * Views
 */
app.TagView = Backbone.View.extend({
  tagName: 'tr',

  initialize: function(){
    this.template = _.template($('#tmplTag').html());
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
    app.tagEditView.render('編輯帳號', this.model);
  },

  update: function(){
    var content = this.model.toJSON();
    content.index = this.index;
    this.$el.html(this.template(content));
  }

});

app.TagListView = Backbone.View.extend({
  initialize: function(){
    this.$body = this.$el.find('tbody');
    this.$selectAll = this.$el.find('#selectAll');
    this.recycleMode = false;
    this.filterText = '';
    this.order = '_id';
    this.collection = new app.TagCollection();
    this.renderCollection = new app.TagCollection();
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
    var renderArray = this.collection.filter(function(model){
      return model.get('name').indexOf(self.filterText ,0) > -1 ;
    });
    renderArray.forEach(function(model, index){
        var view = new app.TagView({model: model});
        self.$body.append( view.render(index+1).el );
    });
  },

  // toggle the active/inactive tags
  recycleToggle: function() {
    this.$selectAll.prop('checked', false);
    this.recycleMode = !this.recycleMode;
    $('#newBtn').prop('disabled', this.recycleMode);
    if(this.recycleMode)
      this.collection.url = '/api/tags/recycle';
    else
      this.collection.url = '/api/tags';
    this.collection.fetch({reset:true});
  },

  filter: function(filterText){
    this.$selectAll.prop('checked', false);
    this.filterText = filterText;
    this.render();
  },

  reorder: function(e){
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
  addOne: function(model){
    this.collection.add(model,{at: 0});
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

  recover: function(){
    var self = this;
    var selected = this.$el.find('input[name="index[]"]:checked');
    var isSuccess = true;
    selected.each(function(index){
      var id = $(this).val();
      var tag = self.collection.get(id);
      tag.save({active: true}, {
        success: function(model, res){
          self.collection.remove(model);
          app.messageBoxView.model.set({
            type: 'success',
            title: 'SUCCESS',
            content: 'Recover tags: <strong><u>' + model.get('username') + '</u></strong> success'
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

  },

  unactive: function(){
    var self = this;
    var selected = this.$el.find('input[name="index[]"]:checked');
    var isSuccess = true;
    selected.each(function(index){
      var id = $(this).val();
      var tag = self.collection.get(id);
      tag.save({active: false}, {
        success: function(model, res){
          self.collection.remove(model);
          app.messageBoxView.model.set({
            type: 'success',
            title: 'SUCCESS',
            content: 'Unactive tags: <strong><u>' + model.get('username') + '</u></strong> success'
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
  },

  remove: function(){
    var self = this;
    var selected = this.$el.find('input[name="index[]"]:checked');
    var isSuccess = true;
    selected.each(function(index){
      var id = $(this).val();
      var tag = self.collection.get(id);
      tag.destroy({
        success: function(model, res){
          self.collection.remove(model);
          app.messageBoxView.model.set({
            type: 'success',
            title: 'SUCCESS',
            content: 'Remove tags: <strong><u>' + model.get('username') + '</u></strong> success'
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
  }

});


app.TagToolbarView = Backbone.View.extend({
  initialize: function(){
    this.recycleMode = false;
  },

  events: {
    'click #recycleToggle': 'recycleToggle',
    'click #newBtn': 'add',
    'click #removeBtn': 'remove',
    'click #recoverBtn': 'recover',
    'input #filter': 'filter'
  },

  recycleToggle: function(){
    this.$el.find('#recycleToggle').toggleClass('active');
    this.$el.find('#recoverBtn').toggleClass('hide');
    this.$el.find('#recycleLabel').toggleClass('hide');
    this.recycleMode = !this.recycleMode;
    app.tagListView.recycleToggle(); 
  },

  filter: function(){
    app.tagListView.filter($('#filter').val());
  },

  add: function(){
    var newTagName = this.$el.find('#filter').val()
    var newTag = new app.Tag({ name: newTagName });
    app.tagEditView.render('新增Tag', newTag);
    $('#filter').val('');
    this.filter();
  },

  remove: function(){
    if(this.recycleMode)
      app.tagListView.remove();
    else
      app.tagListView.unactive();
  },

  recover: function(){
    app.tagListView.recover();
  }

});

app.TagEditView = Backbone.View.extend({
  initialize: function(){
    this.template = _.template($('#tmplEditBox').html())
    this.$editTitle = this.$el.find('#editTitle');
    this.$editBody = this.$el.find('#editBody');
    this.$confirm = this.$el.find('#confirm');
  },

  events: {
    'click #save': 'save'
  },

  render: function(title, tagModel){
    if(this.edittingModel != tagModel){
      this.edittingModel = tagModel;
      this.$editTitle.html(title);
      this.$editBody.html(this.template(tagModel.toJSON()));
    }
  },

  save: function(){
    this.edittingModel.set({
      name:   this.$editBody.find('#tagName').val(),
    });
    this.edittingModel.save({},{
      success: function(tag, res){
        app.tagListView.addOne(new app.Tag(tag.attributes));
        app.messageBoxView.model.set({
          type: 'success',
          title: 'SUCCESS',
          content: 'Edit tag: <strong><u>' + tag.get('name') + '</u></strong> success',
          undoable: false
        })
      },
      error: function(tag, res){
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
