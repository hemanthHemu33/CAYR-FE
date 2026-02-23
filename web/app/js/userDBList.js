"use strict"

var _GlobalUserDBInfo = {
    url: '../../../apix/UserSession/',
}

var userDBInfo = {
    Init: function () {
        document.getElementById('divMain').addEventListener('click', this);
        userDBInfo.GetUserDatabases();
    },

    GetUserDatabases: function () {
        var meta = {};

        var functionName = "GetUserDatabases";
        var postbackUrl = _GlobalUserDBInfo.url + '/' + functionName;

        __DoAsyncPostBack(meta, postbackUrl, function (ajxOut) {
            _$modxAppProgressBar.hide();
            if (ajxOut.Success == false) {
                $('#error').html(ajxOut.Message);
                if (ajxOut.Command == 'No_Session') {
                    location.href = "login.html";
                }
                return;
            }

            if (ajxOut.Success == true) {
                userDBInfo.LoadDBList(ajxOut.ResultData);
            }
        });
    },

    LoadDBList: function (data) {
        for (var i = 0; i < data.length; i++) {
            var dbInfo = 'Client: ' + data[i].ClientName + " - DB: " + data[i].DataBaseEnterprise
            $('#userDbList').append("<option value='" + data[i].URID + "'>" + dbInfo + "</option>");
        }
    },

    ConnectToDB: function () {
        var meta = {};
        meta.URID = $('#userDbList').val();
        if (meta.URID == null || meta.URID == '') {
            $('#error').html('Please select a database from above list');
            return;
        }

        $('#error').html('');

        var functionName = "ConnectToDB";
        var postbackUrl = _GlobalUserDBInfo.url + '/' + functionName;

        __DoAsyncPostBack(meta, postbackUrl, function (ajxOut) {
            _$modxAppProgressBar.hide();
            if (ajxOut.Success == false) {
                $('#error').html(ajxOut.Message);
                if (ajxOut.Command == 'No_Session') {
                    location.href = "login.html";
                }
                return;
            }

            if (ajxOut.Success == true) {
                location.href = 'dashboard.html';
            }
        });
    },

    handleEvent: function (ev) {
        ev.preventDefault();
        var target = ev.target;
        var currentTarget = ev.currentTarget;
        var evlCase = currentTarget.getAttribute('data-evl');
        var evCase = target.getAttribute('data-ev');

        switch (evCase) {
            case 'EV_CONNECT':
                userDBInfo.ConnectToDB();
                break;

            case 'EV_CANCEL':
                location.href = 'dashboard.html';
                break;
        }
    },
}

userDBInfo.Init();