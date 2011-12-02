Ext.require(['Ext.app.Controller']);

Ext.define('GiniJS.controller.CommunicationController', {
	extend: 'Ext.app.Controller',
	init : function(){
		console.log("Initializing communication handlers ... ");
		this.application.on('gserver', function(e){
			switch (e.type){
				case "do_connect":
					this.ongServerConnect(e);
					break;
			}
		}, this);
	},
	
	ongServerConnect : function(e){
		this.socket = io.connect('http://localhost');
		this.socket.on('gserver', this.ongServerMsg);
		
		this.application.fireEvent('console', {
			type: 'open',
			name: 'gServer'
		});
	},
	
	ongServerMsg : function(data){
		console.log("Got a gServer message!", data);
		
		this.application.fireEvent('console', {
			type: 'msg',
			msg: data.msg,
			name: 'gServer'
		});
	}
});