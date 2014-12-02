'use strict';
/*
 * Setup
 */
var app = app || {};


/*
 * Models & Collections
 */
app.MessageModel = Backbone.Model.extend({
  defaults:{    
    message: {
      type: 'success',
      title: 'INITIAL',
      content: 'init success'
    },
    undoable: false
  }  
});

app.TagModel = Backbone.Model.extend({
  urlRoot: '/api/tags',
  idAttribute: '_id',
  defaults: {
    name: 'default name',
    lastModifier: '',
    lastModified: Date.now()
  },
  validate: function(attrs, option){
    //return '已存在相同名稱的Tag: ' + attrs.name;
  },
  initialize: function(){
    this.bind('invalid', function(model, error){
      app.tagView.messageModel.set('message', { 
        type: 'danger',
        title: 'ERROR',
        content: error
      });
    });
  }
});

app.TagCollection = Backbone.Collection.extend({
  model: app.TagModel, 
  url: '/api/tags',
  initialize: function(){
    this.lastOrder = '';
    this.url = '/api/tags';
  }
});   

/*
 * Views
 */
app.TagView = Backbone.View.extend({
  el: '#tagContainer',
  events:{
    'click #newTagBtn': 'addNewTag',
    'click .reorder': 'reorder',
    'click .editTag': 'editTag',
    'click #delTag': 'delTag',
    'click #unactiveTag': 'unactiveTag',
    'click #undo': 'undo',
    'click #recycleMode': 'recycleMode',
    'click #init': 'initialize',
    'input #newTagName': 'filter'
  },
  filter: function(){
    var filter = this.$el.find('#newTagName').val();
    this.collection.reset(this.oriCollection.filter(function(tag){
      return tag.get('name').indexOf(filter,0)>-1 || tag.get('lastModifier').indexOf(filter,0)>-1;
    }));
  },
  undo: function(){
    var self = this;
    this.undoCollection.models.forEach(function(undoTag){
      undoTag.save().done(function(){
        self.collection.unshift(undoTag);
        self.oriCollection.unshift(undoTag);
      })
    });
    this.messageModel.set({
      message: {
        type: 'success', 
        title: 'SUCCESS',
        content: 'Undo a delete command'
      },
      undoable: false
    });
  },
  recycleMode: function(){
    this.recycleMode = true;
    var self = this;
    this.collection.reset();
    this.collection.url = '/api/tags/recycle';
    this.collection.fetch({
      success: function(){
        self.render();     
      },
      error: function(){

      }
    });
  },
  addNewTag: function(){
    var self = this;
    var newTag = new app.TagModel();
    newTag.save({
      name: this.$el.find('#newTagName').val(),
      lastModified: Date.now()
    },{ 
      success: function(tag, res){
        self.collection.unshift(tag);
        self.oriCollection.unshift(tag);
        self.messageModel.set({
          message: {
            type: 'success', 
            title: 'SUCCESS',
            content: 'Add a new tag <strong><u>' + tag.get('name') + '</u></strong>'
          },
          undoable: false
        });
        self.$el.find('#newTagName').val('');
        self.filter();
      }, 
      error: function(model, res, option){
        self.messageModel.set({
          message: { 
            type: 'danger',
            title: 'ERROR',
            content: res.responseText
          },
          undoable: false
        });
      }     
    });
  },
  editTag: function(e){
    var edittingID = $(e.currentTarget).data('id');
    alert('editting ' + this.collection.get(edittingID).get('name'));
  },
  unactiveTag: function(){
    this.undoCollection.reset();
    var self = this;
    var checks = this.$el.find('input[name="index[]"]:checked');
    var unactiveList = [];
    var errorList = [];

    checks.each(function(){
      var tag = self.collection.get($(this).val());
      if(tag){
        tag.save({active: false}, {
          success: function(tag, res){
            self.undoCollection.add(tag);
            unactiveList.push(tag.get('name'));
          },
          error: function(tag, res){
            errorList.push(tag.get('name'));
          }
        });
      } else {
        errorList.push($(this).val());
      }
    });

    var returnMessage = ''
    if(unactiveList.length > 0){
      returnMessage = 'Unactive: <strong><u>' + unactiveList.join(', ') + '</strong></u>.';
    } 
    if(errorList.length > 0){
      returnMessage += 'Error with: <strong><u>' + errorList.join(', ') + '</strong></u>.';
    }
    self.messageModel.set({
      message: { 
        type: errorList.length>0? 'danger':'warning', 
        title: 'Warning',
        content: returnMessage
      },
      undoable: true
    });

  },
  delTag: function(){
    this.undoCollection.reset();
    var self = this;
    var del = this.$el.find('input[name="index[]"]:checked');
    var isSuccess = true;
    var deletingTag;
    var deletedTagList = [];
    del.each(function(){
      deletingTag = self.collection.get($(this).val());
      if(deletingTag){
        deletingTag.destroy({
          success: function(model, res){
            self.undoCollection.add(model);
            /*
            self.messageModel.set({
              message: { 
                type:'warning', 
                title: 'Warning',
                content: 'Delete the tag: <strong><u>' + model.get('name') + '</strong></u>'
              },
              undoable: true
            });
            */
          },
          error: function(model, res){
            isSuccess = false;
            /*
            self.messageModel.set({
              message: { 
                type:'danger', 
                title: 'ERROR',
                content:'Error while deleting tag: <strong><u>' + model.get('name') + '</strong></u> Res: ' + res.responseText
              },
              undoable: false
            });
            */
          }
        });
      } else {
        isSuccess = false;
        self.messageModel.set('message', { 
          type:'danger', 
          title: 'ERROR',
          content:'Error with deleting tags'
        });
      }
      return isSuccess;
    });
  },
  reorder: function(e){
    var newComparator = $(e.currentTarget).data('by');
    var reverser;
    if(this.collection.lastOrder === newComparator){
      this.collection.lastOrder = -newComparator;
      reverser = -1;
    } else {
      this.collection.lastOrder = newComparator;
      reverser = 1;
    }

    this.collection.comparator = function(tag1, tag2){
      return tag1.get(newComparator).toLowerCase()>tag2.get(newComparator).toLowerCase()?reverser:-reverser;
    }
    this.collection.sort();
  },
  render: function(){
    var self = this;
    var data = ''; 
    var num = 0;
    var lastModified;
    this.collection.forEach(function(tag){
      num++;
      lastModified = new Date(tag.get('lastModified'));
      data += self.template({
        num: num,
        name: tag.get('name'),  
        id: tag.get('_id'),
        lastModifier: tag.get('lastModifier'),
        lastModified: lastModified.toLocaleDateString() + '  ' +
                      lastModified.getHours() + ':' + 
                      lastModified.getMinutes() + ':' + 
                      lastModified.getSeconds()
      });
    });

    this.$el.find('#tagList').html(data);
    return this;
  },
  renderMessage: function(){
    // 4 different types for message: success, info, warning, danger
    var message = this.messageModel.get('message');
    var data = this.messageTemplate({
      type: message.type,
      title: message.title,
      content: message.content
    });
    this.$el.find('#messageBox').html(data);
  },
  initialize: function(){
    var self = this;
    this.model = new app.TagModel();
    this.messageModel = new app.MessageModel();
    this.collection = new app.TagCollection();
    this.oriCollection = new Backbone.Collection();
    this.undoCollection = new Backbone.Collection();
    this.undoable = false;
    this.recycleMode = false;
    this.collection.fetch({
      success: function(collection, res){
        self.render();
        self.oriCollection = new Backbone.Collection(self.collection.models);
      },
      error: function(){
        self.messageModel.set({
          message: { 
            type: 'danger',
            title: 'ERROR',
            content: 'some error with getting tag list from server'
          },
          undoable: false
        });
      },
      reset: true
    });
    
    this.listenTo(this.collection, 'reset add remove sort', this.render, this);
    this.listenTo(this.messageModel, 'change', this.renderMessage, this);
    this.template = _.template($('#tmplTagList').html());
    this.messageTemplate = _.template($('#tmplMessage').html());
  }
});


/*
 * Bootup
 */
$(document).ready(function(){
  app.tagView = new app.TagView();
});

