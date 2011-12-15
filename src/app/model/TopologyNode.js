Ext.define('GiniJS.model.TopologyNode', {
	requires: ['GiniJS.model.Interface', 'GiniJS.model.Property'],
	extend: 'Ext.data.Model',
	
	fields: [{
		name: 'id'
	}, {
		name: 'type'
	}, {
		name: 'iface'
	}, {
		name: 'sprite'
	}, {
		name: 'connection_sprites'
	}],
	
	hasMany: [{
		model: 'GiniJS.model.TopologyNode', name: 'connections'
	}, {
		model: 'GiniJS.model.Interface', name: 'interfaces'
	}, {
		model: 'GiniJS.model.Property', name: 'properties'
	}],
		
	/*proxy: {
		type: 'localstorage',
		id: 'GiniJS.localstorage.Topology'
	},*/
	
	property : function(key){
		var prop = this.properties().findRecord('property', key);
		return Ext.isEmpty(prop) ? prop : prop.get('value');
	},
	setProperty : function(key, value, editable){ 
		this.properties().loadData([{
			property: key,
			value: value,
			editable: editable || false
		}], true);
	},
	connectionsWith : function(type){
		var cons = [];
		this.connections().each(function(rec){
			if (rec.type() === type)
				cons.push(rec);
		});
		return cons;
	},
	otherConnection : function(node, type){
		var con = undefined;
		this.connections().each(function(rec){
			if (!con && rec !== node && (!type || rec.type() === type))
				con = rec;
		});
		return con;
	},
	emptyInterface : function(){
		var iface;
		this.interfaces().each(function(rec){
			if (Ext.isEmpty(rec.property('target')))
				iface = rec;
		});
		return iface;
	},
	
	interface : function(target){
		var found;
		this.interfaces().each(function(rec){
			if (rec.property('target') === target)
				found = rec;
		});
		return found;
	},
	
	/**
	 * TODO: Complete this so that the .gsav file can be generated
	 */
	toString : function(){
		var str = this.property('name')+":",
			i = 0, max = this.properties().getCount();
		
		str += "("+this.get('sprite').x+","+this.get('sprite').y+")\n";
		
		this.properties().each(function(prop){
			str += "\t" + prop.get('property')+":"+prop.get('value')+(i < max - 1 ? "\n" : "");
			i++;
		});
		
		if (this.interfaces().getCount() > 0)
			str += "\n";
		
		var me = this,
			toks = [];
		this.interfaces().each(function(iface){
			str += "\t\tinterface:";
			toks = iface.toString().split("\n");
			// first token is name 
			str += toks[0] + "\n";
			for (i = 1; i < toks.length; i++){
				str += "\t\t" + toks[i] + (i < toks.length - 1 ? "\n" : "");
			};
		});
		
		return str;
	},
	
	toJSON : function(){
		var obj = {};
		obj.id = this.get('id');
		obj.x = this.get('sprite').x;
		obj.y = this.get('sprite').y;
		obj.type = this.get('type');
		
		obj.properties = [];
		this.properties().each(function(prop){
			obj.properties.push(prop.toJSON());
		});
		
		obj.interfaces = [];
		this.interfaces().each(function(iface){
			obj.interfaces.push(iface.toJSON());
		});
		
		obj.connections = [];
		this.connections().each(function(con){
			obj.connections.push(con.getId());
		});
		
		return obj;
	},
	
	type : function(){
		return this.get('type');
	},
	
	statics : {	
		fromJSON : function(obj){
			var id = Ext.id();
			var model = Ext.create('GiniJS.model.TopologyNode', {
				id: id,
				connection_sprites: [],
				type: obj.type
			});
			
			model.connections().filterOnLoad = false;
			
			model.properties().filterOnLoad = false;
			model.properties().loadData(obj.properties);
			
			model.interfaces().filterOnLoad = false;
			var ifaces = [],
				iface;
			Ext.each(obj.interfaces, function(i){
				iface = Ext.create('GiniJS.model.Interface', {
					id: Ext.id(),
					tid: id,
					subnet: i.subnet
				});
				iface.properties().filterOnLoad = false;
				iface.properties().loadData(i.properties);
				
				ifaces.push(iface);
			});
			model.interfaces().loadRecords(ifaces);
			model.set('iface', iface);
			
			return model;
		}
	}
});
