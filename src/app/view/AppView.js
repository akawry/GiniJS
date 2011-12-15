Ext.define('GiniJS.view.AppView', {
	constructor : function(config){
		var loginView = Ext.create('GiniJS.view.LoginView');
		loginView.show();
		GiniJS.view.AppView.superclass.constructor.call(this, config);
	},
	extend: 'Ext.container.Viewport',
	alias: 'widget.appview',	
	plain: true, 
	layout: {
		type: 'border'
	},
	defaults: {
		split: true
	},
	items: [{
		region: 'north',
		items: [Ext.create('GiniJS.view.Menu')],
		layout: {
			type: 'fit'
		}
	}, {
		region: 'west',
		layout: {
			type: 'fit'
		},
		minWidth: 200,
		width: 200,
		items: [Ext.create('GiniJS.view.ComponentView')]
	}, {
		region: 'south',
		minHeight: 200,
		height: 200,		
		layout: {
			type: 'fit'
		},
		items: [Ext.create('GiniJS.view.LogView', {
			title: 'Log',
			minHeight: 200
		})]
	}, {
		region: 'east',
		minWidth: 200,
		layout: {
			type: 'vbox',
			align: 'stretch'
		},
		items: [Ext.create('GiniJS.view.PropertyView', {
			flex: 1,
			title: 'Properties',
			minWidth: 200,
			width: 200
		}),
		Ext.create('GiniJS.view.InterfaceView', {
			flex: 1,
			title: 'Interfaces',
			minWidth: 200,
			width: 200
		})]
	}, {
		region: 'center',
		xtype: 'panel',
		layout: 'fit',
		items: [Ext.create('GiniJS.view.CanvasView')]
	}],
	listeners : {
		'afterrender' : function(){
			console.log(this);
			this.fireEvent('log', "Welcome to GiniJS");
		}
	}
		
});