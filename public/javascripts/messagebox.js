'use strict';
/*
 * Setup
 */
var app = app || {};

/*
 * Models & Collections
 */
app.MessageBoxModel = Backbone.Model.extend({
  defaults:{    
    type: 'success',
    title: 'INITIAL',
    content: 'init success',
    undoable: false
  },
});

/*
 * Views
 */
app.MessageBoxView = Backbone.View.extend({
  initialize: function(){
    this.model = new app.MessageBoxModel();
    this.template = _.template($('#tmplMessageBox').html());
    this.listenTo(this.model, 'change', this.render);
  },

  events: {
    'click #undo': 'undo'
  },

  render: function(){
    this.$el.html(this.template(this.model.toJSON()));
  },

  undo: function(){
  }
});
