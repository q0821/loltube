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
      content: 'init success'
    }
  }  
});

app.TagModel = Backbone.Model.extend({
  urlRoot: '/tags',
  idAttribute: '_id',
  defaults: {
    name: 'default name',
    lastModifier: 'system',
    lastModified: Date.now()
  }
});

app.TagCollection = Backbone.Collection.extend({
  model: app.TagModel, 
  url: '/tags',
  initialize: function(){
    var self = this;
    this.lastOrder = '';
    this.url = '/tags';
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
    'keyup #newTagName': 'filter',
    'change #newTagName': 'filter'
  },
  filter: function(){
    var filter = this.$el.find('#newTagName').val();
    this.collection.reset(this.oriCollection.filter(function(tag){
      return tag.get('name').indexOf(filter,0)>-1? true:false;
    }));
  },
  addNewTag: function(){
    var self = this;
    var newTag = new app.TagModel({
      name: this.$el.find('#newTagName').val()
    });
    newTag.save().done(function(){
      self.collection.add(newTag, {at: 0});
      self.oriCollection.add(newTag);
      self.messageModel.set('message', { type: 'success', content: 'Add a new tag to server.'});
      self.$el.find('#newTagName').val('');
    });
  },
  editTag: function(e){
    var edittingID = $(e.currentTarget).data('id');
    alert('editting ' + this.collection.get(edittingID).get('name'));
  },
  delTag: function(){
    var self = this;
    var del = this.$el.find('input[name="index[]"]:checked');
    var success = true;
    var deletingTag;
    del.each(function(){
      deletingTag = self.collection.get($(this).val());
      if(deletingTag){
        deletingTag.destroy({
          success: function(){},
          error: function(){ success = false;}  
        });
      } else {
        success = false;
        self.messageModel.set('message', { type:'danger', content:'Error with deleting tags'});
      }
      return success;
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
      content: message.content
    });
    this.$el.find('#messageBox').html(data);
  },
  initialize: function(){
    var self = this;
    this.model = new app.TagModel();
    this.messageModel = new app.MessageModel();
    this.oriCollection = new Backbone.Collection();
    this.collection = new app.TagCollection();
    this.collection.fetch({
      success: function(collection, res){
        self.render();
        self.oriCollection = new Backbone.Collection(self.collection.models);
      },
      error: function(){
        self.messageModel.set('message', { type: 'danger', content: 'some error with getting tag list from server'});
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

