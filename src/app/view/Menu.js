Ext.define('GiniJS.view.Menu', {
	extend: 'Ext.toolbar.Toolbar',
	resizable: false,
	items: [{
		text: 'File',
		menu: Ext.create('Ext.menu.Menu', {
			type: 'file',
			items: [{
				text: 'New'
			}, {
				text: 'Open'
			}, {
				text: 'Save'
			}, {
				text: 'Save As'
			}, {
				text: 'Send File'
			}, {
				text: 'Export'
			}]
		})
	}, {
		text: 'Project',
		menu: Ext.create('Ext.menu.Menu', {
			type: 'project',
			items: [{
				text: 'New'
			}, {
				text: 'Open'
			}, {
				text: 'Close'
			}]
		})
	}, {
		text: 'Run',
		menu: Ext.create('Ext.menu.Menu', {
			type: 'run',
			items: [{
				text: 'Run'
			}, {
				text: 'Stop'
			}, {
				text: 'Start Server'
			}]
		})
	}, {
		text: 'Config',
		menu: Ext.create('Ext.menu.Menu', {
			type: 'config',
			items: [{	
				text: 'Options'
			}]
		})
	}, {
		text: 'Help',
		menu: Ext.create('Ext.menu.Menu', {
			type: 'help',
			items: [{
				text: 'FAQ'
			}, {
				text: 'About'
			}]
		})
	}]
});