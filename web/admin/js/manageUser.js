"use strict"
var _GlobalUser = {
    url: '../../../apix/Admin/',
    recordsPerPage: 50,
    selectedUser: '',
}

var User = {
    _UsersRecCount: 0,
    _UsersGrid: {},

    Init: function () {
        document.getElementById('divMain').addEventListener('click', this);
        document.getElementById('selClient').addEventListener('change', this);
        document.getElementById('selActive').addEventListener('change', this);
        document.getElementById('inpFirstName').addEventListener('keyup', this);
        document.getElementById('inpLastName').addEventListener('keyup', this);
        document.getElementById('selSearch').addEventListener('change', this);

        $('.accordion-content-dict').css('display', 'block');
        this.showSubMenu();
        this.showDefaultMessage();
        this.initilizeGridsonPage();
        this._ManageUserGridConfigration = this.initializeGridConfiguration(this._UsersGrid);
        this.toggleMenuDisplay();
        $('#divResetPW').hide();
        this.GetAllClients();
    },

    initilizeGridsonPage: function () {
        //Users Grid
        this._UsersGrid = new QCGrid();
        this._UsersGrid.width = '100%';
        this._UsersGrid.height = 'calc(100vh - 170px)';
        this._UsersGrid.id = 'tblUserGrid'
        this._UsersGrid.containerID = 'UserGrid';
        this._UsersGrid.class = 'table table-bordered table-striped table-hover gridLayoutFix';
    },

    initializeGridConfiguration: function (gridInstance) {
        const config = new QCGridConfigration(gridInstance);
        var url = '../../../apix/CAYRGridConfiguration/';
        config.gridAPI = url + 'GetGridColModel';
        config.gridSaveAPI = url + 'SaveGridColModal';
        config.gridResetAPI = url + 'ResetGridColModal';
        return config;
    },

    resetPage: function () {
        this.showDefaultMessage();
        $('#selClient').prop('selectedIndex', 0);
        _$modxAppCore.showErrorMessage('', 'error', 'divValidateMsg');
        $('#UserGridGrid').html('')
        this.resetCtle();
    },

    showDefaultMessage: function () {
        var htm = `
    <div class="mngFaclit-empty-state text-center p-5">
        <i class="fa-solid fa-users text-muted fa-3x mb-4 mngFaclit-empty-icon" aria-hidden="true"></i>
        <p class="lead">
            <strong>No users available</strong>. Please select a client to view its users.
        </p>
    </div>`;

        $('#UserNoMsg').html(htm).removeClass('d-none');
    },

    showNoUserMessage: function () {
        var htm = `
        <div class="mngFaclit-empty-state text-center p-5">
             <i class="fa-solid fa-users text-muted fa-3x mb-4 mngFaclit-empty-icon" aria-hidden="true"></i>
            <p class="lead mb-2">
                <strong>No user available for the selected client.</strong>
            </p>
            <p class="mb-0">
                In order to add a user, click the button below.
            </p>
            <div id="addFacilityBtn" class="btn btn-primary" data-ev = "EV_AddUser">
                <i class="fa fa-plus me-2" data-ev = "EV_AddUser"></i>Add User
            </div>
        </div>`;

        $('#UserNoMsg').html(htm).removeClass('d-none');
    },

    showSubMenu: function () {
        $('#UserFilter').addClass('custom-margin-dictionary');
        $('#UserNoMsg').addClass('custom-margin-dictionary');
        $('.table-bordered.cursor-pointer.mb-3').addClass('custom-margin-dictionary');
        //$('.navbar-nav').css('margin-left', '200px');
        $("body").addClass("sidebar-icon-only");
        $('#theme-settings').css('display', 'block')
        $('#submenuIcon').remove();
    },

    toggleMenuDisplay: function () {
        $('#defaultMsg').css('display', 'none');
        $('#menuDiv').css('display', 'none');
    },

    setPage: function (v) {
        Core.toggleMenuDisplay();
        $('#div' + v).css('display', 'block');
        _$modxAppCore.hideinlineConfirm('alert' + v);
        //$('#btnDelete').hide();
        $('#divResetPW').hide();
        _$modxAppCore.showErrorMessage('', 'success', 'divValidateMsg');
    },

    GetAllClients: async function () {
        var meta = {}
        var functionName = "GetAllClients";
        var url = _GlobalUser.url + functionName;
        var data = await __PromisAsyncPostBack(meta, url);

        Core.bindSelectList('selClient', data, 'ClientID', 'Name', 'Select Client');

        User.setPage('User');
    },

    GetUserDetails: async function (gridParam) {
        _$modxAppProgressBar.show();
        var meta = {}
        gridParam = this.setFilter(gridParam);
        if (gridParam.query == null) {
            return;
        }

        meta.QCGridParam = gridParam;
        meta.GridName = 'UserGrid';
        var functionName = "GetUserDetails";
        var url = _GlobalUser.url + functionName;
        var qcGrid = await __PromisAsyncPostBack(meta, url);
        if (qcGrid.success == false) {
            _$modxAppProgressBar.hide();
            User.resetCtle();
            _$modxAppCore.alert("Could not get user data", 'Error');
            return false;
        }
        if (qcGrid.data.length == 0) {
            User.resetCtle();
            $('#UserGrid').html('')
            $('#btnAddUser').addClass('d-none')
            this.showNoUserMessage();
            _$modxAppProgressBar.hide();
            return;
        }
        $('#UserNoMsg').addClass('d-none')
        $('#btnAddUser').removeClass('d-none')
        Core.showNoGridDataMessage(this._UsersGrid.containerID, '');
        //code to plot the grid
        var grid = this._UsersGrid;
        grid.gridData = qcGrid;
        if (User._UsersRecCount != qcGrid.param.totalRecords) {
            grid.clearBind();
        }
        grid.bind();
        User._UsersRecCount = qcGrid.param.totalRecords;
        _$modxAppProgressBar.hide();
        grid.onSubmit = function (gridParam) {
            User.GetUserDetails(gridParam);
        }

        grid.onRowDblClick = function (rowNum, colNum, row, colModel) {
            //To override the Active column value
            var tempRow = {};
            tempRow.ClientUserID = row.ClientUserID;
            tempRow.UserName = row.UserName;
            tempRow.FirstName = row.FirstName;
            tempRow.LastName = row.LastName;
            tempRow.Phone = row.Phone;
            tempRow.Email = row.Email;
            tempRow.JobTitle = row.JobTitle;

            if (row.Active == 'Yes') {
                tempRow.Active = true;
            }
            else {
                tempRow.Active = false;
            }

            _$modxAppCore.putAppCoreModel('UserMeta', tempRow);
            _GlobalUser.selectedUser = row.UserName;

            _$modxAppCore.showErrorMessage('', 'success', 'divValidateMsg');
            _$modxAppCore.hideinlineConfirm('alertFacility');
            if (tempRow.Active == true) {
                $('#divResetPW').show();
            }
            else {
                $('#divResetPW').hide();
            }
            
            $('.table-primary').removeClass('table-primary');
            $('.tr-select').addClass('table-primary');
            if (row.ClientUserID != null && row.ClientUserID > 0) {
                $('#inpUserName').prop('disabled', true);
            }
            else {
                $('#inpUserName').prop('disabled', false);
            }
            $('#divManageUsers').removeClass('d-none');
           // $('#btnAddUser').css('margin-right', '510px');
            $('.chkRow').prop('checked', false);            
            $('.chkHeader').prop('checked', false);
            $('#btnAssignGroups').addClass('d-none');
            User.hideUserAddUpdateFormAssignGroups();
            User.getUserGroupMap(tempRow.UserName, 'ulUserGroupMapping');
        }
    },

    resetCtle: function () {
        var meta = {};
        meta.ID = 0;
        meta.ClientID = 0;
        meta.UserName = '';
        meta.FirstName = '';
        meta.LastName = '';
        meta.Phone = '';
        meta.Email = '';
        meta.JobTitle = '';
        meta.Active = true,

        $('#divResetPW').hide();
        $('.table-primary').removeClass('table-primary');
        _$modxAppCore.showErrorMessage('', 'success', 'divValidateMsg');
        _$modxAppCore.putAppCoreModel('UserMeta', meta);
    },

    saveUserDetails: async function () {
        var meta = _$modxAppCore.getAppCoreModel('UserMeta');
        meta.GroupMeta = [];
        var requiredFields = ['FirstName', 'LastName', 'Phone', 'Email', 'UserName'];

        meta.ClientID = $('#selClient').val();
        if (meta.ClientID == null || meta.ClientID == '') {
            _$modxAppCore.showErrorMessage(`Please select a client`, 'error', 'divValidateMsg');
            $('#selClient').focus();
            return;
        }

        var validation = Core.validateInputs(requiredFields, meta);

        if (validation.isValid == false) {
            _$modxAppCore.showErrorMessage(`${validation.error}`, 'error', 'divValidateMsg');
            $('#inp' + validation['missingField']).focus();
            return;
        }

        validation = Core.checkSpecialCharacters(meta.FirstName);
        if (validation.isValid == false) {
            _$modxAppCore.showErrorMessage(`${validation.error} from FirstName`, 'error', 'divValidateMsg');
            $('#inpFirstName').focus();
            return;
        }

        validation = Core.checkSpecialCharacters(meta.LastName);
        if (validation.isValid == false) {
            _$modxAppCore.showErrorMessage(`${validation.error} from LastName`, 'error', 'divValidateMsg');
            $('#inpLastName').focus();
            return;
        }
        var len = 12;
        var isValid = Core.checkInputValues(meta.Phone, len);
        if (isValid == 0) {
            _$modxAppCore.showErrorMessage(`PhoneNumber has to consist of exactly 10 digits`, 'error', 'divValidateMsg');
            $('#inpPhone').focus();
            return;
        }
        
        if (_$AppValidatte.validateEmail(meta.Email) == false) {
            _$modxAppCore.showErrorMessage(`Please enter valid Email`, 'error', 'divValidateMsg');
            $('#inpEmail').focus();
            return;
        }

        if (meta.UserName.length > 20) {
            _$modxAppCore.showErrorMessage(`UserName can not have more then 20 characters`, 'error', 'divValidateMsg');
            $('#inpEmail').focus();
            return;
        }
        /*
        validation = Core.checkSpecialCharacters(meta.UserName);
        if (validation.isValid == false) {
            _$modxAppCore.showErrorMessage(`${validation.error} from UserName`, 'error', 'divValidateMsg')
            return;
        }
        */

        if (meta.Active == true) {
            meta.IsActive = 1;
        }
        else {
            meta.IsActive = 0;
        }

        var ulCtl = 'ulUserGroupMapping';
        var ul = $('#' + ulCtl + ' > li');
        if (ul.length == 0) {
            _$modxAppCore.showErrorMessage(`No group(s) available. Please create a group in the Manage Group & Role menu before assigning users.`, 'error', 'divValidateMsg');
            $('#ulUserGroupMapping').focus();
            return;
        }

        for (var i = 0; i < ul.length; i++) {
            var li = ul[i].id;
            var liID = li.replace('li_', '');
            var isChk = $('#chk_' + liID).is(':checked');
            if (isChk == true) {
                var groupMeta = {};
                groupMeta.GroupID = liID.replace(ulCtl + '_', '');
                
                meta.GroupMeta.push(groupMeta);
            }
        }

        if (meta.GroupMeta.length == 0) {
            _$modxAppCore.showErrorMessage(`Please select at least one group`, 'error', 'divValidateMsg');
            $('#ulUserGroupMapping').focus();
            return;
        }

        _$modxAppCore.showErrorMessage('', 'success', 'divValidateMsg');

        _$modxAppProgressBar.show();

        var functionName = "SaveUserDetails";
        var url = _GlobalUser.url + functionName;
        var ajaxOut = await __PromisAsyncPostBack(meta, url);
        if (ajaxOut.Success == false) {
            _$modxAppCore.showErrorMessage(ajaxOut.Message, 'error', 'divValidateMsg')
            _$modxAppProgressBar.hide();
            return;
        }

        if (ajaxOut.Success == true) {
            _$modxAppProgressBar.hide();
            _$modxAppCore.showErrorMessage(ajaxOut.Message, 'success', 'divValidateMsg')
            this.GetUserDetails(Core.gridDefault);
            $('#ID').val(ajaxOut.ResultData);
            if (meta.IsActive == 1) {
                $('#divResetPW').show();
            }
            else {
                $('#divResetPW').hide();
            }
        }
    },

    resetPWConfirm: function () {
        var name = _GlobalUser.selectedUser;
        var msg = 'Are you sure you want to reset the password for User with name: <b>' + name + '</b>?';
        _$modxAppCore.inlineConfirm('inlinealertMessage', 'alertUser', msg, "primary", "EV_CONFRIM_RESET_PW", "EV_CANCEL_RESET_PW");
    },

    resetPassword: async function () {
        var meta = {};
        meta.UserName = $('#inpUserName').val();

        _$modxAppCore.showErrorMessage('', 'success', 'divValidateMsg');

        _$modxAppProgressBar.show();

        var functionName = "ResetPassword";
        var url = _GlobalUser.url + functionName;
        var ajaxOut = await __PromisAsyncPostBack(meta, url);
        if (ajaxOut.Success == false) {
            _$modxAppCore.showErrorMessage(ajaxOut.Message, 'error', 'divValidateMsg')
            _$modxAppProgressBar.hide();
            return;
        }

        if (ajaxOut.Success == true && ajaxOut.Sender == 'USER_NOT_EXISTS_IN_AD') {
            _$modxAppProgressBar.hide();
            _$modxAppCore.hideinlineConfirm('alertUser');
            _$modxAppCore.showErrorMessage(ajaxOut.Message, 'error', 'divValidateMsg')            
            return;
        }

        if (ajaxOut.Success == true) {            
            _$modxAppProgressBar.hide();
            _$modxAppCore.hideinlineConfirm('alertUser');
            _$modxAppCore.showErrorMessage(ajaxOut.Message, 'success', 'divValidateMsg')            
        }
    },

    hideUserAddUpdateForm: function () {
        $('#divManageUsers').addClass('d-none');
        $('#btnAddUser').css('margin-right', '0px');
        $('#UserNoMsg').css('margin-left', '200px');
    },

    buildUserName: function () {
        var clientUserID = $('#inpClientUserID').val();
        if (clientUserID > 0) {
            return;
        }
        if ($('#inpFirstName').val().trim().length > 0) {
            $('#inpUserName').val($('#inpFirstName').val() + '.' + $('#inpLastName').val());
        }
    },

    resetPage: function () {
        $('#btnAddUser').addClass('d-none')
        $('#selClient').prop('selectedIndex', 0);
        $('#selActive').prop('selectedIndex', 0);
        $('#selSearch').prop('selectedIndex', 0);
        $('#inpSearch').val('');

        _$modxAppCore.showErrorMessage('', 'error', 'divValidateMsg');
        Core.showNoGridDataMessage(this._UsersGrid.containerID, '');
        this.resetCtle();     
        this.showDefaultMessage();
        $('#divManageUsers').removeClass('d-none');
    },

    getUserGroupMap: async function (userName, ul) {
        _$modxAppProgressBar.show();
        $('#ulGroupRoleMapping').empty();
        var meta = {};
        meta.UserName = userName;
        meta.ClientID = $('#selClient').val();
        var functionName = "GetUserGroupMap";
        var url = _GlobalUser.url + functionName;
        var ajaxOut = await __PromisAsyncPostBack(meta, url);
        if (ajaxOut.Success == false) {
            _$modxAppCore.showErrorMessage(ajaxOut.Message, 'error', 'divValidateMsgGroup')
            _$modxAppProgressBar.hide();
            return;
        }

        if (ajaxOut.Success) {
            _$modxAppProgressBar.hide();
            User.setUserGroupMap(ajaxOut, ul);
        }
    },

    setUserGroupMap: function (data, ul) {
        var len = data.ResultData.length;
        if (len == 0) {
            $('#' + ul).empty();
            return;
        }

        var htm = '';
        for (var i = 0; i < len; i++) {
            var ID = data.ResultData[i].ID;
            var groupName = data.ResultData[i].GroupName;
            var groupNameNoSpace = groupName.replace(/ /g, '-');
            var isSelected = data.ResultData[i].IsSelected;
            var description = data.ResultData[i].Description;
            var chk = 'checked';
            
            if (isSelected == 0) {
                chk = '';
            }
           
            htm += '<li class="adminRoleLi" style="display: block;" id="li_' + ul + '_' + ID + '">';
            htm += '<input type="checkbox" value="' + ID + '" data-rolename="' + groupNameNoSpace + '" id="chk_' + ul + '_' + ID + '" class="form-check-input adminRoleChk" data-ev="EV_SelectGroup"' + chk + '>';
            htm += '<span id="span_' + ul + '_' + ID + '" style="margin-left: 17px;">' + groupName + '</span>';
            htm += '<span style="display: table;font-size: small;"> ' + description + '</span>';
            htm += '</li>';
        }

        $('#' + ul).html(htm);
    },

    setFilter: function (gridParam) {
        var searhcColumn = $('#selSearch').val();
        var serachValue = $('#inpSearch').val().trim();

        gridParam.queryType = 'ClientID|IsActive|' + searhcColumn;
        gridParam.query = $('#selClient').val() + '|' + $('#selActive').val() + '|' + serachValue;

        return gridParam;
    },

    chkAllRows: function () {
        $('.chkRow').prop('checked', $('.chkHeader').prop('checked'));
        var len = this.IsUsersSelected();
    },

    chkRow: function () {
        var len = this.IsUsersSelected();

    },

    AssignGroups: function () {
        var len = this.IsUsersSelected();
        if (len == 0) {
            _$modxAppCore.showErrorMessage('Please select at least one user', 'error', 'divValidateMsgGroup')
            return;
        }

        $('#divAssignGroups').removeClass('d-none');
        this.getUserGroupMap('', 'ulUserGroupMappingAssignGroups');
    },

    IsUsersSelected: function () {
        var chk = $('.chkRow:checked');
        if (chk.length == 0) {
            $('#btnAssignGroups').addClass('d-none');

        }
        else {
            $('#btnAssignGroups').removeClass('d-none');
        }

        return chk.length;
    },

    hideUserAddUpdateFormAssignGroups: function () {
        $('#divAssignGroups').addClass('d-none');
        $('#UserNoMsg').css('margin-left', '200px');
    },

    saveUsersGroups: async function () {
        var meta = {};
        meta.GroupMeta = [];
        var ulCtl = 'ulUserGroupMappingAssignGroups';
        var ul = $('#' + ulCtl + ' > li');
        for (var i = 0; i < ul.length; i++) {
            var li = ul[i].id;
            var liID = li.replace('li_', '');
            var isChk = $('#chk_' + liID).is(':checked');
            if (isChk == true) {
                var groupMeta = {};
                groupMeta.GroupID = liID.replace(ulCtl + '_', '');

                meta.GroupMeta.push(groupMeta);
            }
        }

        if (meta.GroupMeta.length == 0) {
            _$modxAppCore.showErrorMessage(`Please select at least one group`, 'error', 'divValidateMsgGroup');
            return;
        }

        var chk = $('.chkRow:checked');
        var chkIds = '';
        for (var i = 0; i < chk.length; i++) {
            if ($(chk[i]).is(":checked")) {
                chkIds += $(chk[i]).attr('data-id') + ',';
            }
        }

        if (chk.length == 0) {
            _$modxAppCore.showErrorMessage(`Please select at least one user`, 'error', 'divValidateMsgGroup');
            return;
        }

        meta.ClientUserIDs = chkIds;
        meta.ClientID = $('#selClient').val();
        _$modxAppCore.showErrorMessage('', 'success', 'divValidateMsgGroup');

        _$modxAppProgressBar.show();

        var functionName = "SaveUsersGroups";
        var url = _GlobalUser.url + functionName;
        var ajaxOut = await __PromisAsyncPostBack(meta, url);
        if (ajaxOut.Success == false) {
            _$modxAppCore.showErrorMessage(ajaxOut.Message, 'error', 'divValidateMsgGroup')
            _$modxAppProgressBar.hide();
            return;
        }

        if (ajaxOut.Success == true) {
            _$modxAppProgressBar.hide();
            _$modxAppCore.showErrorMessage(ajaxOut.Message, 'success', 'divValidateMsgGroup');
        }
    },

    handleEvent: function (ev) {
        var target = ev.target;
        var evCase = target.getAttribute('data-ev');

        switch (evCase) {
            case 'EV_CloseSubMenu':
                $('#UserFilter').removeClass('custom-margin-dictionary');
                $('#UserNoMsg').removeClass('custom-margin-dictionary');
                Core.closeSubMenu();
                break;

            case 'EV_ShowSubMenu':
                this.showSubMenu();
                break;

            case 'EV_ManageUser':
                this.resetPage();
                this.hideUserAddUpdateForm();
                this.hideUserAddUpdateFormAssignGroups();
                break;

            case 'EV_ManageFacilites':
                location.href = 'manageFacilites.html';
                break;

            case 'EV_ManageUserGroup':
                location.href = 'manageUserGroup.html';
                break;

            case 'EV_ManageClient':
                location.href = 'client.html';
                break;

            case 'EV_AddUser':
               // $('#btnAddUser').css('margin-right', '510px');
                $('#UserNoMsg').css('margin-left', '-200px');
                $('#divManageUsers').removeClass('d-none');
                this.hideUserAddUpdateFormAssignGroups();
                this.resetCtle();
                $('#inpFirstName').focus();
                this.getUserGroupMap('', 'ulUserGroupMapping');
                $('.chkRow').prop('checked', false);
                $('.chkHeader').prop('checked', false);
                $('#btnAssignGroups').addClass('d-none');
                break;

            case 'EV_Save':
                this.saveUserDetails();
                break;

            case 'EV_Delete':
                this.deleteUserConfirm();
                break;

            case 'EV_CANCEL_RESET_PW':
                _$modxAppCore.hideinlineConfirm('alertUser');
                break;

            case 'EV_CONFRIM_RESET_PW':
                this.resetPassword();
                break;

            case 'EV_CloseAddUpdateUsers':
                this.hideUserAddUpdateForm();
                break;

            case 'EV_Client_Change':
                if (ev.type == 'change') {
                    $('.filters').show();
                    this.hideUserAddUpdateForm(); 
                    this.hideUserAddUpdateFormAssignGroups();
                    this.GetUserDetails(Core.gridDefault);
                }
                break;

            case 'EV_FirstName':
            case 'EV_LastName':
                if (ev.type == 'keyup') {
                    this.buildUserName();
                }
                break;

            case 'EV_PW':
                this.resetPWConfirm();
                break;

            case 'EV_Search':
                this.hideUserAddUpdateForm();
                this.hideUserAddUpdateFormAssignGroups();
                this.GetUserDetails(Core.gridDefault);
                break;

            case 'EV_ChkHeader':
                this.chkAllRows();
                break;

            case 'EV_ChkRow':
                this.chkRow();
                break;

            case 'EV_AssignGroups':
                this.AssignGroups();
                break;

            case 'EV_CloseAddUpdateUsersAssignGroups':
                this.hideUserAddUpdateFormAssignGroups();
                break;

            case 'EV_SaveGroups':
                this.saveUsersGroups();
                break;

            case 'EV_Active':
                if (ev.type == 'change') {
                    this.hideUserAddUpdateForm();
                    this.hideUserAddUpdateFormAssignGroups();
                    this.GetUserDetails(Core.gridDefault);
                }
                break;

            case 'EV_SelSearch':
                if (ev.type == 'change') {
                    var v = $('#selSearch').val();
                    if (v == '') {
                        $('#inpSearch').val('');
                    }
                }
                break;
        }
    }
}

User.Init();
