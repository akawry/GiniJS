Ext.require(['Ext.window.Window']);


var handleKeyPress = function(field, e, eOpts){
	if (e.getCharCode() === e.ENTER){
		var cons = this.up('window');
		cons.processCommand(field.getValue());
		field.setValue("");
	}
};

Ext.define('GiniJS.view.Console', {
	extend: 'Ext.window.Window',
	alias: 'widget.console',
	closeAction: 'hide',
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
	
	append : function(msg, user){
		var panel = this.down("panel");
		user = user || this.title;
		var prompt = this.prompt || ": ",
			prefix = user + prompt; 
		panel.body.insertHtml("beforeEnd", prefix + msg + "<br/>");
		var d = panel.body.dom;
		d.scrollTop = d.scrollHeight - d.offsetHeight;
	},
	
	processCommand : function(cmd){
		this.append(cmd);
		this.fireEvent('command', this, cmd);
	}
	
});