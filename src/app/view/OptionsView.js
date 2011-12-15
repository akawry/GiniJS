GiniJS.store.ServerStore = Ext.create('Ext.data.ArrayStore', {
	fields : [{
		name : 'name'
	}],
	data : [['localhost']]
});

var colorGrid = Ext.create('Ext.picker.Color', {});
var generalForm = Ext.create('Ext.form.Panel', {
	items : [Ext.create('Ext.form.FieldSet', {
		title : 'User Interface',
		items : [{
			xtype : 'checkbox',
			boxLabel : 'Show component names',
			name: 'showcomponentnames',
			checked: GiniJS.globals.options['showcomponentnames'] === "on"
		}, {
			xtype : 'checkbox',
			boxLabel : 'Show grid',
			name: 'showgrid',
			checked: GiniJS.globals.options['showgrid'] === "on"
		}, {
			xtype : 'checkbox',
			boxLabel : 'Remember and restore layout',
			name: 'rememberlayout',
			checked: GiniJS.globals.options['rememberlayout'] === "on"
		}, {
			xtype : 'fieldcontainer',
			fieldLabel : 'Grid color',
			items : [colorGrid]
		}]
	}), Ext.create('Ext.form.FieldSet', {
		title : 'Compilation / Runtime',
		items : [{
			xtype : 'checkbox',
			boxLabel : 'Auto-routing',
			name: 'autorouting',
			checked: GiniJS.globals.options['autorouting'] === "on"
		}, {
			xtype : 'checkbox',
			boxLabel : 'Auto-generate IP/MAC addresses',
			name: 'autogenerate',
			checked: GiniJS.globals.options['autogenerate'] === "on"
		}, {
			xtype : 'checkbox',
			boxLabel : 'Compile before running',
			name: 'compile',
			checked: GiniJS.globals.options['compile'] === "on"
		}, {
			xtype : 'checkbox',
			boxLabel : 'Use glowing lights',
			name: 'glowinglights',
			checked: GiniJS.globals.options['glowinglights'] === "on"
		}]
	})],
});

var serverForm = Ext.create('Ext.form.Panel', {
	items : [Ext.create('Ext.form.FieldSet', {
		title : 'Server configuration',
		items : [{
			xtype : 'fieldcontainer',
			layout : {
				type : 'hbox'
			},
			items : [Ext.create('Ext.form.ComboBox', {
				fieldLabel : 'Server',
				labelWidth : 180,
				queryMode : 'local',
				store : GiniJS.store.ServerStore,
				displayField : 'name',
				valueField : 'name',
				name: 'server'
			}), {
				xtype : 'button',
				text : 'Delete',
				margins : '0 10 0 10'
			}]
		}, {
			xtype : 'fieldcontainer',
			layout : {
				type : 'hbox'
			},
			items : [{
				xtype : 'textfield',
				labelWidth : 180,
				fieldLabel : ' ',
				labelSeparator : '',
				name: 'addserver'
			}, {
				xtype : 'button',
				text : 'Add',
				margins : '0 10 0 10'
			}]
		}, {
			xtype : 'textfield',
			labelWidth : 180,
			fieldLabel : 'Session name (if using Putty)',
			name: 'sessionname'
		}]
	}), Ext.create('Ext.form.FieldSet', {
		title : 'SSH Tunnel Port Configuration',
		items : [{
			xtype : 'fieldcontainer',
			layout : {
				type : 'hbox'
			},
			items : [{
				xtype : 'textfield',
				fieldLabel : 'Local Port',
				emptyText : '10001',
				name: 'localport'
			}, {
				xtype : 'button',
				text : 'Randomize',
				margins : '0 10 0 10'
			}]
		}, {
			xtype : 'fieldcontainer',
			layout : {
				type : 'hbox'
			},
			items : [{
				xtype : 'textfield',
				fieldLabel : 'Remote Port',
				emptyText : '10000',
				name: 'remoteport'
			}, {
				xtype : 'button',
				text : 'Randomize',
				margins : '0 10 0 10'
			}]
		}]
	})]
});

Ext.define('GiniJS.view.OptionsView', {
	extend : 'Ext.window.Window',
	alias: 'widget.optionsview',
	allOptions: {
		'showcomponentnames' : 'off',
		'showgrid' : 'off',
		'rememberlayout' : 'off',
		'autorouting' : 'off',
		'autogenerate' : 'off',
		'compile' : 'off',
		'glowinglights' : 'off'
	},
	title : 'Options',
	closable : true,
	floating : true,
	modal : true,
	width : 450,
	closeAction : 'hide',
	items : [Ext.create('Ext.tab.Panel', {
		items : [{
			title : 'General',
			items : [generalForm]
		}, {
			title : 'Server',
			items : [serverForm]
		}]
	})],
	buttons : [{
		text : 'Close',
		handler : function() {
			var win = this.up('window');
			win.hide();
			var vals = generalForm.getValues();
			vals['gridcolor'] = colorGrid.getValue();
			Ext.apply(vals, serverForm.getValues());		
			Ext.apply(GiniJS.globals.options, win.allOptions);
			Ext.apply(GiniJS.globals.options, vals);
			win.fireEvent('updateoptions', GiniJS.globals.options);
			localStorage['options'] = Ext.encode(GiniJS.globals.options);
		}
	}]
});

