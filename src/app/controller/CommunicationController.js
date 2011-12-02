Ext.require(['Ext.app.Controller']);

Ext.define('GiniJS.controller.CommunicationController', {
	extend: 'Ext.app.Controller',
	init : function(){
		console.log("Initializing communication handlers ... ");
		var me = this;
		this.application.on('gserver', function(e){
			switch (e.type){
				case "do_connect":
					me.ongServerConnect(e);
					break;
			}
		}, {
			scope: this
		});
	},
	
	ongServerConnect : function(e){
		this.socket = io.connect('http://localhost');
		this.socket.on('gserver', this.ongServerMsg);
	},
	
	ongServerMsg : function(data){
		console.log("Got a gServer message!", data);
	}
});