"use strict"

var _Global = {
    url: '../../../apix/Login/',
}

var Login = {

    Init: function () {
        document.getElementById('divMain').addEventListener('click', this);
    },

    UserLogin: function () {
       
        var userMeta = _$modxAppCore.getAppCoreModel('userMeta');
        if (userMeta.UserName.trim() == '') {
            $('#error').html('Please enter Username');
            return;
        }

        if (userMeta.Password == '') {
            $('#error').html('Please enter Password');
            return;
        }

        $('#error').html('');
        _$modxAppProgressBar.show();
        var functionName = "UserLogin";
        var postbackUrl = _Global.url + '/' + functionName;

        __DoAsyncPostBack(userMeta, postbackUrl, function (ajxOut) {
            if (ajxOut.Success == false) {
                _$modxAppProgressBar.hide();
                $('#error').html(ajxOut.Message);
                return;
            }

            if (ajxOut.Success == true) {
                if (ajxOut.Command == "ShowDBList") {
                    location.href = "userDBList.html";
                }
                else {
                    location.href = "dashboard.html";
                    _$modxAppProgressBar.hide();
                }
            }
            _$modxAppProgressBar.hide();
        });
    },

    handleEvent: function (ev) {
        ev.preventDefault();
        var target = ev.target;
        var currentTarget = ev.currentTarget;
        var evlCase = currentTarget.getAttribute('data-evl');
        var evCase = target.getAttribute('data-ev');

        switch (evCase) {
            case 'EV_LOGIN':
                this.UserLogin();
                break;
        }
    },
}

Login.Init();

//if (window.location.protocol != "https:") {
//    window.location.protocol = "https";
//}