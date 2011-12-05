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
		
		this.control({
			'console' : {
				'command' : this.onCommand,
				scope : this
			}
		});
	},
	
	ongServerConnect : function(e){
		this.socket = io.connect('http://localhost');
		var me = this;
		this.socket.on('process_msg', function(data){
			me.onProcessMsg(data);
		});
		
		this.application.fireEvent('console', {
			type: 'open',
			name: 'gserver ' + GiniJS.globals.gserverVersion
		});
	},
	
	onProcessMsg : function(data){
		console.log("Got a process message!", data);
		
		this.application.fireEvent('console', {
			type: 'msg',
			msg: data.msg,
			name: data.process
		});
	},
	
	onCommand : function(cons, cmd){
		console.log("Sending console command to server: ", cons, cmd);
		Ext.Ajax.request({
			url: '/console',
			jsonData : {
				console: cons.title, 
				command: cmd
			},
			success : function(res){
				console.log("Command produced server response: ", res);
			}
		});	
	}
});