Ext.define('GiniJS.model.Interface', {
	extend: 'Ext.data.Model',
	field: ['id', 'tid'],
	belongsTo: [{
		model: 'GiniJS.model.TopologyNode', foreignKey: 'tid'
	}],
	hasMany: [{
		model: 'GiniJS.model.Property', name: 'properties'
	}],
	property : function(key){
		var prop = this.properties().findRecord('property', key);
		return Ext.isEmpty(prop) ? prop : prop.get('value');
	},
	setProperty : function(key, value, editable){
		var prop = this.properties().findRecord('property', key);
		if (prop){
			prop.set('value', value);
		} else {
			this.properties().loadData([{
				property: key,
				value: value,
				editable: editable || false
			}], true);
		}
	},
	toString : function(){
		var str = this.property('target')+"\n";
	
		/**
		 * TODO: write the Routing information
		 * (for the .gsav files )
		 */
		
		var i = 0, max = this.properties().getCount(); 
		this.properties().each(function(prop){
			if (prop.get('property') !== "target")
				str += "\t"+prop.get('property')+":"+prop.get('value')+((i < max - 1) ? "\n" : "");
				i++;
		});
		
		return str; 
	}
});