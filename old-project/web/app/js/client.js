"use strict"
var _GlobalClient = {
    url: '../../../apix/Admin/',
    recordsPerPage: 50,
    selectedClient: '',
    logoMaxFileSize: 0,
    logoFileSize:0,
}

var Client = {
    _ClientsRecCount: 0, 
    _ClientsGrid: {},

    Init: function () {
        document.getElementById('divMain').addEventListener('click', this);
        document.getElementById('selActive').addEventListener('change', this);
        document.getElementById('selSearch').addEventListener('change', this);

        $('.accordion-content-dict').css('display', 'block');
        this.showDefaultMessage();
        this.initilizeGridsonPage();
        this._ClientGridConfigration = this.initializeGridConfiguration(this._ClientsGrid);
        $(document).on('focus', '.dt', function () {
            $(this).datepicker({
                dateFormat: 'mm/dd/yyyy',
                changeMonth: true,
                changeYear: true,
                yearRange: '2000:2100'
            });
        });

        this.toggleMenuDisplay();
        $('#divClient').css('display', 'block');
        $('#btnDelete').hide();
        Core.getStateList('inpState');
        this.GetClients(Core.gridDefault);
        Accordion.init('#ClientAccordianIns');
        Accordion.init('#FclAccordianIns');
        $('.accordion-content-dict').css('display', 'block');
        $("#logoViewer").attr("src", '../common/theme/assets/images/BlankLogo.png');
    },

    initilizeGridsonPage: function () {
        //Clients Grid
        this._ClientsGrid = new QCGrid();
        this._ClientsGrid.width = '100%';
        this._ClientsGrid.height = 'calc(100vh - 500px)';
        this._ClientsGrid.id = 'tblClientsGrid'
        this._ClientsGrid.containerID = 'ClientsGrid';
        this._ClientsGrid.class = 'table table-bordered table-striped table-hover gridLayoutFix';

    },

    initializeGridConfiguration: function (gridInstance) {
        const config = new QCGridConfigration(gridInstance);
        var url = '../../../apix/CAYRGridConfiguration/';
        config.gridAPI = url + 'GetGridColModel';
        config.gridSaveAPI = url + 'SaveGridColModal';
        config.gridResetAPI = url + 'ResetGridColModal';
        return config;
    },

    showSubMenu: function () {
        $('.table-bordered.cursor-pointer.mb-3').addClass('custom-margin-dictionary');
        $('#ClientFilter').addClass('custom-margin-dictionary');
        $("body").addClass("sidebar-icon-only");
        $('#theme-settings').css('display', 'block')
        $('#submenuIcon').remove();
    },

    showDefaultMessage: function () {
        Core.showNoGridDataMessage('defaultMsg', "Please choose a menu item.")
    },

    toggleMenuDisplay: function () {
        $('#defaultMsg').css('display', 'none');
        $('#menuDiv').css('display', 'none');
    },

    GetClients: async function (gridParam) {
        _$modxAppProgressBar.show();
        var meta = {};
        this.setFilter(gridParam);
        meta.QCGridParam = gridParam;
        meta.GridName = 'ClientsGrid';
        var functionName = "GetClients";
        var url = _GlobalClient.url + functionName;
        var qcGrid = await __PromisAsyncPostBack(meta, url);
        if (qcGrid.success == false) {
            $('#ClientsGrid').empty();
            _$modxAppProgressBar.hide();
            _$modxAppCore.alert("Could not get clients data", 'Error');
            return false;
        }

        _GlobalClient.logoMaxFileSize = qcGrid.message;
        $('#spanMaxSize').html('max file size: ' + _GlobalClient.logoMaxFileSize + ' KB. png/jpg/jpeg only');
        if (qcGrid.data.length == 0) {
            $('#ClientsGrid').empty();
            this.showClientDefaultMessage();
            _$modxAppProgressBar.hide();
            return;
        }

        //code to plot the grid
        var grid = this._ClientsGrid;
        grid.gridData = qcGrid;
        if (Client._ClientsRecCount != qcGrid.param.totalRecords) {
            grid.clearBind();
        }
        grid.bind();
        Client._ClientsRecCount = qcGrid.param.totalRecords;

        $('#ClientNoMsg').addClass('d-none');
        _$modxAppProgressBar.hide();
        grid.onSubmit = function (gridParam) {
            Client.GetClients(gridParam);
        }

        grid.onRowDblClick = function (rowNum, colNum, row, colModel) {
            const tempEl = document.createElement("div");
            tempEl.innerHTML = row.Name;
            const ClientName = tempEl.textContent.trim();
            //To override the Active column value
            var tempRow = {};
            tempRow.ClientID = row.ClientID;
            tempRow.Name = ClientName;
            tempRow.Description = row.Description;
            tempRow.Department = row.Department;
            tempRow.TaxID = row.TaxID;
            tempRow.Address1 = row.Address1;
            tempRow.Address2 = row.Address2;
            tempRow.City = row.City;
            tempRow.State = row.State;
            tempRow.Zip = row.Zip;
            tempRow.ContactName = row.ContactName;
            tempRow.ContactPhone = row.ContactPhone;
            tempRow.ContactEmail = row.ContactEmail
            tempRow.ContractStartDate = row.ContractStartDate;
            tempRow.ContractEndDate = row.ContractEndDate;
            tempRow.Logo = row.Logo;
            
            if (row.IsActive == 'Yes') {
                tempRow.Active = true;
            }
            else {
                tempRow.Active = false;
            }

            _$modxAppCore.putAppCoreModel('ClientMeta', tempRow);
            _GlobalClient.selectedClient = row.Name;
            if (row.Logo == '') {
                $("#logoViewer").attr("src", '../common/theme/assets/images/BlankLogo.png');
            }
            else {
                $("#logoViewer").attr("src", row.Logo);
            }

            _$modxAppCore.showErrorMessage('', 'success', 'divValidateMsg');
            _$modxAppCore.hideinlineConfirm('alertClient');
            $('.table-primary').removeClass('table-primary');
            $('.tr-select').addClass('table-primary');
            $('#btnDelete').show();
            $('#addClient').css('margin-right', '510px');
            $('#divManageClient').removeClass('d-none');
        }
    },

    resetCtle: function () {
        var meta = {};
        meta.ID = 0;
        meta.Name = '';
        meta.Description = '';
        meta.Department = '';
        meta.TaxID = '';
        meta.Address1 = '';
        meta.Address2 = '';
        meta.City = '';
        meta.State = '';
        meta.Zip = '';
        meta.ContactName = '';
        meta.ContactPhone = '';
        meta.ContactEmail = '';
        meta.ContractStartDate = '';
        meta.ContractEndDate = '';
        meta.Active = true;

        _GlobalClient.logoFileSize = 0;
        $('.table-primary').removeClass('table-primary');
        $("#logoViewer").attr("src", '../common/theme/assets/images/BlankLogo.png');
        _$modxAppCore.showErrorMessage('', 'success', 'divValidateMsg');
        _$modxAppCore.putAppCoreModel('ClientMeta', meta);
    },

    saveClient: async function () {
        var meta = _$modxAppCore.getAppCoreModel('ClientMeta');
        if (meta.Active == true) {
            meta.IsActive = 1;
        }
        else {
            meta.IsActive = 0;
        }
        var files = $("#logoUploader").get(0).files;
        if (meta.ClientID == '') {  //Add case
            if (files.length > 0) {
                var file = document.getElementById("logoUploader").files[0];
                if (file.type == 'image/png' || file.type == 'image/jpg' || file.type == 'image/jpeg') {
                }
                else {
                    _$modxAppCore.showErrorMessage(`Logo file can only png/jpg/jpeg`, 'error', 'divValidateMsg')
                    return;
                }

                if ((parseInt(file.size) / 1000) > parseInt(_GlobalClient.logoMaxFileSize)) {
                    _$modxAppCore.showErrorMessage(`Logo can not be more then ${parseInt(_GlobalClient.logoMaxFileSize)} KB`, 'error', 'divValidateMsg')
                    return;
                }
                meta.Logo = await Core.getBase64(file);
            } 
        }
        else {  //Edit case
            if (files.length > 0) {
                var file = document.getElementById("logoUploader").files[0];
                if (file.type == 'image/png' || file.type == 'image/jpg' || file.type == 'image/jpeg') {
                }
                else {
                    _$modxAppCore.showErrorMessage(`Logo file can only png/jpg/jpeg`, 'error', 'divValidateMsg')
                    return;
                }
                if ((parseInt(file.size) / 1000) > parseInt(_GlobalClient.logoMaxFileSize)) {
                    _$modxAppCore.showErrorMessage(`Logo can not be more then ${parseInt(_GlobalClient.logoMaxFileSize)} KB`, 'error', 'divValidateMsg')
                    return;
                }
                meta.Logo = await Core.getBase64(file);
            } else {
                meta.Logo = $("#logoViewer").attr("src");
            }
        }

        var requiredFields = ['Name', 'ContactPhone','ContactEmail', 'Address1', 'City', 'State', 'Zip'];

        var validation = Core.validateInputs(requiredFields, meta);

        if (validation.isValid == false) {
            _$modxAppCore.showErrorMessage(`${validation.error}`, 'error', 'divValidateMsg');
            $('#inp' + validation['missingField']).focus();
            return;
        }

        validation = Core.checkSpecialCharacters(meta.Name);
        if (validation.isValid == false) {
            _$modxAppCore.showErrorMessage(`${validation.error} from Name`, 'error', 'divValidateMsg');
            $('#inpName').focus();
            return;
        }

        if (_$AppValidatte.validateEmail(meta.ContactEmail) == false) {
            _$modxAppCore.showErrorMessage(`Please enter valid ContactEmail`, 'error', 'divValidateMsg');
            $('#inpContactEmail').focus();
            return;
        }

        var len = 9;
        var isValid = Core.checkInputValues(meta.TaxID, len);
        if (isValid == 0) {
            _$modxAppCore.showErrorMessage(`Tax ID has to consist of exactly ${len} digits`, 'error', 'divValidateMsg');
            $('#inpTaxID').focus();
            return;
        }

        len = 5;
        if (meta.Zip.length < 5) {
            isValid = Core.checkInputValues(meta.Zip, len);
            if (isValid == 0) {
                _$modxAppCore.showErrorMessage(`Zip has to consist of exactly ${len} digits`, 'error', 'divValidateMsg');
                $('#inpZip').focus();
                return;
            }
        }


        if (meta.ContractStartDate != '' && meta.ContractEndDate != '') {
            var startDate = new Date(meta.ContractStartDate);
            var endDate = new Date(meta.ContractEndDate);

            if (startDate > endDate) {
                _$modxAppCore.showErrorMessage(`Contract start date connot be after end date`, 'error', 'divValidateMsg');
                return;
            }
        }

        _$modxAppCore.showErrorMessage('', 'success', 'divValidateMsg');

        _$modxAppProgressBar.show();

        var functionName = "SaveClient";
        var url = _GlobalClient.url + functionName;
        var ajaxOut = await __PromisAsyncPostBack(meta, url);
        if (ajaxOut.Success == false) {
            _$modxAppCore.showErrorMessage(ajaxOut.Message, 'error', 'divValidateMsg')
            _$modxAppProgressBar.hide();
            return;
        }

        if (ajaxOut.Success) {
            _$modxAppProgressBar.hide();
            _$modxAppCore.showErrorMessage(ajaxOut.Message, 'success', 'divValidateMsg')
            this.GetClients(Core.gridDefault);
            $('#ClientID').val(ajaxOut.ResultData);
            _GlobalClient.logoFileSize = 0;
        }
    },

    resetPage: function () {
        _$modxAppCore.showErrorMessage('', 'error', 'divValidateMsg');
        Core.showNoGridDataMessage(this._ClientsGrid.containerID, '');
        this.resetCtle();
        $('#selActive').prop('selectedIndex', 0);
        $('#selSearch').prop('selectedIndex', 0);
        $('#inpSearch').val('');
        this.GetClients(Core.gridDefault);
        this.hideClientAddUpdateForm();
    },

    hideClientAddUpdateForm: function () {
        $('#divManageClient').addClass('d-none');
        $('#addClient').css('margin-right', '0px');
        $('#ClientNoMsg').css('margin-left', '200px');

    },

    showClientDefaultMessage: function () {
        var active = $('#selActive').val();
        active = active == '0' ? 'In active' : 'Active';
        var htm = `
          <div class="mngFaclit-empty-state text-center p-5">
              <i class="fa-solid fa-users text-muted mb-4 mngFaclit-empty-icon"></i>
              <p class="lead mb-2">
                  <strong>No <b>${active}</b> clients available</strong> at the moment.
              </p>
              <p class="mb-0">
                  In order to add a client, click the button below.
              </p>
              <div id="addClientBtn" class="btn btn-primary" data-ev="EV_AddClient">
                  <i class="fa fa-plus me-2" data-ev="EV_AddClient"></i>Add Client
              </div>
          </div> `;
        $('#ClientNoMsg').html(htm).removeClass('d-none');

    },

    setFilter: function (gridParam) {
        var searhcColumn = $('#selSearch').val();
        var serachValue = $('#inpSearch').val().trim();

        gridParam.queryType = 'IsActive|' + searhcColumn;
        gridParam.query = $('#selActive').val() + '|' + serachValue;

        return gridParam;
    },

    handleEvent: function (ev) {
        var target = ev.target;
        var evCase = target.getAttribute('data-ev');

        switch (evCase) {
            case 'EV_CloseSubMenu':
                $('#ClientFilter').removeClass('custom-margin-dictionary')
                Core.closeSubMenu();
                break;

            case 'EV_ShowSubMenu':
                this.showSubMenu();
                break;

            case 'EV_ManageUser':
                location.href = 'manageUser.html';
                break;

            case 'EV_ManageClient':
                this.resetPage();
                break;

            case 'EV_ManageFacilites':
                location.href = 'manageFacilites.html';
                break;

            case 'EV_ManageUserGroup':
                location.href = 'manageUserGroup.html';
                break;
           
            case 'EV_AddClient':
                $('#addClient').css('margin-right', '510px');
                $('#ClientNoMsg').css('margin-left', '-200px');
                $('#divManageClient').removeClass('d-none');
                this.resetCtle();
                $('#btnDelete').hide();
                $('#inpName').focus();
                break;

            case 'EV_Save':
                this.saveClient();
                break;

            case 'EV_UPLOAD_LOGO':
                $('#logoUploader').click();
                break;
            
            case 'EV_CloseAddUpdateClient':
                this.hideClientAddUpdateForm();
                break;

            case 'EV_Active':
                if (ev.type == 'change') {
                    this.GetClients(Core.gridDefault);
                    this.hideClientAddUpdateForm();
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

            case 'EV_Search':
                this.GetClients(Core.gridDefault);
                this.hideClientAddUpdateForm();                
                break;

            /* Manage Facility  */
            case 'EV_ViewManageFacility':
                $('#ManageFacilityGrid').removeClass('d-none')
                $('.bold-link').removeClass('bold-link');
                $('.table-primary').removeClass('table-primary');
                ev.target.parentElement.classList.remove('tr-select');
                ev.target.classList.add('bold-link');
                $('.searchCtl').show();
                Facilites.hideFacilityAddUpdateForm() 
                _GlobalFacilites.selClient = ev.target.getAttribute('data-id')
                Core.gridDefault.query = _GlobalFacilites.selClient
                Facilites.GetFacilites(Core.gridDefault);     
                break;
        }
    }
}

Client.Init();

//Set image after selection
document.getElementById('logoUploader').addEventListener('change', function (event) {
    var file = event.target.files[0];
    if (file) {
        _GlobalClient.logoFileSize = file.size;
        var reader = new FileReader();
        reader.onload = function (e) {
            document.getElementById('logoViewer').src = e.target.result;
        };
        reader.readAsDataURL(file);
    }
});

$(document).ready(function () {
    var postbackUrl = "../../../apix/UserSession/GetUserRolesByPage";
    var meta = {};
    meta.PageName = 'client.html';
    
    __DoAsyncPostBack(meta, postbackUrl, function (ajxOut) {
        if (ajxOut.Success == false) {
            return '';
        }

        if (ajxOut.Success == true) {
            var rolValue = ajxOut.ResultData;
            if (rolValue.includes('A') == false && rolValue.includes('E') == false) {
                $('#addClient').remove();
                $('#btnAddFacility').remove();
                $('#btnClientSave').remove();
                $('#btnFacilitySave').remove();
            }

            if (rolValue.includes('D') == false) {
                $('#chkActive').prop('disabled', true);
            }
        }
    });
});