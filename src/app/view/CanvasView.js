Ext.define('GiniJS.view.CanvasView', {
	extend: 'Ext.draw.Component',
	alias: 'widget.canvasview',
	viewBox: false,
	listeners : {
		'afterrender' : function(){
			if (!this.dropZone){
				var me = this;
				this.dropZone = new Ext.dd.DropTarget(this.getEl().dom, {
					notifyDrop  : function(ddSource, e, data){
						if (GiniJS.globals.topologyState === "off" && data.componentData){
							me.fireEvent('insertnode', ddSource, e, data, me);
							return true;
						} 
						return false;
					},
					
					notifyOver : function(ddSource, e, data){
						if (GiniJS.globals.topologyState == "off"){
							if (!data.componentData){
								me.fireEvent('dragnode', ddSource, e, data, me);
							}
							return this.dropAllowed;
						}
						return this.dropNotAllowed;
					}
				});
				
				this.getEl().on({
					'contextmenu' : function(e){
						e.preventDefault();
						me.fireEvent('rightclick', e);	
					}
				});
				
				this.getEl().on('dblclick', function(e, el, eOpts){
					me.fireEvent('doubleclick', e);
				});
			}
		}
	}
});
	
