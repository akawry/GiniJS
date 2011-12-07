GiniJS.store.ServerStore = Ext.create('Ext.data.ArrayStore', {
	fields: [{
		name: 'name'
	}],
	data: [['localhost']]
}); 

Ext.define('GiniJS.view.OptionsView', {
		extend: 'Ext.window.Window',
		title: 'Options',
		closable: true,
		floating: true,
		modal: true,
		width: 450,
		closeAction: 'hide',
		items: [
			Ext.create('Ext.tab.Panel', {
				items: [{
					title: 'General',
					items: [
						Ext.create('Ext.form.Panel', {
							items: [
								Ext.create('Ext.form.FieldSet', {
									title: 'User Interface',
									items: [{
										xtype: 'checkbox',
										boxLabel: 'Show component names'	
									}, {
										xtype: 'checkbox',
										boxLabel: 'Show grid'
									}, {
										xtype: 'checkbox',
										boxLabel: 'Use smoothing'
									}, {
										xtype: 'checkbox',
										boxLabel: 'Remember and restore layout'
									}, {
										xtype: 'fieldcontainer',
										fieldLabel: 'Grid color',
										items: [{
											xtype: 'colorpicker'
										}]
									}]
								}),
								
								Ext.create('Ext.form.FieldSet', {
									title: 'Compilation / Runtime',
									items: [{
										xtype: 'checkbox',
										boxLabel: 'Auto-routing'
									}, {
										xtype: 'checkbox',
										boxLabel: 'Auto-generate IP/MAC addresses'
									}, {
										xtype: 'checkbox',
										boxLabel: 'Compile before running'
									}, {
										xtype: 'checkbox',
										boxLabel: 'Use glowing lights'
									}]
								})
							],
						})
					]
				}, {
					title: 'Server',
					items: [
						Ext.create('Ext.form.Panel', {
							items: [
								Ext.create('Ext.form.FieldSet', {
									title: 'Server configuration',
									items: [{
										xtype: 'fieldcontainer',
										layout: {
											type: 'hbox'
										},
										items: [
											Ext.create('Ext.form.ComboBox', {
												fieldLabel: 'Server',
												labelWidth: 180,
												queryMode: 'local',
												store: GiniJS.store.ServerStore,
	    										displayField: 'name',
	    										valueField: 'name'
											}),
											{
												xtype: 'button',
												text: 'Delete',
												margins: '0 10 0 10'
											}
										]
									}, {
										xtype: 'fieldcontainer',
										layout: {
											type: 'hbox'
										},
										items: [
											{
												xtype: 'textfield',
												labelWidth: 180,
												fieldLabel: ' ',
												labelSeparator: ''
											},
											{
												xtype: 'button',
												text: 'Add',
												margins: '0 10 0 10'
											}
										]
									}, {
										xtype: 'textfield',
										labelWidth: 180,
										fieldLabel: 'Session name (if using Putty)'
									}]
								}),
								
								Ext.create('Ext.form.FieldSet', {
									title: 'SSH Tunnel Port Configuration',
									items: [{
										xtype: 'fieldcontainer',
										layout: {
											type: 'hbox'
										},
										items: [
											{
												xtype: 'textfield',
												fieldLabel: 'Local Port',
												emptyText: '10001'
											},
											{
												xtype: 'button',
												text: 'Randomize',
												margins: '0 10 0 10'
											}
										]
									},
									{
										xtype: 'fieldcontainer',
										layout: {
											type: 'hbox'
										},
										items: [
											{
												xtype: 'textfield',
												fieldLabel: 'Remote Port',
												emptyText: '10000'
											},
											{
												xtype: 'button',
												text: 'Randomize',
												margins: '0 10 0 10'
											}
										]
									}]
								})
							]
						})
					]
				}
			]
		})
	],
	buttons: [{
		text: 'Close',
		handler : function(){
			this.up('window').hide();
		}
	}]
});