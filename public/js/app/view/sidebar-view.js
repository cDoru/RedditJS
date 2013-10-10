define(['jquery', 'underscore', 'backbone', 'resthub', 'hbs!template/sidebar', 'view/base-view', 'view/login-view', 'model/sidebar', 'event/channel', 'cookie'],
	function($, _, Backbone, Resthub, SidebarTmpl, BaseView, LoginView, SidebarModel, channel, Cookie) {
		var SidebarView = BaseView.extend({
			el: ".side",
			events: {
				'submit #search': 'gotoSearch',
				'click .add': 'subscribe',
				'click .remove': 'unsubscribe'
			},

			initialize: function(data) {
				_.bindAll(this);
				this.template = SidebarTmpl;
				this.subName = data.subName
				this.dynamicStylesheet(this.subName)
				this.model = new SidebarModel(this.subName)

				if (this.subName == "front") {
					//this.model.set('header_img', 'img/logo.png')
					this.model.set('isFront', true)
					this.render()
					this.loadLoginView()
					channel.trigger("header:update", this.model);
					this.$('.titlebox').hide()

				} else { //only fetch sidebar info if on the front page
					this.model.fetch({
						success: this.loaded
					});
				}
				// this.$() is a shortcut for this.$el.find().

			},
			addOutboundLink: function() {
				this.$('.usertext-body a').addClass('outBoundLink').attr("data-bypass", "true"); //makes the link external to be clickable
				this.$('.usertext-body a').attr('target', '_blank');
			},
			subscribe: function(e) {
				e.preventDefault()
				e.stopPropagation()
				var target = this.$(e.currentTarget)
				target.removeClass('add').addClass('remove').html('unsubscribe')

				var params = {
					action: 'sub',
					sr: this.model.get('name'),
					sr_name: this.model.get('name'),
					uh: $.cookie('modhash')
				};

				this.api("api/subscribe", 'POST', params, function(data) {
					console.log("vote done", data)
					channel.trigger('header:refreshSubreddits')
				});

			},
			unsubscribe: function(e) {
				e.preventDefault()
				e.stopPropagation()
				var target = this.$(e.currentTarget)
				target.removeClass('remove').addClass('add').html('subscribe')
				var params = {
					action: 'unsub',
					sr: this.model.get('name'),
					uh: $.cookie('modhash')
				};
				this.api("api/subscribe", 'POST', params, function(data) {
					console.log("vote done", data)
					channel.trigger('header:refreshSubreddits')
				});
			},

			gotoSearch: function(e) {
				e.preventDefault()
				e.stopPropagation()
				var q = encodeURIComponent(this.$('.sidebarSearch').val())
				console.log('user searched for ', q)
				Backbone.history.navigate('/search/' + q, {
					trigger: true
				})

			},
			loaded: function(response, sidebar) {
				this.render()
				this.loadLoginView()
				channel.trigger("header:update", this.model);
				channel.trigger('submit:type', this.model.get('submission_type'))
				if (window.settings.get('showSidebar') === false) {
					$('.side').hide()
				}
				this.addOutboundLink()
				//HeaderView.updateHeader(this.model)

			},
			loadLoginView: function() {
				this.loginView = new LoginView({
					root: "#theLogin"
				})

				//now render the login view
				//this.loginView.render();
			}

		});
		return SidebarView;
	});