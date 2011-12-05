Ext.define('GiniJS.view.LogView', {
	alias: 'widget.logview',
	extend: 'Ext.panel.Panel',
	log : function(msg){
		this.body.insertHtml("beforeEnd", msg+"</br>");
	}
});