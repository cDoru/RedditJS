define([
  'underscore', 'backbone', 'resthub', 'hbs!template/comment', 'hbs!template/commentMOAR', 'view/base-view', 'event/channel', 'cookie'],
	function(_, Backbone, Resthub, commentTmpl, CommentMOAR, BaseView, channel, Cookie) {
		var CommentView = BaseView.extend({
			strategy: 'append',
			template: commentTmpl,

			events: {
				'click .upArrow': 'upvote',
				'click .downArrow': 'downvote',
				'click .noncollapsed .expand': "hideThread",
				'click .collapsed .expand': "showThread"
				//  'keyup #new-todo':     'showTooltip'
			},

			initialize: function(options) {
				_.bindAll(this);
				$(this.el).html('')
				var self = this;
				//this.collection = options.collection
				this.model = options.model
				this.name = this.model.get('name')
				this.template = commentTmpl;
				this.render();

				this.renderChildren()

				// this.model.fetch({
				// 	success: this.loaded,
				// 	error: this.fetchError
				// });
			},

			hideThread: function(e) {
				e.preventDefault()
				e.stopPropagation()

				this.$('.noncollapsed').hide()
				this.$('.collapsed').show()
				this.$('.child').hide()
				this.$('.midcol').hide()

			},
			showThread: function(e) {
				e.preventDefault()
				e.stopPropagation()
				this.$('.collapsed').hide()
				this.$('.noncollapsed').show()
				this.$('.child').show()
				this.$('.midcol').show()

			},

			renderChildren: function() {
				var replies = this.model.get('replies')
				if (typeof replies !== 'undefined' && replies != "" && replies != null) {
					var self = this

					replies.each(function(model) {
						//console.log(model)
						if (model.get('kind') == 't1') {
							var comment = new CommentView({
								model: model,
								root: "#" + self.name
								//root: "#commentarea"
							})
						} else {
							//console.log('its a more:', model)
							//var MOAR = 'load more comments (2 replies)'
							//this.$("#" + self.name).html(MOAR)

							this.$("#" + self.name).html(CommentMOAR({
								model: model.attributes
							}))

						}
					})

				}
			},
			/**************Fetching functions ****************/
			fetchError: function(response, error) {
				console.log("fetch error, lets retry")

			},
			fetchMore: function() {

			},

			loaded: function(model, res) {
				this.$('.loading').hide()

				this.render();

			},

		});
		return CommentView;
	});