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
		if (GiniJS.globals.topologyState !== "off"){
			Ext.Msg.alert("Error", "Please stop the currently running topology first.");
			return;
		}
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
			this.application.fireEvent('saveas');
		} else {
			// var gsav = this.getController('TopologyController').topologyToGSAV();
			var obj = this.getController('TopologyController').topologyToJSON();
			console.log("About to dump", obj);
			var json = Ext.encode(obj);
			console.log(json);
			
			Ext.Ajax.request({
				url: '/download',
				params: {
					filename: GiniJS.globals.open,
					filedata: json
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
		if (GiniJS.globals.topologyState !== "off"){
			Ext.Msg.alert("Error", "Please stop the currently running topology first.");
			return;
		}
		
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
	
	onExport : function(){
		var canvas = Ext.ComponentQuery.query('canvasview')[0],
			svgel = canvas.surface.el.dom,
			serializer = new XMLSerializer(),
			svg;
		console.log(svgel);
		try {
			svg = serializer.serializeToString(svgel);
		} catch (exception) {
			this.application.fireEvent('log', 'Could not export the topology: '+exception);
		}
		
		Ext.Ajax.request({
			url: '/download',
			params : {
				filename: 'test.svg',
				filedata : svg
			},
			success : function(){
				window.location = "download?filename=test.svg";
			}
		});
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
					if (user === '')
						user = "Guest";
						
					this.application.fireEvent('login', user);
					GiniJS.globals.user = user;
				}
			},
			scope : this
		});
	},
	
	onLoad : function(res){
		
		this.application.fireEvent('log', 'Opening ' + res.name + "...");
		
		var reader = new FileReader(),
			me = this;
		reader.onloadend = function(e){
			GiniJS.globals.open = res.name;
			try {
				var topology = Ext.decode(e.target.result);
				me.getController('TopologyController').openTopology(topology, res.name);
			} catch (exception){
				Ext.Msg.alert('Error', 'The file was not a valid GiniJS save file.');
				me.application.fireEvent('log', 'Could not load the file.');
			}
		};
		
		reader.readAsBinaryString(res);
	}
});