/**
 * @file [Please Input File Description]
 * @author leeight(leeight@gmail.com)
 */

define(function (require) {
    // require template
    require('bat-ria/tpl!./settings.tpl.html');

    var FormView = require('bat-ria/mvc/FormView');

    /**
     * [Please Input View Description]
     *
     * @constructor
     */
    function UserSettingsView() {
        FormView.apply(this, arguments);
    }

    /**
     * @inheritDoc
     */
    UserSettingsView.prototype.template = 'TPL_user_settings';

    /**
     * @inheritDoc
     */
    UserSettingsView.prototype.uiProperties = {
        'smtp-tls': {
            'checked': '@formData.smtp.tls'
        },
        'pop3-tls': {
            'checked': '@formData.pop3.tls'
        }
    };

    /**
     * 当用户输入邮箱地址的时候，尝试自动补全高级设置的内容
     * 例如当输入 liyubei@baidu.com 的时候，我就可以猜到其它字段应该
     * 填写的内容了
     * 如果根据输入的邮箱地址无法识别，那么高级设置里面的字段就自动置空，让用户手工输入
     */
    UserSettingsView.prototype._autoComplete = function() {
        var email = this.get('email').getValue();
        var password = this.get('password').getValue();

        var pattern = /^([^@]+)@(.+)$/;
        var match = email.match(pattern) || [];
        if (match) {
            var username = match[1];
            var domain = match[2];
            if (domain === 'baidu.com') {
                this.get('pop3-username').setValue(username);
                this.get('pop3-password').setValue(password);
                this.get('pop3-hostname').setValue('email.baidu.com:995');
                this.get('pop3-interval').setValue('60');
                this.get('pop3-keep_mail_on_server').setValue('14');
                this.get('pop3-tls').setChecked(true);

                this.get('smtp-username').setValue('internal\\' + username);
                this.get('smtp-password').setValue(password);
                this.get('smtp-hostname').setValue('email.baidu.com:25');
                this.get('smtp-tls').setChecked(true);
                return
            }
            else if (domain === '126.com') {
                this.get('pop3-username').setValue(username);
                this.get('pop3-password').setValue(password);
                this.get('pop3-hostname').setValue('pop.126.com:995');
                this.get('pop3-interval').setValue('60');
                this.get('pop3-keep_mail_on_server').setValue('14');
                this.get('pop3-tls').setChecked(true);

                this.get('smtp-username').setValue(username);
                this.get('smtp-password').setValue(password);
                this.get('smtp-hostname').setValue('smtp.126.com:465');
                this.get('smtp-tls').setChecked(true);
                return
            }
        }

        this.get('pop3-username').setValue(match[1] || '');
        this.get('pop3-password').setValue(password);
        this.get('pop3-hostname').setValue(match[2] ? (match[2] + ':110') : '');
        this.get('pop3-interval').setValue('60');
        this.get('pop3-keep_mail_on_server').setValue('0');
        this.get('pop3-tls').setChecked(false);

        this.get('smtp-username').setValue(match[1] || '');
        this.get('smtp-password').setValue(password);
        this.get('smtp-hostname').setValue(match[2] ? (match[2] + ':25') : '');
        this.get('smtp-tls').setChecked(false);
    };

    /**
     * @inheritDoc
     */
    UserSettingsView.prototype.uiEvents = {
        'email:input': function() {
            this._autoComplete();
        },
        'password:input': function() {
            this._autoComplete();
        }
    };

    require('er/util').inherits(UserSettingsView, FormView);
    return UserSettingsView;
});
