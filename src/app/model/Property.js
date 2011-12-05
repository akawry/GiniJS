Ext.define('GiniJS.model.Property', {
	extend: 'Ext.data.Model',
	idProperty: 'property',
	fields: [{
		name: 'property'
	}, {
		name: 'value'
	}, {
		name: 'editable', type: 'boolean'
	}]
});