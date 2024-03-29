Ext.define('GiniJS.view.SaveDialogue', {
	extend: 'Ext.form.Panel',
	alias: 'widget.filesave',
	title: 'Save',
	floating: true,
	closable: true,
	frame: true,
	width: 400,
	closeAction: 'hide',
	items: [{
        xtype: 'textfield',
        itemId: 'gsavfile',
        fieldLabel: 'File',
        labelWidth: 50,
        msgTarget: 'side',
        allowBlank: false,
        anchor: '100%'
    }],
	buttons: [{
		text: 'Save',
		handler : function(){
			var panel = this.up('panel');
			panel.hide();
			if (typeof panel.callback === "function")
				panel.callback.call(this, panel.getComponent('gsavfile').getValue());
		}
	}]
});
