"use strict"
var _GlobalAdmin = {
    url: '../../../apix/Admin/',
    recordsPerPage: 50,
    selectedClient: '',
}

var Admin = {
    _CurrentMenu:'',
    _ClientsRecCount: 0,
    _ClientsGrid: {},

    Init: function () {
        document.getElementById('divMain').addEventListener('click', this);
        
        $('.accordion-content-dict').css('display', 'block');
        this.showSubMenu();
        this.showDefaultMessage();
        this.initilizeGridsonPage();    
    },

    initilizeGridsonPage: function () {
       
    },

    showSubMenu: function () {
        $('.table-bordered.cursor-pointer.mb-3').addClass('custom-margin-dictionary');
        $('.navbar-nav').css('margin-left', '200px');
        $("body").addClass("sidebar-icon-only");
        $('#theme-settings').css('display', 'block')
        $('#submenuIcon').remove();
    },

    showDefaultMessage: function () {
        Core.showNoGridDataMessage('defaultMsg', "Please choose a menu item.")
    },

    manageUser: function (ev) {
        Admin._CurrentMenu = 'manageUser';
        Core.setHeaderTitle('Admin', ev);
        this.toggleMenuDisplay();
    },

    toggleMenuDisplay: function () {
        $('#defaultMsg').css('display', 'none');     
        $('#menuDiv').css('display', 'none');     
    },

    handleEvent: function (ev) {
        var target = ev.target;
        var evCase = target.getAttribute('data-ev');

        switch (evCase) {
            case 'EV_CloseSubMenu':
                Core.closeSubMenu();
                break;

            case 'EV_ShowSubMenu':
                this.showSubMenu();
                break;

            case 'EV_ManageUser':
                location.href = 'manageUser.html';
                break;

            case 'EV_ManageUserGroup':
                location.href = 'manageUserGroup.html';
                break;

            case 'EV_ManageClient':
                location.href = 'client.html';
                break;

            case 'EV_ManageFacilites':
                location.href = 'manageFacilites.html';
                break;
        }
    }
}

Admin.Init();