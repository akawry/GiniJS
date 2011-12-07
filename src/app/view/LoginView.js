Ext.define('GiniJS.view.LoginView', {
	extend: 'Ext.form.Panel',
	alias: 'widget.loginview',
	title: 'Login',
	modal: true,
	floating: true,
	frame: true,
	bodyPadding: '10',
	width: 300,
	items: [{
		xtype: 'textfield',
		fieldLabel: 'User',
		itemId: 'userField'
	}, {
		xtype: 'textfield',
		fieldLabel: 'Password',
		inputType: 'password',
		itemId: 'passwordField'
	}],
	buttons: [{
		text: 'Login',
		dock: 'bottom',
		handler : function(){
			var p = this.up('panel'),
				user = p.getComponent('userField').getValue(),
				pass = p.getComponent('passwordField').getValue();
			this.fireEvent('login', user, pass);
		}
	}]
});
