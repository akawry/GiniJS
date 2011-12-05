Ext.define('GiniJS.controller.ViewController', {
	extend: 'Ext.app.Controller',
	id: 'GiniJS.controller.ViewController',
	init : function(){
		console.log("Initializing view controller...");
		this.application.on('refreshviews', this.refreshViews, this);	
		this.application.on('console', this.onConsole, this);
		this.consoles = {};
		
		this.control({
			'component' : {
				'log' : function(msg){
					Ext.ComponentQuery.query('logview')[0].log(msg);
				}
			}
		});
	},
	 
	refreshViews : function(e){
		var store = Ext.isEmpty(e.selected) ? Ext.data.StoreManager.lookup('GiniJS.store.EmptyProperties') : e.selected.properties();
		Ext.ComponentQuery.query('propertyview')[0].reconfigure(store);
		store = (Ext.isEmpty(e.selected) || Ext.isEmpty(e.selected.get('iface'))) ? Ext.data.StoreManager.lookup('GiniJS.store.EmptyInterfaces') : e.selected.get('iface').properties();
		Ext.ComponentQuery.query('interfaceview')[0].reconfigure(store);
	},
	
	onConsole : function(e){
		if (e.type === "open"){
			this.consoles[e.name] = Ext.create('GiniJS.view.Console', {
				title: e.name,
				width: 300,
				height: 300,
				prompt: "> "
			});
			this.consoles[e.name].show();
		} else if (e.type === "msg"){
			var cons = this.consoles[e.name];
			if (cons){
				cons.append(e.msg, "");
			}
		}
	}
	
});