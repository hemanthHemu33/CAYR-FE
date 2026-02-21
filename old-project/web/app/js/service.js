"use strict"
var _GlobalServices = {
    url: '../../../apix/Services/',
    recordsPerPage: 50,
    selectedService: '',
    ServiceTypeID: '',
    selectedServiceName: '',
}

var Services = {
    _Services: 0,
    _ServicesGrid: {},
    _ServicesDetails: 0,
    _ServicesDetailsGrid: {},
    _MappedCptDetails: 0,
    _MappedCptDetailsGrid: {},

    Init: function () {
        document.getElementById('divMain').addEventListener('click', this);

        $('.accordion-content-dict').css('display', 'block');
        this.showSubMenu();
        this.initilizeGridsonPage();
        this._ServiceGridConfigration = this.initializeGridConfiguration(this._ServicesGrid);
        this._ServiceDetailGridConfigration = this.initializeGridConfiguration(this._ServicesDetailsGrid);
        this.GetAllService(Core.gridDefault)



    },


    initilizeGridsonPage: function () {
        //Services Grid
        this._ServicesGrid = new QCGrid();
        this._ServicesGrid.width = '100%';
        this._ServicesGrid.height = 'calc(40vh)';
        this._ServicesGrid.id = 'tblServicesGrid'
        this._ServicesGrid.containerID = 'ServicesGrid';
        this._ServicesGrid.class = 'table table-bordered table-striped table-hover ';

        //ServicesDetails Grid
        this._ServicesDetailsGrid = new QCGrid();
        this._ServicesDetailsGrid.width = '100%';
        this._ServicesDetailsGrid.height = 'calc(38vh)';
        this._ServicesDetailsGrid.id = 'tblServicesDetailsGrid'
        this._ServicesDetailsGrid.containerID = 'ServicesDetailsGrid';
        this._ServicesDetailsGrid.class = 'table table-bordered table-striped table-hover gridLayoutFix';

        //ServicesDetails Grid
        this._MappedCptDetailsGrid = new QCGrid();
        this._MappedCptDetailsGrid.width = '100%';
        this._MappedCptDetailsGrid.height = 'calc(38vh)';
        this._MappedCptDetailsGrid.id = 'tblMappedServiceCptGrid'
        this._MappedCptDetailsGrid.containerID = 'MappedServiceCptGrid';
        this._MappedCptDetailsGrid.class = 'table table-bordered table-striped table-hover gridLayoutFix';
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
                <i class="fa-solid fa-clipboard-list text-muted mb-4 mngFaclit-empty-icon"></i>
                <p class="lead">
                    <strong>No services have been added yet.</strong>
                    <br>
                    Get started by
                    <a href="#" id="lnkAddService" data-ev="EV_AddMasterService" class="mngFaclit-cta-link">
                        <i class="fas fa-plus-circle me-1" data-ev="EV_AddMasterService" ></i>adding a new service type
                    </a>
                </p>
            </div>
    `;

        $('#ClientNoMsg').html(html).removeClass('d-none');

    },
    showSubMenu: function () {
        $('.table-bordered.cursor-pointer.mb-3').addClass('custom-margin-dictionary');
        $('#ServiceAccordianIns').addClass('custom-margin-dictionary')
        $('#ServiceFilter').addClass('custom-margin-dictionary')
        $('#serviceTypeHeader').addClass('custom-margin-dictionary')
        $('#CptServiceFilter').addClass('custom-margin-dictionary')
        $('#FacilityFilter').addClass('custom-margin-dictionary');
        $("body").addClass("sidebar-icon-only");
        $('#theme-settings').css('display', 'block')
        $('#submenuIcon').remove();
    },

    //This fucntion fetch all the service from service master
    GetAllService: async function (gridParam) {
        _$modxAppProgressBar.show();
        var meta = {}
        if (gridParam.query == null) {
            return;
        }
        meta.QCGridParam = gridParam;
        meta.GridName = 'ServicesGrid'
        var functionName = "GetAllServiceData";
        var url = _GlobalServices.url + functionName;
        var qcGrid = await __PromisAsyncPostBack(meta, url);
        if (qcGrid.success == false) {
            _$modxAppProgressBar.hide();
            _$modxAppCore.alert("Could not get Services data", 'Error');
            return false;
        }
        if (qcGrid.data.length == 0) {
            $('#ServicesGrid').html('')
            this.showFacilityDefaultMessage();
            _$modxAppProgressBar.hide();
            return;
        }
        $('#ClientNoMsg').html('').addClass('d-none');
        Core.showNoGridDataMessage(this._ServicesGrid.containerID, '');
        //code to plot the grid
        var grid = Services._ServicesGrid;
        grid.gridData = qcGrid;
        if (Services._ServicesRecCount != qcGrid.param.totalRecords) {
            grid.clearBind();
        }
        grid.bind();
        Services._ServicesRecCount = qcGrid.param.totalRecords;
        _$modxAppProgressBar.hide();
        grid.onSubmit = function (gridParam) {
            Services.GetAllService(gridParam);
        }

        grid.onRowDblClick = function (rowNum, colNum, row, colModel) {
            //_$modxAppCore.putAppCoreModel('ServiceMasterMeta', row);
            //_GlobalServices.selectedService = row.ServiceTypeName;
            //_$modxAppCore.showErrorMessage('', 'success', 'divValidateMsgMap');
            //_$modxAppCore.hideinlineConfirm('alertFacility');
            //$('#btnDelete').show();

            //$('.table-primary').removeClass('table-primary');
            //$('.tr-select').addClass('table-primary');
            //$('#btnAddMasterService').css('margin-right', '520px');
            //$('#divAddEditMasterService').removeClass('d-none');
        }
    },

    resetServiceCtle: function () {
        $('#btnDelete').hide();
        $('.table-primary').removeClass('table-primary');
        _$modxAppCore.showErrorMessage('', 'success', 'divValidateMsgMap');
        _$modxAppCore.putAppCoreModel('ServiceMasterMeta', '');
    },
    resetCptMapService: function () {
        $('#btnDelete').hide();
        $('.table-primary').removeClass('table-primary');
        _$modxAppCore.showErrorMessage('', 'success', 'divValidateMsgCPTSrvMapDet');
        _$modxAppCore.putAppCoreModel('ServiceCPTMeta', '');
        $('#ServiceCptCodeID').val('')
    },

    saveMasterService: async function () {
        var meta = _$modxAppCore.getAppCoreModel('ServiceMasterMeta');
        var requiredFields = ['ServiceTypeName'];
        var validation = Core.validateInputs(requiredFields, meta);


        if (validation.isValid == false) {
            _$modxAppCore.showErrorMessage(`${validation.error}`, 'error', 'divValidateMsgMap');
            $('#inp' + validation['missingField']).focus();
            return;
        }

        validation = Core.checkSpecialCharacters(meta.ServiceName);
        if (validation.isValid == false) {
            _$modxAppCore.showErrorMessage(`${validation.error} from Name`, 'error', 'divValidateMsgMap');
            $('#inpServiceTypeName').focus();
            return;
        }
        _$modxAppCore.showErrorMessage('', 'success', 'divValidateMsgMap');

        _$modxAppProgressBar.show();

        var functionName = "SaveServiceType";
        var url = _GlobalServices.url + functionName;
        var ajaxOut = await __PromisAsyncPostBack(meta, url);
        if (ajaxOut.Success == false) {
            _$modxAppCore.showErrorMessage(ajaxOut.Message, 'error', 'divValidateMsgMap')
            _$modxAppProgressBar.hide();
            return;
        }

        if (ajaxOut.Success) {
            _$modxAppProgressBar.hide();
            _$modxAppCore.showErrorMessage(ajaxOut.Message, 'success', 'divValidateMsgMap')
            this.GetAllService(Core.gridDefault);
            $('#ID').val(ajaxOut.ResultData);
        }
    },

    resetPage: function () {
        this.showFacilityDefaultMessage();
        $('#selClient').prop('selectedIndex', 0);
        _$modxAppCore.showErrorMessage('', 'error', 'divValidateMsgMap');
        $('#ServicesGrid').html('')
        this.resetServiceCtle();
        this.hideServicesAddUpdateForm();
    },

    hideServicesAddUpdateForm: function () {
        $('#divAddEditServices').addClass('d-none');
        $('#btnAddServices').css('margin-right', '0px');

    },
    ViewServiceDetail: function (ev) {
        Core.gridDefault.query = ev.target.getAttribute('data-id')
        _GlobalServices.ServiceTypeID = Core.gridDefault.query
        _GlobalServices.ServiceID = ev.target.getAttribute('data-parent')
        $('.bold-link').removeClass('bold-link');
        $('.table-primary').removeClass('table-primary');
        ev.target.parentElement.classList.remove('tr-select');
        ev.target.classList.add('bold-link');
        $('#physcianDetails').removeClass('d-none')
        this.hideMasterServiceAddUpdateForm();
        this.hideServiceDetailAddUpdateForm();
        this.GetAllServiceDetails(Core.gridDefault);
        $('#manageServiceDetailGrid').removeClass('d-none')
    },
    ViewMappedCptDetail: function (ev) {
        Core.gridDefault.query = ev.target.getAttribute('data-id')
        _GlobalServices.ServiceID = Core.gridDefault.query
        $('.bold-link').removeClass('bold-link');
        $('.table-primary').removeClass('table-primary');
        ev.target.parentElement.classList.remove('tr-select');
        ev.target.classList.add('bold-link');
        $('#physcianDetails').removeClass('d-none')
        this.hideMasterServiceAddUpdateForm();
        this.hideServiceDetailAddUpdateForm();
        this.GetMappedCptCode(Core.gridDefault);
        $('#manageCPTServiceMappingGrid').removeClass('d-none')
    },
    hideMasterServiceAddUpdateForm: function () {
        $('#divAddEditMasterService').addClass('d-none');
        $('#btnAddMasterService').css('margin-right', '0px');
    },
    deleteConfirm: function () {
        var name = _GlobalServices.selectedService;
        var msg = 'Are you sure you want to delete the service type "<b>' + name + '</b>"? This action will also delete all services associated with it.';
        _$modxAppCore.inlineConfirm('inlinealertMessage', 'alertFacility', msg, "primary", "EV_CONFRIM_DeleteFacility", "EV_CANCELDelFacility");
        $('.in-tkt-modelCntr').scrollTop(1E10);
        $('#alertFacility').scrollTop(0);
    },

    deleteServiceType: async function () {
        var meta = {};
        meta.ServiceTypeID = $('#ServiceTypeID').text().trim();

        _$modxAppCore.showErrorMessage('', 'success', 'divValidateMsgMap');

        _$modxAppProgressBar.show();

        var functionName = "DeleteServiceType";
        var url = _GlobalServices.url + functionName;
        var ajaxOut = await __PromisAsyncPostBack(meta, url);
        if (ajaxOut.Success == false) {
            _$modxAppCore.showErrorMessage(ajaxOut.Message, 'error', 'divValidateMsgMap')
            _$modxAppProgressBar.hide();
            return;
        }

        if (ajaxOut.Success) {
            _$modxAppProgressBar.hide();
            this.resetServiceCtle();
            _$modxAppCore.hideinlineConfirm('alertFacility');
            $('#manageServiceDetailGrid').addClass('d-none') //---- hide service details
            this.hideServiceDetailAddUpdateForm();

            $('#btnDelete').hide();
            _$modxAppCore.showErrorMessage(ajaxOut.Message, 'success', 'divValidateMsgMap')
            this.hideMasterServiceAddUpdateForm();
            this.GetAllService(Core.gridDefault);
        }
    },

    //-------------------------------- Service Detial ------------------------------------------------------------
    //This fucntion fetch all the service detials from service details table
    GetAllServiceDetails: async function (gridParam) {
        _$modxAppProgressBar.show();
        var meta = {}
        if (gridParam.query == null) {
            return;
        }
        meta.QCGridParam = gridParam;
        meta.GridName = 'ServicesDetailsGrid'
        var functionName = "GetAllServiceDetailsData";
        var url = _GlobalServices.url + functionName;
        var qcGrid = await __PromisAsyncPostBack(meta, url);
        if (qcGrid.success == false) {
            _$modxAppProgressBar.hide();
            _$modxAppCore.alert("Could not get ServicesDetails data", 'Error');
            return false;
        }
        if (qcGrid.data.length == 0) {
            $('#ServicesDetailsGrid').html('')
            //$('#manageServiceDetailGrid').addClass('d-none')
            this.showServiceDetailDefaultMessage();
            // this.GetAllService(Core.gridDefault);
            _$modxAppProgressBar.hide();
            return;
        }
        $('#ServiceDetial').addClass('d-none')
        Core.showNoGridDataMessage(this._ServicesDetailsGrid.containerID, '');
        //code to plot the grid
        var grid = Services._ServicesDetailsGrid;
        grid.gridData = qcGrid;
        if (Services._ServicesDetailsRecCount != qcGrid.param.totalRecords) {
            grid.clearBind();
        }
        grid.bind();
        Services._ServicesDetailsRecCount = qcGrid.param.totalRecords;
        _$modxAppProgressBar.hide();
        grid.onSubmit = function (gridParam) {
            Services.GetAllServiceDetails(gridParam);
        }

        grid.onRowDblClick = function (rowNum, colNum, row, colModel) {
            row.ServiceName = row.Name
            if (row.IsActive == "Yes" || row.IsActive) {
                row.IsActive = true;
            }
            else {
                row.IsActive = false;
            }
            _$modxAppCore.putAppCoreModel('ServiceDetailMeta', row);
            _GlobalServices.selectedServiceName = row.ServiceName;

            _$modxAppCore.showErrorMessage('', 'success', 'divValidateMsgSrvDet');
            _$modxAppCore.hideinlineConfirm('alertFacility');
            $('#btnDeleteSrvDet').show();

            $('.table-primary').removeClass('table-primary');
            $('.tr-select').addClass('table-primary');
            $('#btnAddSrvDetail').css('margin-right', '510px');
            $('#divAddEditDetailService').removeClass('d-none');
        }
    },
    hideServiceDetailAddUpdateForm: function () {
        $('#divAddEditDetailService').addClass('d-none');
        $('#btnAddSrvDetail').css('margin-right', '0px');

    },
    resetServDetailCtle: function () {
        $('#btnDeleteSrvDet').hide();
        $('.table-primary').removeClass('table-primary');
        _$modxAppCore.showErrorMessage('', 'success', 'divValidateMsgSrvDet');
        let meta = {}
        meta.ServiceName = '',
            meta.IsActive = true,
            meta.Description = ''
        _$modxAppCore.putAppCoreModel('ServiceDetailMeta', meta);
    },
    saveServiceDetails: async function () {
        var meta = _$modxAppCore.getAppCoreModel('ServiceDetailMeta')
        var requiredFields = ['ServiceName'];
        var validation = Core.validateInputs(requiredFields, meta);
        if (validation.isValid == false) {
            _$modxAppCore.showErrorMessage(`${validation.error}`, 'error', 'divValidateMsgSrvDet');
            $('#inp' + validation['missingField']).focus();
            return;
        }
        meta.ServiceTypeID = _GlobalServices.ServiceTypeID


        validation = Core.checkSpecialCharacters(meta.ServiceName);
        if (validation.isValid == false) {
            _$modxAppCore.showErrorMessage(`${validation.error} from Name`, 'error', 'divValidateMsgSrvDet');
            $('#inpName').focus();
            return;
        }
        _$modxAppCore.showErrorMessage('', 'success', 'divValidateMsgSrvDet');

        _$modxAppProgressBar.show();

        var functionName = "SaveServiceDetails";
        var url = _GlobalServices.url + functionName;
        meta.ServiceTypeID = _GlobalServices.ServiceTypeID
        var ajaxOut = await __PromisAsyncPostBack(meta, url);
        if (ajaxOut.Success == false) {
            _$modxAppCore.showErrorMessage(ajaxOut.Message, 'error', 'divValidateMsgSrvDet')
            _$modxAppProgressBar.hide();
            return;
        }

        if (ajaxOut.Success) {
            _$modxAppProgressBar.hide();
            $('#ServiceDetial').addClass('d-none')
            _$modxAppCore.showErrorMessage(ajaxOut.Message, 'success', 'divValidateMsgSrvDet')
            Core.gridDefault.query = _GlobalServices.ServiceTypeID;
            this.GetAllServiceDetails(Core.gridDefault);
            $('#ID').val(ajaxOut.ResultData);
        }
    },
    deleteServiceConfirm: function () {
        var name = _GlobalServices.selectedServiceName;
        var msg = 'Are you sure you want to delete Service with name: <b>' + name + '</b>?';
        _$modxAppCore.inlineConfirm('inlineServicealertMessage', 'alertFacility', msg, "primary", "EV_CONFRIM_SrvDeleteFacility", "EV_CANCELSrvDelFacility");
        $('.in-tkt-modelCntr').scrollTop(1E10);
        $('#alertFacility').scrollTop(0);
    },

    deleteService: async function () {
        var meta = {};
        meta.ServiceID = $('#ServiceID').text().trim();
        meta.FacilityServiceTypeID = $('#FacilityServiceTypeID').text().trim();

        _$modxAppCore.showErrorMessage('', 'success', 'divValidateMsgSrvDet');

        _$modxAppProgressBar.show();

        var functionName = "DeleteService";
        var url = _GlobalServices.url + functionName;
        var ajaxOut = await __PromisAsyncPostBack(meta, url);
        if (ajaxOut.Success == false) {
            _$modxAppCore.showErrorMessage(ajaxOut.Message, 'error', 'divValidateMsgSrvDet')
            _$modxAppProgressBar.hide();
            return;
        }

        if (ajaxOut.Success) {
            _$modxAppProgressBar.hide();
            this.resetServDetailCtle();
            _$modxAppCore.hideinlineConfirm('alertFacility');
            $('#btnDeleteSrvDet').hide();
            _$modxAppCore.showErrorMessage(ajaxOut.Message, 'success', 'divValidateMsgSrvDet')
            this.hideServiceDetailAddUpdateForm();
            this.GetAllServiceDetails(Core.gridDefault);
        }
    },
    //GetAllFacility: async function (ClientId) {
    //    var meta = {}
    //    meta.ClientID = ClientId;
    //    var url = '../../../apix/ManagePhysician/GetAllFacility';
    //    var data = await __PromisAsyncPostBack(meta, url);

    //    Core.bindSelectList('inpselServiceFacility', data, 'FacilityID', 'Name', 'Select');

    //},
    showServiceDetailDefaultMessage: function () {
        const html = `
            <div class="mngFaclit-empty-state text-center p-5">
                <i class="fa-solid fa-clipboard-list text-muted mb-4 mngFaclit-empty-icon"></i>
                <p class="lead">
                    <strong>No services have been added yet.</strong>
                    <br>
                    Get started by
                    <a href="#" id="lnkAddService" data-ev="EV_AddServiceDetail" class="mngFaclit-cta-link">
                        <i class="fas fa-plus-circle me-1" data-ev="EV_AddServiceDetail" ></i>adding a new service
                    </a>
                </p>
                <p class="text-muted small mb-0">
                    Once services are added, they will appear here for easy management.
                </p>
            </div> `;

        $('#ServiceDetial').html(html).removeClass('d-none');

    },
    GetMappedCptCode: async function (gridParam) {
        _$modxAppProgressBar.show();
        var meta = {}
        if (gridParam.query == null) {
            return;
        }
        meta.QCGridParam = gridParam;
        meta.searchType = "ServiceID";
        meta.searchVal = gridParam.query
        var functionName = "GetAllCptService";
        var url = _GlobalServices.url + functionName;
        var qcGrid = await __PromisAsyncPostBack(meta, url);
        if (qcGrid.success == false) {
            _$modxAppProgressBar.hide();
            _$modxAppCore.alert("Could not get Mapped Cpt data", 'Error');
            return false;
        }
        if (qcGrid.data.length == 0) {
            $('#ServicesDetailsGrid').html('')
            //$('#manageServiceDetailGrid').addClass('d-none')
            this.showServiceDetailDefaultMessage();
            // this.GetAllService(Core.gridDefault);
            _$modxAppProgressBar.hide();
            return;
        }
        $('#ServiceDetial').addClass('d-none')
        Core.showNoGridDataMessage(this._MappedCptDetailsGrid.containerID, '');
        //code to plot the grid
        var grid = Services._MappedCptDetailsGrid;
        grid.gridData = qcGrid;
 
        grid.clearBind();
        grid.bind();
        _$modxAppProgressBar.hide();
        grid.onSubmit = function (gridParam) {
            Services.GetMappedCptCode(gridParam);
        }

        grid.onRowDblClick = function (rowNum, colNum, row, colModel) {
            _$modxAppCore.putAppCoreModel('ServiceCPTMeta', row);
            _$modxAppCore.showErrorMessage('', 'success', 'divValidateMsgCPTSrvMapDet');
            $('.table-primary').removeClass('table-primary');
            $('.tr-select').addClass('table-primary');
 
            $('#divAddEditServiceCptMap').removeClass('d-none');
        }
    },
    mapCptService: async function () {
        var meta = _$modxAppCore.getAppCoreModel('ServiceCPTMeta')
 
        if (meta.CptCodes == "") {
            $('#inpServiceCPTCode').focus();
            _$modxAppCore.showErrorMessage(`CPT Code is required.`, 'error', 'divValidateMsgCPTSrvMapDet');
            return;
        }
        else if (meta.CptName == "") {
            $('#CptName').focus();
            _$modxAppCore.showErrorMessage(`CPT Description is required.`, 'error', 'divValidateMsgCPTSrvMapDet');
            return;
        }
        meta.ServiceCptCodeID = $('#ServiceCptCodeID').val() || $('#ServiceCptCodeID').text();
        meta.ServiceID = _GlobalServices.ServiceID
        $('#divValidateMsgCPTSrvMapDet').html('');
 
 
        _$modxAppProgressBar.show();

        var functionName = "SaveCptSerivceMapping";
        var url = _GlobalServices.url + functionName;
        meta.ServiceTypeID = _GlobalServices.ServiceTypeID
        var ajaxOut = await __PromisAsyncPostBack(meta, url);
        if (ajaxOut.Success == false) {
            _$modxAppCore.showErrorMessage(ajaxOut.Message, 'error', 'divValidateMsgCPTSrvMapDet')
            _$modxAppProgressBar.hide();
            return;
        }

        if (ajaxOut.Success) {
            _$modxAppProgressBar.hide();
            $('#ServiceDetial').addClass('d-none')
            _$modxAppCore.showErrorMessage(ajaxOut.Message, 'success', 'divValidateMsgCPTSrvMapDet')
            Core.gridDefault.query = _GlobalServices.ServiceID;
            this.GetMappedCptCode(Core.gridDefault);
            $('#ServiceCptCodeID').val(ajaxOut.CommandArgs);
        }
    },
    handleEvent: function (ev) {
        var target = ev.target;
        var evCase = target.getAttribute('data-ev');

        switch (evCase) {
            case 'EV_CloseSubMenu':
                $('#serviceTypeHeader').removeClass('custom-margin-dictionary')
                $('#CptServiceFilter').removeClass('custom-margin-dictionary')
                $('#FacilityFilter').removeClass('custom-margin-dictionary')
                $('#ServiceFilter').removeClass('custom-margin-dictionary')
                $('#ServiceAccordianIns').removeClass('custom-margin-dictionary')
                Core.closeSubMenu();
                break;

            case 'EV_ShowSubMenu':
                this.showSubMenu();
                break;

            case 'EV_ManageServiceMaster':
                location.href = 'service.html';
                break;
            case 'EV_ManageFacilityService':
                location.href = 'facilityService.html';
                break;
            case 'EV_ManageCptService':
                location.href = 'cptService.html';
                break;
            case 'EV_ViewServiceDetail':
                this.ViewServiceDetail(ev);
                break
            case 'EV_ViewManageServiceCpt':
                this.ViewMappedCptDetail(ev);
                break;
            case 'EV_AddMasterService':
                //$('#btnAddMasterService').css('margin-right', '520px');
                $('#FacilityNoMsg').css('margin-left', '-200px');
                $('#divAddEditMasterService').removeClass('d-none');
                this.resetServiceCtle();
                break;
            case 'EV_MapCptService':
                $('#divAddEditServiceCptMap').removeClass('d-none')
                this.resetCptMapService();
                break;

            case 'EV_CloseAddUpdateServiceMaster':
                this.hideMasterServiceAddUpdateForm();
                break;
            case 'EV_CloseAddUpdateServiceCptDetial':
                $('#divAddEditServiceCptMap').addClass('d-none')
                break;
            case 'EV_Save':
                this.saveMasterService();
                break;

            case 'EV_Delete':
                this.deleteConfirm();
                break;

            case 'EV_CONFRIM_DeleteFacility':
                this.deleteServiceType();
                break;
            case 'EV_CANCELDelFacility':
                _$modxAppCore.hideinlineConfirm('alertFacility');
                break;

            //-----------Service detials 
            case 'EV_AddServiceDetail':
               // $('#btnAddSrvDetail').css('margin-right', '510px');
                // $('#ServiceDetial').css('margin-left', '-200px');
                $('#divAddEditDetailService').removeClass('d-none');
                this.resetServDetailCtle();
                break;
            case 'EV_CloseAddUpdateServiceDetial':
                this.hideServiceDetailAddUpdateForm();
                break;
            case 'EV_Save_ServiceDetail':
                this.saveServiceDetails();
                break;
            case 'EV_Delete_SrvDet':
                this.deleteServiceConfirm();
                break;
            case 'EV_CANCELSrvDelFacility':
                _$modxAppCore.hideinlineConfirm('alertFacility');
                break;
            case 'EV_CONFRIM_SrvDeleteFacility':
                this.deleteService();
                break;

            //------------Cpt Codes Mapping 
            case 'EV_Save_CptDetail':
                this.mapCptService();
                break;
        }
    }
}
Services.Init();


$(document).ready(function () {
    var postbackUrl = "../../../apix/UserSession/GetUserRolesByPage";
    var meta = {};
    meta.PageName = 'service.html';

    __DoAsyncPostBack(meta, postbackUrl, function (ajxOut) {
        if (ajxOut.Success == false) {
            return '';
        }

        if (ajxOut.Success == true) {
            var rolValue = ajxOut.ResultData;

            //if user do not have any role for service page, then rederict to facilityService page, as this is thwe default page open for service main menu
            if (rolValue == '') {
                location.href = '../../web/app/facilityService.html';
                return;
            }

            if (rolValue.includes('A') == false && rolValue.includes('E') == false) {
                $('#btnAddMasterService').remove();
                $('#btnServiceTypeSave').remove();
                $('#btnAddSrvDetail').remove();
                $('#btnServiceDetailSave').remove();
            }

            if (rolValue.includes('D') == false) {
                $('#btnDeleteSrvDet').remove();
                $('#btnDelete').remove();
            }
        }
    });
});