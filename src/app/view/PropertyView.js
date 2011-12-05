Ext.define('GiniJS.view.PropertyView', {
	constructor : function(config){
		this.emptyStore = new Ext.data.Store({
			requires: 'GiniJS.model.Property',
			model: 'GiniJS.model.Property',
			storeId: 'GiniJS.store.EmptyProperties'
		});
		GiniJS.view.PropertyView.superclass.constructor.call(this, config);
	},
	alias: 'widget.propertyview',
	extend: 'Ext.grid.Panel',
	store: this.emptyStore,
	columns: [{
		id: 'property',
		header: 'Property',
		dataIndex: 'property',
		flex: 1
	}, {
		id: 'value',
		header: 'Value',
		dataIndex: 'value',
		flex: 1,
		field: 'textfield'
	}],
	selType: 'cellmodel',
    plugins: [
        Ext.create('Ext.grid.plugin.CellEditing', {
            clicksToEdit: 2,
            listeners : {
            	beforeedit : function(e, eOpts){
            		/**
            		 * For some weird reason this only works for the first item you edit ... 
            		 * Clicking on a new topology element and trying to edit that won't work!
            		 */
            		// return e.record.get('editable') === true;
            		return false; // for now, disable editing 	
            	},
            	/**
            	 * TODO: Validate the edit 
            	 */
            	validateedit : function(editor, e, eOpts){
            		
            	},
            	edit : function(editor, e){
            		// remove the red triangle right away 
	            	e.record.commit();
	            }
	       }
        })
    ]
});