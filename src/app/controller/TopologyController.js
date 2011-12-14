var TOPOLOGY_COLORS = {
	detached: '#FFB90F',
	attached: '#55AE3A',
	killed: '#CD3700'
};

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
				'doubleclick': this.onNodeDoubleClick			
			}, 
			'interfaceview > toolbar > button' : {
				'click' : this.onInterfaceChange
			},
			'console' : {
				'hide': this.onConsoleClose
			},
			'taskview > button' : {
				'kill' : this.onKill
			}
		});

		this.application.on({
			'starttopology' : this.startTopology,
			'stoptopology' : this.stopTopology,
			scope : this
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
		
		// draw the power button on the left 
		if (data.componentData.type === "Router" || data.componentData.type === "UML"){
			var xOff = data.componentData.type === "Router" ? 5 : 20,
				yOff = data.componentData.type === "Router" ? 2 : 5;
			sprite.powerButton = Ext.create('Ext.draw.Sprite',{
				x: xOff + sprite.x,
				y: yOff + sprite.y + sprite.height/2 - 5,
				type: 'circle',
				'stroke-width' : 0.7,
				'stroke': "#000000",
				radius: 5,
				fill: TOPOLOGY_COLORS['detached'],
				zIndex: 2,
				xOff: xOff,
				yOff: yOff
			});
			this.canvas.surface.add(sprite.powerButton);
		}
		
		store.add(node);			
		// store.sync();			
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
		if (sprite.powerButton){
			sprite.powerButton.setAttributes({
				x: sprite.powerButton.xOff + sprite.x,
				y: sprite.powerButton.yOff + sprite.y + sprite.height/2 - 5
			});
			if (GiniJS.globals.topologyState === "running"){
				sprite.powerButton.redraw();
			}
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
		data.setProperty('mask', '255.255.255.0');
		data.setProperty('subnet', '192.168.' + this.subnets +'.0');
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
		console.log(this);
		if (GiniJS.globals.topologyState === "off"){
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
		}
		this.selected = node.model;
		this.application.fireEvent('refreshviews', {
			selected: this.selected
		});
	},
	
	onNodeRightClick : function(e){
		var sprite = this.getUnderCursor(e);
		if (!Ext.isEmpty(sprite)){
			this.rightClicked = sprite.model
			var menu = this.rightClickMenus[sprite.model.get('node').get('type')] || this.rightClickMenus["Default"];
			menu.showAt([e.getX(), e.getY()]);
		}
	},
	
	onNodeDoubleClick : function(e){
		var sprite = this.getUnderCursor(e);
		if (!Ext.isEmpty(sprite)){
			var node = sprite.model;
			if (GiniJS.globals.topologyState === "running" && (node.type() === "Router" || node.type() === "UML")){
				var store = Ext.data.StoreManager.lookup('GiniJS.store.TaskStore'),
					task = store.findRecord('name', node.property('name'));
				if (task.get('status') === 'detached'){
					this.application.fireEvent('console', {
						type: 'open',
						name: node.property('name')
					});
					
					sprite.powerButton.setAttributes({
						fill: TOPOLOGY_COLORS['attached']
					});
					sprite.powerButton.redraw();
					
					
					task.set('status', 'attached');
					task.commit();
				}
			}
		}
	},
	
	getUnderCursor : function(e){
		var sprite, x, y,
			 store = Ext.data.StoreManager.lookup('GiniJS.store.TopologyStore'),
			 under = null,
			 me = this;
		store.each(function(rec){
			sprite = rec.get('sprite');
			x = e.getX() - me.canvas.getEl().getX();
			y = e.getY() - me.canvas.getEl().getY();
			if (x >= sprite.x && x <= sprite.x + sprite.width &&
					y >= sprite.y && y <= sprite.y + sprite.height){
					under = sprite;
			}
		});
		return under;
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
		if (GiniJS.globals.topologyState === "running"){
			this.application.fireEvent('log', "You cannot delete items from a running topology!");
			return;
		}
		
		// delete the sprite 
		var spr = node.get('sprite');
		spr.destroy();
		spr.label.destroy();
		if (spr.selectionBox)
			spr.selectionBox.destroy();
		if (spr.powerButton)
			spr.powerButton.destroy();
		
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
					
					if (em.connections().getCount() > 1){
						errorMsg = "Subnet cannot have more than two connections!"
					} else if (sm.connectionsWith("Subnet").length > 0){
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
						} else if (em.connectionsWith("Subnet").length > 0){
							errorMsg = "Switch cannot have more than one Subnet!";
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
					iface.properties().sorters.add(new Ext.util.Sorter({
						property: 'property',
						direction: 'ASC'
					}));
					
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
					iface.properties().sorters.add(new Ext.util.Sorter({
						property: 'property',
						direction: 'ASC'
					}));
					
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

					iface.setProperty('ipv4', '');
					iface.setProperty('mac', '');

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
			
			// Ext.data.StoreManager.lookup('GiniJS.store.TopologyStore').sync();
			
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
			gsav = "",
			i = 0, max = store.getCount();
		store.each(function(node){
			gsav += node.toString()+(i < max - 1 ? "\n" : "");
			i++;
		});
		
		// write edges 
		gsav += "\n";
		var pairs = {},
			pair = "",
			name,
			con_name;
		/**
		 * TODO: does it matter which way the connection is written? ie, 
		 * does (UML_1,Switch_1) == (Switch_1,UML_1) ?
		 * Right now I'm just writing one of the two, but I'm arbitrarily 
		 * writing one of them. 
		 */
		store.each(function(node){
			name = node.property('name');
			node.connections().each(function(con){
				con_name = con.property('name');
				if (!pairs[con_name] || !pairs[con_name][name]){
					pair = 'edge:('+name+','+con_name+')\n\tname:SomeEdge\n';
					if (!pairs[name])
						pairs[name] = {};
					pairs[name][con_name] = pair;
					gsav += pair;
				}
			});
		});
		return gsav;
	},

	startTopology : function(){
		if (GiniJS.globals.topologyState === "off"){
			var taskStore = Ext.data.StoreManager.lookup('GiniJS.store.TaskStore');
			taskStore.remove(taskStore.getRange());
			
			var store = Ext.data.StoreManager.lookup('GiniJS.store.TopologyStore');
			
			// generate IPs and MACs
			var me = this;
			store.each(function(rec){
				if (rec.type() === "UML"){
					var con = rec.connections().first();
					if (con){
						if (con.type() === "Subnet"){
							me.generateIP(rec.interfaces().first(), con, rec);
							me.generateMAC(rec.interfaces().first(), rec);
							rec.interfaces().first().properties().each(function(prop){
								prop.commit();
							});
						} else if (con.type() === "Switch") {
							var subnet = con.otherConnection(rec, "Subnet");
							if (subnet){
								me.generateIP(rec.interfaces().first(), subnet, rec);
								me.generateMAC(rec.interfaces().first(), rec);
								rec.interfaces().first().properties().each(function(prop){
									prop.commit();
								});
							}
						}
					}
				} else if (rec.type() === "Router"){
					rec.interfaces().each(function(iface){
						var target = store.getNodeByName(iface.property('target'));
						if (target){
							var subnet = me.subnetBetween(rec, target);
							me.generateIP(iface, subnet, rec);
							me.generateMAC(iface, rec);
							iface.properties().each(function(prop){
								prop.commit();
							});
						}
					});
				}
			});
			
			store.each(function(rec){
				if (rec.type() === "Router" || rec.type() === "UML"){
					taskStore.loadData([{
						name: rec.property('name'),
						pid: 0,
						status: 'detached'
					}], true);
					rec.get('sprite').powerButton.setAttributes({
						fill: TOPOLOGY_COLORS['detached']
					});
					rec.get('sprite').powerButton.show(true);
				}
				rec.get('sprite').dd.lock();
			});
			GiniJS.globals.topologyState = "running";
		}
	},
	
	stopTopology : function(){
		if (GiniJS.globals.topologyState === "running"){
			var taskStore = Ext.data.StoreManager.lookup('GiniJS.store.TaskStore');
			taskStore.remove(taskStore.getRange());
			
			var store = Ext.data.StoreManager.lookup('GiniJS.store.TopologyStore');
			var me = this;
			store.each(function(rec){
				if (rec.type() === "Router" || rec.type() === "UML"){
					rec.get('sprite').powerButton.hide(true);
				}
				rec.get('sprite').dd.unlock();
			});
			
			GiniJS.globals.topologyState = "off";
		}
	},
	
	onConsoleClose : function(cons, eOpts){
		var store = Ext.data.StoreManager.lookup('GiniJS.store.TopologyStore'),
			node = null;
		store.each(function(rec){
			if (rec.property('name') === cons.title)
				node = rec;
		});
		
		node.get('sprite').powerButton.setAttributes({
			fill: TOPOLOGY_COLORS['detached']
		});
		node.get('sprite').powerButton.redraw();
		
		var taskStore = Ext.data.StoreManager.lookup('GiniJS.store.TaskStore'),
			task = taskStore.findRecord('name', cons.title);
		task.set('status', 'detached');
		task.commit();
	},
	
	onKill : function(row){
		var store = Ext.data.StoreManager.lookup('GiniJS.store.TopologyStore');
		store.each(function(rec){
			if (rec.property('name') === row.get('name')){
				rec.get('sprite').powerButton.setAttributes({
					fill: TOPOLOGY_COLORS['killed']
				});
				rec.get('sprite').powerButton.redraw();	
			}
		});
	},
	
	generateIP : function(iface, subnet, node){
		console.log(iface, subnet, node);
		var net = subnet.property('subnet').split(".")[2],
			num = Number(node.property('name').split("_")[1]);
		if (node.type() === "Router")
			num += 126;
		iface.set('subnet', subnet.property('subnet'));
		console.log(iface.get('subnet'), subnet.property('subnet'));
		iface.setProperty('ipv4', '192.168.' + net + "." + (num + 1));
	},
	
	generateMAC : function(iface, node){
		var num = Number(node.property('name').split("_")[1]),
			mac = "fe:fd:";
		if (node.type() === "UML"){
			mac += "02:00:00:" + (num < 16 ? "0" : "") + toHex(num);
		} else if (node.type() === "Router"){
			var idx = node.interfaces().indexOf(iface);
			mac += "03:" + (num < 16 ? "0" : "" ) + toHex(num) + ":00:" + (idx < 16 ? "0" : "") + toHex(idx);
		}
		iface.setProperty('mac', mac);
	},
	
	subnetBetween : function(a, b){
		var subnet = null;
		a.connections().each(function(con){
			if (con.type() === "Subnet" && 
				(con.connections().first() === a && con.connections().last() === b) ||
				(con.connections().first() === b && con.connections().last() === a))
				subnet = con;
		});
		return subnet;
	},
	
	newTopology : function(){
		var store = Ext.data.StoreManager.lookup('GiniJS.store.TopologyStore');
		store.each(function(rec){
			var sprite = rec.get('sprite');
			sprite.destroy();
			Ext.each(rec.get('connection_sprites'), function(con){
				if (con.destroy)
					con.destroy();
			});
			sprite.label.destroy();
			if (sprite.selectionBox)
				sprite.selectionBox.destroy();
			if (sprite.powerButton)
				sprite.powerButton.destroy();
		});
		
		store.remove(store.getRange());
		
		this.routers = 0;
		this.umls = 0;
		this.switches = 0;
		this.subnets = 0;
		this.firewalls = 0;
		this.uml_freedoss = 0;
		this.uml_androids = 0;
		this.mobiles = 0;
		this.wireless_access_points = 0;
	},
	
	openTopology : function(data){
		
	}
});
	
function toHex(d) {
  var r = d % 16;
  var result;
  if (d-r == 0) 
    result = toChar(r);
  else 
    result = toHex( (d-r)/16 ) + toChar(r);
  return result;
}
 
function toChar(n) {
  const alpha = "0123456789ABCDEF";
  return alpha.charAt(n);
}