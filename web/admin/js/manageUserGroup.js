"use strict"
var _GlobalUserGroup = {
    url: '../../../apix/Admin/',
    recordsPerPage: 50,
    selectedUserGroup: '',
}

var ManageUserGroup = {
    _UserGroupRecCount: 0,
    _UserRoleRecCount: 0,
    _UserGroupGrid: {},
    _UserRoleGrid: {},

    Init: function () {
        document.getElementById('divMain').addEventListener('click', this);
        document.getElementById('selActive').addEventListener('change', this);
        document.getElementById('selClient').addEventListener('change', this);

        $('.accordion-content-dict').css('display', 'block');
        this.showSubMenu();
        this.initilizeGridsonPage();
        this.showDefaultMessage();
        this.toggleMenuDisplay();
        this.GetAllClients();
        this.getUserRoles(Core.gridDefault);
        this.getRoleGroupMap(0);
    },

    showDefaultMessage: function () {
        const html = `
        <div class="mngFaclit-empty-state text-center p-5" >
            <i class="fa-solid fa-building-user text-muted mb-4 mngFaclit-empty-icon" style="font-size: 3rem;"></i>
            <p class="lead">
                 Please select a client to view its groups.
            </p>
        </div>`;

        $('#UserGroupGrid').html(html).removeClass('d-none');
    },

    initilizeGridsonPage: function () {
        //User Group Grid
        this._UserGroupGrid = new QCGrid();
        this._UserGroupGrid.width = '100%';
        this._UserGroupGrid.height = '100%';
        this._UserGroupGrid.id = 'tblUserGroupGrid'
        this._UserGroupGrid.containerID = 'UserGroupGrid';
        this._UserGroupGrid.class = 'table table-bordered table-striped table-hover ';

        //User Role Grid
        this._UserRoleGrid = new QCGrid();
        this._UserRoleGrid.width = '100%';
        this._UserRoleGrid.height = '450px';
        this._UserRoleGrid.id = 'tblUserRoleGrid'
        this._UserRoleGrid.containerID = 'UserRoleGrid';
        this._UserRoleGrid.class = 'table table-bordered table-striped table-hover ';
    },

    resetCtleGroup: function () {
        var meta = {};
        meta.ID = 0;
        meta.GroupName = '';
        var active = $('#selActive').val();
        meta.Active = active == 1 ? true : false;
        $('#btnDeleteGroup').hide();
        _$modxAppCore.showErrorMessage('', 'success', 'divValidateMsgGroup');
        _$modxAppCore.putAppCoreModel('UserGroupMeta', meta);
        ManageUserGroup.getRoleGroupMap(0);
    },

    resetCtleRole: function () {
        var meta = {};
        meta.ID = 0;
        meta.RoleName = '';
        $('#btnDeleteRole').hide();
        _$modxAppCore.showErrorMessage('', 'success', 'divValidateMsgGroup');
        _$modxAppCore.putAppCoreModel('UserRoleMeta', meta);
        this.getUserRoles(Core.gridDefault);
    },

    GetAllClients: async function () {
        var meta = {}
        var functionName = "GetAllClients";
        var url = _GlobalUserGroup.url + functionName;
        var data = await __PromisAsyncPostBack(meta, url);

        Core.bindSelectList('selClient', data, 'ClientID', 'Name', 'Select Client');
    },

    getUserGroups: async function (gridParam) {
        _$modxAppProgressBar.show();
        var meta = {};
        meta.ClientID = $('#selClient').val();
        gridParam = this.setFilter(gridParam);
        if (gridParam.query == null) {
            return;
        }
        
        $('#divUserGroup').show();
        $('#nav-tabContent').show();
        meta.QCGridParam = gridParam;

        var functionName = "GetUserGroups";
        var url = _GlobalUserGroup.url + functionName;
        var qcGrid = await __PromisAsyncPostBack(meta, url);
        if (qcGrid.success == false) {
            _$modxAppProgressBar.hide();
            ManageUserGroup.resetCtleGroup();
            //ManageUserGroup.getUserGroups(Core.gridDefault);
            _$modxAppCore.alert("Could not get groups data", 'Error');
            return false;
        }
        if (qcGrid.data.length == 0) {
            var message = "We are sorry, but no results match your search for group.";
            ManageUserGroup.resetCtleGroup();
            //ManageUserGroup.getUserGroups(Core.gridDefault); 
            Core.showNoGridDataMessage(this._UserGroupGrid.containerID, message);
            _$modxAppProgressBar.hide();
            return;
        }

        Core.showNoGridDataMessage(this._UserGroupGrid.containerID, '');
        //code to plot the grid
        var grid = this._UserGroupGrid;
        grid.gridData = qcGrid;
        if (ManageUserGroup._UserGroupRecCount != qcGrid.param.totalRecords) {
            grid.clearBind();
        }
        grid.bind();
        ManageUserGroup._UserGroupRecCount = qcGrid.param.totalRecords;

        //To select teh last selected row after reload the Grid
        $('tr').each(function () {
            var row = $(this).closest("tr");
            var group = row.children().html();
            if (_GlobalUserGroup.selectedUserGroup == group) {
                $(this).addClass('table-primary');
            }
        });
        Core.expandQCGrid(this._UserGroupGrid.containerID);
        _$modxAppProgressBar.hide();
        grid.onSubmit = function (gridParam) {
            ManageUserGroup.getUserGroups(gridParam);
        }

        grid.onRowDblClick = function (rowNum, colNum, row, colModel) {
            var active = $('#selActive').val();
            row.Active = true;   
            if (active == 0) {
                row.Active = false;   
            }
            
            _$modxAppCore.putAppCoreModel('UserGroupMeta', row);
            _GlobalUserGroup.selectedUserGroup = row.GroupName;

            _$modxAppCore.showErrorMessage('', 'success', 'divValidateMsgGroup');
            _$modxAppCore.hideinlineConfirm('alertUserGroup');
            $('#btnDeleteGroup').show();

            $('.table-primary').removeClass('table-primary');
            $('.tr-select').addClass('table-primary');

            ManageUserGroup.getRoleGroupMap(row.ID);
        }
    },

    saveUserGroup: async function () {
        var meta = _$modxAppCore.getAppCoreModel('UserGroupMeta');
        if (meta.Active == true) {
            meta.IsActive = 1;
        }
        else {
            meta.IsActive = 0;
        }
        meta.GroupRoleMeta = [];

        meta.ClientID = $('#selClient').val();

        if (meta.GroupName.trim() == '') {
            _$modxAppCore.showErrorMessage('Group name is missing or empty', 'error', 'divValidateMsgGroup');
            $('#inpGroupName').focus();
            return;
        }

        var validation = Core.checkSpecialCharacters(meta.GroupName);
        if (validation.isValid == false) {
            _$modxAppCore.showErrorMessage(`${validation.error} from group name`, 'error', 'divValidateMsgGroup');
            $('#inpGroupName').focus();
            return;
        }

        var ul = $('#ulGroupRoleMapping > li');
        for (var i = 0; i < ul.length; i++) {
            var li = ul[i].id;
            var liID = li.replace('li_', '');
            var isChk = $('#chk_' + liID).is(':checked');
            if (isChk == true) {
                var roleName = $('#span_' + liID).text();
                var roleValue = 'RW'; // $('input[name=' + roleName.replace(/ /g, '-') + ']:radio:checked').val();

                var groupRoleMeta = {};
                groupRoleMeta.RoleID = liID;
                groupRoleMeta.RoleValue = roleValue;

                meta.GroupRoleMeta.push(groupRoleMeta);
            }
        }

        if (meta.GroupRoleMeta.length == 0) {
            _$modxAppCore.showErrorMessage(`Please select at least one role`, 'error', 'divValidateMsgGroup');
            $('#ulGroupRoleMapping').focus();
            return;
        }

        _$modxAppCore.showErrorMessage('', 'success', 'divValidateMsgGroup ');

        _$modxAppProgressBar.show();

        var functionName = "SaveUserGroup";
        var url = _GlobalUserGroup.url + functionName;
        var ajaxOut = await __PromisAsyncPostBack(meta, url);
        if (ajaxOut.Success == false) {
            _$modxAppCore.showErrorMessage(ajaxOut.Message, 'error', 'divValidateMsgGroup')
            _$modxAppProgressBar.hide();
            return;
        }

        if (ajaxOut.Success) {
            _$modxAppProgressBar.hide();
            _$modxAppCore.showErrorMessage(ajaxOut.Message, 'success', 'divValidateMsgGroup')
            ManageUserGroup.getUserGroups(Core.gridDefault);
            $('#UserGroupID').val(ajaxOut.ResultData);
        }
    },

    deleteGroupConfirm: function () {
        var name = _GlobalUserGroup.selectedUserGroup;
        var msg = 'Are you sure you want to delete group with name: <b>' + name + '</b>?.';
        _$modxAppCore.inlineConfirm('inlinealertMessageGroup', 'alertGroup', msg, "primary", "EV_CONFRIM_DeleteGroup", "EV_CANCELDelGroup");
    },

    deleteGroup: async function () {
        var meta = {};
        meta.ID = $('#UserGroupID').val();

        _$modxAppCore.showErrorMessage('', 'success', 'divValidateMsgGroup');

        _$modxAppProgressBar.show();

        var functionName = "DeleteGroup";
        var url = _GlobalUserGroup.url + functionName;
        var ajaxOut = await __PromisAsyncPostBack(meta, url);
        if (ajaxOut.Success == false) {
            _$modxAppCore.showErrorMessage(ajaxOut.Message, 'error', 'divValidateMsgGroup')
            _$modxAppProgressBar.hide();
            return;
        }

        if (ajaxOut.Success) {
            _$modxAppProgressBar.hide();
            this.resetCtleGroup();
            //ManageUserGroup.getUserGroups(Core.gridDefault);
            _$modxAppCore.hideinlineConfirm('alertGroup');
            $('#btnDeleteGroup').hide();
            $('#ulGroupRoleMapping').empty();
            _$modxAppCore.showErrorMessage(ajaxOut.Message, 'success', 'divValidateMsgGroup')
            this.getUserGroups(Core.gridDefault);
        }
    },

    getUserRoles: async function (gridParam) {
        _$modxAppProgressBar.show();
        var meta = {}
        $('#divUserRole').show();
        meta.QCGridParam = gridParam;

        var functionName = "GetUserRoles";
        var url = _GlobalUserGroup.url + functionName;
        var qcGrid = await __PromisAsyncPostBack(meta, url);
        if (qcGrid.success == false) {
            _$modxAppProgressBar.hide();
            _$modxAppCore.alert("Could not get user role data", 'Error');
            return false;
        }
        if (qcGrid.data.length == 0) {
            var message = "We are sorry, but no role data is present.";
            Core.showNoGridDataMessage(this._UserRoleGrid.containerID, message);
            _$modxAppProgressBar.hide();
            return;
        }

        Core.showNoGridDataMessage(this._UserRoleGrid.containerID, '');
        //code to plot the grid
        var grid = this._UserRoleGrid;
        grid.gridData = qcGrid;
        if (ManageUserGroup._UserRoleRecCount != qcGrid.param.totalRecords) {
            grid.clearBind();
        }
        grid.bind();
        ManageUserGroup._UserRoleRecCount = qcGrid.param.totalRecords;
        Core.expandQCGrid(this._UserRoleGrid.containerID);
        _$modxAppProgressBar.hide();
        grid.onSubmit = function (gridParam) {
            ManageUserGroup.getUserRoles(gridParam);
        }

        grid.onRowClick = function (rowNum, colNum, row, colModel) {
        }
    },

    getRoleGroupMap: async function (groupID) {
        _$modxAppProgressBar.show();
        $('#ulGroupRoleMapping').empty();
        var meta = {};
        meta.GroupID = groupID;
        var functionName = "GetRoleGroupMap";
        var url = _GlobalUserGroup.url + functionName;
        var ajaxOut = await __PromisAsyncPostBack(meta, url);
        if (ajaxOut.Success == false) {
            _$modxAppCore.showErrorMessage(ajaxOut.Message, 'error', 'divValidateMsgGroup')
            _$modxAppProgressBar.hide();
            return;
        }

        if (ajaxOut.Success) {
            _$modxAppProgressBar.hide();
            ManageUserGroup.setRoleGroupMap(ajaxOut);
        }
    },

    setRoleGroupMap: function (data) {
        var len = data.ResultData.length;
        if (len == 0) {
            $('#ulGroupRoleMapping').empty();
            return;
        }

        var htm = '';
        for (var i = 0; i < len; i++) {
            var ID = data.ResultData[i].ID;
            var roleName = data.ResultData[i].RoleName;
            var roleNameNoSpace = roleName.replace(/ /g, '-');
            var roleValue = data.ResultData[i].RoleValue;
            var isSelected = data.ResultData[i].IsSelected;
            var desc = 'Permission to view, add, edit delete everythings';
            var chk = 'checked';
            var radioDisabled = '';
            var radioR = '';
            var radioRW = '';
            var radioNA = '';

            if (isSelected == 0) {
                chk = '';
                radioDisabled = 'disabled';
            }

            if (roleValue == 'R') {
                radioR = 'checked';
            }
            else if (roleValue == 'RW') {
                radioRW = 'checked';
            }
            else {
                radioNA = 'checked';
            }

            if (chk == '') {
                radioNA = '';
            }

            htm += '<li class="adminRoleLi" style="display: block;" id="li_' + ID + '">';
            htm += '<input type="checkbox" value="' + ID + '" data-rolename="' + roleNameNoSpace + '" id="chk_' + ID + '" class="form-check-input adminRoleChk" data-ev="EV_SelectRole"' + chk + '>';
            htm += '<span id="span_' + ID + '" style="margin-left: 17px;">' + roleName + '</span>';
            //htm += '<div style="float: right; position: relative; display: flex;">';
            //htm += '	<input type="radio" id="' + roleNameNoSpace + '_R" data-rolename="' + roleNameNoSpace + '" data-ev="EV_SelectRoleValue" class="adminRoleRadio" value="R" name="' + roleNameNoSpace + '" ' + radioR + ' ' + radioDisabled + '>R';
            //htm += '	<input type="radio" id="' + roleNameNoSpace + '_RW" data-rolename="' + roleNameNoSpace + '" class="adminRoleRadio" data-ev="EV_SelectRoleValue" value="RW" name="' + roleNameNoSpace + '" ' + radioRW + ' ' + radioDisabled + '>RW';
            //htm += '	<input type="radio" id="' + roleNameNoSpace + '_NA" class="adminRoleRadio" data-rolename="' + roleNameNoSpace + '" data-ev="EV_SelectRoleValue" value="NA" name="' + roleNameNoSpace + '" ' + radioNA + ' ' + radioDisabled + '>NA';
            //htm += '</div>';
            htm += '<span style="display: table;font-size: small;"> ' + desc + '</span>';
            htm += '</li>';
        }

        $('#ulGroupRoleMapping').html(htm);
    },

    setRadioStatus: function (ctl) {
        var roleName = $(ctl).attr('data-rolename').replace(/ /g, '-');;
        var isChecked = $(ctl).is(':checked');
        if (isChecked == true) {
            $('#' + roleName + '_RW').attr('checked', true);
            $("input[name='" + roleName + "']").attr('disabled', false);
        }
        else {
            $("input[name='" + roleName + "']").attr('disabled', true).attr('checked', false);
        }

    },

    showSubMenu: function () {
        $('#filterMangeGroup').addClass('custom-margin-dictionary');
        $('#divUserGroup').addClass('custom-margin-dictionary');
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

    setFilter: function (gridParam) {
        gridParam.queryType = 'ClientID|IsActive';
        gridParam.query = $('#selClient').val() + '|' + $('#selActive').val();

        return gridParam;
    },

    clickGroupTab: function () {
        $('#nav-Group').addClass('active');
        $('#nav-Group').addClass('show');

        $('#nav-Role').removeClass('active');
        $('#nav-Role').removeClass('show');

        $('#UserGroupGrid').show();
        $('#UserRoleGrid').hide();
        $('.inpForm').show();
        $('.table-primary').removeClass('table-primary');
    },

    clickRoleTab: function () {
        $('#nav-Group').removeClass('active');
        $('#nav-Group').removeClass('show');

        $('#nav-Role').addClass('active');
        $('#nav-Role').addClass('show');

        $('#UserGroupGrid').hide();
        $('#UserRoleGrid').show();

        $('.inpForm').hide();

        $('.table-primary').removeClass('table-primary');
        this.resetCtleGroup();
    },

    handleEvent: function (ev) {
        var target = ev.target;
        var evCase = target.getAttribute('data-ev');

        switch (evCase) {
            case 'EV_CloseSubMenu':
                $('#filterMangeGroup').removeClass('custom-margin-dictionary');
                $('#divUserGroup').removeClass('custom-margin-dictionary');
                Core.closeSubMenu();
                break;

            case 'EV_ShowSubMenu':
                this.showSubMenu();
                break;

            case 'EV_ManageUser':
                location.href = 'manageUser.html';
                break;

            case 'EV_ManageClient':
                location.href = 'client.html';
                break;

            case 'EV_ManageFacilites':
                location.href = 'manageFacilites.html';
                break;

            case 'EV_ManageUserGroup':          
                $('#divUserGroup').hide();
                $('#nav-tabContent').hide();       
                $('.filters').hide();
                $('.inpForm').hide();
                $('.groupnrole').hide();

                $('#selClient').prop('selectedIndex', 0);
                $('#selActive').prop('selectedIndex', 0);

                this.clickGroupTab();
                break;

            case 'EV_AddGroup':
                this.resetCtleGroup();
                $('#btnDeleteGroup').hide();
                $('#inpGroupName').focus();
                break;

            case 'EV_SaveGroup':
                this.saveUserGroup();
                break;

            case 'EV_DeleteGroup':
                this.deleteGroupConfirm();
                break;

            case 'EV_CONFRIM_DeleteGroup':
                this.deleteGroup();
                break;

            case 'EV_CANCELDelGroup':
                _$modxAppCore.hideinlineConfirm('alertGroup');
                break;

            case 'EV_SelectRole':
                ManageUserGroup.setRadioStatus(target);
                break;

            case 'EV_Active':
                if (ev.type == 'change') {
                    this.resetCtleGroup();
                    this.getUserGroups(Core.gridDefault);
                }
                break;

            case 'EV_Client_Change':
                if (ev.type == 'change') {
                    _GlobalUserGroup.selectedUserGroup = '';
                    this.resetCtleGroup();
                    this.getUserGroups(Core.gridDefault);
                    $('.filters').show();
                    $('.inpForm').show();
                    $('.groupnrole').show();
                }
                break;
            case 'Ev_Show_Group':
                this.clickGroupTab();
                break;
            case 'Ev_Show_Role':
                this.clickRoleTab();
                break;
        }
    }
}

ManageUserGroup.Init();