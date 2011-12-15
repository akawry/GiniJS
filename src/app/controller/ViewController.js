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
		var pstore, istore;
		if (Ext.isEmpty(e.selected)){
			pstore = Ext.data.StoreManager.lookup('GiniJS.store.EmptyProperties');
			istore = Ext.data.StoreManager.lookup('GiniJS.store.EmptyInterfaces');
		} else {
			pstore = e.selected.properties();
			if (Ext.isEmpty(e.selected.get('iface'))){
				istore = Ext.data.StoreManager.lookup('GiniJS.store.EmptyInterfaces');
			} else {
				istore = e.selected.get('iface').properties();
			}
		}
		var pview = Ext.ComponentQuery.query('propertyview')[0];
		if (pview.rendered === true){
			pview.reconfigure(pstore);
		} else {
			console.log("property view not rendered yet ... ");
		}
		
		var iview = Ext.ComponentQuery.query('interfaceview')[0];
		if (iview.rendered === true){
			iview.reconfigure(istore);
		} else {
			console.log("iface view not rendered yet ... ");
		}
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
		var logview = Ext.ComponentQuery.query('logview')[0];
		if (logview.rendered === true){
			logview.log(msg);
		} else {
			console.log("log view not rendered yet ... ");
		}
	},
	
	onLogin : function(user){
		Ext.ComponentQuery.query('loginview')[0].hide();
		this.onLog('Logged in as '+user+'.');
	},
	
	onOpen : function(){
		var me = this;
		if (!Ext.isDefined(this.openForm)){
			this.openForm = Ext.create('GiniJS.view.OpenDialogue', {
				application: this.application
			});
		}
		
		this.openForm.show();
	},
	
	onSaveAs : function(callback){
		var me = this;
		if (!Ext.isDefined(this.saveForm)){
			this.saveForm = Ext.create('GiniJS.view.SaveDialogue', {
				application: this.application,
				callback: callback
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