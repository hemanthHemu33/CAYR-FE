"use strict"
var _GlobalPhysician = {
    url: '../../../apix/ManagePhysician/',
    recordsPerPage: 50,
    PhysicianNPI: '',
}

var Physician = {
    _PhysicianRecCount: 0,
    _PhysicianGrid: {},

    Init: function () {
        document.getElementById('divMain').addEventListener('click', this);
        document.getElementById('searchType').addEventListener('change', this);
        
        $('.accordion-content-dict').css('display', 'block');
        this.showSubMenu();
        flatpickr(".dt", {
            dateFormat: "m/d/Y",   
            allowInput: true       
        });
        $(function () {
            const $start = $("#inpPecosDisEnrollDate");
            const $end = $("#inpPecosLastDate");

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
        Core.getStateList('inpState');
        this.initilizeGridsonPage();
        this._PhysicianGridConfigration = this.initializeGridConfiguration(this._PhysicianGrid);
        this.GetAllPhysician(Core.gridDefault);
    },
    initializeGridConfiguration: function (gridInstance) {
        const config = new QCGridConfigration(gridInstance);
        var url = '../../../apix/CAYRGridConfiguration/';
        config.gridAPI = url + 'GetGridColModel';
        config.gridSaveAPI = url + 'SaveGridColModal';
        config.gridResetAPI = url + 'ResetGridColModal';
        return config;
    },
    getNpiFromUrl: function () {
        // Get current URL parameters
        const urlParams = new URLSearchParams(window.location.search);
        return urlParams.get('Npi');
    },

    initilizeGridsonPage: function () {
        //Physician Grid
        this._PhysicianGrid = new QCGrid();
        this._PhysicianGrid.width = '100%';
        this._PhysicianGrid.height = 'calc(77vh - 160px)';
        this._PhysicianGrid.id = 'tblPhysicianMasterGrid'
        this._PhysicianGrid.containerID = 'PhysicianMasterGrid';
        this._PhysicianGrid.class = 'table table-bordered table-striped table-hover gridLayoutFix';
    },
    showFacilityDefaultMessage: function () {
        const html = `
        <div class="mngFaclit-empty-state text-center p-5">
            <i class="fa-regular fa-hospital text-muted mb-4 mngFaclit-empty-icon"></i>
            <p class="lead">
                <strong>No facilities available</strong>. Please select a client to view its facilities.
                 Or, you can <a href="#" id="lnkAddFacility" data-ev="EV_AddPhysician" class="mngFaclit-cta-link">
                    <i class="fas fa-plus-circle me-1" data-ev="EV_AddPhysician" ></i>Add a new facility
                </a>
                directly.
            </p>
           
        </div>
    `;

        $('#FacilityNoMsg').html(html).removeClass('d-none');

    },
    showSubMenu: function () {
        $('.table-bordered.cursor-pointer.mb-3').addClass('custom-margin-dictionary');
        $('#AdditionalPhyInfo').addClass('custom-margin-dictionary')
        $('#FacilityFilter').addClass('custom-margin-dictionary');
        $("body").addClass("sidebar-icon-only");
        $('#theme-settings').css('display', 'block')
        $('#submenuIcon').remove();
    },

    setPage: function (v) {
        Core.toggleMenuDisplay();
        $('#div' + v).css('display', 'block');
        //Physician.resetCtle();
        _$modxAppCore.hideinlineConfirm('alert' + v);
        $('#btnDeletePhysicainMaster').hide();
        _$modxAppCore.showErrorMessage('', 'success', 'divValidateMsgMap');
    },
    GetAllPhysician: async function (gridParam) {
        _$modxAppProgressBar.show();
        var meta = {}
        if (gridParam.query == null) {
            return;
        }
        const valMeta = _$modxAppCore.getAppCoreModel('PhyValMeta');
        if (valMeta.SearchVal.trim() != '') {
            gridParam.query = valMeta.SearchVal.trim();
            gridParam.queryType = $('#searchType').val();
        }
        meta.QCGridParam = gridParam;
      
        meta.GridName = 'PhysicianMasterGrid';
        var functionName = "GetPhysiciansData";
        var url = _GlobalPhysician.url + functionName;
        var qcGrid = await __PromisAsyncPostBack(meta, url);
        if (qcGrid.success == false) {
            _$modxAppProgressBar.hide();
            _$modxAppCore.alert("Could not get physician data", 'Error');
            return false;
        }
        if (qcGrid.data.length == 0) {
            $('#PhysicianGrid').html('')
            this.showFacilityDefaultMessage();
            _$modxAppProgressBar.hide();
            return;
        }
        Core.showNoGridDataMessage(this._PhysicianGrid.containerID, '');
        //code to plot the grid
        var grid = Physician._PhysicianGrid;
        grid.gridData = qcGrid;
        if (Physician._PhysicianRecCount != qcGrid.param.totalRecords) {
            grid.clearBind();
        }
        grid.bind();
        Physician._PhysicianRecCount = qcGrid.param.totalRecords;
        _$modxAppProgressBar.hide();
        grid.onSubmit = function (gridParam) {
            Physician.GetAllPhysician(gridParam);
        }

        grid.onRowDblClick = function (rowNum, colNum, row, colModel) {
            // Set PhysicianNPI
            const tempEl = document.createElement("div");
            tempEl.innerHTML = row.PhysicianNPI;
            const npiValue = tempEl.textContent.trim();

            // Assign values
            _GlobalPhysician.PhysicianNPI = npiValue;
            row.PhysicianNPI = npiValue;


            if (row.Active == 'Yes') {
                row.Active = true;
            }
            else {
                row.Active = false;
            }

            // Update Model
            _$modxAppCore.putAppCoreModel('PhysicianMeta', row);

            // UI Updates
            _$modxAppCore.showErrorMessage('', 'success', 'divValidateMsgMap');
            _$modxAppCore.hideinlineConfirm('alertFacility');
            $('#btnDeletePhysicainMaster').show();
            $('.table-primary').removeClass('table-primary');
            $('.tr-select').addClass('table-primary');
            $('#divAddEditPhysician').removeClass('d-none');
        }
    },


    resetCtle: function () {
        let meta = {
                "PhysiciansMasterID": "",
                "PhysicianNPI": "",
                "ProviderType": "",
                "PhysicianCode": "",
                "Suffix": "",
                "PhysicianFirstName": "",
                "PhysicianMiddleName": "",
                "PhysicianLastName": "",
                "Address1": "",
                "Address2": "",
                "City": "",
                "State": null,
                "ZIPCode": "",
                "PhysicianPhone": "",
                "PhysicianEmail": "",
                "Gender": "",
                "SecondaryLocation": "",
                "StateLicenceNumber": "",
                "RestrictRegions": "",
                "FEIN": "",
                "EIN": "",
                "TIN": "",
                "Active": 1,
                "Credential": "",
                "PrimaryDepartment": "",
                "PrimaryLocation": "",
                "PecosStatus": "",
                "PecosDate": "",
                "PecosDisEnrollDate": "",
                "PecosLastDate": "",
                "Speciality": "",
                "SpecialtyDescription": "",
                "TaxonomyCode": "",
                "SecondaryTaxonomyCode": ""
            }
        $('#btnDeletePhysicainMaster').hide();
        $('.table-primary').removeClass('table-primary');
        _$modxAppCore.hideinlineConfirm('alertFacility');
        _$modxAppCore.showErrorMessage('', 'success', 'divValidateMsgMap');
        _$modxAppCore.putAppCoreModel('PhysicianMeta', meta);
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
        meta.PhysiciansMasterID = $('#inpPhysiciansMasterID').val().trim();

        _$modxAppCore.showErrorMessage('', 'success', 'divValidateMsgMap');

        _$modxAppProgressBar.show();

        var functionName = "DeletePhysician";
        var url = _GlobalPhysician.url + functionName;
        var ajaxOut = await __PromisAsyncPostBack(meta, url);
        if (ajaxOut.Success == false) {
            _$modxAppCore.showErrorMessage(ajaxOut.Message, 'error', 'divValidateMsgMap')
            _$modxAppProgressBar.hide();
            return;
        }

        if (ajaxOut.Success) {
            _$modxAppProgressBar.hide();
            this.resetCtle();
            _$modxAppCore.hideinlineConfirm('alertFacility');
            $('#btnDeletePhysicainMaster').hide();
            _$modxAppCore.showErrorMessage(ajaxOut.Message, 'success', 'divValidateMsgMap')
            this.hidePhysicianAddUpdateForm();
            Physician.GetAllPhysician(Core.gridDefault);
        }
    },

    savePhysician: async function () {
        var meta = _$modxAppCore.getAppCoreModel('PhysicianMeta');
        const requiredPhysicianField = [
            "PhysicianNPI",
            "ProviderType",
            "Suffix",
            "PhysicianFirstName",
            "PhysicianLastName",
            "Address1",
            "City",
            "State",
            "ZIPCode",
            "PhysicianPhone",
            "PhysicianEmail",
            "Gender",
            "Credential",
            "PrimaryDepartment",
            "PrimaryLocation",
            "Speciality",
            "SpecialtyDescription",
            "TaxonomyCode"
        ];




        var validation = Core.validateInputs(requiredPhysicianField, meta);

        if (validation.isValid == false) {
            _$modxAppCore.showErrorMessage(`${validation.error}`, 'error', 'divValidateMsgMap');
            $('#inp' + validation['missingField']).focus();
            return;
        }

        if (_$AppValidatte.validateEmail(meta.PhysicianEmail) == false) {
            _$modxAppCore.showErrorMessage(`Please enter valid ContactEmail`, 'error', 'divValidateMsgMap');
            $('#inpPhysicianEmail').focus();
            return;
        }
        var len = 10;
        var isValid = Core.checkInputValues(meta.PhysicianNPI, len);
        if (isValid == 0) {
            _$modxAppCore.showErrorMessage(`Physician NPI has to consist of exactly ${len} digits`, 'error', 'divValidateMsgMap');
            $('#inpPhysicianNPI').focus();
            return;
        }
        len = 5;
        if (meta.ZIPCode.length < 5) {
            isValid = Core.checkInputValues(meta.ZIPCode, len);
            if (isValid == 0) {
                _$modxAppCore.showErrorMessage(`Zip has to consist of minimum ${len} digits`, 'error', 'divValidateMsgMap');
                $('#inpZIPCode').focus();
                return;
            }
        }
        len = 9;
        isValid = Core.checkInputValues(meta.FEIN, len);
        if (isValid == 0) {
            _$modxAppCore.showErrorMessage(`FEIN has to consist of exactly ${len} digits`, 'error', 'divValidateMsgMap');
            $('#inpFEIN').focus();
            return;
        }
        len = 9;
        isValid = Core.checkInputValues(meta.EIN, len);
        if (isValid == 0) {
            _$modxAppCore.showErrorMessage(`EIN has to consist of exactly ${len} digits`, 'error', 'divValidateMsgMap');
            $('#inpEIN').focus();
            return;
        }

        len = 9;
        isValid = Core.checkInputValues(meta.TIN, len);
        if (isValid == 0) {
            _$modxAppCore.showErrorMessage(`TIN has to consist of exactly ${len} digits`, 'error', 'divValidateMsgMap');
            $('#inpTIN').focus();
            return;
        }

        var len = 12;
        var isValid = Core.checkInputValues(meta.PhysicianPhone, len);
        if (isValid == 0) {
            _$modxAppCore.showErrorMessage(`Physician Phone has to consist of exactly 10 digits`, 'error', 'divValidateMsgMap');
            $('#inpPhysicianPhone').focus();
            return;
        }
        _$modxAppCore.showErrorMessage('', 'success', 'divValidateMsgMap');

        _$modxAppProgressBar.show();

        var functionName = "SavePhysicianMaster";
        var url = _GlobalPhysician.url + functionName;
        var ajaxOut = await __PromisAsyncPostBack(meta, url);
        if (ajaxOut.Success == false) {
            _$modxAppCore.showErrorMessage(ajaxOut.Message, 'error', 'divValidateMsgMap')
            _$modxAppProgressBar.hide();
            return;
        }

        if (ajaxOut.Success) {
            _$modxAppProgressBar.hide();
            _$modxAppCore.showErrorMessage(ajaxOut.Message, 'success', 'divValidateMsgMap')
            this.GetAllPhysician(Core.gridDefault);
            $('#ID').val(ajaxOut.ResultData);
        }
    },

    resetPage: function () {
        this.showFacilityDefaultMessage();
        $('#selClient').prop('selectedIndex', 0);
        _$modxAppCore.showErrorMessage('', 'error', 'divValidateMsgMap');
        $('#PhysicianGrid').html('')
        this.resetCtle();
        this.hidePhysicianAddUpdateForm();
    },

    hidePhysicianAddUpdateForm: function () {
        $('#divAddEditPhysician').addClass('d-none');
        $('#btnAddPhysicianMaster').css('margin-right', '0px');

    },
    getAdditionalPhysicianDetails: async function (ev) {
        Core.gridDefault.query = ev.target.getAttribute('data-id')
        _$modxAppProgressBar.show();
        var meta = {}
        meta.QCGridParam = Core.gridDefault;
        var functionName = "GetPhysicianAdditionalInfo";
        var url = _GlobalPhysician.url + functionName;
        var ajax = await __PromisAsyncPostBack(meta, url);
        if (ajax.success == false) {
            _$modxAppProgressBar.hide();
            _$modxAppCore.alert("Could not get physician info data", 'Error');
            return false;
        }
        this.populatePhysicianInfo(ajax.ResultData)
        _$modxAppProgressBar.hide();
    },
    populatePhysicianInfo: function (data) {
        let $infoContainer = $("#AdditionalPhyInfo");
        $infoContainer.empty(); // clear old content

        if (!data || $.isEmptyObject(data)) {
            $infoContainer.append(`
            <div class="col-12">
                <div class="alert alert-warning text-center py-1 mb-0 small">
                    <i class="bi bi-exclamation-circle"></i> No additional physician information available.
                </div>
            </div>
        `);
            return;
        }
        $infoContainer.append(`
        <div class="card shadow-sm w-100">
            <div class="card-header  py-1"  style="background: lightgray; border-radius: 0px">
                <span class="fw-semibold small">Additional Physician Information</span>
            </div>
            <div class="card-body py-2">
                <div class="row g-2" id="physicianInfoRows"></div>
            </div>
        </div>
    `);

        let $rows = $("#physicianInfoRows");

        $.each(data, function (key, value) {
            $rows.append(`
            <div class="col-sm-6 col-lg-4 small">
                <span class="phyInfoLbl">${key}:</span>
                <span class="phyVal">${value ? value : ' '}</span>
            </div>
        `);
        });
    },
    handleEvent: function (ev) {
        var target = ev.target;
        var evCase = target.getAttribute('data-ev');

        switch (evCase) {
            case 'EV_CloseSubMenu':
                $('#FacilityFilter').removeClass('custom-margin-dictionary')
                $('#AdditionalPhyInfo').removeClass('custom-margin-dictionary')
                Core.closeSubMenu();
                break;

            case 'EV_ShowSubMenu':
                this.showSubMenu();
                break;

            case 'EV_ManagePhysicianMaster':
                location.href = 'managePhysicians.html';
                break;

            case 'EV_ManagePhysicianFacility':
                location.href = 'manageFacilityPhysician.html'
                break;

            case 'EV_AddPhysician':
                //$('#btnAddPhysicianMaster').css('margin-right', '650px');
                $('#FacilityNoMsg').css('margin-left', '-200px');
                $('#divAddEditPhysician').removeClass('d-none');
                this.resetCtle();
                break;

            case 'EV_Save_PhysicainMaster':
                this.savePhysician();
                break;

            case 'EV_ManagePhysician':
                this.resetPage();
                break;

            case 'EV_Delete':
                this.deletePhysicianConfirm();
                break;

            case 'EV_CANCELDelPhysician':
                _$modxAppCore.hideinlineConfirm('alertFacility');
                break;

            case 'EV_CONFRIM_DeletePhysician':
                this.deletePhysician();
                break;
            case 'EV_CloseAddUpdatePhysician':
                this.hidePhysicianAddUpdateForm();
                break;

            case 'Ev_NavigateToFacility':
                this.NavigateToFacility();
                break;

            case 'EV_ViewAdditionalDetails':
                $('#AdditionalPhyInfo').removeClass('d-none')
                $('.bold-link').removeClass('bold-link');
                $('.table-primary').removeClass('table-primary');
                ev.target.parentElement.classList.remove('tr-select');
                ev.target.classList.add('bold-link');
                this.getAdditionalPhysicianDetails(ev);
                break;

            case 'Ev_searchPhysician':
                $('#AdditionalPhyInfo').addClass('d-none')
                Physician.GetAllPhysician(Core.gridDefault);
                break;
            case 'Ev_SearchPhysOption':
                if (ev.type == 'change') {
                    _$modxAppCore.putAppCoreModel('PhyValMeta', {});
                    $('#AdditionalPhyInfo').addClass('d-none')
                }
                break;

        }
    }
}

Physician.Init();

$(document).ready(function () {
    var postbackUrl = "../../../apix/UserSession/GetUserRolesByPage";
    var meta = {};
    meta.PageName = 'managePhysicians.html';

    __DoAsyncPostBack(meta, postbackUrl, function (ajxOut) {
        if (ajxOut.Success == false) {
            return '';
        }

        if (ajxOut.Success == true) {
            var rolValue = ajxOut.ResultData;
            if (rolValue.includes('A') == false && rolValue.includes('E') == false) {
                $('#btnAddPhysicianMaster').remove();
                $('#btnSavePhysicainMaster').remove();
            }

            if (rolValue.includes('D') == false) {
                $('#btnDeletePhysicainMaster').remove();
            }
        }
    });
});