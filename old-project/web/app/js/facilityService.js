"use strict"
var _GlobalFacilityService = {
    url: '../../../apix/Services/',
    recordsPerPage: 50,
    PhysicianNPI: '',
}

var FacilityService = {
    _FacilityServiceRecCount: 0,
    _FacilityServiceGrid: {},
    _FacilitesRecCount: 0,
    _FacilitesGrid: {},
    _FacilityScheduleGrid: {},

    Init: function () {
        document.getElementById('divMain').addEventListener('click', this);
        document.getElementById('ServiceTypeCode').addEventListener('change', this);

        $('.accordion-content-dict').css('display', 'block');
        $(function () {
            const $start = $("#inpContractStartDate");
            const $end = $("#inpContractEndDate");

            const startPicker = $start.flatpickr({
                dateFormat: "m-d-Y",
                defaultDate: null,
                onChange: function (selectedDates) {
                    if (selectedDates.length > 0) {
                        const startDate = selectedDates[0];
                        // set minDate for End Date only (no max restriction)
                        endPicker.set("minDate", startDate);
                        // if End Date < Start Date, reset
                        if (endPicker.selectedDates[0] && endPicker.selectedDates[0] < startDate) {
                            endPicker.clear();
                        }
                    }
                }
            });
            const endPicker = $end.flatpickr({
                dateFormat: "m-d-Y",
                defaultDate: null,
                onChange: function (selectedDates) {
                    if (selectedDates.length > 0) {
                        const endDate = selectedDates[0];
                        // validate End Date >= Start Date
                        if (startPicker.selectedDates[0] && endDate < startPicker.selectedDates[0]) {
                            alert("End date cannot be earlier than start date.");
                            endPicker.clear();
                        }
                    }
                }
            });
        });
        $('#inpWeekday').multiselect({
            includeSelectAllOption: true,
            nonSelectedText: 'Select Weekdays',
            numberDisplayed: 3,
            buttonWidth: '100%',
            enableFiltering: true,
            enableCaseInsensitiveFiltering: true
        });

        this.showSubMenu();
        this.initilizeGridsonPage();
        this._FacilityServiceGridConfigration = this.initializeGridConfiguration(this._FacilityServiceGrid);
        this.showFacilityServiceDefaultMsg();
        Core.GetAllClients('FacilityService');
        this.GetServiceType();
        FacilityService.BindDropDownList([], 'ServiceID');
        Accordion.init('#filterAccordian');

    },
    initilizeGridsonPage: function () {
        //Physician Grid
        this._FacilityServiceGrid = new QCGrid();
        this._FacilityServiceGrid.width = '100%';
        this._FacilityServiceGrid.height = 'calc(60vh - 160px)';
        this._FacilityServiceGrid.id = 'tblFacilityServiceGrid';
        this._FacilityServiceGrid.containerID = 'FacilityServiceGrid';
        this._FacilityServiceGrid.class = 'table table-bordered table-striped table-hover gridLayoutFix';

        //Facilites Grid
        this._FacilitesGrid = new QCGrid();
        this._FacilitesGrid.width = '100%';
        this._FacilitesGrid.height = '300px';
        this._FacilitesGrid.id = 'tblFacilityGrid'
        this._FacilitesGrid.containerID = 'FacilityGrid';
        this._FacilitesGrid.class = 'table table-bordered table-striped table-hover  ';

        this._FacilityScheduleGrid = new QCGrid();
        this._FacilityScheduleGrid.width = '100%';
        this._FacilityScheduleGrid.height = '300px';
        this._FacilityScheduleGrid.id = 'tblFacilityScheduleGrid'
        this._FacilityScheduleGrid.containerID = 'FacilityScheduleGrid';
        this._FacilityScheduleGrid.class = 'table table-bordered table-striped table-hover  ';

    },
    initializeGridConfiguration: function (gridInstance) {
        const config = new QCGridConfigration(gridInstance);
        var url = '../../../apix/CAYRGridConfiguration/';
        config.gridAPI = url + 'GetGridColModel';
        config.gridSaveAPI = url + 'SaveGridColModal';
        config.gridResetAPI = url + 'ResetGridColModal';
        return config;
    },
    showFacilityServiceDefaultMsg: function () {
        const html = `
            <div class="mngFaclit-empty-state text-center p-5">
            <i class="fa-solid fa-clipboard-list text-muted mb-4 mngFaclit-empty-icon"></i>
            <p class="lead">
                <strong>No services available.</strong>
                <br>
                Please select a facility to view its associated services.
            </p>
        </div>


    `;

        $('#FacilityServiceDefaultMsg').html(html).removeClass('d-none');

    },
    showFacilityDefaultMessage: function () {
        const html = `
        <div class="mngFaclit-empty-state text-center p-5">
            <i class="fa-regular fa-hospital text-muted mb-4 mngFaclit-empty-icon"></i>
            <p class="lead">
                <strong>No service available for the selected facility</strong>.<a href="#" id="lnkAddFacility" data-ev="EV_AddFacilityService" class="mngFaclit-cta-link">
                    <i class="fas fa-plus-circle me-1" data-ev="EV_AddFacilityService" ></i>Click here to add service
                </a>
            </p>
           
        </div>
    `;

        $('#FacilityServiceDefaultMsg').html(html).removeClass('d-none');

    },
    showSubMenu: function () {
        // $('.table-bordered.cursor-pointer.mb-3').addClass('custom-margin-dictionary');
        $('#FacilityFilter').addClass('custom-margin-dictionary');
        $('#filterAccordian').addClass('custom-margin-dictionary')
        $('#FacilityServiceAccordianIns').addClass('custom-margin-dictionary')
        $("body").addClass("sidebar-icon-only");
        $('#theme-settings').css('display', 'block')
        $('#submenuIcon').remove();
        $('#attach_document').addClass('custom-margin-dictionary')
        $('#FacilityServiceCard').addClass('custom-margin-dictionary')
    },

    GetFacilityBySearch: async function (searchText, page = 1) {
        if (!searchText || searchText.length < 3) return [];

        const meta = { Name: searchText };
        meta.ClientID = $('#inpOrderClient').val();
        const url = '../../../apix/ManagePhysician/GetAllFacility';

        try {
            const data = await __PromisAsyncPostBack(meta, url);
            return Array.isArray(data) ? data : [];
        } catch (error) {
            console.error("Error fetching facilities:", error);
            return [];
        }
    },
    GetServiceType: async () => {
        var meta = {}
        var functionName = "GetServiceType";
        var url = _GlobalFacilityService.url + functionName;
        var data = await __PromisAsyncPostBack(meta, url);

        Core.bindSelectList('ServiceTypeCode', data, 'Id', 'Name', 'Select');
    },
    GetServiceDetails: async (serviceType) => {
        var meta = {}
        meta.Id = serviceType
        var functionName = "GetServiceListDetails";
        var url = _GlobalFacilityService.url + functionName;
        var data = await __PromisAsyncPostBack(meta, url);
        FacilityService.BindDropDownList(data, 'ServiceID');
    },
    BindDropDownList: function (list, id) {
        const $ddl = $("#" + id);

        // Always clear & destroy previous instance
        $ddl.empty();
        if ($ddl.data('multiselect')) {
            $ddl.multiselect('destroy');
        }
        // Bind new list
        $ddl.html(list);

        // Initialize fresh multiselect
        $ddl.multiselect({
            maxHeight: 250,
            buttonWidth: '100%',
            nonSelectedText: '-Select Service-',
            buttonContainer: '<div class="form-control drpDwnMutiSelect"/>',
            buttonClass: 'custom-add-btn-mulitselect',
            allSelectedText: 'All Services Selected',
            nSelectedText: 'selected',
            enableFiltering: true,
            enableCaseInsensitiveFiltering: true,
            includeSelectAllOption: true,
            selectAllText: ' Select All Service',
            selectAllNumber: false,
            selectAllJustVisible: false
        });
    },

    GetFacilityService: async function (gridParam) {
        _$modxAppProgressBar.show();
        var meta = {}
        if (gridParam.query == null) {
            _$modxAppProgressBar.hide();
            return;
        }
        meta.QCGridParam = gridParam;
        meta.GridName = 'FacilityServiceGrid'
        var functionName = "GetFacilityServiceData";
        var url = _GlobalFacilityService.url + functionName;
        var qcGrid = await __PromisAsyncPostBack(meta, url);
        if (qcGrid.success == false) {
            _$modxAppProgressBar.hide();
            _$modxAppCore.alert("Could not get Services data", 'Error');
            return false;
        }
        if (qcGrid.data.length == 0) {
            $('#FacilityServiceGrid').html('')
            this.showFacilityDefaultMessage();
            _$modxAppProgressBar.hide();
            return;
        }
        $('#FacilityServiceDefaultMsg').addClass('d-none')
        $('#btnFacilityService').removeClass('d-none')
        Core.showNoGridDataMessage(this._FacilityServiceGrid.containerID, '');
        //code to plot the grid
        var grid = FacilityService._FacilityServiceGrid;
        grid.gridData = qcGrid;
        grid.clearBind();
        grid.bind();
        _$modxAppProgressBar.hide();
        grid.onSubmit = function (gridParam) {
            FacilityService.GetFacilityService(gridParam);
        }

        grid.onRowDblClick = function (rowNum, colNum, row, colModel) {
            Promise.all([
                FacilityService.GetServiceDetails(row.ServiceTypeID),
            ]).then(() => {
                if (row.IsActive == "Yes" || row.IsActive) {
                    row.IsActive = true;
                }
                else {
                    row.IsActive = false;
                }
                $('#FacilityDropdown').val(null).trigger('change');
                _$modxAppCore.putAppCoreModel('FacilityServiceMeta', row);
                _GlobalFacilityService.selectedService = row.ServiceTypeName;
                _$modxAppCore.showErrorMessage('', 'success', 'divValidateMsg');
                _$modxAppCore.hideinlineConfirm('alertFacility');
                $('#btnDeleteSrvDet').show();

                $('.table-primary').removeClass('table-primary');
                $('.tr-select').addClass('table-primary');
                $('#btnAddMasterService').css('margin-right', '520px');
                $('#divPhysicianFacilityMap').removeClass('d-none');
                $("#ServiceID").multiselect('select', [row.ServiceID]);
            })

        }
    },
    GetFacilityServiceSchedule: async function (gridParam) {
        _$modxAppProgressBar.show();
        var meta = {}
        if (gridParam.query == null) {
            _$modxAppProgressBar.hide();
            return;
        }
        meta.QCGridParam = gridParam;
        meta.ServiceTypeID = _GlobalFacilityService.ServiceTypeID
        meta.ServiceID = _GlobalFacilityService.ServiceId
        meta.FacilityID = _GlobalFacilityService.selFacility
        meta.GridName = 'FacilityServiceScheduleGrid'
        var functionName = "GetFacilityServiceSchedule";
        var url = _GlobalFacilityService.url + functionName;
        var qcGrid = await __PromisAsyncPostBack(meta, url);
        if (qcGrid.success == false) {
            _$modxAppProgressBar.hide();
            _$modxAppCore.alert("Could not get Services data", 'Error');
            return false;
        }
        if (qcGrid.data.length == 0) {
            $('#FacilityScheduleGrid').html('')
            this.showFacilityAvaialbityDefaultMessage();
            _$modxAppProgressBar.hide();
            return;
        }
        $('#FacilyScheduleDefaultMessage').addClass('d-none')
        Core.showNoGridDataMessage(this._FacilityScheduleGrid.containerID, '');
        //code to plot the grid
        var grid = FacilityService._FacilityScheduleGrid;
        grid.gridData = qcGrid;
        grid.clearBind();
        grid.bind();
        _$modxAppProgressBar.hide();
        grid.onSubmit = function (gridParam) {
            FacilityService.GetFacilityServiceSchedule(gridParam);
        }

        grid.onRowDblClick = function (rowNum, colNum, row, colModel) {
            row.StartHour = FacilityService.convertTo24HrFormat(row.StartHour)
            row.EndHour = FacilityService.convertTo24HrFormat(row.EndHour)
            row.StartHour = row.StartHour.replace(/\s?(AM|PM)$/i, "");
            row.EndHour = row.EndHour.replace(/\s?(AM|PM)$/i, "");

            _$modxAppCore.putAppCoreModel('ScheduleServiceFacilityMeta', row);
            $('#ServiceSdlMapId').val(row.ServiceSdlMapId)
            $('#inpWeekday').val(row.Weekday);
            $('#inpWeekday').multiselect('refresh');
            $('.bold-link').removeClass('bold-link');
            $('.table-primary').removeClass('table-primary');
            $('.tr-select').addClass('table-primary');
            $('#btnDeleteAvlDet').removeClass('d-none')
            $('#divPhysicianFacilityScheduleMap').removeClass('d-none')
        }
    },
    showFacilityAvaialbityDefaultMessage: function () {
        const html = `
        <div class="mngFaclit-empty-state text-center p-5">
            <i class="fa-regular fa-hospital text-muted mb-4 mngFaclit-empty-icon"></i>
            <p class="lead">
              <strong>No availability for the selected service.</strong>
                <span  id="lnkAddFacility" data-ev="EV_ScheduleMapSrv" class="mngFaclit-cta-link">
                    <i class="fas fa-plus-circle me-1" data-ev="EV_ScheduleMapSrv"></i>
                    Click here to create availability
                </span>

            </p>
           
        </div>
    `;

        $('#FacilyScheduleDefaultMessage').html(html).removeClass('d-none');

    },
    resetCtle: function () {
        $('#btnDeleteSrvDet').hide();
        $('.table-primary').removeClass('table-primary');
        _$modxAppCore.showErrorMessage('', 'success', 'divValidateMsg');
        _$modxAppCore.putAppCoreModel('PhysicianMeta', '');
    },

    deletePhysicianConfirm: function () {
        var npi = _GlobalPhysician.PhysicianNPI;
        var msg = 'Are you sure you want to delete physician with npi: <b>' + npi + '</b>?';
        _$modxAppCore.inlineConfirm('inlinealertMessage', 'alertFacility', msg, "primary", "EV_CONFRIM_DeletePhysician", "EV_CANCELDelPhysician");
        $('.in-tkt-modelCntr').scrollTop(1E10);
        $('#alertFacility').scrollTop(0);
    },

    deletePhysician: async function () {
        var meta = {};
        meta.PhysiciansMasterID = $('#PhysiciansMasterID').text().trim();

        _$modxAppCore.showErrorMessage('', 'success', 'divValidateMsg');

        _$modxAppProgressBar.show();

        var functionName = "DeletePhysician";
        var url = _GlobalPhysician.url + functionName;
        var ajaxOut = await __PromisAsyncPostBack(meta, url);
        if (ajaxOut.Success == false) {
            _$modxAppCore.showErrorMessage(ajaxOut.Message, 'error', 'divValidateMsg')
            _$modxAppProgressBar.hide();
            return;
        }

        if (ajaxOut.Success) {
            _$modxAppProgressBar.hide();
            this.resetCtle();
            _$modxAppCore.hideinlineConfirm('alertFacility');
            $('#btnDeleteSrvDet').hide();
            _$modxAppCore.showErrorMessage(ajaxOut.Message, 'success', 'divValidateMsg')
            this.hidePhysicianAddUpdateForm();
            Physician.GetAllPhysician(Core.gridDefault);
        }
    },

    saveFacilityService: async function () {
        var meta = {}
        meta.FacilityServiceTypeID = $('#FacilityServiceTypeID').text().trim();
        //meta.ServiceIDList = $('#ServiceID').val().join(", ");
        meta.ServiceTypeID = $('#ServiceTypeCode').val();
        if (meta.ServiceTypeID == null || meta.ServiceTypeID == '') {
            _$modxAppCore.showErrorMessage(`Please select a service type`, 'error', 'divValidateMsg');
            $('#ServiceTypeCode').focus();
            return;
        }
        meta.ServiceID = $('#ServiceID').val();
        if (meta.ServiceID == null || meta.ServiceID == '') {
            _$modxAppCore.showErrorMessage(`Please select a service `, 'error', 'divValidateMsg');
            $('#ServiceID').focus();
            return;
        }
        meta.FacilityId = _GlobalFacilityService.selFacility
        if (meta.FacilityId == null || meta.FacilityId == '') {
            _$modxAppCore.showErrorMessage(`Please select facility `, 'error', 'divValidateMsg');
            $('#inpOrderFacility').focus();
            return;
        }
        meta.IsActive = $('#IsActive').is(':checked');
        meta.ContractStartDate = $('#inpContractStartDate').val();
        meta.ContractEndDate = $('#inpContractEndDate').val();
        _$modxAppCore.showErrorMessage('', 'success', 'divValidateMsg');

        _$modxAppProgressBar.show();

        var functionName = "SaveFacilityService";
        var url = _GlobalFacilityService.url + functionName;
        var ajaxOut = await __PromisAsyncPostBack(meta, url);
        if (ajaxOut.Success == false) {
            _$modxAppCore.showErrorMessage(ajaxOut.Message, 'error', 'divValidateMsg')
            _$modxAppProgressBar.hide();
            return;
        }

        if (ajaxOut.Success) {
            _$modxAppProgressBar.hide();
            _$modxAppCore.showErrorMessage(ajaxOut.Message, 'success', 'divValidateMsg')
            Core.gridDefault.query = _GlobalFacilityService.selFacility;
            this.GetFacilityService(Core.gridDefault);
            $('#ID').val(ajaxOut.ResultData);
        }
    },

    resetPage: function () {
        this.showFacilityDefaultMessage();
        $('#selClient').prop('selectedIndex', 0);
        _$modxAppCore.showErrorMessage('', 'error', 'divValidateMsg');
        $('#PhysicianGrid').html('')
        this.resetCtle();
        this.hidePhysicianAddUpdateForm();
    },

    hidePhysicianAddUpdateForm: function () {
        $('#divAddEditPhysician').addClass('d-none');
        $('#btnAddPhysician').css('margin-right', '0px');

    },
    NavigateToFacility: function () {
        var meta = {}
        meta = this.extractUrlParams();
        let npi = meta.Npi;
        let Facility = meta.Facility
        window.location.href = "manageFacilityPhysician.html?Npi=" + encodeURIComponent(npi) + "&Facility=" + encodeURIComponent(Facility);
    },
    extractUrlParams: function () {
        const params = new URLSearchParams(window.location.search);
        const Npi = params.get('Npi');
        const Facility = params.get('Facility');
        return { Npi, Facility };
    },
    hideFacilityService: function () {
        $('#divPhysicianFacilityMap').addClass('d-none')
        $('#btnFacilityService').css('margin-right', '');
    },
    resetServDetailCtle: function () {
        $('#btnDeleteSrvDet').hide();
        $('.table-primary').removeClass('table-primary');
        $('#FacilityDropdown').val(null).trigger('change');
        _$modxAppCore.hideinlineConfirm('alertFacility');
        _$modxAppCore.showErrorMessage('', 'success', 'divValidateMsg');
        let meta = {}
        meta.ServiceName = '',
            meta.IsActive = true,
            meta.Description = ''
        _$modxAppCore.putAppCoreModel('FacilityServiceMeta', meta);
        $("#ServiceID").multiselect('updateButtonText');
    },
    deleteServiceConfirm: function () {
        var msg = 'Are you sure you want to delete Service for the selected facility?';
        _$modxAppCore.inlineConfirm('inlineServicealertMessage', 'alertFacility', msg, "primary", "EV_CONFRIM_SrvDeleteFacility", "EV_CANCELSrvDelFacility");
        $('.in-tkt-modelCntr').scrollTop(1E10);
        $('#alertFacility').scrollTop(0);
    },
    delServiceAvlConfirm: function () {
        var msg = 'Are you sure you want to delete the availability slot for the selected service?';
        _$modxAppCore.inlineConfirm('inlineServicealertAvlMessage', 'alertFacility', msg, "primary", "EV_CONFRIM_SrvAvlDeleteFacility", "EV_CANCELSrvAvlDelFacility");
        $('.in-tkt-modelCntr').scrollTop(1E10);
        $('#divPhysicianFacilityScheduleMap').scrollTop(0);
    },

    deleteFacilityService: async function () {
        var meta = {};
        meta.FacilityServiceTypeID = $('#FacilityServiceTypeID').text().trim();

        _$modxAppCore.showErrorMessage('', 'success', 'divValidateMsg');

        _$modxAppProgressBar.show();

        var functionName = "DeleteFacilityService";
        var url = _GlobalFacilityService.url + functionName;
        var ajaxOut = await __PromisAsyncPostBack(meta, url);
        if (ajaxOut.Success == false) {
            _$modxAppCore.showErrorMessage(ajaxOut.Message, 'error', 'divValidateMsg')
            _$modxAppProgressBar.hide();
            return;
        }

        if (ajaxOut.Success) {
            _$modxAppProgressBar.hide();
            this.resetServDetailCtle();
            _$modxAppCore.hideinlineConfirm('alertFacility');
            $('#btnDeleteSrvDet').hide();
            _$modxAppCore.showErrorMessage(ajaxOut.Message, 'success', 'divValidateMsg')
            this.hideFacilityService();
            this.GetFacilityService(Core.gridDefault);
        }
    },
    deleteFacilityAvlService: async function () {
        var meta = {};
        meta.ServiceSdlMapId = $('#ServiceSdlMapId').text().trim();

        _$modxAppCore.showErrorMessage('', 'success', 'divValidateMsg');

        _$modxAppProgressBar.show();

        var functionName = "DeleteFacilityServiceAvialblity";
        var url = _GlobalFacilityService.url + functionName;
        var ajaxOut = await __PromisAsyncPostBack(meta, url);
        if (ajaxOut.Success == false) {
            _$modxAppCore.showErrorMessage(ajaxOut.Message, 'error', 'divValidateMsg')
            _$modxAppProgressBar.hide();
            return;
        }

        if (ajaxOut.Success) {
            _$modxAppProgressBar.hide();
            this.resetServDetailCtle();
            $('.table-primary').removeClass('table-primary');
            $('#divPhysicianFacilityScheduleMap').addClass('d-none');
            _$modxAppCore.hideinlineConfirm('alertFacility');
            $('#btnDeleteAvlDet').addClass('d-none')
            _$modxAppCore.showErrorMessage(ajaxOut.Message, 'success', 'divValidateMsg')
            this.hideFacilityService();
            this.GetFacilityServiceSchedule(Core.gridDefault);
        }
    },
    GetAllClients: async function () {
        var meta = {}
        var url = "../../../apix/Admin/GetAllClients";
        var data = await __PromisAsyncPostBack(meta, url);

        Core.bindSelctizeList('inpOrderClient', data, 'ClientID', 'Name', 'Select');
    },
    bindSelctizeList: function (selectId, data, valueField, labelField, placeholder) {
        var $select = $('#' + selectId);
        if ($select.hasClass('selectized')) {
            var selectize = $select[0].selectize;
            selectize.destroy();
            $select = $('#' + selectId);
        }

        // Clear and add placeholder
        $select.empty();
        $select.append($('<option>').val('').text(placeholder));

        $.each(data, function (i, item) {
            var optionText = item[labelField];
            $select.append($('<option>').val(item[valueField]).text(optionText));
        });

        // Initialize Selectize
        $select.selectize({
            allowEmptyOption: true,
            placeholder: placeholder,
            onChange: function (value) {
                if (!value) return;
                var selectedOption = this.options[value];
                var selectedText = selectedOption.text;
                if (typeof PhysicianFacility !== 'undefined' && PhysicianFacility.GetNpiDrDetail) {
                    PhysicianFacility.GetNpiDrDetail(selectedText);
                }
            }
        });
    },
    GetFacilites: async function (gridParam) {
        _$modxAppProgressBar.show();
        var meta = {}
        if (gridParam.query == null) {
            _$modxAppProgressBar.hide();
            return;
        }
        gridParam = this.setFaciltyQuery(gridParam);
        meta.QCGridParam = gridParam;
        meta.GridName = 'FacilityGrid';
        var functionName = "GetFacilites";
        var url = _GlobalFacilityService.url + functionName;
        var qcGrid = await __PromisAsyncPostBack(meta, url);
        if (qcGrid.success == false) {
            _$modxAppProgressBar.hide();
            _$modxAppCore.alert("Could not get facilites data", 'Error');
            return false;
        }
        if (qcGrid.data.length == 0) {
            _$modxAppProgressBar.hide();
            return;
        }

        Core.showNoGridDataMessage(this._FacilitesGrid.containerID, '');
        //code to plot the grid
        var grid = this._FacilitesGrid;
        grid.gridData = qcGrid;
        if (FacilityService._FacilitesRecCount != qcGrid.param.totalRecords) {
            grid.clearBind();
        }
        grid.bind();
        FacilityService._FacilitesRecCount = qcGrid.param.totalRecords;
        _$modxAppProgressBar.hide();
        grid.onSubmit = function (gridParam) {
            FacilityService.GetFacilites(gridParam);
        }

        grid.onRowDblClick = function (rowNum, colNum, row, colModel) {


        }
    },
    setFaciltyQuery: function (gridParam) {
        var searhcColumn = 'Name'
        var serachValue = $('#facilitySearch').val().trim();
        gridParam.queryType = 'ClientID|' + searhcColumn;
        gridParam.query = $('#inpOrderClient').val() + '|' + serachValue;

        return gridParam;
    },
    SaveFacilityServiceSchedule: async function () {
        var meta = {}
        meta = _$modxAppCore.getAppCoreModel('ScheduleServiceFacilityMeta');
        var requiredFields = ['Weekdays', 'StartHour', 'EndHour'];
        var validation = Core.validateInputs(requiredFields, meta);
        if (meta.Weekdays.length == 0) {
            _$modxAppCore.showErrorMessage(`Please select atleast one weekday`, 'error', 'divValidateSchedlueMsg');
            $('#inpWeekday').focus();
            return;
        }
        if (validation.isValid == false) {
            _$modxAppCore.showErrorMessage(`${validation.error}`, 'error', 'divValidateSchedlueMsg');
            $('#inp' + validation['missingField']).focus();
            return;
        }

        meta.ServiceSdlMapId = $('#ServiceSdlMapId').val();
        meta.ServiceTypeID = _GlobalFacilityService.ServiceTypeID;
        meta.ServiceId = _GlobalFacilityService.ServiceId;
        meta.FacilityId = _GlobalFacilityService.selFacility;

        if (meta.StartHour >= meta.EndHour) {
            _$modxAppCore.showErrorMessage(
                "End Hour cannot be earlier than Start Hour.",
                "error",
                "divValidateSchedlueMsg"
            );
            $('#inpEndHour').focus();
            return;
        }
        _$modxAppCore.showErrorMessage('', 'success', 'divValidateSchedlueMsg');

        _$modxAppProgressBar.show();

        var functionName = "SaveFacilityServiceSchedule";
        var url = _GlobalFacilityService.url + functionName;
        var ajaxOut = await __PromisAsyncPostBack(meta, url);
        if (ajaxOut.Success == false) {
            _$modxAppCore.showErrorMessage(ajaxOut.Message, 'error', 'divValidateSchedlueMsg')
            _$modxAppProgressBar.hide();
            return;
        }

        if (ajaxOut.Success) {
            _$modxAppProgressBar.hide();
            _$modxAppCore.showErrorMessage(ajaxOut.Message, 'success', 'divValidateSchedlueMsg')
            $('#ServiceSdlMapId').val(ajaxOut.ResultData);
            // call grid data 
            this.GetFacilityServiceSchedule(Core.gridDefault);
        }
    },
    convertTo24HrFormat: function (time) {
        let [hours, minutes, modifier] = time.split(/[:\s]/);  

        if (hours === '12') {
            hours = '00';  
        }

        if (modifier === 'PM') {
            hours = parseInt(hours, 10) + 12;
        }
 
        minutes = minutes.padStart(2, '0');
        hours = hours.toString().padStart(2, '0');

        return `${hours}:${minutes}`;
    },


    handleEvent: function (ev) {
        var target = ev.target;
        var evCase = target.getAttribute('data-ev');

        switch (evCase) {
            case 'EV_CloseSubMenu':
                $('#FacilityFilter').removeClass('custom-margin-dictionary')
                $('#FacilityServiceAccordianIns').removeClass('custom-margin-dictionary')
                $('#filterAccordian').removeClass('custom-margin-dictionary')
                $('#attach_document').removeClass('custom-margin-dictionary')
                $('#FacilityServiceCard').removeClass('custom-margin-dictionary')
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
            case 'EV_AddFacilityService':
                this.resetServDetailCtle();
                $('#divPhysicianFacilityMap').removeClass('d-none')
                break;
            case 'EV_CloseAddUpdateFacilityService':
                $('.table-primary').removeClass('table-primary');
                this.hideFacilityService();
                break;
            case 'EV_Facility_Change':
                if (ev.type == 'change') {
                    this.hideFacilityService();
                    //Core.gridDefault.query = ev.target.value;
                    //this.GetFacilityService(Core.gridDefault);
                }
                break;
            case 'EV_Save_FacilityService':
                this.saveFacilityService();
                break;
            case 'EV_OnChangeServiceType':
                if (ev.type == 'change') {
                    let ServiceType = ev.target.value
                    this.GetServiceDetails(ServiceType);
                }
                break;
            case 'EV_Delete_SrvDet':
                this.deleteServiceConfirm();
                break;
            case 'EV_Delete_AvlDet':
                this.delServiceAvlConfirm();
                break;
            case 'EV_CANCELSrvDelFacility':
                _$modxAppCore.hideinlineConfirm('alertFacility');
                break;
            case 'EV_CANCELSrvAvlDelFacility':
                _$modxAppCore.hideinlineConfirm('alertFacility');
                break;
            case 'EV_CONFRIM_SrvDeleteFacility':
                this.deleteFacilityService();
                break;
            case 'EV_CONFRIM_SrvAvlDeleteFacility':
                this.deleteFacilityAvlService();
                break;
            case 'EV_ViewManageFacility':
                $('#FacilityServiceCard').removeClass('d-none')
                $('.bold-link').removeClass('bold-link');
                $('.table-primary').removeClass('table-primary');
                ev.target.parentElement.classList.remove('tr-select');
                ev.target.classList.add('bold-link');
                $('#FacilityScheduleMapCard').addClass('d-none')
                $('#divPhysicianFacilityScheduleMap').addClass('d-none');

                ev.target.parentElement.classList.remove('tr-select');
                ev.target.classList.add('bold-link');
                _GlobalFacilityService.selFacility = ev.target.getAttribute('data-id')
                Core.gridDefault.query = _GlobalFacilityService.selFacility
                FacilityService.GetFacilityService(Core.gridDefault)
                break;

            case 'EV_SearchFacility':
                $('#FacilityServiceCard').addClass('d-none')
                this.GetFacilites(Core.gridDefault)
                break;
            case 'EV_ViewServiceScheduleMap':
                _GlobalFacilityService.ServiceTypeID = ev.target.getAttribute('data-id-servicetypeid')
                _GlobalFacilityService.ServiceId = ev.target.getAttribute('data-value-serviceid')
                $('.bold-link').removeClass('bold-link');
                $('.table-primary').removeClass('table-primary');
                ev.target.parentElement.classList.remove('tr-select');
                ev.target.classList.add('bold-link');
                $('html, body').animate({
                    scrollTop: $(document).height()
                }, 600);
                $('#divPhysicianFacilityScheduleMap').addClass('d-none');
                this.GetFacilityServiceSchedule(Core.gridDefault);
                $('#FacilityScheduleMapCard').removeClass('d-none')
                break;

            case 'EV_ScheduleMapSrv':
                _$modxAppCore.putAppCoreModel('ScheduleServiceFacilityMeta', '');
                $('#ServiceSdlMapId').val('')
                $('#inpWeekday').multiselect('deselectAll', false);
                $('#inpWeekday').multiselect('refresh');
                $('.table-primary').removeClass('table-primary');
                $('#divPhysicianFacilityScheduleMap').removeClass('d-none')
                $('#btnDeleteAvlDet').addClass('d-none')
                _$modxAppCore.showErrorMessage('', 'success', 'divValidateSchedlueMsg');
                _$modxAppCore.hideinlineConfirm('alertFacility');
                break;

            case 'EV_Save_FacilityServiceMap':
                this.SaveFacilityServiceSchedule();
                break;
            case 'EV_CloseAddUpdateFacilityServiceScheduleMap':
                $('.table-primary').removeClass('table-primary');
                _$modxAppCore.showErrorMessage('', 'success', 'divValidateSchedlueMsg');
                _$modxAppCore.hideinlineConfirm('alertFacility');
                $('#divPhysicianFacilityScheduleMap').addClass('d-none');
                break;
        }
    }
}

FacilityService.Init();

$(document).ready(function () {
    var postbackUrl = "../../../apix/UserSession/GetUserRolesByPage";
    var meta = {};
    meta.PageName = 'facilityService.html';

    __DoAsyncPostBack(meta, postbackUrl, function (ajxOut) {
        if (ajxOut.Success == false) {
            return '';
        }

        if (ajxOut.Success == true) {
            var rolValue = ajxOut.ResultData;
            if (rolValue.includes('A') == false && rolValue.includes('E') == false) {
                $('#btnFacilityService').remove();
                $('#btn_FacilityService').remove();

            }

            if (rolValue.includes('D') == false) {
                $('#btnDeleteSrvDet').remove();
            }
        }
    });
});