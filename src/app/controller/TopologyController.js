

Ext.define('GiniJS.controller.TopologyController', {
	extend: 'Ext.app.Controller',
	id: 'GiniJS.controller.TopologyController',
	init : function(app){
		console.log("Initializing topology ... ");
		this.control ({
			'canvasview' : {
				'insertnode' : this.onInsertNode,
				'dragnode' : this.onDragNode,
				'rightclick' : this.onNodeRightClick,			
			}, 
			'interfaceview > toolbar > button' : {
				'click' : this.onInterfaceChange
			}
		});
		
		this.routers = 0;
		this.umls = 0;
		this.switches = 0;
		this.subnets = 0;
		this.firewalls = 0;
		this.uml_freedoss = 0;
		this.uml_androids = 0;
		this.mobiles = 0;
		this.wireless_access_points = 0;
		
		this.rightClickMenus = {};
		this.rightClickMenus["UML"] = Ext.create('Ext.menu.Menu', {
			items: [{
				text: 'Delete'
			}, {
				text: 'Restart'
			}, {
				text: 'Stop'
			}],
			listeners: {
				'click' : this.onUMLRightClick,
				scope : this
			}
		});
		
		this.rightClickMenus["Subnet"] = Ext.create('Ext.menu.Menu', {
			items: [{
				text: 'Delete'
			}],
			listeners: {
				'click' : this.onSubnetRightClick,
				scope : this
			}
		});
		
		this.rightClickMenus["Router"] = Ext.create('Ext.menu.Menu', {
			items: [{
				text: 'Delete'
			}, {
				text: 'Restart'
			}, {
				text: 'Stop'
			}, {
				text: 'Wireshark'
			}, {
				text: 'Graph'
			}],
			listeners: {
				'click' : this.onRouterRightClick,
				scope : this
			}
		});
		
		this.rightClickMenus["Switch"] = Ext.create('Ext.menu.Menu', {
			items: [{
				text: 'Delete'
			}],
			listeners: {
				'click' : this.onSwitchRightClick,
				scope : this
			}
		});
		
		this.rightClickMenus["Default"] = Ext.create('Ext.menu.Menu', {
			items: [{
				text: 'Delete'
			}],
			listeners : {
				'click' : this.onDefaultRightClick,
				scope : this
			}
		});
		
	},
	
	getNodeByType : function(type){
		var store = Ext.data.StoreManager.lookup('GiniJS.store.TopologyStore');
		var r = [];
		store.each(function(rec){
			if (rec.get('node').get('type') === type)
				r.push(rec);
		});
		return r;
	},
	
	onInsertNode : function(ddSource, e, data, canvas){
		console.log("Inserting node ... ", ddSource, e, data, canvas);

		if (!this.canvas){
			this.canvas = canvas;
		}
		
		var store = Ext.data.StoreManager.lookup('GiniJS.store.TopologyStore'),
			 comps = Ext.data.StoreManager.lookup('GiniJS.store.ComponentStore'),
			 mdl = comps.findRecord('type', data.componentData.type);			
		
		var x = e.getX() - canvas.getEl().getX(),
			 y = e.getY() - canvas.getEl().getY(),
			 id = Ext.id();
				
		var node = Ext.create('GiniJS.model.TopologyNode', {
			node: mdl,
			connection_sprites: []
		});
		
		node.properties().filterOnLoad = false;			
		node.connections().filterOnLoad = false;
		node.interfaces().filterOnLoad = false;
	
		var sprite = Ext.create('Ext.draw.Sprite', {
			type: 'image',
			x: x,
			y: y,
			id: id,
			width: data.componentData.width,
			height: data.componentData.height,
			src: data.componentData.icon,
			draggable: {
				constrain: true,
				constrainTo: canvas.getEl()
			},
			listeners : {
				'click' : this.onNodeClick,
				scope : this
			},
			model : node,
			zIndex: 1
		});
		
		node.set('sprite', sprite);
		canvas.surface.add(sprite).show(true);
			 
		switch ( data.componentData.type ){
			case "Router":
				this.onInsertRouter(node);
				break;
			case "UML":
				this.onInsertUML(node);
				break;
			case "Switch":
				this.onInsertSwitch(node);
				break;
			case "Subnet":
				this.onInsertSubnet(node);
				break;
			case "UML_FreeDOS":
				this.onInsertFreeDOS(node);
				break;
			case "Mobile":
				this.onInsertMobile(node);
				break;
			case "UML_Android":
				this.onInsertUMLAndroid(node);
				break;
			case "Firewall":
				this.onInsertFirewall(node);
				break;
			case "Wireless_access_point":
				this.onInsertWirelessAccessPoint(node);
				break;
		}
		
		sprite.label = Ext.create('Ext.draw.Sprite', {
			type: 'text',
			text: node.property('name'),
			y: y + data.componentData.height + 10,
			x: x + data.componentData.width/2 - (node.property('name').length * 6)/2
		});
		canvas.surface.add(sprite.label).show(true);
		
		/**
		 * TODO: The circle thingies to show if the device is on ?
		 */
		
		store.add(node);			
					
	},
	
	onDragNode : function(ddSource, e, data, canvas){
		// mouse is moving too fast and gets off the image 
		if (e.target.nodeName !== "image")
			return;
			
		var sprite = data.sprite,
			x = Ext.fly(e.target).getX() - canvas.getEl().getX(),
			y = Ext.fly(e.target).getY() - canvas.getEl().getY();
		sprite.x = x;
		sprite.y = y;
		sprite.label.setAttributes({
			x: sprite.x + sprite.width/2 - (sprite.label.text.length * 6)/2,
			y: sprite.y + sprite.height + 10
		});
		sprite.label.redraw();
		if (this.dragStart === sprite && sprite.selectionBox){
			sprite.selectionBox.destroy();
			sprite.selectionBox = this.getSelectionBox(sprite);
			this.canvas.surface.add(sprite.selectionBox).show(true);
		}
		this.redrawConnections(data.sprite);
	},
	
	onInsertRouter : function(data){
		console.log("Inserting router ... ", data);
		data.setProperty('name', 'Router_' + (++this.routers), true);
	},
	
	onInsertUML : function(data){
		console.log("Inserting UML ... ", data);
		data.setProperty('name', 'UML_' + (++this.umls), true);
		
		// Are these dynamically allocated ?
		data.setProperty('filesystem', 'root_fs_beta2', false);
		data.setProperty('filetype', 'cow', false);
		
	},
	
	onInsertSwitch : function(data){
		console.log("Inserting Switch ... ", data);
		data.setProperty('name', 'Switch_' + (++this.switches), true);
		data.setProperty('Hub mode', false, true); 
	},
	
	onInsertSubnet : function(data){
		console.log("Inserting Subnet ... ", data);
		data.setProperty('name', 'Subnet_' + (++this.subnets), true);
	},
	
	onInsertFreeDOS : function(data){
		console.log("Inserting Free DOS ... ", data);
		data.setProperty('name', 'UML_FreeDOS_' + (++this.uml_freedoss), true);
	},
	
	onInsertMobile : function(data){
		console.log("Inserting Mobile ... ", data);
		data.setProperty('name', 'Mobile_' + (++this.mobiles), true);
	},
	
	onInsertUMLAndroid : function(data){
		console.log("Inserting Android UML ... ", data);
		data.setProperty('name', 'UML_Android_' + (++this.uml_androids), true);
	},
	
	onInsertFirewall : function(data){
		console.log("Inserting Firewall ... ", data);
		data.setProperty('name', 'Firewall_' + (++this.firewalls), true);
	},
	
	onInsertWirelessAccessPoint : function(data){
		console.log("Inserting Wirless Access Point ... ", data);
		data.setProperty('name', 'Wireless_access_point_' + (++this.wireless_access_points), true);
	},
	
	getSelectionBox : function(node){
		return Ext.create('Ext.draw.Sprite', {
			type: 'path',
			path: new Ext.XTemplate('M {lx} {ty} L {rx} {ty} M {rx} {ty} L {rx} {by} M {rx} {by} L {lx} {by} M {lx} {by} L {lx} {ty}').apply({
				lx: node.x,
				rx: node.x + node.width,
				ty: node.y,
				by: node.y + node.height
			}),
			'stroke-width' : 1,
			'stroke': "#CDCDCD"
		});
	},
	
	onNodeClick : function(node, e, eOpts){
		// handle connections 
		if (e.ctrlKey === true){
			if (!this.dragStart){
				this.dragStart = node;
				
				// draw selection box 
				node.selectionBox = this.getSelectionBox(node);	
				this.canvas.surface.add(node.selectionBox).show(true);				
				
			} else if (node != this.dragStart){
			
				// remove other selection box
				this.dragStart.selectionBox.destroy();
				this.onInsertConnection(this.dragStart, node);
				this.dragStart = undefined;
			} else {
				this.dragStart.selectionBox.destroy();
				// deselect connection 
				this.dragStart = undefined;
			}
			return false;
		}
		this.selected = node.model;
		this.application.fireEvent('refreshviews', {
			selected: this.selected
		});
	},
	
	onNodeRightClick : function(e){
		var sprite, x, y, me = this,
			 store = Ext.data.StoreManager.lookup('GiniJS.store.TopologyStore');
		store.each(function(rec){
			sprite = rec.get('sprite');
			x = e.getX() - me.canvas.getEl().getX();
			y = e.getY() - me.canvas.getEl().getY();
			if (x >= sprite.x && x <= sprite.x + sprite.width &&
					y >= sprite.y && y <= sprite.y + sprite.height){
					
					me.rightClicked = sprite.model;
					var menu = me.rightClickMenus[sprite.model.get('node').get('type')] || me.rightClickMenus["Default"];
					menu.showAt([e.getX(), e.getY()]);
					
			}
		});
	},
	
	onUMLRightClick : function(menu, item, e, eOpts){
		console.log("Selected something from the UML right click menu...", menu, item, e, eOpts);
		switch (item.text){
			case "Delete":
				this.onNodeDelete(this.rightClicked);
				break;
		}
	},
	
	onRouterRightClick : function(menu, item, e, eOpts){
		console.log("Selected something from the Router right click menu...", menu, item, e, eOpts);
		switch (item.text){
			case "Delete":
				this.onNodeDelete(this.rightClicked);
				break;
		}
	},
	
	onSubnetRightClick : function(menu, item, e, eOpts){
		console.log("Selected something from the Subnet right click menu...", menu, item, e, eOpts);
		switch (item.text){
			case "Delete":
				this.onNodeDelete(this.rightClicked);
				break;
		}
	},
	
	onSwitchRightClick : function(menu, item, e, eOpts){
		console.log("Selected something from the Switch right click menu...", menu, item, e, eOpts);
		switch (item.text){
			case "Delete":
				this.onNodeDelete(this.rightClicked);
				break;
		}
	},
	
	onDefaultRightClick : function(menu, item, e, eOpts){
		console.log("Selecting something from an item whose logic has not been implemented yet ....", menu, item, e, eOpts);
		switch (item.text){
			case "Delete":
				this.onNodeDelete(this.rightClicked);
				break;
			
		}
	},
	
	onNodeDelete : function(node){
		console.log("Deleting", node);
		
		// delete the sprite 
		node.get('sprite').destroy();
		
		// delete all the lines out of this node 
		Ext.each(node.get('connection_sprites'), function(sprite){
			node.connections().each(function(con){
				var sprites = con.get('connection_sprites');
				sprites.splice(sprites.indexOf(sprite), 1);
			});
			sprite.destroy();		
		});
		
		// remove any interfaces pointing to the deleted node 
		var store = Ext.data.StoreManager.lookup('GiniJS.store.TopologyStore');
		var me = this;
		if (node.get('node').get('type') !== "Subnet"){
			store.each(function(con){
				var iface = con.interface(node.property('name'));
				if (!Ext.isEmpty(iface)){
					con.interfaces().remove(iface);
					if (con.get('iface') === iface){
						con.set('iface', con.interfaces().first());
						if (me.selected === con){
							Ext.ComponentQuery.query('interfaceview')[0].reconfigure(con.get('iface').properties());
						}
					}
				}
			});
		// subnet acts as a bridge between two components,
		// and subnet is being deleted 
		} else {
			if (node.connections().getCount() === 2){
				var a = node.connections().first(), b = node.connections().last();
				var iface = a.interface(b.property('name'));
				a.interfaces().remove(iface);
				if (a.get('iface') === iface){
					a.set('iface', a.interfaces().first());
				}
				
				iface = b.interface(a.property('name'));
				b.interfaces().remove(iface);
				if (b.get('iface') === iface){
					b.set('iface', b.interfaces().first());
				}	
				
				me.application.fireEvent('refreshviews', {
					selected: this.selected
				});
			}
		}		
		
		// remove connections from other nodes
		node.connections().each(function(con){
			console.log(con);
			con.connections().remove(node);
		});
		
		// remove from the store of nodes 
		store.remove(node);		
	},
	
	onDrawConnection : function(start, end){
		var p = new Ext.XTemplate('M {startx},{starty} L {endx},{endy}').apply({
			startx: start.x + start.width/2,
			starty: start.y + start.height/2,
			endx: end.x + end.width/2,
			endy: end.y + end.height/2
		});
		var sprite = Ext.create('Ext.draw.Sprite', {
			type: 'path',
			path: p,
			'stroke-width' : 2,
			'stroke' : '#000000'
		});

		start.model.get('connection_sprites').push(sprite);
		end.model.get('connection_sprites').push(sprite);
		this.canvas.surface.add(sprite).show(true);
	},
	
	redrawConnections : function(sprite){
		var sprites = sprite.model.get('connection_sprites');
		Ext.each(sprites, function(s){
			s.destroy();
		})
		sprite.model.set('connection_sprites', []);
		var me = this;
		sprite.model.connections().each(function(con){
			me.onDrawConnection(sprite, con.get('sprite'));
		});
	},

	
	onInsertConnection : function(start, end){
		console.log("got a connection!!!");
		console.log(start, end);
		var sm = start.model,
			 em = end.model,
			 startType = sm.get('node').get('type'),
			 endType = em.get('node').get('type'),
			 success = false,
			 errorMsg = undefined;

		/**
		 * TODO: Consider the other component types ... 
		 */

		switch (startType){
			case "UML":

				if (sm.connections().getCount() > 0){
					errorMsg = "UML cannot have more than one connection!";
				} else {
					if (endType === "Switch" || endType == "Subnet"){
						success = true;
					}
				}
	
				break;
				
			case "Switch":
			
				if (endType === "UML"){
					if (em.connections().getCount() > 0){
						errorMsg = "UML cannot have more than one connection!";
					} else {
						success = true;
					}
					
				} else if (endType === "Subnet"){
					
					if (sm.connectionsWith("Subnet").length > 0){
						errorMsg = "Switch cannot have more than one Subnet!";
					} else if (em.connectionsWith("Switch").length > 0){
						errorMsg = "Subnet cannot have more than one Switch!";
					} else {
						success = true;
					}
					
				} 
				
				break;
			
			case "Router":
			
				if (endType === "Subnet"){
					if (em.connections().getCount() < 2){
						success = true;
					} else {
						errorMsg = "Subnet cannot have more than two connections!";
					}
				}
				
				break;
			
			case "Subnet":
				
				if (sm.connections().getCount() >= 2){
					errorMsg = "Subnet cannot have more than two connections!";
				} else {
					if (endType === "Router"){
						success = true;
						
					} else if (endType === "Switch"){
						
						if (sm.connectionsWith("Switch").length > 0){
							errorMsg = "Subnet cannot have more than one Switch!";
						} else {
							success = true;
						}
						
					} else if (endType === "UML"){
						if (em.connections().getCount() > 0){
							errorMsg = "UML cannot have more than one connection!"
						} else {
							success = true;
						}
					}
				}
				
				break;	
		}
		
		if (success === true){

			if (sm.connections().indexOf(em) === -1 && em.connections().indexOf(sm) === -1){
				sm.connections().loadRecords([em], {
					addRecords: true
				});
				em.connections().loadRecords([sm], {
					addRecords: true
				});
				
				if (startType === "UML" || startType === "Router"){
					console.log("Adding interface to " + sm.property("name"), sm.interfaces().getCount());
					var iface = Ext.create('GiniJS.model.Interface', {
						id: Ext.id(),
						tid: sm.get('id')
					});
					iface.properties().filterOnLoad = false;
					
					if (startType === "UML"){
						if (endType === "Switch"){
							iface.setProperty('target', em.property('name'));
						} else if (endType === "Subnet"){
							// find other side of connection
							if (em.connections().getCount() > 1){
								iface.setProperty('target', em.otherConnection(sm).property('name'));
							}
						}
					} else if (startType === "Router"){
						if (em.connections().getCount() > 1){
							var other = em.otherConnection(sm);
							iface.setProperty('target', other.property('name'));
							if (other.get('node').get('type') === "UML" || other.get('node').get('type') === "Router"){
								var other_iface = other.emptyInterface();
								other_iface.setProperty('target', sm.property('name'));
								other.set('iface', other_iface);
							}
						}
					} else if (startType === "Switch"){
						if (endType === "UML"){
							iface.setProperty('target', em.property('name'));
						} else if (endType === "Subnet"){
							if (em.connections().getCount() > 1){
								iface.setProperty('target', em.otherConnection(sm).property('name'));
							}
						}
					}
								
					
					// TODO: These are allocated dynamically
					iface.setProperty('mac', '');
					iface.setProperty('ipv4', '');
					
					sm.interfaces().loadRecords([iface], {
						addRecords : true
					});
					if (!Ext.isEmpty(iface.property('target'))){
						sm.set('iface', iface);
						console.log("Setting " + sm.property('name')+"'s interface target as "+iface.property('target'));
					}					
				}
				
				if (endType === "Router" || endType === "UML"){
					console.log("Adding interface to "+em.property("name"), em.interfaces().getCount());
					var iface = Ext.create('GiniJS.model.Interface', {
						id: Ext.id(),
						tid: sm.get('id')
					});
					iface.properties().filterOnLoad = false;
					if (startType === "Subnet"){
						if (sm.connections().getCount() > 1){
							var other = sm.otherConnection(em);
							iface.setProperty('target', other.property('name'));
							if (other.get('node').get('type') === "UML" || other.get('node').get('type') === "Router"){
								var other_iface = other.emptyInterface();
								other_iface.setProperty('target', em.property('name'));
								other.set('iface', other_iface);
							}
						}
					} else if (endType === "UML"){
						iface.setProperty('target', sm.property('name'));
					}
					
					// TODO: These are allocated dynamically
					iface.setProperty('mac', '');
					iface.setProperty('ipv4', '');
					
					em.interfaces().loadRecords([iface], {
						addRecords: true
					});
					
					if (!Ext.isEmpty(iface.property('target'))){
						em.set('iface', iface);
						console.log("Setting " + em.property('name')+"'s interface target as "+iface.property('target'));
					}				
				} 
				
				if (endType === "Switch" && startType === "Subnet"){
					if (sm.connections().getCount() > 1){
						var other = sm.otherConnection(em),
						    other_iface = other.emptyInterface();
						other_iface.setProperty('target', em.property('name'));
						if (Ext.isEmpty(other.get('iface')))
							other.set('iface', other_iface);
					}
				}
						
				
				this.onDrawConnection(start, end);
			}
			
		} else {
			Ext.Msg.alert("Error", errorMsg || ("Cannot connect " + startType + " and " + endType));
		}
			 
	},
	
	onInterfaceChange : function(btn){
		var idx = this.selected.interfaces().indexOf(this.selected.get('iface'));
		if (btn.text === "<"){
			if (idx > 0){
				this.selected.set('iface', this.selected.interfaces().getAt(idx - 1));
			}			
		} else if (btn.text === ">"){
			if (idx < this.selected.interfaces().getCount() - 1){
				this.selected.set('iface', this.selected.interfaces().getAt(idx + 1));
			}
		}
		this.application.fireEvent('refreshviews', {
			selected: this.selected
		}); 
	},
	
	topologyToGSAV : function(){
		var store = Ext.data.StoreManager.lookup('GiniJS.store.TopologyStore');
		var gsav = "";
		store.each(function(node){
			gsav += node.toString();
		});
		console.log(gsav);
	}
	
});