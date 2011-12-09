Ext.define('GiniJS.controller.ViewController', {
	extend: 'Ext.app.Controller',
	id: 'GiniJS.controller.ViewController',
	init : function(){
		console.log("Initializing view controller...");
		
		this.taskManager = Ext.create('GiniJS.view.TaskView', {
			title: 'Task Manager',
			minWidth: 100,
			width: 300,
		});	
		this.consoles = {};
		
		this.application.on({
			'refreshviews' : this.refreshViews,
			'console' : this.onConsole,
			'starttopology' : this.onStartTopology,
			'stoptopology' : this.onStopTopology,
			'log' : this.onLog,
			'login' : this.onLogin,
			'open' : this.onOpen,
			'saveas' : this.onSaveAs,
			'options' : this.onOptions,
			scope : this
		});
		
		this.control({
			'component' : {
				'log' : function(msg){
					Ext.ComponentQuery.query('logview')[0].log(msg);
				}
			},
			'taskview > button': {
				'kill': this.onKill
			}
		});
	},
	 
	refreshViews : function(e){
		var store = Ext.isEmpty(e.selected) ? Ext.data.StoreManager.lookup('GiniJS.store.EmptyProperties') : e.selected.properties();
		Ext.ComponentQuery.query('propertyview')[0].reconfigure(store);
		store = (Ext.isEmpty(e.selected) || Ext.isEmpty(e.selected.get('iface'))) ? Ext.data.StoreManager.lookup('GiniJS.store.EmptyInterfaces') : e.selected.get('iface').properties();
		Ext.ComponentQuery.query('interfaceview')[0].reconfigure(store);
	},
	
	onConsole : function(e){
		if (e.type === "open"){
			this.consoles[e.name] = Ext.create('GiniJS.view.Console', {
				title: e.name,
				width: 300,
				height: 300,
				prompt: "> "
			});
			this.consoles[e.name].show();
		} else if (e.type === "msg"){
			var cons = this.consoles[e.name];
			if (cons){
				cons.append(e.msg, "");
			}
		}
	},
	
	onKill : function(row){
		var cons = this.consoles[row.get('name')];
		if (cons){
			cons.hide();
		}
	},
	
	onStartTopology : function(){
		this.taskManager.show();
	},
	
	onStopTopology : function(){
		this.taskManager.hide();
		for (var console in this.consoles){
			if (console !== "gserver " + GiniJS.globals.gserverVersion)
				this.consoles[console].hide();
		}
	},
	
	onLog : function(msg){
		Ext.ComponentQuery.query('logview')[0].log(msg);
	},
	
	onLogin : function(user){
		Ext.ComponentQuery.query('loginview')[0].hide();
		this.onLog('Logged in as '+user+'.');
	},
	
	onOpen : function(){
		var me = this;
		if (!Ext.isDefined(this.openForm)){
			this.openForm = Ext.create('Ext.form.Panel', {
				alias: 'widget.fileopen',
				title: 'Open',
				floating: true,
				closable: true,
				frame: true,
				width: 400,
				closeAction: 'hide',
				items: [{
			        xtype: 'filefield',
			        itemId: 'gsavfile',
			        fieldLabel: 'File',
			        labelWidth: 50,
			        msgTarget: 'side',
			        allowBlank: false,
			        anchor: '100%',
			        buttonText: 'Browse'
			    }],
				buttons: [{
					text: 'Open',
					handler : function(){
						var panel = this.up('panel'),
							file = panel.getComponent('gsavfile').getValue();
						me.application.fireEvent('load', file);
						panel.hide();
					}
				}]
			});
		}
		
		this.openForm.show();
	},
	
	onSaveAs : function(callback){
		var me = this;
		if (!Ext.isDefined(this.saveForm)){
			this.saveForm = Ext.create('Ext.form.Panel', {
				alias: 'widget.filesave',
				title: 'Save',
				floating: true,
				closable: true,
				frame: true,
				width: 400,
				closeAction: 'hide',
				items: [{
			        xtype: 'textfield',
			        itemId: 'gsavfile',
			        fieldLabel: 'File',
			        labelWidth: 50,
			        msgTarget: 'side',
			        allowBlank: false,
			        anchor: '100%'
			    }],
				buttons: [{
					text: 'Save',
					handler : function(){
						var panel = this.up('panel');
						GiniJS.globals.open = panel.getComponent('gsavfile').getValue();
						me.application.fireEvent('save', callback);
						panel.hide();
					}
				}]
			});
		}

		this.saveForm.show();
	},
	
	onOptions : function(){
		if (!Ext.isDefined(this.optionsForm)){
			this.optionsForm = Ext.create('GiniJS.view.OptionsView');
		}
		this.optionsForm.show();
	}
	
});