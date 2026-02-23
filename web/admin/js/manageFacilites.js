"use strict"
var _GlobalFacilites = {
    url: '../../../apix/Admin/',
    recordsPerPage: 50,
    selectedFacility: '',
}

var Facilites = {
    _FacilitesRecCount: 0,
    _FacilitesGrid: {},

    Init: function () {
        document.getElementById('divMain').addEventListener('click', this);
      /*  document.getElementById('selClient').addEventListener('change', this);*/
        document.getElementById('selActive_fcl').addEventListener('change', this);
        document.getElementById('selSearchFcl').addEventListener('change', this);
        
        $('.accordion-content-dict').css('display', 'block');
/*        this.showSubMenu();*/
   /*     this.showFacilityDefaultMessage();*/
        this.initilizeGridsonPage();
        this._FacilityGridConfigration = this.initializeGridConfiguration(this._FacilitesGrid);
     
        Core.getStateList('inpStatefcl');
        Core.getFacilityTypeList('selFacilityType');
        Core.getFacilityTypeList('FacilityType');
        $('#inpStatefcl').prop('selectedIndex', 0);
    },

    initilizeGridsonPage: function () {
        //Facilites Grid
        this._FacilitesGrid = new QCGrid();
        this._FacilitesGrid.width = '100%';
        this._FacilitesGrid.height = 'calc(100vh - 500px)';
        this._FacilitesGrid.id = 'tblFacilityGrid'
        this._FacilitesGrid.containerID = 'FacilityGrid';
        this._FacilitesGrid.class = 'table table-bordered table-striped table-hover gridLayoutFix';
    },

    initializeGridConfiguration: function (gridInstance) {
        const config = new QCGridConfigration(gridInstance);
        var url = '../../../apix/CAYRGridConfiguration/';
        config.gridAPI = url + 'GetGridColModel';
        config.gridSaveAPI = url + 'SaveGridColModal';
        config.gridResetAPI = url + 'ResetGridColModal';
        return config;
    },

    showFacilityDefaultMessage: function () {
        const html = `
        <div class="mngFaclit-empty-state text-center p-5">
            <i class="fa-regular fa-hospital text-muted mb-4 mngFaclit-empty-icon"></i>
            <p class="lead">
                <strong>No facilities available</strong>. Please select a client to view its facilities.
            </p>
        </div>`;

        $('#FacilityNoMsg').html(html).removeClass('d-none');
    },

    showNoFacilityMessage: function () {
        var htm = `
        <div class="mngFaclit-empty-state text-center p-5">
             <i class="fa-regular fa-hospital text-muted mb-4 mngFaclit-empty-icon"></i>
            <p class="lead mb-2">
                <strong>No facility available for the selected client.</strong>
            </p>
            <p class="mb-0">
                In order to add a facility, click add facility button.
            </p>
       
        </div>`;

        $('#FacilityGrid').html(htm).removeClass('d-none');
    },

    showSubMenu: function () {
        $('.table-bordered.cursor-pointer.mb-3').addClass('custom-margin-dictionary');
        $('#FacilityFilter').addClass('custom-margin-dictionary');
        $("body").addClass("sidebar-icon-only");
        $('#theme-settings').css('display', 'block')
        $('#submenuIcon').remove();
    },

    setPage: function (v) {
        Core.toggleMenuDisplay();
        $('#div' + v).css('display', 'block');
        _$modxAppCore.hideinlineConfirm('alert' + v);
        _$modxAppCore.showErrorMessage('', 'success', 'divValidateMsgFcl');
    },

    GetAllClients: async function () {
        var meta = {}
        var functionName = "GetAllClients";
        var url = _GlobalFacilites.url + functionName;
        var data = await __PromisAsyncPostBack(meta, url);

        Core.bindSelectList('selClient', data, 'ClientID', 'Name', 'Select');

        Facilites.setPage('Facilites');
    },

    GetFacilites: async function (gridParam) {
        _$modxAppProgressBar.show();
        var meta = {}
        gridParam = this.setFaciltyQuery(gridParam);
        if (gridParam.query == null) {
            return;
        }
        meta.QCGridParam = gridParam;
        meta.GridName = 'FacilityGrid';
        var functionName = "GetFacilites";
        var url = _GlobalFacilites.url + functionName;
        var qcGrid = await __PromisAsyncPostBack(meta, url);
        if (qcGrid.success == false) {
            _$modxAppProgressBar.hide();
            Facilites.resetCtle();
            _$modxAppCore.alert("Could not get facilites data", 'Error');
            return false;
        }
        if (qcGrid.data.length == 0) {
            $('#FacilityGrid').html('')
            this.showNoFacilityMessage();
            _$modxAppProgressBar.hide();
            return;
        }
        $('#btnAddFacility').removeClass('d-none')
        $('#FacilityNoMsg').addClass('d-none')
        Core.showNoGridDataMessage(this._FacilitesGrid.containerID, '');
        //code to plot the grid
        var grid = this._FacilitesGrid;
        grid.gridData = qcGrid;
        if (Facilites._FacilitesRecCount != qcGrid.param.totalRecords) {
            grid.clearBind();
        }
        grid.bind();
        Facilites._FacilitesRecCount = qcGrid.param.totalRecords;
        _$modxAppProgressBar.hide();
        grid.onSubmit = function (gridParam) {
            Facilites.GetFacilites(gridParam);
        }

        grid.onRowDblClick = function (rowNum, colNum, row, colModel) {
            //To override the Active column value
            var tempRow = {};
            tempRow.ClientID = row.ClientID;
            tempRow.ID = row.ID;
            tempRow.ClientName = row.ClientName;
            tempRow.Department = row.Department;
            tempRow.ClientFacilityID = row.ClientFacilityID;
            tempRow.FacilityType = row.FacilityType;
            tempRow.Name = row.Name;
            tempRow.Address1 = row.Address1;
            tempRow.Address2 = row.Address2;
            tempRow.City = row.City;
            tempRow.State = row.State;
            tempRow.Zip = row.Zip
            tempRow.ContactName = row.ContactName;
            tempRow.ContactPhone = row.ContactPhone;
            tempRow.ContactEmail = row.ContactEmail;
            tempRow.NPI = row.NPI;
            tempRow.TaxID = row.TaxID;
            tempRow.MedicareTaxID = row.MedicareTaxID;
            tempRow.TIN = row.TIN;
            tempRow.EIN = row.EIN;
            tempRow.FaxNumber = row.FaxNumber;
            tempRow.FacilityEmpContact = row.FacilityEmpContact;
            tempRow.FacilityEmpPhone = row.FacilityEmpPhone;
            tempRow.FacilityEmpEmail = row.FacilityEmpEmail;

            if (row.IsActive == 'Yes') {
                tempRow.Active = true;
            }
            else {
                tempRow.Active = false;
            }

            _$modxAppCore.putAppCoreModel('FacilitesMeta', tempRow);
            _GlobalFacilites.selectedFacility = row.Name;
            $('#SelClientFacility').html($('#selClient option:selected').text())
            _$modxAppCore.showErrorMessage('', 'success', 'divValidateMsgFcl');
            _$modxAppCore.hideinlineConfirm('alertFacility');            
            $('.table-primary').removeClass('table-primary');
            $('.tr-select').addClass('table-primary');
            $('#btnAddFacility').css('margin-right', '510px');
            $('#divManageFacilites').removeClass('d-none');
        }
    },

    setFaciltyQuery: function (gridParam) {
        var searhcColumn = $('#selSearchFcl').val();
        var serachValue = $('#inpSearchfcl').val().trim();
        if (searhcColumn == 'FacilityType') {
            serachValue = $('#selFacilityType').val();
        }
        gridParam.queryType = 'ClientID|IsActive|' + searhcColumn;
        gridParam.query = _GlobalFacilites.selClient + '|' + $('#selActive_fcl').val() + '|' + serachValue;

        return gridParam;
    },

    resetCtle: function () {
        var meta = {};
        meta.ID = 0;
        meta.ClientID = 0;
        meta.ClientFacilityID = '';
        meta.FacilityType = 'Clinic';
        meta.Name = '';
        meta.Address1 = '';
        meta.Address2 = '';
        meta.City = '';
        meta.State = '';
        meta.Zip = '';
        meta.ContactName = '';
        meta.ContactPhone = '';
        meta.ContactEmail = '';
        meta.NPI = '';
        meta.TaxID = '';
        meta.MedicareTaxID = '';
        meta.EIN = '';
        meta.TIN = '';
        meta.FaxNumber = '';
        meta.FacilityEmpContact = '';
        meta.FacilityEmpPhone = '';
        meta.FacilityEmpEmail = '';
        meta.Active = true;
        
        $('.table-primary').removeClass('table-primary');
        _$modxAppCore.showErrorMessage('', 'success', 'divValidateMsgFcl');
        _$modxAppCore.putAppCoreModel('FacilitesMeta', meta);
    },
    
    saveFacility: async function () {
        var meta = _$modxAppCore.getAppCoreModel('FacilitesMeta');
        if (meta.Active == true) {
            meta.IsActive = 1;
        }
        else {
            meta.IsActive = 0;
        }
        var requiredFields = ['Name', 'NPI', 'ContactName', 'ContactPhone', 'ContactEmail', 'Address1', 'City', 'State', 'Zip'];

        meta.ClientID = _GlobalFacilites.selClient
        if (meta.ClientID == null || meta.ClientID == '') {
            _$modxAppCore.showErrorMessage(`Please select a client`, 'error', 'divValidateMsgFcl');
            $('#selClient').focus();
            return;
        }

        var validation = Core.validateInputs(requiredFields, meta);

        if (validation.isValid == false) {
            _$modxAppCore.showErrorMessage(`${validation.error}`, 'error', 'divValidateMsgFcl');
            $('#inp' + validation['missingField']).focus();
            return;
        }

        validation = Core.checkSpecialCharacters(meta.Namefcl);
        if (validation.isValid == false) {
            _$modxAppCore.showErrorMessage(`${validation.error} from Name`, 'error', 'divValidateMsgFcl');
            $('#inpNamefcl').focus();
            return;
        }

        var len = 10;
        var isValid = Core.checkInputValues(meta.NPI, len);
        if (isValid == 0) {
            _$modxAppCore.showErrorMessage(`NPI has to consist of exactly ${len} digits`, 'error', 'divValidateMsgFcl');
            $('#inpNPI').focus();
            return;
        }

        if (meta.State == '-1') {
            _$modxAppCore.showErrorMessage(`Please select state`, 'error', 'divValidateMsgFcl')
            $('#inpState').focus();
            return;
        }

        if (_$AppValidatte.validateEmail(meta.ContactEmail) == false) {
            _$modxAppCore.showErrorMessage(`Please enter valid ContactEmail`, 'error', 'divValidateMsgFcl');
            $('#ContactEmail').focus();
            return;
        }

        if (meta.FacilityEmpEmail.trim() != '' && _$AppValidatte.validateEmail(meta.FacilityEmpEmail) == false) {
            _$modxAppCore.showErrorMessage(`Please enter valid Facility Emp Email`, 'error', 'divValidateMsgFcl');
            $('#inpFacilityEmpEmail').focus();
            return;
        }

        var len = 9;
        var isValid = Core.checkInputValues(meta.TaxID, len);
        if (isValid == 0) {
            _$modxAppCore.showErrorMessage(`Tax ID has to consist of exactly ${len} digits`, 'error', 'divValidateMsgFcl');
            $('#inpTaxID').focus();
            return;
        }

        len = 11;
        isValid = Core.checkInputValues(meta.MedicareTaxID, len);
        if (isValid == 0) {
            _$modxAppCore.showErrorMessage(`Medicare Tax ID has to consist of exactly ${len} digits`, 'error', 'divValidateMsgFcl');
            $('#inpMedicareTaxID').focus();
            return;
        }

        len = 9;
        isValid = Core.checkInputValues(meta.EIN, len);
        if (isValid == 0) {
            _$modxAppCore.showErrorMessage(`EIN has to consist of exactly ${len} digits`, 'error', 'divValidateMsgFcl');
            $('#inpEIN').focus();
            return;
        }

        len = 9;
        isValid = Core.checkInputValues(meta.TIN, len);
        if (isValid == 0) {
            _$modxAppCore.showErrorMessage(`TIN has to consist of exactly ${len} digits`, 'error', 'divValidateMsgFcl');
            $('#inpTIN').focus();
            return;
        }

        len = 5;
        if (meta.Zip.length < 5) {
            isValid = Core.checkInputValues(meta.Zip, len);
            if (isValid == 0) {
                _$modxAppCore.showErrorMessage(`Zip has to consist of exactly ${len} digits`, 'error', 'divValidateMsgFcl');
                $('#inpZip').focus();
                return;
            }
        }
        _$modxAppCore.showErrorMessage('', 'success', 'divValidateMsgFcl');

        _$modxAppProgressBar.show();

        var functionName = "SaveFacility";
        var url = _GlobalFacilites.url + functionName;
        var ajaxOut = await __PromisAsyncPostBack(meta, url);
        if (ajaxOut.Success == false) {
            _$modxAppCore.showErrorMessage(ajaxOut.Message, 'error', 'divValidateMsgFcl')
            _$modxAppProgressBar.hide();
            return;
        }

        if (ajaxOut.Success) {
            _$modxAppProgressBar.hide();
            _$modxAppCore.showErrorMessage(ajaxOut.Message, 'success', 'divValidateMsgFcl')
            this.GetFacilites(Core.gridDefault);
            $('#ID').val(ajaxOut.ResultData);
        }
    },

    resetPage: function () {
        $('#btnAddFacility').addClass('d-none')
        this.showFacilityDefaultMessage();
        $('#selClient').prop('selectedIndex', 0);
        _$modxAppCore.showErrorMessage('', 'error', 'divValidateMsgFcl');
        $('#FacilityGrid').html('');
        $('.searchCtl').hide();
        $('#selFacilityType').hide();
        $('#selActive').prop('selectedIndex', 0);
        $('#selSearch').prop('selectedIndex', 0);
        $('#selFacilityType').prop('selectedIndex', 0);
        $('#inpSearch').val('');
        this.resetCtle();
        this.hideFacilityAddUpdateForm();
    },

    hideFacilityAddUpdateForm: function (){
        $('#divManageFacilites').addClass('d-none');
        $('#btnAddFacility').css('margin-right', '0px');
        $('#FacilityNoMsg').css('margin-left', '200px');
    },    

    handleEvent: function (ev) {
        var target = ev.target;
        var evCase = target.getAttribute('data-ev');
        
        switch (evCase) {
            case 'EV_CloseSubMenu':
                $('#FacilityFilter').removeClass('custom-margin-dictionary')
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

            case 'EV_ManageUserGroup':
                location.href = 'manageUserGroup.html';
                break;

            case 'EV_Client_Change':
                if (ev.type == 'change') {
                    $('.searchCtl').show();
                    this.hideFacilityAddUpdateForm() //-----------------Hide form
                    this.GetFacilites(Core.gridDefault);                    
                }
                break;

            case 'EV_AddFacilities':
                $('#btnAddFacility').css('margin-right', '510px');
                $('#FacilityNoMsg').css('margin-left', '-200px');
                $('#divManageFacilites').removeClass('d-none');
                this.resetCtle();
                $('#SelClientFacility').html($('#selClient option:selected').text())
                $('#inpNamefcl').focus();
                break;

            case 'EV_Save_fcl':
                this.saveFacility();
                break;

            case 'EV_ManageFacilites':
                this.resetPage();
                break;
            case 'EV_CloseAddUpdateFacilites':
                this.hideFacilityAddUpdateForm();
                break;

            case 'EV_Active_fcl':
                if (ev.type == 'change') {
                    this.GetFacilites(Core.gridDefault);
                    this.hideFacilityAddUpdateForm();
                }
                break;          

            case 'EV_SelSearch_FacilityDrp':
                if (ev.type == 'change') {
                    var v = $('#selSearchFcl').val();
                    $('#selFacilityType').addClass('d-none')
                    $('#inpSearchfcl').removeClass('d-none')
                    $('#selFacilityType').prop('selectedIndex', 0);
                    if (v == '') {                        
                        $('#inpSearchfcl').val('');
                    }
                    else if (v == 'FacilityType') {
                        $('#selFacilityType').removeClass('d-none')
                        $('#inpSearchfcl').addClass('d-none')
                    }
                }
                break;

            case 'EV_Search_fcl':
                this.GetFacilites(Core.gridDefault);
                this.hideFacilityAddUpdateForm();
                break;
        }
    }
}

Facilites.Init();
