Ext.define('GiniJS.store.TopologyStore', {
	extend: 'Ext.data.Store',
	requires: 'GiniJS.model.TopologyNode',
	model: 'GiniJS.model.TopologyNode',
	getNodeByName : function(name){
		var node = null;
		this.each(function(rec){
			if (rec.property('name') === name)
				node = rec;
		});
		return node;
	}
});

Ext.create('GiniJS.store.TopologyStore', {
	storeId: 'GiniJS.store.TopologyStore'
});