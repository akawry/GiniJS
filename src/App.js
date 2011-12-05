Ext.Loader.setConfig({
	enabled: true,
	disableCaching: false,
	paths: {
		'GiniJS' : 'app'
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