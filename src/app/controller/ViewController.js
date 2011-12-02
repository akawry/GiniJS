Ext.define('GiniJS.controller.ViewController', {
	extend: 'Ext.app.Controller',
	id: 'GiniJS.controller.ViewController',
	init : function(){
		console.log("Initializing view controller...");
		this.application.on('refreshviews', this.refreshViews, {
			scope : this
		});
	},
	 
	refreshViews : function(e){
		var store = Ext.isEmpty(e.selected) ? Ext.data.StoreManager.lookup('GiniJS.store.EmptyProperties') : e.selected.properties();
		Ext.ComponentQuery.query('propertyview')[0].reconfigure(store);
		store = (Ext.isEmpty(e.selected) || Ext.isEmpty(e.selected.get('iface'))) ? Ext.data.StoreManager.lookup('GiniJS.store.EmptyInterfaces') : e.selected.get('iface').properties();
		Ext.ComponentQuery.query('interfaceview')[0].reconfigure(store);
	}
	
});