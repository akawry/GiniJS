Ext.define('GiniJS.view.OpenDialogue', {
	extend: 'Ext.form.Panel',
	alias: 'widget.fileopen',
	title: 'Open',
	floating: true,
	closable: true,
	frame: true,
	width: 400,
	closeAction: 'hide',
	items: [{
        xtype: 'filefield',
        itemId: 'gsavfile',
        fieldLabel: 'File',
        labelWidth: 50,
        msgTarget: 'side',
        allowBlank: false,
        anchor: '100%',
        buttonText: 'Browse',
        listeners : {
        	'afterrender' : function(field){
        		var panel = this.up('panel');
        		field.fileInputEl.dom.addEventListener('change', function(e){
        			panel.file = e.target.files[0];
        		}, false);
        	}
        }
    }],
	buttons: [{
		text: 'Open',
		handler : function(){
			var panel = this.up('panel'),
				file = panel.getComponent('gsavfile').getValue();
			panel.application.fireEvent('load', panel.file);
			panel.hide();
		}
	}]
});
