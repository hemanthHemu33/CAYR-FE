"use strict"
var _GlobalCPTService = {
    url: '../../../apix/Services/',
    recordsPerPage: 50,
    PhysicianNPI: '',
}

var CPTService = {
    _CPTServiceRecCount: 0,
    _CPTServiceGrid: {},
 

    Init: function () {
        document.getElementById('divMain').addEventListener('click', this);
        this.showSubMenu();
        this.initilizeGridsonPage();
        
        Accordion.init('#CPTServiceAccordianIns');
        this.GetCPTService(Core.gridDefault);

    },
    initilizeGridsonPage: function () {
        //Physician Grid
        this._CPTServiceGrid = new QCGrid();
        this._CPTServiceGrid.width = '100%';
        this._CPTServiceGrid.height = 'calc(90vh - 160px)';
        this._CPTServiceGrid.id = 'tblCPTServiceGrid';
        this._CPTServiceGrid.containerID = 'CPTServiceGrid';
        this._CPTServiceGrid.class = 'table table-bordered table-striped table-hover gridLayoutFix';

 

    },
 
    showCPTServiceDefaultMsg: function () {
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

        $('#CPTServiceDefaultMsg').html(html).removeClass('d-none');

    },
 
    showSubMenu: function () {
         $('.table-bordered.cursor-pointer.mb-3').addClass('custom-margin-dictionary');
        $('#filterSection').addClass('custom-margin-dictionary');
        $('#CPTServiceAccordianIns').addClass('custom-margin-dictionary');
        $("body").addClass("sidebar-icon-only");
        $('#theme-settings').css('display', 'block')
        $('#submenuIcon').remove();
    
    },

    GetCPTService: async function (gridParam) {
        _$modxAppProgressBar.show();
        var CptServiceMeta = {}
        if (gridParam.query == null) {
            _$modxAppProgressBar.hide();
            return;
        }
 
        CptServiceMeta.QCGridParam = gridParam;
        CptServiceMeta.searchType = $('#selSearch').val();
        CptServiceMeta.searchVal = $('#inpSearch').val().trim();
        var functionName = "GetAllCptService";
        var url = _GlobalCPTService.url + functionName;
        var qcGrid = await __PromisAsyncPostBack(CptServiceMeta, url);
        if (qcGrid.success == false) {
            _$modxAppProgressBar.hide();
            _$modxAppCore.alert("Could not get Services data", 'Error');
            return false;
        }
        if (qcGrid.data.length == 0) {
            $('#CPTServiceGrid').html('')
            this.showNoCptDefaultDefaultMessage();
            _$modxAppProgressBar.hide();
            return;
        }
        $('#CPTServiceDefaultMsg').addClass('d-none')
        $('#btnCPTService').removeClass('d-none')
        Core.showNoGridDataMessage(this._CPTServiceGrid.containerID, '');
        //code to plot the grid
        var grid = CPTService._CPTServiceGrid;
        grid.gridData = qcGrid;
        grid.clearBind();
        grid.bind();
        _$modxAppProgressBar.hide();
        grid.onSubmit = function (gridParam) {
            CPTService.GetCPTService(gridParam);
        }

        grid.onRowDblClick = function (rowNum, colNum, row, colModel) {
            Promise.all([
                CPTService.GetServiceDetails(row.ServiceTypeID),
            ]).then(() => {
                if (row.IsActive == "Yes" || row.IsActive) {
                    row.IsActive = true;
                }
                else {
                    row.IsActive = false;
                }
                $('#FacilityDropdown').val(null).trigger('change');
                _$modxAppCore.putAppCoreModel('CPTServiceMeta', row);
                _GlobalCPTService.selectedService = row.ServiceTypeName;
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
    showNoCptDefaultDefaultMessage: function () {

 

        var htm = `
        <div class="mngFaclit-empty-state text-center p-5">
            <i class="fa-solid fa-users text-muted mb-4 mngFaclit-empty-icon"></i>
            <p class="lead mb-2">
                <strong>No records found for the search</strong>
            </p>
            <p class="mb-0 text-muted">
            There are no records that match your search criteria.
            </p>
        </div>
    `;

        $('#CPTServiceGrid')
            .html(htm)
            .removeClass('d-none');
    },
 
    handleEvent: function (ev) {
        var target = ev.target;
        var evCase = target.getAttribute('data-ev');

        switch (evCase) {
            case 'EV_CloseSubMenu':
                $('#filterSection').removeClass('custom-margin-dictionary')
                $('#CPTServiceAccordianIns').removeClass('custom-margin-dictionary')
                $('.table-bordered.cursor-pointer.mb-3').removeClass('custom-margin-dictionary');
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
            case 'EV_AddCPTService':
                this.resetServDetailCtle();
                $('#divPhysicianFacilityMap').removeClass('d-none')
                break;
            case 'EV_CloseAddUpdateCPTService':
                $('.table-primary').removeClass('table-primary');
                this.hideCPTService();
                break;
            case 'EV_Facility_Change':
                if (ev.type == 'change') {
                    this.hideCPTService();
                    //Core.gridDefault.query = ev.target.value;
                    //this.GetCPTService(Core.gridDefault);
                }
                break;
            case 'EV_Save_CPTService':
                this.saveCPTService();
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
                this.deleteCPTService();
                break;
            case 'EV_CONFRIM_SrvAvlDeleteFacility':
                this.deleteFacilityAvlService();
                break;
            case 'EV_ViewManageFacility':
                $('#CPTServiceCard').removeClass('d-none')
                $('.bold-link').removeClass('bold-link');
                $('.table-primary').removeClass('table-primary');
                ev.target.parentElement.classList.remove('tr-select');
                ev.target.classList.add('bold-link');
                $('#FacilityScheduleMapCard').addClass('d-none')
                $('#divPhysicianFacilityScheduleMap').addClass('d-none');

                ev.target.parentElement.classList.remove('tr-select');
                ev.target.classList.add('bold-link');
                _GlobalCPTService.selFacility = ev.target.getAttribute('data-id')
                Core.gridDefault.query = _GlobalCPTService.selFacility
                CPTService.GetCPTService(Core.gridDefault)
                break;

            case 'EV_Search':
                $('#CPTServiceCard').addClass('d-none')
                this.GetCPTService(Core.gridDefault)
                break;
            case 'EV_ViewServiceScheduleMap':
                _GlobalCPTService.ServiceTypeID = ev.target.getAttribute('data-id-servicetypeid')
                _GlobalCPTService.ServiceId = ev.target.getAttribute('data-value-serviceid')
                $('.bold-link').removeClass('bold-link');
                $('.table-primary').removeClass('table-primary');
                ev.target.parentElement.classList.remove('tr-select');
                ev.target.classList.add('bold-link');
                $('html, body').animate({
                    scrollTop: $(document).height()
                }, 600);
                $('#divPhysicianFacilityScheduleMap').addClass('d-none');
                this.GetCPTServiceSchedule(Core.gridDefault);
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

            case 'EV_Save_CPTServiceMap':
                this.SaveCPTServiceSchedule();
                break;
            case 'EV_CloseAddUpdateCPTServiceScheduleMap':
                $('.table-primary').removeClass('table-primary');
                _$modxAppCore.showErrorMessage('', 'success', 'divValidateSchedlueMsg');
                _$modxAppCore.hideinlineConfirm('alertFacility');
                $('#divPhysicianFacilityScheduleMap').addClass('d-none');
                break;
        }
    }
}

CPTService.Init();

$(document).ready(function () {
    var postbackUrl = "../../../apix/UserSession/GetUserRolesByPage";
    var meta = {};
    meta.PageName = 'CPTService.html';

    __DoAsyncPostBack(meta, postbackUrl, function (ajxOut) {
        if (ajxOut.Success == false) {
            return '';
        }

        if (ajxOut.Success == true) {
            var rolValue = ajxOut.ResultData;
            if (rolValue.includes('A') == false && rolValue.includes('E') == false) {
                $('#btnCPTService').remove();
                $('#btn_CPTService').remove();

            }

            if (rolValue.includes('D') == false) {
                $('#btnDeleteSrvDet').remove();
            }
        }
    });
});