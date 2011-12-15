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
		},
		'resize' : function(me, width, height){
			this.width = width;
			this.height = height;
			this.updateGrid();
		}
	},
	updateGrid : function(width, height){
		
		Ext.each(this.grid, function(g){
			g.destroy();
		});
		this.grid = [];

		if (GiniJS.globals.options['showgrid'] === "on"){
			console.log("here");
			var gwidth = GiniJS.globals.options['gridwidth'],
				gheight = GiniJS.globals.options['gridheight'],
				xdivs = this.width / gwidth,
				ydivs = this.height/gheight,
				sprite, p;
			for (var i = 0; i < xdivs; i++){
				p = new Ext.XTemplate('M {startx},{starty} L {endx},{endy}').apply({
					startx: i * gwidth,
					starty: 0,
					endx: i * gwidth,
					endy: this.height
				});
				sprite = Ext.create('Ext.draw.Sprite', {
					type: 'path',
					path: p,
					stroke: GiniJS.globals.options['gridcolor'] || "#DEDEDE",
					'stroke-width' : 1
				});
				this.surface.add(sprite).show(true);
				this.grid.push(sprite);
			}
			
			for (var i = 0; i < ydivs; i++){
				p = new Ext.XTemplate('M {startx},{starty} L {endx},{endy}').apply({
					startx: 0,
					starty: i * gheight,
					endx: this.width,
					endy: i * gheight
				});
				sprite = Ext.create('Ext.draw.Sprite', {
					type: 'path',
					path: p,
					stroke: GiniJS.globals.options['gridcolor'] || "#DEDEDE",
					'stroke-width' : 1
				});
				this.surface.add(sprite).show(true);
				this.grid.push(sprite);
			}
		}
	}
});
	
