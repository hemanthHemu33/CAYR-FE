"use strict"
var _GlobalPatientDetails = {
    url: '../../../apix/PatientDetails/',
    recordsPerPage: 50,
    selPatientDetailID: '',
    selPatientDemographicsID: '',
    selPatientInsuranceID: '',
}

var PatientDetails = {
    _PatientDetails: 0,
    _PatientProcedures: 0,
    _PatientDiagnosis: 0,
    _PatientInsurance: 0,
    _PatientDemographic: 0,
    _PatientDemographicsHistory: 0,
    _PatientInsuranceHistory: 0,

    Init: function () {
        document.getElementById('divMain').addEventListener('click', this);
        document.getElementById('inpOrderClient').addEventListener('change', this);
        document.getElementById('selSearch').addEventListener('change', this);

        $(document).on('focus', '#inpPatientDOB, #inpPrimaryInsuredDOB,.dt', function () {
            if (!this._flatpickr) {
                flatpickr(this, {
                    dateFormat: "m-d-Y",
                    maxDate: $(this).is("#inpPatientDOB, #inpPrimaryInsuredDOB") ? "today" : null,
                    defaultDate: null,
                    onChange: function (selectedDates, dateStr, instance) {
                        instance.close();
                    }
                });
            }
        });

        $(document).ready(function () {
            const $start = $("#inpEligibilityStartDate");
            const $end = $("#inpEligibilityEndDate");

            const startPicker = $start.flatpickr({
                dateFormat: "m-d-Y",
                maxDate: "today",   // restrict Start Date to today or earlier
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



        Core.getStateList('inpPatientState');
        Core.getStateList('inpInsuranceCompanyState');
        Core.getStateList('inpPrimaryInsuredAddressState');
        $('.accordion-content-dict').css('display', 'block');
        Core.GetAllClients('PatientDetails')
        this.initilizeGridsonPage();
        this._PatientDetailsGridConfigration = this.initializeGridConfiguration(this._PatientDetailsGrid);
        this._PatientProceduresGridConfigration = this.initializeGridConfiguration(this._PatientProceduresGrid);
        this._PatientDiagnosisGridConfigration = this.initializeGridConfiguration(this._PatientDiagnosisGrid);
        this._PatientInsuranceGridConfigration = this.initializeGridConfiguration(this._PatientInsuranceGrid);
        this._PatientDemographicsGridConfigration = this.initializeGridConfiguration(this._PatientDemographicsGrid);
        this._PatientDemographicsHistoryGridGridConfigration = this.initializeGridConfiguration(this._PatientDemographicsHistoryGrid);
        this._PatientInsuranceHistoryGridGridConfigration = this.initializeGridConfiguration(this._PatientInsuranceHistoryGrid);
        this.showInitialDefaultMessage();


    },
    setFilter: function (gridParam) {
        let selFacilityVal = $('#facilitySearch').attr('data-selected-id');
        if ($('#inpOrderClient').val() == '') {
            _$modxAppCore.showErrorMessage(`Please select a client to perform a search.`, 'error', 'selFileterMsg');
            gridParam.query = 'error'
            return gridParam;
        }
        if (selFacilityVal == '' || selFacilityVal == undefined) {
            _$modxAppCore.showErrorMessage(`Please select a facility to perform a search.`, 'error', 'selFileterMsg');
            gridParam.query = 'error'
            return gridParam;

        }
        _$modxAppCore.showErrorMessage(``, 'error', 'selFileterMsg');
        var searhcColumn = $('#selSearch').val();
        var serachValue = $('#inpSearch').val().trim();
        gridParam.queryType = 'ClientID|FacilityID|' + searhcColumn;
        gridParam.query = $('#inpOrderClient').val() + '|' + selFacilityVal + '|' + serachValue;

        return gridParam;
    },


    showInitialDefaultMessage: function () {
        const html = `
        <div class="mngFaclit-empty-state text-center p-5  ">
            <i class="fa-solid fa-hospital-user text-muted mb-4 mngFaclit-empty-icon" style="font-size: 2rem;"></i>
            <p class="lead mb-0">
                Please select a client and its facility to view patient details.
            </p>
        </div>
    `;

        $('#PatientDetailsGrid').html(html).removeClass('d-none');
    },

    showNoPatientMessage: function () {
        const html = `
        <div class="mngFaclit-empty-state text-center p-5">
            <i class="fa-solid fa-user text-muted mb-4 mngFaclit-empty-icon"></i>
            <p class="lead">
                <strong>No patient available for the selected facility</strong>.<a href="#" id="lnkAddFacility" data-ev="EV_AddPatient" class="mngFaclit-cta-link">
                    <i class="fas fa-plus-circle me-1" data-ev="EV_AddPatient" ></i>Click here to add patient
                </a>
            </p>
           
        </div>
    `;

        $('#PatientDetailsGrid').html(html).removeClass('d-none');

    },

    initilizeGridsonPage: function () {
        // Utility function to create and configure a QCGrid
        const createQCGrid = (config) => {
            const grid = new QCGrid();
            grid.width = config.width || '100%';
            grid.height = config.height || 'calc(40vh)';
            grid.id = config.id;
            grid.containerID = config.containerID;
            grid.class = config.class || 'table table-bordered table-striped table-hover gridLayoutFix';
            return grid;
        };
        // Grid configuration
        const gridConfigs = [
            { containerID: 'PatientDetailsGrid', id: 'tblPatientDetailsGrid', height: '300px' },
            { containerID: 'PatientProceduresGrid', id: 'tblPatientProceduresGrid', height: '235px' },
            { containerID: 'PatientDiagnosisGrid', id: 'tblPatientDiagnosisGrid', height: '235px' },
            { containerID: 'PatientInsuranceGrid', id: 'tblPatientInsuranceGrid', height: '235px' },
            { containerID: 'PatientDemographicsGrid', id: 'tblPatientDemographicsGrid', height: '235px' },
            { containerID: 'PatientDemographicsHistoryGrid', id: 'tblPatientDemographicsHistoryGrid', height: '225px' },
            { containerID: 'PatientInsuranceHistoryGrid', id: 'tblPatientInsuranceHistoryGrid', height: '235px' },

        ];

        // Create grids dynamically
        gridConfigs.forEach(config => {
            const gridName = `_${config.containerID}`;
            this[gridName] = createQCGrid(config);
        });

    },
    initializeGridConfiguration: function (gridInstance) {
        const config = new QCGridConfigration(gridInstance);
        var url = '../../../apix/CAYRGridConfiguration/';
        config.gridAPI = url + 'GetGridColModel';
        config.gridSaveAPI = url + 'SaveGridColModal';
        config.gridResetAPI = url + 'ResetGridColModal';
        return config;
    },

    showFacilityDefaultMessage: function (id) {
        const html = `
             <div class="mngFaclit-empty-state text-center p-5">
                <i class="fa-solid fa-clipboard-list text-muted mb-4 mngFaclit-empty-icon"></i>
                <p class="lead">
               There are no records to display in this section.
                </p>
            </div>
    `;

        $('#' + id).html(html).removeClass('d-none');

    },
    //This fucntion fetch all the service from service master
    GetAllPatientDetails: async function (gridParam) {
        _$modxAppProgressBar.show();
        var meta = {}
        if (gridParam.query == null) {
            _$modxAppProgressBar.hide();
            return;
        }
        this.setFilter(gridParam);
        if (gridParam.query == 'error') {
            _$modxAppProgressBar.hide();
            return;
        }
        meta.QCGridParam = gridParam;
        meta.GridName = 'PatientDetailsGrid'
        var functionName = "GetPatientDetailsData";
        var url = _GlobalPatientDetails.url + functionName;
        var qcGrid = await __PromisAsyncPostBack(meta, url);
        if (qcGrid.success == false) {
            _$modxAppProgressBar.hide();
            _$modxAppCore.alert("Could not get PatientDetails data", 'Error');
            return false;
        }
        if (qcGrid.data.length == 0) {
            $('#' + PatientDetails._PatientDetailsGrid.containerID).html('')
            PatientDetails.clearPatientSectionGrids();
            PatientDetails.resetServDetailCtle();
            /* $('#btnFacilityService').addClass('d-none')*/
            $('#patient-history-tab').addClass('d-none')
            $('#patient-tab').addClass('d-none')
            PatientDetails.resetGlobalPatientDetails();
            PatientDetails.showNoPatientMessage();
            _$modxAppProgressBar.hide();
            return;
        }
        $('#btnFacilityService').removeClass('d-none')
        Core.showNoGridDataMessage(this._PatientDetailsGrid.containerID, '');
        //code to plot the grid
        var grid = PatientDetails._PatientDetailsGrid;
        grid.gridData = qcGrid;
        if (PatientDetails._PatientDetailsRecCount != qcGrid.param.totalRecords) {
            grid.clearBind();
        }
        grid.bind();
        PatientDetails._PatientDetailsRecCount = qcGrid.param.totalRecords;
        _$modxAppProgressBar.hide();
        grid.onSubmit = function (gridParam) {
            PatientDetails.GetAllPatientDetails(gridParam);
        }

        grid.onRowDblClick = function (rowNum, colNum, row, colModel) {
            //Hide all the grid 
            PatientDetails.clearPatientSectionGrids();
            PatientDetails.resetServDetailCtle();
            $('#PatientSubmitMsg').addClass('d-none')
            $('.bold-link').removeClass('bold-link');
            $('.btnPatientFormNavigation').removeClass('d-none');
            $('#patient-history-tab').addClass('d-none')
            $('#patient-tab').addClass('d-none')
            PatientDetails.resetGlobalPatientDetails();
            _GlobalPatientDetails.selPatientDetailID = row.PatientDetailID;
            PatientDetails.GetPatientDemographics(Core.gridDefault, 'Edit');
            PatientDetails.GetPatientInsurance(Core.gridDefault, 'Edit');
            $('#divPatientDemographics').removeClass('d-none')
            $('#tblPatientDetailsGrid .table-primary').removeClass('table-primary');
            $('#tblPatientDetailsGrid .tr-select').addClass('table-primary');



        }
    },
    clearPatientSectionGrids: function () {
        var gridIds = [
            "PatientDemographicsGrid",
            "PatientProceduresGrid",
            "PatientDiagnosisGrid",
            "PatientInsuranceGrid",
            "PatientDemographicsHistoryGrid",
            "PatientInsuranceHistoryGrid"
        ];
        gridIds.forEach(function (id) {
            $("#" + id).html('');
        });
    },
    GetAllPatientProcedures: async function (gridParam) {
        _$modxAppProgressBar.show();
        var meta = {}
        if (gridParam.query == null) {
            return;
        }
        gridParam.query = _GlobalPatientDetails.selPatientDetailID;
        meta.QCGridParam = gridParam;
        meta.GridName = 'PatientProceduresGrid'
        var functionName = "GetAllPatientProcedures";
        var url = _GlobalPatientDetails.url + functionName;
        var qcGrid = await __PromisAsyncPostBack(meta, url);
        if (qcGrid.success == false) {
            _$modxAppProgressBar.hide();
            _$modxAppCore.alert("Could not get PatientDetails data", 'Error');
            return false;
        }
        if (qcGrid.data.length == 0) {
            $('#' + PatientDetails._PatientProceduresGrid.containerID).html('')
            this.showFacilityDefaultMessage(PatientDetails._PatientProceduresGrid.containerID);
            _$modxAppProgressBar.hide();
            return;
        }

        Core.showNoGridDataMessage(this._PatientProceduresGrid.containerID, '');
        //code to plot the grid
        var grid = PatientDetails._PatientProceduresGrid;
        grid.gridData = qcGrid;
        if (PatientDetails._PatientProcedures != qcGrid.param.totalRecords) {
            grid.clearBind();
        }
        grid.bind();
        PatientDetails._PatientProcedures = qcGrid.param.totalRecords;
        _$modxAppProgressBar.hide();
        grid.onSubmit = function (gridParam) {
            PatientDetails.GetAllPatientProcedures(gridParam);
        }

        grid.onRowDblClick = function (rowNum, colNum, row, colModel) {

        }
    },
    GetPatientDiagnosis: async function (gridParam) {
        _$modxAppProgressBar.show();
        var meta = {}
        if (gridParam.query == null) {
            return;
        }
        gridParam.query = _GlobalPatientDetails.selPatientDetailID;
        meta.QCGridParam = gridParam;
        meta.GridName = 'PatientDiagnosisGrid'
        var functionName = "GetPatientDiagnosis";
        var url = _GlobalPatientDetails.url + functionName;
        var qcGrid = await __PromisAsyncPostBack(meta, url);
        if (qcGrid.success == false) {
            _$modxAppProgressBar.hide();
            _$modxAppCore.alert("Could not get PatientDetails data", 'Error');
            return false;
        }
        if (qcGrid.data.length == 0) {
            $('#' + PatientDetails._PatientDiagnosisGrid.containerID).html('')
            this.showFacilityDefaultMessage(PatientDetails._PatientDiagnosisGrid.containerID);
            _$modxAppProgressBar.hide();
            return;
        }

        Core.showNoGridDataMessage(this._PatientDiagnosisGrid.containerID, '');
        //code to plot the grid
        var grid = PatientDetails._PatientDiagnosisGrid;
        grid.gridData = qcGrid;
        if (PatientDetails._PatientDiagnosis != qcGrid.param.totalRecords) {
            grid.clearBind();
        }
        grid.bind();
        PatientDetails._PatientDiagnosis = qcGrid.param.totalRecords;
        _$modxAppProgressBar.hide();
        grid.onSubmit = function (gridParam) {
            PatientDetails.GetPatientDiagnosis(gridParam);
        }

        grid.onRowDblClick = function (rowNum, colNum, row, colModel) {

        }
    },
    GetPatientInsurance: async function (gridParam, type) {
        _$modxAppProgressBar.show();
        var meta = {}
        if (gridParam.query == null) {
            return;
        }
        gridParam.query = _GlobalPatientDetails.selPatientDetailID;
        meta.QCGridParam = gridParam;
        meta.GridName = 'PatientInsuranceGrid'
        var functionName = "GetPatientInsurance";
        var url = _GlobalPatientDetails.url + functionName;
        var qcGrid = await __PromisAsyncPostBack(meta, url);
        if (qcGrid.success == false) {
            _$modxAppProgressBar.hide();
            _$modxAppCore.alert("Could not get PatientDetails data", 'Error');
            return false;
        }
        if (type == 'Edit') {
            //set edit from value
            if (qcGrid?.data && qcGrid.data.length > 0) {
                const row = qcGrid.data[0];

                // -------------------------------
                // Normalize EligibilityStatus
                // -------------------------------
                row.EligibilityStatus = (row.EligibilityStatus === 'Active' || row.EligibilityStatus === 1) ? 1 : 0;

                // -------------------------------
                // Handle "Direct Bill To Patient"
                // -------------------------------
                const $chkDirectBill = $('[data-ev="Ev_CheckedDirectBillToMemb"]');

                if (row.InsuranceType === 'DirectBillToPatient') {
                    // Clear the InsuranceType value and check the box
                    row.InsuranceType = '';
                    $chkDirectBill.prop('checked', true);
                    this.togglePatientInsuranceFields(true);

                } else {
                    // Uncheck the box and enable all fields
                    $chkDirectBill.prop('checked', false);
                    this.togglePatientInsuranceFields(false);

                }
            } else {
                this.togglePatientInsuranceFields(false);
            }
           
            _$modxAppCore.putAppCoreModel('PatientInsuranceMeta', qcGrid.data[0]);
            _$modxAppProgressBar.hide();
            return;
        }
        if (qcGrid.data.length == 0) {
            $('#' + PatientDetails._PatientInsuranceGrid.containerID).html('')
            this.showFacilityDefaultMessage(PatientDetails._PatientInsuranceGrid.containerID);
            _$modxAppProgressBar.hide();
            return;
        }
        Core.showNoGridDataMessage(this._PatientInsuranceGrid.containerID, '');
        //code to plot the grid
        var grid = PatientDetails._PatientInsuranceGrid;
        grid.gridData = qcGrid;
        if (PatientDetails._PatientInsurance != qcGrid.param.totalRecords) {
            grid.clearBind();
        }
        grid.bind();
        PatientDetails._PatientInsurance = qcGrid.param.totalRecords;
        _$modxAppProgressBar.hide();
        grid.onSubmit = function (gridParam) {
            PatientDetails.GetPatientInsurance(gridParam, 'New');
        }

        grid.onRowDblClick = function (rowNum, colNum, row, colModel) {
            $('#PatientDemographicsHistoryGrid').html('')
            _GlobalPatientDetails.selPatientInsuranceID = row.PatientInsuranceID;
            $('#tblPatientInsuranceGrid .table-primary').removeClass('table-primary');
            $('#tblPatientInsuranceGrid .tr-select').addClass('table-primary');
            $('#patient-history-tab').removeClass('d-none')
            $('#nav-demographics-history-tab').addClass('d-none')
            $('#nav-insurance-history-tab').removeClass('d-none')
            $('#nav-insurance-history-tab')[0].click();

        }
    },
    GetPatientDemographics: async function (gridParam, type) {
        _$modxAppProgressBar.show();
        var meta = {}
        if (gridParam.query == null) {
            return;
        }
        gridParam.query = _GlobalPatientDetails.selPatientDetailID;
        meta.QCGridParam = gridParam;
        meta.GridName = 'PatientDemographicsGrid'
        var functionName = "GetPatientDemographics";
        var url = _GlobalPatientDetails.url + functionName;
        var qcGrid = await __PromisAsyncPostBack(meta, url);
        if (qcGrid.success == false) {
            _$modxAppProgressBar.hide();
            _$modxAppCore.alert("Could not get PatientDetails data", 'Error');
            return false;
        }
        if (type == 'Edit') {
            //set edit from value
            _$modxAppCore.putAppCoreModel('PatientDemographicsMeta', qcGrid.data[0]);
            _$modxAppProgressBar.hide();
            return
        }
        if (qcGrid.data.length == 0) {
            $('#' + PatientDetails._PatientDemographicsGrid.containerID).html('')
            this.showFacilityDefaultMessage(PatientDetails._PatientDemographicsGrid.containerID);
            _$modxAppProgressBar.hide();
            return;
        }



        Core.showNoGridDataMessage(this._PatientDemographicsGrid.containerID, '');
        //code to plot the grid
        var grid = PatientDetails._PatientDemographicsGrid;
        grid.gridData = qcGrid;
        if (PatientDetails._PatientDemographics != qcGrid.param.totalRecords) {
            grid.clearBind();
        }
        grid.bind();
        PatientDetails._PatientDemographics = qcGrid.param.totalRecords;
        _$modxAppProgressBar.hide();
        grid.onSubmit = function (gridParam) {
            PatientDetails.GetPatientDemographics(gridParam);
        }

        grid.onRowDblClick = function (rowNum, colNum, row, colModel) {
            $('#PatientInsuranceHistoryGrid').html('')
            _GlobalPatientDetails.selPatientDemographicsID = row.PatientDemographicsID;
            $('#tblPatientDemographicsGrid .table-primary').removeClass('table-primary');
            $('#tblPatientDemographicsGrid .tr-select').addClass('table-primary');
            $('#patient-history-tab').removeClass('d-none')
            $('#nav-insurance-history-tab').addClass('d-none')
            $('#nav-demographics-history-tab').removeClass('d-none')
            $('#nav-demographics-history-tab')[0].click();

        }
    },
    GetPatientDemographicsHistory: async function (gridParam) {
        _$modxAppProgressBar.show();
        var meta = {}
        if (gridParam.query == null) {
            return;
        }
        gridParam.query = _GlobalPatientDetails.selPatientDemographicsID
        meta.QCGridParam = gridParam;
        meta.GridName = 'PatientDemographicsHistoryGrid'
        var functionName = "GetPatientDemographicsHistory";
        var url = _GlobalPatientDetails.url + functionName;
        var qcGrid = await __PromisAsyncPostBack(meta, url);
        if (qcGrid.success == false) {
            _$modxAppProgressBar.hide();
            _$modxAppCore.alert("Could not get patient demographics history data", 'Error');
            return false;
        }
        if (qcGrid.data.length == 0) {
            $('#' + PatientDetails._PatientDemographicsHistoryGrid.containerID).html('')
            this.showFacilityDefaultMessage(PatientDetails._PatientDemographicsHistoryGrid.containerID);
            _$modxAppProgressBar.hide();
            return;
        }

        Core.showNoGridDataMessage(this._PatientDemographicsHistoryGrid.containerID, '');
        //code to plot the grid
        var grid = PatientDetails._PatientDemographicsHistoryGrid;
        grid.gridData = qcGrid;
        if (PatientDetails._PatientDemographicsHistory != qcGrid.param.totalRecords) {
            grid.clearBind();
        }
        grid.bind();
        PatientDetails._PatientDemographicsHistory = qcGrid.param.totalRecords;
        _$modxAppProgressBar.hide();
        grid.onSubmit = function (gridParam) {
            PatientDetails.GetPatientDemographicsHistory(gridParam);
        }

        grid.onRowDblClick = function (rowNum, colNum, row, colModel) {

        }
    },

    GetPatientInsuranceHistory: async function (gridParam) {
        _$modxAppProgressBar.show();
        var meta = {}
        if (gridParam.query == null) {
            return;
        }
        gridParam.query = _GlobalPatientDetails.selPatientInsuranceID
        meta.QCGridParam = gridParam;
        meta.GridName = 'PatientInsuranceHistoryGrid'
        var functionName = "GetPatientInsuranceHistory";
        var url = _GlobalPatientDetails.url + functionName;
        var qcGrid = await __PromisAsyncPostBack(meta, url);
        if (qcGrid.success == false) {
            _$modxAppProgressBar.hide();
            _$modxAppCore.alert("Could not get patient insurance history data", 'Error');
            return false;
        }
        if (qcGrid.data.length == 0) {
            $('#' + PatientDetails._PatientInsuranceHistoryGrid.containerID).html('')
            this.showFacilityDefaultMessage(PatientDetails._PatientInsuranceHistoryGrid.containerID);
            _$modxAppProgressBar.hide();
            return;
        }
        $('#' + PatientDetails._PatientInsuranceHistoryGrid.containerID).html('')
        //code to plot the grid
        var grid = PatientDetails._PatientInsuranceHistoryGrid;
        grid.gridData = qcGrid;
        if (PatientDetails._PatientInsuranceHistory != qcGrid.param.totalRecords) {
            grid.clearBind();
        }
        grid.bind();
        PatientDetails._PatientInsuranceHistory = qcGrid.param.totalRecords;
        _$modxAppProgressBar.hide();
        grid.onSubmit = function (gridParam) {
            PatientDetails.GetPatientInsuranceHistory(gridParam);
        }

        grid.onRowDblClick = function (rowNum, colNum, row, colModel) {

        }
    },

    resetGlobalPatientDetails: function () {
        _GlobalPatientDetails.selPatientDetailID = '';
        _GlobalPatientDetails.selPatientDemographicsID = '';
        _GlobalPatientDetails.selPatientInsuranceID = '';
    },
    resetServDetailCtle: function () {
        _$modxAppCore.putAppCoreModel('PatientDemographicsMeta', '');
        _$modxAppCore.putAppCoreModel('PatientInsuranceMeta', '');
        $('[data-ev="Ev_CheckedDirectBillToMemb"]').prop('checked', false);
        $('.btnPatientFormNavigation').addClass('d-none');
        $('#btnDeleteSrvDet').hide();
        $('.table-primary').removeClass('table-primary');
        _$modxAppCore.showErrorMessage('', 'success', 'divValidateMsgDemo');
        _$modxAppCore.showErrorMessage('', 'success', 'divValidatePatiIns');
        _$modxAppCore.putAppCoreModel('PatientDemographicsMeta', '');
        _$modxAppCore.putAppCoreModel('PatientInsuranceMeta', '');

    },
    resetPatientDemographics: function () {
        $('#btnDelPatDemo').hide();
        $('#divPatientInsurance').addClass('d-none')
        _$modxAppCore.showErrorMessage('', 'success', 'divValidateMsgDemoIns');
        _$modxAppCore.putAppCoreModel('PatientDemographicsMeta', '');
    },
    resetPatientInsurance: function () {
        $('#btnDelPatDemo').hide();
        $('#divPatientDemographics').addClass('d-none')
        _$modxAppCore.showErrorMessage('', 'success', 'divValidateMsgDemoDemo');
        _$modxAppCore.putAppCoreModel('PatientInsuranceMeta', '');
    },

    SavePatientDetails: async function () {
        var meta = _$modxAppCore.getAppCoreModel('PatientDemographicsMeta');
        var requiredFields = ['PatientFirstName', 'PatientLastName', 'PatientDOB', 'PatientSSN', 'PatientGender', 'PatientPhoneNumber', 'PatientEmail', 'PatientAddress1', 'PatientCity', 'PatientState', 'PatientZip'];
        var validation = Core.validateInputs(requiredFields, meta);

        if (validation.isValid == false) {
            _$modxAppCore.showErrorMessage(`${validation.error}`, 'error', 'divValidateMsgDemo');
            $('#inp' + validation['missingField']).focus();
            return;
        }
        var len = 12;
        var isValid = Core.checkInputValues(meta.PatientPhoneNumber, len);
        if (isValid == 0) {
            _$modxAppCore.showErrorMessage(`PhoneNumber has to consist of exactly 10 digits`, 'error', 'divValidateMsgDemo');
            $('#inpPatientPhoneNumber').focus();
            return;
        }
        if (_$AppValidatte.validateEmail(meta.PatientEmail) == false) {
            _$modxAppCore.showErrorMessage(`Please enter valid ContactEmail`, 'error', 'divValidateMsgDemo');
            $('#inpContactEmail').focus();
            return;
        }

        var len = 5;
        if (meta.PatientZip.length < 5) {
            var isValid = Core.checkInputValues(meta.PatientZip, len);
            if (isValid == 0) {
                _$modxAppCore.showErrorMessage(`Zip Code has to consist of minimum 5 digits`, 'error', 'divValidateMsgDemo');
                $('#inpPatientZip').focus();
                return;
            }
        }
        //const isChecked = document.querySelector('[data-ev="Ev_CheckedDirectBillToMemb"]');
        //if (isChecked) {
        //    _$modxAppCore.putAppCoreModel('PatientInsuranceMeta', '');
        //    meta.InsuranceType = 'DirectBillToPatient'
        //}  
        _$modxAppCore.showErrorMessage('', 'success', 'divValidateMsgDemo');

        _$modxAppProgressBar.show();
        meta.ClientID = $('#inpOrderClient').val();
        meta.FacilityID = $('#facilitySearch').attr('data-selected-id');
        var functionName = "SavePatientDetails";
        var url = _GlobalPatientDetails.url + functionName;
        var ajaxOut = await __PromisAsyncPostBack(meta, url);
        if (ajaxOut.Success == false) {
            _$modxAppCore.showErrorMessage(ajaxOut.Message, 'error', 'divValidateMsgDemo')
            _$modxAppProgressBar.hide();
            return;
        }

        if (ajaxOut.Success) {
            _$modxAppProgressBar.hide();
            _$modxAppCore.showErrorMessage(ajaxOut.Message, 'success', 'divValidateMsgDemo')
            this.togglePatientSections('divPatientInsurance')
            $('#PatientDetailID').val(ajaxOut.CommandArgs);
            Core.gridDefault.query = $('#inpOrderClient').val();
            this.GetAllPatientDetails(Core.gridDefault)
        }
    },
    SavePatientInsurance: async function () {
        var meta = _$modxAppCore.getAppCoreModel('PatientInsuranceMeta');
        const isChecked = document.getElementById("chkDirectBill").checked;
        if (isChecked) {
            _$modxAppCore.putAppCoreModel('PatientInsuranceMeta', '');
            meta.InsuranceType = 'DirectBillToPatient'
        } else {
            const requiredFields = [
                "InsurancePriority",
                "PlanType",
                "InsurancePlanID",
                "InsurancePlanName",
                "PolicyNumber",
                /* "MEDICARENO",*/
                "MedicareCarrier",
                "MBI",
                // "PatientID",
                //"MemberId",
                //"SubscriberId",
                "MemberRelationship",
                "EligibilityStatus",
                "EligibilityStartDate",
                "EligibilityEndDate",
                "GroupNumber",
                "GroupName",
                //"InsuredGroupEmpId",
                //"GroupEmpName",
                /* "InsuranceCompanyId",*/
                "InsuranceCompanyName",
                "InsuranceCoPhoneNumber",
                //"InsuranceCompanyAddress1",
                //"InsuranceCompanyCity",
                //"InsuranceCompanyState",
                //"InsuranceCompanyZip",
                "PrimaryInsuredFName",
                "PrimaryInsuredLName",
                "PrimaryInsuredRelationship",
                "PrimaryInsuredDOB",
                "PrimaryInsuredStreetAddress1",
                "PrimaryInsuredAddressCity",
                "PrimaryInsuredAddressState",
                "PrimaryInsuredAddressZip"

            ];

            var validation = Core.validateInputs(requiredFields, meta);

            if (validation.isValid == false) {
                _$modxAppCore.showErrorMessage(`${validation.error}`, 'error', 'divValidatePatiIns');
                $('#inp' + validation['missingField']).focus();
                return;
            }
            var len = 12;
            var isValid = Core.checkInputValues(meta.InsuranceCoPhoneNumber, len);
            if (isValid == 0) {
                _$modxAppCore.showErrorMessage(`CoPhoneNumber   has to consist of exactly 10 digits`, 'error', 'divValidatePatiIns');
                $('#inpInsuranceCoPhoneNumber').focus();
                return;
            }
            var len = 5;
            if (meta.PrimaryInsuredAddressZip.length < 5) {
                var isValid = Core.checkInputValues(meta.PrimaryInsuredAddressZip, len);
                if (isValid == 0) {
                    _$modxAppCore.showErrorMessage(`Zip Code has to consist of minimum 5 digits`, 'error', 'divValidatePatiIns');
                    $('#inpPrimaryInsuredAddressZip').focus();
                    return;
                }
            }
            _$modxAppCore.showErrorMessage('', 'success', 'divValidatePatiIns');
        }  
        
        meta.PatientDetailID = _GlobalPatientDetails.selPatientDetailID;
        _$modxAppProgressBar.show();
        meta.PatientDetailID = $('#PatientDetailID').val();
        var functionName = "SavePatientInsurance";
        var url = _GlobalPatientDetails.url + functionName;
        var ajaxOut = await __PromisAsyncPostBack(meta, url);
        if (ajaxOut.Success == false) {
            _$modxAppCore.showErrorMessage(ajaxOut.Message, 'error', 'divValidatePatiIns')
            _$modxAppProgressBar.hide();
            return;
        }

        if (ajaxOut.Success) {
            _$modxAppProgressBar.hide();
            _$modxAppCore.showErrorMessage(ajaxOut.Message, 'success', 'divValidatePatiIns')
            this.togglePatientSections("PatientSubmitMsg")
            $('#PatientDetailID').val(ajaxOut.ResultData);

        }
    },
    togglePatientSections: function (showId = "", type) {

        const ids = [
            "divPatientAddDiv",
            "divPatientDemographics",
            "divPatientInsurance",
            "PatientSubmitMsg",
        ];
        ids.forEach(id => {
            const el = document.getElementById(id);
            if (el) {
                if (id === showId) {
                    el.classList.remove("d-none");
                } else {
                    el.classList.add("d-none");
                }
            }
        });
        if ($('#PatientInsuranceID').val() == '') {
            const $chkDirectBill = $('[data-ev="Ev_CheckedDirectBillToMemb"]');
            $chkDirectBill.prop('checked', false);
            this.togglePatientInsuranceFields(false);
        }
    },
 
    GetFacilityBySearch: async function (searchText, page = 1) {

        const meta = {
            Name: searchText,
            ClientID: $('#inpOrderClient').val(),
            Page: page
        };

        const url = '../../../apix/ManagePhysician/GetAllFacility';

        try {
            facilityDropdown.showLoader();

            const data = await __PromisAsyncPostBack(meta, url);
            facilityDropdown.renderList(data || []);

            return data || [];
        } catch (e) {
            console.error("GetFacilityBySearch error:", e);
            facilityDropdown.renderList([]);
            return [];
        }
    },

    bindFacilitySearchDropDown: function (inputId, dropdownId) {

        const input = document.getElementById(inputId);
        const dropdown = document.getElementById(dropdownId);
        const loader = document.getElementById("facilityLoader");

        function showLoader() {
            loader.classList.remove("d-none");
        }

        function hideLoader() {
            loader.classList.add("d-none");
        }

        function renderList(list) {

            dropdown.querySelectorAll(
                "li:not(#facilityLoader):not(.facility-inner-search)"
            ).forEach(li => li.remove());

            if (!list || list.length === 0) {
                const noLi = document.createElement("li");
                noLi.className = "list-group-item text-muted";
                noLi.textContent = "No results found";
                dropdown.appendChild(noLi);
                hideLoader();
                return;
            }

            list.forEach(item => {
                const li = document.createElement("li");
                li.className = "list-group-item list-group-item-action";
                li.title = item.Name;

                const span = document.createElement("span");
                span.className = "facility-item-text";
                span.textContent = item.Name;

                li.appendChild(span);
                li.dataset.value = item.FacilityID;

                li.addEventListener("click", function () {
                    input.value = item.Name;
                    input.dataset.selectedId = item.FacilityID;
                    dropdown.classList.add("d-none");
                });

                dropdown.appendChild(li);
            });

            hideLoader();
        }

        return {
            showLoader,
            hideLoader,
            renderList
        };
    },

    InsuredInofSameAsPatient: function () {
        let PatientMeta = _$modxAppCore.getAppCoreModel('PatientDemographicsMeta');
        const isChecked = document.getElementById("chkDirectBill").checked;
        if (isChecked) {
            
        } else {
            if ($("#chkSameAsPatient").is(":checked") && PatientMeta) {
                let meta = {
                    "PrimaryInsuredFName": PatientMeta.PatientFirstName,
                    "PrimaryInsuredMName": PatientMeta.PatientMiddle,
                    "PrimaryInsuredLName": PatientMeta.PatientLastName,
                    "PrimaryInsuredRelationship": "Self",
                    "PrimaryInsuredDOB": PatientMeta.PatientDOB,
                    "PrimaryInsuredStreetAddress1": PatientMeta.PatientAddress1,
                    "PrimaryInsuredStreetAddress2": PatientMeta.PatientAddress2,
                    "PrimaryInsuredAddressCity": PatientMeta.PatientCity,
                    "PrimaryInsuredAddressState": PatientMeta.PatientState,
                    "PrimaryInsuredAddressZip": PatientMeta.PatientZip
                };

                // disable 
                //Object.keys(meta).forEach(function (key) {
                //    let elementId = "#inp" + key;
                //    $(elementId).val(meta[key]).prop("disabled", true);
                //});

                _$modxAppCore.putAppCoreModel('PrimaryInsuredMeta', meta);

            } else {
                // enable fields again
                let PrimaryInsuredFields = [
                    "PrimaryInsuredFName",
                    "PrimaryInsuredMName",
                    "PrimaryInsuredLName",
                    "PrimaryInsuredRelationship",
                    "PrimaryInsuredDOB",
                    "PrimaryInsuredStreetAddress1",
                    "PrimaryInsuredStreetAddress2",
                    "PrimaryInsuredAddressCity",
                    "PrimaryInsuredAddressState",
                    "PrimaryInsuredAddressZip"
                ];

                PrimaryInsuredFields.forEach(function (key) {
                    let elementId = "#inp" + key;
                    $(elementId).val("").prop("disabled", false);
                });

                _$modxAppCore.putAppCoreModel('PrimaryInsuredMeta', '');
            }
        }
        
    },
    /**
 * Enable or disable all input/select/textarea fields inside #divPatientInsurance,
 * except checkboxes (they remain clickable).
 *
 * @param {boolean} disable - true to disable, false to enable
 */
    togglePatientInsuranceFields: function (disable) {
        const container = document.getElementById("divPatientInsurance");
        if (!container) return;

        // Select all input, select, textarea elements
        const fields = container.querySelectorAll("input, select, textarea");

        fields.forEach(el => {
            // Leave checkboxes active (not disabled)
            if (el.type === "checkbox") return;

            // Toggle disable based on flag
            el.disabled = disable;
        });

 
    },

    handleEvent: function (ev) {
        var target = ev.target;
        var evCase = target.getAttribute('data-ev');

        switch (evCase) {
            case 'Ev_showProcedure':
                $('#ShowPatientDemoForm').addClass('d-none')
                $('#ShowPatientInsForm').addClass('d-none')
                $('#patient-history-tab').addClass('d-none')
                this.GetAllPatientProcedures(Core.gridDefault);
                break;

            case 'Ev_showDiagnosis':
                $('#ShowPatientDemoForm').addClass('d-none')
                $('#ShowPatientInsForm').addClass('d-none')
                $('#patient-history-tab').addClass('d-none')
                this.GetPatientDiagnosis(Core.gridDefault);
                break;

            case 'Ev_showPatientInsurance':
                $('#patient-history-tab').addClass('d-none')
                this.GetPatientInsurance(Core.gridDefault, 'New');
                break;

            case 'Ev_showDemographics':
                $('#patient-history-tab').addClass('d-none')
                this.GetPatientDemographics(Core.gridDefault);
                break;
            case 'Ev_showDemographicsHistory':
                this.GetPatientDemographicsHistory(Core.gridDefault);
                break;

            case 'Ev_showPatientInsuranceHistory':
                this.GetPatientInsuranceHistory(Core.gridDefault)
                break;

            case 'EV_AddPatient':
                this.resetServDetailCtle();
                $('#divPatientDemographics').removeClass('d-none')
                break;
            case 'EV_ClosePatientDetail':
                $('#divPatientAddDiv').addClass('d-none')
                break;
            case 'EV_ShowPatientDemographics':
                this.resetPatientDemographics();
                $('#divPatientDemographics').removeClass('d-none')
                break;
            case 'EV_ClosePatientDemographics':
                $('#divPatientDemographics').addClass('d-none')
                break;
            case 'EV_AddPatientInsurance':
                this.resetPatientInsurance();
                $('#divPatientInsurance').removeClass('d-none')
                break;
            case 'EV_ClosePatientInsuracne':
                $('#divPatientDemographics').addClass('d-none')
                $('#divPatientInsurance').addClass('d-none')
                break;
            case 'EV_Save_PatientDetails':
                this.SavePatientDetails();
                break;
            case 'EV_Save_PatientInsurance':
                this.SavePatientInsurance();
                break;
            case 'EV_Save_PatientDemographics':
                this.SavePatientDetails();

                break;

            case 'EV_ClosePatientSucessMsg':
                $('#PatientSubmitMsg').addClass('d-none')
                break;

            case 'EV_ShowPatientInsuranceform':
                _$modxAppCore.showErrorMessage('', 'success', 'divValidatePatiIns');
                this.togglePatientSections('divPatientInsurance')
                break;
            case 'EV_ShowPatientDemographicsform':
                _$modxAppCore.showErrorMessage('', 'success', 'divValidateMsgDemo');
                this.togglePatientSections('divPatientDemographics')
                break;
            case 'EV_ViewPaitientDetails':
                $('#PatientSubmitMsg').addClass('d-none')
                $('.bold-link').removeClass('bold-link');
                ev.target.classList.add('bold-link');
                this.resetPatientDemographics()
                this.resetPatientInsurance();
                $('.table-primary').removeClass('table-primary');
                _GlobalPatientDetails.selPatientDetailID = ev.target.getAttribute('data-id')
                $('.btnPatientFormNavigation').removeClass('d-none');
                $('#patient-history-tab').addClass('d-none')
                $('#patient-tab').removeClass('d-none')
                $('#nav-demographics-tab')[0].click();
                break;
            case 'Ev_SameAsPatient':
                this.InsuredInofSameAsPatient();
                break;
            case 'EV_Search':
                PatientDetails.GetAllPatientDetails(Core.gridDefault);
                break;
            case 'EV_SelSearch':
                if (ev.type == 'change') {
                    var v = $('#selSearch').val();
                    if (v == '') {
                        $('#inpSearch').val('');
                    }
                }
                break;
            case 'Ev_AddAontherPatient':
                _GlobalPatientDetails.selPatientDetailID = 0
                $('#tblPatientDetailsGrid .table-primary').removeClass('table-primary');
                _$modxAppCore.showErrorMessage('', 'success', 'divValidateMsgDemoIns');
                _$modxAppCore.putAppCoreModel('PatientDemographicsMeta', '');
                break;
            case 'Ev_CheckedDirectBillToMemb':
                const isChecked = ev.target.checked;
                if (isChecked) {
                    this.togglePatientInsuranceFields(true);
                } else {
                    this.togglePatientInsuranceFields(false);
                }
                break;
        }
    }
}
function renderFacilityResults(data) {
    const dropdown = document.getElementById("physicianDropdown");

    FacilityNPISearch.hideLoader();

    dropdown.querySelectorAll(".facility-item").forEach(el => el.remove());

    if (!data || data.length === 0) {
        dropdown.insertAdjacentHTML(
            "beforeend",
            `<li class="list-group-item text-muted facility-item">
                No facilities found
            </li>`
        );
        return;
    }

    data.forEach(item => {
        dropdown.insertAdjacentHTML(
            "beforeend",
            `<li class="list-group-item facility-item"
                 data-npi="${item.NPI}">
                 <strong>${item.FacilityName}</strong><br>
                 <small class="text-muted">NPI: ${item.NPI}</small>
             </li>`
        );
    });
}
let facilityDropdown = null;
/* --------------------------------------------
   Facility Search Controller
-------------------------------------------- */
const OrderfacilityNPISearch = (() => {

    let debounceTimer = null;
    const DEBOUNCE_DELAY = 300;

    let dropdownEl;
    let innerSearchEl;
    let clearBtn;

    function init() {
        dropdownEl = document.getElementById("facilityDropdown");
        innerSearchEl = document.getElementById("facilityInnerSearch");
        clearBtn = document.getElementById("clearFacilitySearch");

        const mainInput = document.getElementById("facilitySearch");

        if (!dropdownEl || !innerSearchEl || !mainInput) return;

        mainInput.addEventListener("focus", openDropdown);
        innerSearchEl.addEventListener("input", handleSearch);
        clearBtn.addEventListener("click", clearSearch);

        document.addEventListener("click", handleOutsideClick);
    }

    function openDropdown() {
        dropdownEl.classList.remove("d-none");
        innerSearchEl.focus();
    }

    function handleSearch(e) {
        const value = e.target.value.trim();

        clearTimeout(debounceTimer);

        debounceTimer = setTimeout(() => {
            PatientDetails.GetFacilityBySearch(value);
        }, DEBOUNCE_DELAY);
    }

    function clearSearch() {
        // Clear inner search input
        innerSearchEl.value = "";

        // Clear rendered options but keep inner search + loader rows
        const dropdown = document.getElementById("facilityDropdown");
        dropdown.querySelectorAll(
            "li:not(#facilityLoader):not(.facility-inner-search)"
        ).forEach(li => li.remove());

        // Hide loader if it was visible
        if (facilityDropdown) {
            facilityDropdown.hideLoader();
        }
        // Keep dropdown open and refocus for quick re-search
        dropdown.classList.remove("d-none");
        innerSearchEl.focus();
    }

    function handleOutsideClick(e) {
        if (!e.target.closest(".facility-search")) {
            dropdownEl.classList.add("d-none");
        }
    }

    return { init };

})();


/* --------------------------------------------
   Init facility Search
-------------------------------------------- */
document.addEventListener("DOMContentLoaded", () => {
    OrderfacilityNPISearch.init();
    facilityDropdown = PatientDetails.bindFacilitySearchDropDown(
        "facilitySearch",
        "facilityDropdown"
    );
});


PatientDetails.Init();

$(document).ready(function () {
    var postbackUrl = "../../../apix/UserSession/GetUserRolesByPage";
    var meta = {};
    meta.PageName = 'patientDetails.html';

    __DoAsyncPostBack(meta, postbackUrl, function (ajxOut) {
        if (ajxOut.Success == false) {
            return '';
        }

        if (ajxOut.Success == true) {
            var rolValue = ajxOut.ResultData;
            if (rolValue.includes('A') == false && rolValue.includes('E') == false) {
                $('#btnPatientDemographics').remove();
                $('#btnFacilityService').remove();
            }

            if (rolValue.includes('D') == false) {
                $('#btnDeleteSrvDet').remove();
            }
        }
    });
});