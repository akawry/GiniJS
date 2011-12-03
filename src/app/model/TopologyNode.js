Ext.define('GiniJS.model.TopologyNode', {
	requires: ['GiniJS.model.Interface', 'GiniJS.model.Property'],
	extend: 'Ext.data.Model',
	
	fields: [{
		name: 'id'
	}, {
		name: 'node'
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
	property : function(key){
		var prop = this.properties().findRecord('property', key);
		return Ext.isEmpty(prop) ? prop : prop.get('value');
	},
	setProperty : function(key, value){ 
		this.properties().loadData([{
			property: key,
			value: value
		}], true);
	},
	connectionsWith : function(type){
		var cons = [];
		this.connections().each(function(rec){
			if (rec.get('node').get('type') === type)
				cons.push(rec);
		});
		return cons;
	},
	otherConnection : function(node){
		var con = undefined;
		this.connections().each(function(rec){
			if (!con && rec !== node)
				con = rec;
		});
		console.log(this.property('name')+"'s other connection than "+node.property('name')+" is "+con.property('name'));
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
		console.log(this.store);
		var str = this.property('name')+":";
		str += "("+this.get('sprite').x+","+this.get('sprite').y+")\n";
		this.properties().each(function(prop){
			str += "\t" + prop.get('property')+":"+prop.get('value')+"\n";
		});
		var me = this;
		this.interfaces().each(function(iface){
			var node = me.store.getNodeByName(iface.property('target')),
				nodeStr = node.toString(),
				toks = nodeStr.split("\n");
			Ext.each(toks, function(tok){
				str += "\t\t" + tok;
			});
		});
		
		return str;
	}
});