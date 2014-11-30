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
    var self = this;
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
    'click #undo': 'undo',
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
        console.log('undoing');
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
  delTag: function(){
    this.undoCollection.reset();
    var self = this;
    var del = this.$el.find('input[name="index[]"]:checked');
    var isSuccess = true;
    var deletingTag;
    del.each(function(){
      deletingTag = self.collection.get($(this).val());
      if(deletingTag){
        deletingTag.destroy({
          success: function(model, res){
            model.unset('_id');
            self.undoCollection.add(model);
            self.messageModel.set({
              message: { 
                type:'warning', 
                title: 'Warning',
                content: 'Delete the tag: <strong><u>' + model.get('name') + '</strong></u>'
              },
              undoable: true
            });
          },
          error: function(model, res){
            isSuccess = false;
            self.messageModel.set({
              message: { 
                type:'danger', 
                title: 'ERROR',
                content:'Error while deleting tag: ' + model.get('name')
              },
              undoable: false
            });
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
      console.log('set undo to true');
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
    console.log('rendering');
    var self = this;
    var data = ''; 
    var num = 0;
    this.collection.forEach(function(tag){
      num++;
      data += self.template({
        num: num,
        name: tag.get('name'),  
        id: tag.get('_id'),
        lastModifier: tag.get('lastModifier'),
        lastModified: (new Date(tag.get('lastModified'))).toDateString()
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

