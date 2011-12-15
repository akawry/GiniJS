Ext.Loader.setConfig({
	enabled: true,
	disableCaching: false,
	paths: {
		'GiniJS' : 'app'
	}
});

Ext.ns('GiniJS.globals');
Ext.apply(GiniJS.globals, {
	topologyState : "off",
	gserverVersion: '1.0.1',
	options: {
		'showcomponentnames' : 'on',
		'showgrid' : 'off',
		'rememberlayout' : 'off',
		'autorouting' : 'on',
		'autogenerate' : 'on',
		'compile' : 'off',
		'glowinglights' : 'on',
		'gridwidth' : 50,
		'gridheight' : 50
	}
});

Ext.application({
	name: 'GiniJS',
	models: ['TopologyNode', 'Component', 'Property', 'Interface', 'Task'],
	views: ['AppView'],
	controllers: ['ViewController', 'TopologyController', 'ActionController', 'CommunicationController'],
	stores: ['TopologyStore', 'TaskStore', 'ComponentStore'],
	launch : function(){
		console.log("Launching GiniJS...");
		Ext.create('GiniJS.view.AppView');
	}
});