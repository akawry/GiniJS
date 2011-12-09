Ext.require(['Ext.app.Controller']);

Ext.define('GiniJS.controller.ActionController', {
	extend: 'Ext.app.Controller',
	init : function(){
		console.log("Initializing action handlers ... ");
		this.control({
			'menu' : {
				'click' : this.onMenuSelect
			},
			'taskview > button' : {
				'kill' : this.onKill
			},
			'loginview button' : {
				'login' : this.onLogin
			}
		});
		
		this.application.on({
			'save' : this.onSave,
			'load' : this.onLoad,
			scope : this
		});
		
		this.menuCallbacks = {
			'file' : {
				'New' : this.onNew,
				'Save' : this.onSave,
				'Save As' : this.onSaveAs,
				'Open' : this.onOpen,
				'Send File' : this.onSendFile,
				'Export' : this.onExport
			},
			
			'project' : {
				'New' : this.onNewProject,
				'Open' : this.onOpenProject,
				'Close' : this.onCloseProject
			},
			
			'run' : {
				'Run' : this.onRun,
				'Stop' : this.onStop,
				'Start Server' : this.onStartServer
			},
			
			'config' : {
				'Options' : this.onOptions
			},
			
			'help' : {
				'FAQ' : this.onFAQ,
				'About' : this.onAbout
			}
		};
	},

	onMenuSelect : function(menu, item, e, eOpts){
		console.log(item);
		this.menuCallbacks[menu.type][item.text].call(this);
	},	
	
	onNew : function(){
		// preserve scope
		var me = this;
		var callback = function(){
			me.getController('TopologyController').newTopology();
		}
		Ext.Msg.confirm('Confirm', 'Save before closing?', function(btn){
			if (btn === "yes"){
				this.onSave(callback);
			} else {
				callback();
			}
		}, this);
	},
	
	onSave : function(callback){
		if (!Ext.isDefined(GiniJS.globals.open)){
			console.log("saving as ... ");
			if (typeof callback !== "function"){
				// preserve scope 
				var me = this,
					callback = function(){
						me.onSave()
					};
			}
			this.application.fireEvent('saveas', callback);
		} else {
			var gsav = this.getController('TopologyController').topologyToGSAV();
			Ext.Ajax.request({
				url: '/download',
				params: {
					filename: GiniJS.globals.open,
					gsav: gsav
				},
				success : function(){
					window.location = 'download?filename='+GiniJS.globals.open;
				}
			});
			this.application.fireEvent('log', 'Saved topology to '+ GiniJS.globals.open);
			if (typeof callback === "function")
				callback();
		}
	},
	
	onSaveAs : function(){
		this.application.fireEvent('saveas');
	},
	
	onOpen : function(){
		var me = this;
		var callback = function(){
			console.log("INITIATING OPEN");
			me.application.fireEvent('open');
		};
		
		Ext.Msg.confirm('Confirm', 'Save before closing?', function(btn){
			if (btn === "yes"){
				this.onSave(callback);
			} else {
				callback();
			}
		}, this);
	},
	
	onSendFile : function(){
		
	},
	
	onExport : function(){
		
	},
	
	onNewProject : function(){
		
	},
	
	onOpenProject : function(){
		
	},
	
	onCloseProject : function(){
		
	},
	
	onRun : function(){
		console.log("Sending run command to server ... ");
		
		Ext.Ajax.request({
			url: '/command',
			params: {
				type: 'run'
			},
			success : function(res){
				console.log(res);
			}
		});
		
		/**
		 * TODO: Divert calling this until we get the response from the server 
		 */
		
		this.application.fireEvent('starttopology');
	},
	
	onStop : function(){
		console.log("Sending stop command to server ... ");
		
		Ext.Ajax.request({
			url: '/command',
			params: {
				type: 'stop'
			},
			success : function(res){
				console.log(res);
			}
		});
		
		/**
		 * TODO: Divert calling this until we get the response from the server 
		 */
		
		this.application.fireEvent('stoptopology');
	},
	
	onStartServer : function(){
		console.log("Sending server start command to server ... ");
		
		Ext.Ajax.request({
			url: '/command',
			jsonData : {
				type: 'start_server'
			},
			success : function(res){
				var obj = Ext.decode(res.responseText);
				console.log("Got a response!", obj);
				if (!obj.error){
					console.log("Should open the socket.io connection now ... ");
					this.application.fireEvent('gserver', {
						type: 'do_connect'
					});
				}
			},
			scope : this
		});

	},
	
	onOptions : function(){
		this.application.fireEvent('options');
	},
	
	onFAQ : function(){
		window.open('http://cgi.cs.mcgill.ca/~anrl/gini/faq.html');
	},
	
	onAbout : function(){
		Ext.Msg.alert("About GiniJS", "GiniJS was written by Alexander Kawrykow under the supervision of Muthucumaru Maheswaran");
	},
	
	onKill : function(row){
		console.log("Sending KILL command to server for pid: "+row.get('pid'));
		
		Ext.Ajax.request({
			url: '/command',
			params: {
				type: 'kill',
				pid: row.get('pid')
			},
			success : function(res){
				console.log(res);
			}
		});
		
		/**
		 * TODO: Defer this until we get the confirm from the server !!!
		 */
		
		row.set('status', 'killed');
		row.commit();
		
		var store = Ext.data.StoreManager.lookup('GiniJS.store.TaskStore');
		var stop = true;
		store.each(function(rec){
			if (rec.get('status') !== 'killed')
				stop = false;
		});
		if (stop)
			this.application.fireEvent('stoptopology');
	},
	
	onLogin : function(user, pass){
		Ext.Ajax.request({
			url: '/login',
			params: {
				user: user,
				password: pass
			},
			success: function(res){
				res = Ext.decode(res.responseText);
				if (res.error){
					Ext.Msg.alert("Error", res.err);
				} else {
					this.application.fireEvent('login', user);
					GiniJS.globals.user = user;
				}
			},
			scope : this
		});
	},
	
	onLoad : function(res){
		this.application.fireEvent('log', 'Opening ' + res);
		GiniJS.globals.open = res;
		
		/**
		 * TODO: get the contents of the file and then invoke the openTopology method on the TopologyController 
		 */
	}
});