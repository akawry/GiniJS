Ext.require([
	'Ext.window.Window',
	'GiniJS.store.TaskStore'
]);

Ext.define('GiniJS.view.TaskView', {
	extend: 'Ext.window.Window',
	alias: 'widget.taskview',
	closeAction: 'hide',
	layout: {
		type: 'vbox',
		align: 'stretch'
	},
	scroll: 'vertical',
	items: [
		Ext.create('Ext.grid.Panel', {
			itemId: 'taskList',
			selType: 'rowmodel',
			store: 'GiniJS.store.TaskStore',
			columns: [{
				id: 'name',
				header: 'Name',
				dataIndex: 'name',
				flex: 1,
				field: {
					allowBlank: false
				}
			}, {
				id: 'process',
				header: 'PID',
				dataIndex: 'process',
				flex: 1,
				field: {
					allowBlank: false
				}
			}, {
				id: 'status',
				header: 'Status',
				dataIndex: 'status',
				flex: 1,
				field: {
					allowBlank: false
				}
			}]
		})
	],
	dockedItems: [
		Ext.create('Ext.button.Button', {
			text: 'Kill',
			handler : function(){
				var list = this.up('window').getComponent('taskList'),
					sel = list.getSelectionModel().selected,
					store = Ext.data.StoreManager.lookup('GiniJS.store.TaskStore');
				var me = this;
				Ext.each(sel.items, function(row){
					me.fireEvent('kill', row);
				});
			},
			dock: 'bottom'
		})
	],
	height: 300
});	 