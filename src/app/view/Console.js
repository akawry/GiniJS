Ext.require(['Ext.window.Window']);

var handleKeyPress = function(field, e, eOpts){
	if (e.getCharCode() === e.ENTER){
		var cons = field.up('window');
		cons.processCommand(field.getValue());
		field.setValue("");
	}
};

Ext.define('GiniJS.view.Console', {
	extend: 'Ext.window.Window',
	alias: 'widget.console',
	layout: {
		type: 'vbox',
		align: 'stretch'
	},	
	items: [{
		xtype: 'panel',
		flex: 1,
		autoScroll: true
	}, {
		xtype: 'textfield',
		listeners : {
			'keypress' : handleKeyPress
		},
		enableKeyEvents: true
	}],
	
	processCommand : function(cmd){
		var panel = this.down("panel");
		panel.body.insertHtml("beforeEnd", this.title+": "+cmd+"<br/>");
		var d = panel.body.dom;
		d.scrollTop = d.scrollHeight - d.offsetHeight;
		this.fireEvent('command', this, cmd);
	}
	
});