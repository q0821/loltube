'use strict';
/*
 * Setup
 */
var app = app || {};


/*
 * Models & Collections
 */
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
  lastOrder: ''
});   


/*
 * Views
 */
app.TagView = Backbone.View.extend({
  el: '#tagContainer',
  events:{
    'click #newTagBtn': 'addNewTag',
    'click .reorder': 'reorder',
    'click .editTag': 'editTag'
  },
  addNewTag: function(){
    var self = this;
    var newTag = new app.TagModel({
      name: this.$el.find('input[name="newTagName"]').val()
    });
    newTag.save().done(function(){
      self.collection.add(newTag, {at: 0});
      self.renderMessage('warning', 'Add a new tag');
    });
  },
  editTag: function(e){
    var edittingID = $(e.currentTarget).data('id');
    alert('editting ' + edittingID);
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
  renderMessage: function(type, message){
    // 4 different types for message: success, info, warning, danger
    var data = this.messageTemplate({
      type: type,
      message: message
    });
    this.$el.find('#messageBox').html(data);
  },
  initialize: function(){
    var self = this;
    this.model = new app.TagModel();
    this.collection = new app.TagCollection();
    this.collection.fetch({
      success: function(collection, res){
        self.render();
        self.renderMessage('success', 'get tag list success');
      },
      error: function(){
        self.renderMessage('danger', 'some error with getting tag from server');
      },
      reset: true
    });
    this.listenTo(this.collection, 'sort add', this.render);
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

