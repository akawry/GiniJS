Ext.require(['Ext.app.Controller']);

Ext.define('GiniJS.controller.ActionController', {
	extend: 'Ext.app.Controller',
	init : function(){
		console.log("Initializing action handlers ... ");
		this.control({
			'menu' : {
				'click' : this.onMenuSelect
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
	}
});