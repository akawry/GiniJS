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
			}
		});
	},

	onMenuSelect : function(menu, item, e, eOpts){
		switch(menu.type){
			case "file":
				this.onFileSelect(item);
				break;
			case "project":
				this.onProjectSelect(item);
				break;
			case "edit":
				this.onEditSelect(item);
				break;
			case "run":
				this.onRunSelect(item);
				break;
			case "config":
				this.onConfigSelect(item);
				break;
			case "help":
				this.onHelpSelect(item);
				break;
		}
	},	
	
	onFileSelect : function(data){
		console.log("Item selected from the 'File' menu...", data);
		switch (data.text){
			case "Save" :
				// this.getController('GiniJS.controller.TopologyController').topologyToGSAV();
				break;
		}
	},
	
	onProjectSelect : function(data){
		console.log("Item selected from the 'Project' menu...", data);
	},
	
	onEditSelect : function(data){
		console.log("Item selected from the 'Edit' menu...", data);
	},
	
	onRunSelect : function(data){
		console.log("Item selected from the 'Run' menu...", data);
		switch (data.text){
			case "Run":
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
				
				break;
				
			case "Stop":
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
				
				break;
				
			case "Start Server":
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
				
				break;
		}
	},
	
	onConfigSelect : function(data){
		console.log("Item selected from the 'Config' menu...", data);
	},
	
	onHelpSelect : function(data){
		console.log("Item selected from the 'Help' menu...", data);
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
	}
});