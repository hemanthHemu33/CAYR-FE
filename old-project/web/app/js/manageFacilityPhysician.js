"use strict"



var _GlobalPhysicianFacility = {
    url: '../../../apix/ManagePhysician/',
    recordsPerPage: 50,
    selectedFacility: '',
    selPhysician: '',
    selPhysicainNPI: ''
}

var PhysicianFacility = {
    _PhysicianFacilityRecCount: 0,
    _PhysicianFacilityGrid: {},
    _PhysicianRecCount: 0,
    _PhysicianGrid: {},

    Init: function () {
        document.getElementById('divMain').addEventListener('click', this);
        document.getElementById('inpClient').addEventListener('change', this);

        $('.accordion-content-dict').css('display', 'block');
        this.showSubMenu();
        flatpickr(".dt", {
            dateFormat: "m-d-Y",
            allowInput: true
        });

        this.initilizeGridsonPage();
        this._PhysicianFacilityGridConfigration = this.initializeGridConfiguration(this._PhysicianFacilityGrid);
        this._PhysicianGridConfigration = this.initializeGridConfiguration(this._PhysicianGrid);
        Promise.all([this.GetAllClients()])
            .then(() => {
                const meta = this.getURLMeta();

                if (meta.clientId != null) {
                    // If meta is present, handle it and end the chain
                    this.setFacilityPhyscianForUrlMeta(meta);
                    return Promise.reject('__STOP__');  
                }

                // ---- No meta: continue the normal flow ----
                // set the client
                document.getElementById('inpClient').selectedIndex = 1;

                // load facility list first
                return this.GetFacilityList()
                    .then(() => this.GetAllPhysicianFacility(Core.gridDefault));
            })
            .catch(err => {
                if (err === '__STOP__') return;  
                console.error('Error while loading data:', err);
            });

        this.bindSearchDropdown(
            $("#npiSearch"),
            $("#npiDropdown"),
            {
                source: "physician_npi",
                idField: "FacilityID",
                searchType: "npi",
                formatItem: item => `${item.Name}`,
                onSelect: item => console.log("Selected Physician:", item)
            }
        );

    },
    getURLMeta: function () {
        const params = new URLSearchParams(window.location.search);

        // Safely decode each field
        const meta = {
            orderId: params.has('order') ? atob(params.get('order')) : null,
            clientId: params.has('client') ? atob(params.get('client')) : null,
            facilityId: params.has('facility') ? atob(params.get('facility')) : null
        };
        _GlobalPhysicianFacility.OrderId = meta.orderId;
        return meta;
    },
    setFacilityPhyscianForUrlMeta: function (meta) {
        Promise.all([
            $('#inpClient').val(meta.clientId).trigger('change'),
        ])
            .then(() => {
                this.GetFacilityList(meta.facilityId);
            })
            .then(() => {
                this.GetAllPhysicianFacility(Core.gridDefault);
            })
            .catch(err => {
                console.error("Error while loading data:", err);
            });
    },
    GetAllClients: async function () {
        var meta = {}

        var url = "../../../apix/Admin/GetAllClients";
        var data = await __PromisAsyncPostBack(meta, url);
        _$modxAppUIBinders.bindDropDown('#inpClient', data, 'ClientID', 'Name', 'Select');
    },

    GetFacilityList: async function (fclId) {
        var meta = {}
        meta.ClientID = $('#inpClient').val();
        const functionName = "GetFacilityList"
        const url = _GlobalPhysicianFacility.url + functionName;
        var data = await __PromisAsyncPostBack(meta, url);
        this.BindDropDownList(data, 'selFacilityList',fclId)
    },
    BindDropDownList: function (list, id,fclId) {
        const $ddl = $("#" + id);

        // Always clear & destroy previous instance
        $ddl.empty();
        if ($ddl.data('multiselect')) {
            $ddl.multiselect('destroy');
        }

        // If no data, just return (dropdown stays empty)
        if (!list || list.length === 0) {
            return;
        }

        // Bind new list
        $ddl.html(list);

        // Initialize fresh multiselect
        $ddl.multiselect({
            maxHeight: 250,
            buttonWidth: '100%',
            nonSelectedText: '-Select Facility-',
            buttonContainer: '<div class="form-control drpDwnMutiSelect"/>',
            buttonClass: 'custom-add-btn-mulitselect',
            allSelectedText: 'All Facilities Selected',
            nSelectedText: 'selected',
            enableFiltering: true,
            enableCaseInsensitiveFiltering: true,
            includeSelectAllOption: true,
            selectAllText: ' Select All Facilities',
            selectAllNumber: false,
            selectAllJustVisible: false
        });

        //if (fclId != undefined) {
        //    $('#selFacilityList').multiselect('select', [fclId]);
        //}
    },




    initilizeGridsonPage: function () {
        //PhysicianFacility Grid
        this._PhysicianFacilityGrid = new QCGrid();
        this._PhysicianFacilityGrid.width = '100%';
        this._PhysicianFacilityGrid.height = 'calc(77vh - 160px)';
        this._PhysicianFacilityGrid.id = 'tblPhysicianFacilityGrid'
        this._PhysicianFacilityGrid.containerID = 'PhysicianFacilityGrid';
        this._PhysicianFacilityGrid.class = 'table table-bordered table-striped table-hover gridLayoutFix';

        //Physician Grid
        this._PhysicianGrid = new QCGrid();
        this._PhysicianGrid.width = '100%';
        this._PhysicianGrid.height = 'calc(35vh)';
        this._PhysicianGrid.id = 'tblPhysicianGrid'
        this._PhysicianGrid.containerID = 'PhysicianGrid';
        this._PhysicianGrid.class = 'table table-bordered table-striped table-hover gridLayoutFix';
    },


    initializeGridConfiguration: function (gridInstance) {
        const config = new QCGridConfigration(gridInstance);
        var url = '../../../apix/CAYRGridConfiguration/';
        config.gridAPI = url + 'GetGridColModel';
        config.gridSaveAPI = url + 'SaveGridColModal';
        config.gridResetAPI = url + 'ResetGridColModal';
        return config;
    },
    bindSearchDropdown: function ($input, $dropdown, config) {

        let debounceTimer = null;
        let activeIndex = -1;

        function bindResults(data) {
            $dropdown.empty();
            activeIndex = -1;

            if (data.loading) {
                $dropdown.removeClass('d-none').html(`
                <li class="loading-spinner">
                    <div class="spinner-border text-primary" role="status" style="width: 1.5rem; height: 1.5rem;">
                        <span class="visually-hidden">Loading...</span>
                    </div>
                </li>
            `);
                return;
            }

            // No results handling
            if (!data.results || data.results.length === 0) {
                if (config.source === 'physician_npi') {
                    $dropdown.removeClass('d-none').html(`
                    <li class="no-results">
                        No physician found for "${$input.val()}". 
                        <a href="#" class="add-physician-link" data-ev="Show_Add_Physician">Click here to add new physician.</a>
                    </li>
                `);

                    // Bind click for adding new physician
                    $dropdown.find('.add-physician-link').on('click', function (e) {
                        e.preventDefault();
                        if (typeof config.onAdd === "function") {
                            config.onAdd($input.val());
                        } else {
                            console.log('Add Physician clicked for:', $input.val());
                        }
                        $dropdown.addClass('d-none');
                    });

                } else {
                    $dropdown.removeClass('d-none').html(`<li class="no-results">No results found</li>`);
                }
                return;
            }

            // Bind result items
            data.results.forEach(item => {

                const text = config.formatItem(item);
                const $li = $("<li>")
                    .addClass("dropdown-item")
                    .attr("data-id", item[config.idField])
                    .text(text)
                    .on("click", () => {

                        if (typeof config.onSelect === "function") {
                            config.onSelect(item);
                        }

                        switch (config.source) {
                            case "facility":
                                PhysicianFacility.initFacilityUI(item);
                                break;
                            case "physician_npi":
                                $input.val(text);
                                PhysicianFacility.GetAllPhysicianFacility(Core.gridDefault, item.PhysiciansMasterID);
                                //$input.val(text);
                                //$('#PhysicianID').val(item[config.idField]);
                                //PhysicianFacility.GetNpiDrDetail(item.Name);
                                break;
                            default:
                                console.warn("No follow-up function for source:", config.source);
                        }

                        $dropdown.addClass('d-none');
                    });

                $dropdown.append($li);
            });

            $dropdown.removeClass('d-none');
        }

        $input.on("input", function () {
            clearTimeout(debounceTimer);
            const value = $(this).val().trim();

            if (value.length < 3) {
                $dropdown.addClass('d-none');
                return;
            }

            bindResults({ loading: true });

            debounceTimer = setTimeout(async () => {
                let results = [];

                switch (config.source) {
                    case "facility":
                        results = await PhysicianFacility.GetFacilityBySearch(value);
                        break;
                    case "physician_npi":
                        results = await PhysicianFacility.GetAllNPI({
                            SearchValue: value
                        });
                        break;
                    default:
                        console.warn("Unknown source:", config.source);
                        results = [];
                }

                bindResults({ results });
            }, 400);
        });

        $input.on("keydown", function (e) {
            const items = $dropdown.find(".dropdown-item");
            if (!items.length) return;

            if (e.key === "ArrowDown") {
                e.preventDefault();
                activeIndex = (activeIndex + 1) % items.length;
            } else if (e.key === "ArrowUp") {
                e.preventDefault();
                activeIndex = (activeIndex - 1 + items.length) % items.length;
            } else if (e.key === "Enter" && activeIndex >= 0) {
                e.preventDefault();
                items.eq(activeIndex).click();
            }

            items.removeClass("active").eq(activeIndex).addClass("active");
        });

        $input.on("focus", function () {
            if ($dropdown.children().length > 0) {
                $dropdown.removeClass('d-none');
            }
        });

        $input.on("blur", function () {
            setTimeout(() => $dropdown.addClass('d-none'), 150);
        });
    },




    GetFacilityBySearch: async function () {
        _$modxAppProgressBar.show();
        var meta = {};
        meta.Name = $('#inpSearchByFacility').val().trim();
        meta.ClientID = $('#inpClient').val().trim();
        if (meta.Name == '') {
            retur;
        }
        var url = '../../../apix/ManagePhysician/GetAllFacility';
        try {
            var data = await __PromisAsyncPostBack(meta, url);
            console.log(data);
            _$modxAppProgressBar.hide();
            return data || [];
        } catch (e) {
            _$modxAppProgressBar.hide();
            console.error(e);
            return [];
        }
    },

    GetAllNPI: async function (meta) {
        meta.ClientID = $('#inpClient').val();
        const functionName = "GetAllNPI";
        const url = _GlobalPhysicianFacility.url + functionName;
        try {
            const data = await __PromisAsyncPostBack(meta, url);
            console.log(data)
            return Array.isArray(data) ? data : [];
        } catch (e) {
            console.error(e);
            return [];
        }
    },

    CallBySource: async function (source, searchText) {
        switch (source) {
            case "facility":
                return await this.GetFacilityBySearch(searchText);
            case "physician_npi":
                var meta = { SearchValue: searchText, SearchType: "npi" };
                return await this.GetAllNPI(meta);
            default:
                console.warn("Invalid source type provided:", source);
                return [];
        }
    },


    GetNpiDrDetail: async function (NPI) {
        var meta = {};
        let extractNpi = NPI.match(/^(\d+)\s*-/);
        meta.PhysicianNPI = extractNpi ? extractNpi[1] : NPI.trim();
        var functionName = "GetNpiDrDetail";
        var url = _GlobalPhysicianFacility.url + functionName;
        var data = await __PromisAsyncPostBack(meta, url);
        $('#Speciality')
            .val(data[0].Speciality || "")
            .attr("title", data[0].Speciality || "");

        $('#PhysicianName').val(data[0].Name)

    },

    showSubMenu: function () {
        $('#FacilityPhysician').addClass('custom-margin-dictionary')
        $("body").addClass("sidebar-icon-only");
        $('#theme-settings').css('display', 'block')
        $('#submenuIcon').remove();
    },

    setPage: function (v) {
        Core.toggleMenuDisplay();
        $('#div' + v).css('display', 'block');
        //PhysicianFacility.resetCtle();
        _$modxAppCore.hideinlineConfirm('alert' + v);
        $('#btnDelete').hide();
        _$modxAppCore.showErrorMessage('', 'success', 'divValidateMsg');
    },
    GetAllPhysicianFacility: async function (gridParam, PhysiciansMasterID) {
        _$modxAppProgressBar.show();
        var meta = {}
        meta.PhysiciansMasterID = PhysiciansMasterID;
        meta.ClientID = $('#inpClient').val();
        if (gridParam.query == null) {
            return;
        }
        
        let selFacility = $('#selFacilityList').val().join(", ");
        if (selFacility != '') {
            gridParam.query = $('#selFacilityList').val().join(", ");
        }
        meta.QCGridParam = gridParam;
        meta.GridName = 'PhysicianFacilityGrid'
        meta.QCGridParam.query = gridParam.query
        var functionName = "GetPhysicianFacilitysData";
        var url = _GlobalPhysicianFacility.url + functionName;
        var qcGrid = await __PromisAsyncPostBack(meta, url);
        if (qcGrid.success == false) {
            _$modxAppProgressBar.hide();
            _$modxAppCore.alert("Could not get PhysicianFacility data", 'Error');
            return false;
        }
        if (qcGrid.data.length == 0) {
            $('#PhysicianFacilityGrid').html('')
            Core.showFacilityDefaultMessage('PhysicianFacilityGrid');
            _$modxAppProgressBar.hide();
            return;
        }
        $('#PhysicianNoSelection').addClass('d-none')
        $('#PhysicianTabl').removeClass('d-none')
        Core.showNoGridDataMessage(this._PhysicianFacilityGrid.containerID, '');
        //code to plot the grid
        var grid = PhysicianFacility._PhysicianFacilityGrid;
        grid.gridData = qcGrid;
        grid.clearBind();
        grid.bind();
        PhysicianFacility._PhysicianFacilityRecCount = qcGrid.param.totalRecords;
        _$modxAppProgressBar.hide();
        grid.onSubmit = function (gridParam) {
            PhysicianFacility.GetAllPhysicianFacility(gridParam);
        }

        grid.onRowDblClick = function (rowNum, colNum, row, colModel) {
            _$modxAppCore.showErrorMessage('', 'error', 'divAddNpiMsg');
            $('.table-primary').removeClass('table-primary');
            $('.tr-select').addClass('table-primary');
            let meta = row
            meta.ClientID = $('#inpClient').val();
            meta.PhysiciansMasterID = row.PhysiciansMasterID
            _GlobalPhysicianFacility.selPhysicainNPI = row.PhysicianNPI
            _GlobalPhysicianFacility.selPhysician = row.PhysiciansMasterID
            $('#inpSearchByFacility').val('')
            PhysicianFacility.GePhysicianMappedFacility(meta);

        }
    },

    GetAllPhyscianFacility: async function (PhysicianNPI) {
        _$modxAppProgressBar.show();
        var meta = {}
        meta.PhysicianNPI = PhysicianNPI
        var functionName = "GetAllPhyscianFacility";
        var url = _GlobalPhysicianFacility.url + functionName;
        var result = await __PromisAsyncPostBack(meta, url);
        this.initUpdateFacilityUI(result)
        _$modxAppProgressBar.hide();
    },
    resetCtle: function () {
        this.bindSearchDropdown(
            $("#npiSearch"),
            $("#npiDropdown"),
            {
                source: "physician_npi",
                idField: "FacilityID",
                searchType: "npi",
                formatItem: item => `${item.Name}`,
            }
        );
        $('#btnDelete').hide();
        $('#AddNewPhysician').addClass('d-none')
        $('#SearchPhysician').removeClass('d-none')
        this.resetFacilityUI();
        $('#FacilityDropdown').val(null).trigger('change');
        $('.table-primary').removeClass('table-primary');
        _$modxAppCore.hideinlineConfirm('alertFacility');
        _$modxAppCore.showErrorMessage('', 'success', 'divValidateMsg');
        _$modxAppCore.putAppCoreModel('PhysicianFacilityMappingMeta', '');
    },

    deleteFacilityConfirm: function () {
        var name = _GlobalPhysicianFacility.selectedFacility;
        var msg = 'Are you sure you want to delete physician from the selected facility: <b>' + name + '</b>?';
        _$modxAppCore.inlineConfirm('inlinealertMappingMsg', 'alertFacility', msg, "primary", "EV_CONFRIM_DeleteFacility", "EV_CANCELDelFacility");
        $('.in-tkt-modelCntr').scrollTop(1E10);
        $('#inlinealertMappingMsg').scrollTop(0);
    },

    deleteFacilityPhysician: async function () {
        var meta = {};
        meta.PhysicianFacilityID = $('#PhysicianFacilityID').val()

        _$modxAppCore.showErrorMessage('', 'success', 'divValidateMsg');

        _$modxAppProgressBar.show();

        var functionName = "DeleteFacilityPhysician";
        var url = _GlobalPhysicianFacility.url + functionName;
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
            $('#btnDelete').hide();
            _$modxAppCore.showErrorMessage(ajaxOut.Message, 'success', 'divValidateMsg')
            this.hidePhysicianFacilityAddUpdateForm();
            this.GetAllPhysicianFacility(Core.gridDefault);
        }
    },

    savePhysicianFacility: async function () {

        let PhysicianMap = {};
        PhysicianMap = this.extractFacilityMeta();

        if (PhysicianMap.length == 0) {
            return;
        }
        // Success!
        _$modxAppCore.showErrorMessage('', 'success', 'divValidateMsg');

        _$modxAppProgressBar.show();

        var functionName = "savePhysicianFacility";
        var url = _GlobalPhysicianFacility.url + functionName;
        var ajaxOut = await __PromisAsyncPostBack(PhysicianMap, url);
        if (ajaxOut.Success == false) {
            _$modxAppCore.showErrorMessage(ajaxOut.Message, 'error', 'divValidateMsg')
            _$modxAppProgressBar.hide();
            return;
        }
        _$modxAppProgressBar.hide();
        if (ajaxOut.Success) {
            _$modxAppProgressBar.hide();
            _$modxAppCore.showErrorMessage(ajaxOut.Message, 'success', 'divValidateMsg')

        }
        if (_GlobalPhysicianFacility.OrderId != '' && _GlobalPhysicianFacility.OrderId != null) {
            // handel order message 
            $('#divValidateMsg')
                .empty()
                .append(
                    $(
                        '<div class="error-message mt-1 mb-1 mx-1 w-100" style="color: rgb(0, 128, 0);">' +
                        '<i class="fas fa-check-circle me-1"></i>' +
                        'Physician saved for the selected facility successfully. ' +
                        '<a href="#" class="text-primary resume-order-link ms-1" data-ev="Ev_ResumeOrder">' +
                        'Click here to resume your order' +
                        '</a>' +
                        '</div>'
                    )
                );

        }
    },
    showFacilityDefaultMessage: function () {
        const html = `
        <div class="mngFaclit-empty-state text-center p-5">
            <i class="fa-solid fa-user-doctor text-muted mb-4 mngFaclit-empty-icon"></i>
            <p class="lead">
                <strong>No physicians found for this facility.</strong>
                <br>
                To add a physician to this facility, please
                <a href="#" id="lnkAddPhysician" data-ev="EV_AddPhysicianFacility" class="mngFaclit-cta-link">
                    <i class="fas fa-plus-circle me-1"  data-ev="EV_AddPhysicianFacility"></i>click here
                </a>.
            </p>
        </div>

    `;

        $('#PhyscianFacilityDefaultMsg').html(html).removeClass('d-none');
    },
    resetPage: function () {
        this.showFacilityDefaultMessage();
        $('#selClient').prop('selectedIndex', 0);

        _$modxAppCore.showErrorMessage('', 'error', 'divValidateMsg');
        $('#PhysicianFacilityGrid').html('')
        this.resetCtle();
        this.hidePhysicianFacilityAddUpdateForm();
    },

    hidePhysicianFacilityAddUpdateForm: function () {
        $('#divAddEditPhysician').addClass('d-none')
        $('#physcianDetails').addClass('d-none')
        $('#divPhysicianFacilityMap').addClass('d-none');
        $('#btnAddPhysicianFacility').css('margin-right', '0px');
        //$('#PhyscianFacilityDefaultMsg').addClass('d-none')

    },
    viewPhysicianDetails: function (ev) {
        this.hidePhysicianAddUpdateForm();
        let npi = ev && ev.target.parentElement.textContent.trim();
        Core.gridDefault.query = npi
        $('.bold-link').removeClass('bold-link');
        $('.table-primary').removeClass('table-primary');
        ev.target.parentElement.classList.remove('tr-select');
        ev.target.classList.add('bold-link');
        $('#physcianDetails').removeClass('d-none')
        this.GetAllPhysician(Core.gridDefault)
    },
    GetAllPhysician: async function (gridParam) {
        _$modxAppProgressBar.show();
        var meta = {}
        if (gridParam.query == null) {
            return;
        }
        meta.QCGridParam = gridParam;
        meta.GridName = 'PhysicianGrid';
        var functionName = "GetPhysiciansData";
        var url = _GlobalPhysicianFacility.url + functionName;
        var qcGrid = await __PromisAsyncPostBack(meta, url);
        if (qcGrid.success == false) {
            _$modxAppProgressBar.hide();
            _$modxAppCore.alert("Could not get physician data", 'Error');
            return false;
        }
        if (qcGrid.data.length == 0) {
            $('#PhysicianGrid').html('')
            Core.showFacilityDefaultMessage('#PhysicianFacilityGrid');
            _$modxAppProgressBar.hide();
            return;
        }
        Core.showNoGridDataMessage(this._PhysicianGrid.containerID, '');
        //code to plot the grid
        var grid = PhysicianFacility._PhysicianGrid;
        grid.gridData = qcGrid;
        if (PhysicianFacility._PhysicianRecCount != qcGrid.param.totalRecords) {
            grid.clearBind();
        }
        grid.bind();
        PhysicianFacility._PhysicianRecCount = qcGrid.param.totalRecords;
        _$modxAppProgressBar.hide();
        grid.onSubmit = function (gridParam) {
            PhysicianFacility.GetAllPhysician(gridParam);
        }

        grid.onRowDblClick = function (rowNum, colNum, row, colModel) {
            //_$modxAppCore.putAppCoreModel('PhysicianMeta', row);
            //_GlobalPhysicianFacility.PhysicianNPI = row.PhysicianNPI;

            //_$modxAppCore.showErrorMessage('', 'success', 'divValidateMsgMap');
            //_$modxAppCore.hideinlineConfirm('alertFacility');
            //$('#btnDelete').show();

            //$('.table-primary').removeClass('table-primary');
            //$('.tr-select').addClass('table-primary');
            //$('#btnAddPhysician').css('margin-right', '650px');
            //$('#divAddEditPhysician').removeClass('d-none');
        }
    },

    hidePhysicianAddUpdateForm: function () {
        $('#divAddEditPhysician').addClass('d-none');
        $('#btnAddPhysician').css('margin-right', '0px');

    },
    bindNpiDropdown: function (dropdownId) {
        $('#' + dropdownId).select2({
            placeholder: "Search Physician NPI...",
            minimumInputLength: 3,
            allowClear: true,
            ajax: {
                transport: function (params, success, failure) {
                    if (params.data.term && params.data.term.length >= 3) {
                        PhysicianFacility.GetAllNPI(params.data.term)
                            .then(function (data) {
                                success(data || []);
                            })
                            .catch(failure);
                    }
                },
                processResults: function (data) {
                    return {
                        results: (data || [])
                            .filter(item => item.FacilityID && item.Name)
                            .map(item => ({
                                id: item.ID,
                                text: item.Name
                            }))
                    };
                }
            }
        });
    },


    // Function to collect distinct facility IDs from DOM
    getDistinctFacilityIds: function () {
        let ids = new Set();

        $("#facilityList .facility-item span").each(function () {
            let id = $(this).data("id");
            if (id !== undefined && id !== null && id !== "") {
                ids.add(id);
            }
        });

        return Array.from(ids); // return as array
    },

    resetFacilityUI: function () {

        // Keep the first child, remove all others
        $("#facilityList").children().remove();


        // Reset search input
        $("#selFacility").val("");

        // Clear dropdown
        $("#FacilityDropdown").empty();

        let selectizeInstance = $('#inpOrderFacility')[0].selectize;

        //  full option object
        let selectedOption = selectizeInstance.options[$('#inpOrderFacility').val()];
        console.log(selectedOption);
        PhysicianFacility.initFacilityUI(selectedOption);
    },

    GePhysicianMappedFacility: async function (meta) {
        if (meta.ClientID == '') {
            _$modxAppCore.showErrorMessage('Select a client first to view facilities.', 'error', 'divValidateMsg');
            $('#inpClient').focus();
            return;
        } if (meta.PhysiciansMasterID == '') {
            _$modxAppCore.showErrorMessage('Kindly choose a physician from the Physician section before proceeding.', 'error', 'divValidateMsg');
            return;
        }
        _$modxAppCore.showErrorMessage('', 'error', 'divValidateMsg');
        const functionName = "GeClientFacility";
        const url = _GlobalPhysicianFacility.url + functionName;
        try {
            const data = await __PromisAsyncPostBack(meta, url);
            if (data.Success == true) {

                this.BindFacilityTable(data.ResultData)
            }


        } catch (e) {
            console.error(e);
            return [];
        }
    },
    BindFacilityTable: async function (dataArray) {
        // helpers
        const $ = (sel) => document.querySelector(sel);
        const show = (el) => el && el.classList.remove('d-none');
        const hide = (el) => el && el.classList.add('d-none');

        const table = $("#FacilityTable");
        const tableBody = $("#FacilityTable tbody");
        const loader = $("#FacilityLoader");
        const noData = $("#FacilityNoData");
        const noSelect = $("#FacilityNoSelection");

        // reset UI
        if (tableBody) tableBody.innerHTML = "";
        [noData, loader, noSelect].forEach(hide);
        if (table) table.style.opacity = "1";
        if (tableBody) tableBody.style.opacity = "1";

        // sections always visible for this view
        ['#facilityGrid', '#SerchFacilityDivId', '#divSaveMappingBtn'].forEach(s => show($(s)));

        // start loader (dim only the data area, not the loader)
        if (tableBody) tableBody.style.opacity = "0.4";
        show(loader);

        // ensure the loader actually paints before heavy work
        await new Promise(r => requestAnimationFrame(() => requestAnimationFrame(r)));

        try {


            // guard: no data
            if (!Array.isArray(dataArray) || dataArray.length === 0) {
                if (tableBody) {
                    const tr = document.createElement("tr");
                    tr.innerHTML = `
          <td colspan="6" class="text-center text-muted py-3">
            <i class="fa fa-info-circle me-1"></i>
            No records found for your result
          </td>`;
                    tableBody.appendChild(tr);
                }
                return;
            }

            // normalize + sort (checked first)
            const processed = dataArray.map(d => ({
                ...d,
                IsChecked: String(d.IsMappedToPhysician ?? '').toLowerCase() === 'yes'
            }))
                .sort((a, b) => (a.IsChecked === b.IsChecked) ? 0 : (a.IsChecked ? -1 : 1));

            // render rows
            const frag = document.createDocumentFragment();
            processed.forEach(d => {
                const tr = document.createElement("tr");
                tr.dataset.id = d.FacilityID ?? "";
                tr.dataset.ev = "EV_Show_MappedFacility";

                const facilityID = d.FacilityID ?? "";
                const mappingID = d.PhysicianFacilityID ?? 0;
                const name = d.FacilityName ?? "";
                const fromDate = (d.FromDate ?? "").trim();
                const toDate = (d.ToDate ?? "").trim();
                const isChecked = d.IsChecked;

                tr.innerHTML = `
        <td class="d-none facility-id">${facilityID}</td>
        <td class="d-none mapping-id">${mappingID}</td>
        <td>
          <input type="checkbox" class="form-check-input facility-checkbox" ${isChecked ? "checked" : ""}>
        </td>
        <td style="font-size:11px;">${name}</td>
        <td>
          <input type="text" class="form-control form-control-sm dt fromDate" value="${fromDate}" placeholder="mm/dd/yyyy" style="background:white;">
        </td>
        <td>
          <input type="text" class="form-control form-control-sm dt toDate" value="${toDate}" placeholder="mm/dd/yyyy" style="background:white;">
        </td>`;
                frag.appendChild(tr);
            });
            if (tableBody) tableBody.appendChild(frag);

            // let DOM settle, then init flatpickr (so spinner was visible earlier)
            await new Promise(r => requestAnimationFrame(r));
            flatpickr("#FacilityTable .fromDate", { dateFormat: "m/d/Y", allowInput: true });
            flatpickr("#FacilityTable .toDate", { dateFormat: "m/d/Y", allowInput: true });

        } finally {
            // always re-enable UI
            hide(loader);
            if (tableBody) tableBody.style.opacity = "1";
            if (table) table.style.opacity = "1";
        }
    },



    // Extract facility meta from the table
    extractFacilityMeta: function () {
        const rows = document.querySelectorAll("#FacilityTable tbody tr");
        const checkedRows = document.querySelectorAll("#FacilityTable tbody tr .facility-checkbox:checked");
        let metaArray = [];
        let hasError = false;

        // 1) Physician must be selected
        if (!_GlobalPhysicianFacility?.selPhysician) {
            _$modxAppCore.showErrorMessage("Please select at least one physician.", "error", "divValidateMsg");
            return [];
        }

        // 2) At least one facility must be checked
        if (checkedRows.length === 0) {
            _$modxAppCore.showErrorMessage("Please select at least one facility.", "error", "divValidateMsg");
            return [];
        }

        const ClientID = ($('#inpClient').val() || '').toString().trim();

        rows.forEach(row => {
            const checkbox = row.querySelector(".facility-checkbox");

            // reset visuals every loop
            row.style.border = "";
            row.style.backgroundColor = "";

            if (!checkbox || !checkbox.checked) return;

            const facilityID = parseInt((row.querySelector("td.facility-id")?.textContent || "0").trim(), 10) || 0;
            const PhysicianFacilityID = parseInt((row.querySelector("td.mapping-id")?.textContent || "0").trim(), 10) || 0;
            const name = (row.querySelector("td:nth-child(3)")?.textContent || "").trim();
            const fromDate = (row.querySelector(".fromDate")?.value || "").trim();
            const toDate = (row.querySelector(".toDate")?.value || "").trim();

            // Required dates
            if (!fromDate || !toDate) {
                hasError = true;
                row.style.border = "2px solid #f8d7da";
                _$modxAppCore.showErrorMessage(
                    `From Date and To Date are required for facility: ${name}`,
                    "error",
                    "divValidateMsg"
                );
                return; // skip this invalid row
            }

            // FromDate < ToDate
            const from = new Date(fromDate);
            const to = new Date(toDate);
            if (isNaN(from.getTime()) || isNaN(to.getTime()) || from > to) {
                hasError = true;
                row.style.border = "2px solid #f8d7da";
                _$modxAppCore.showErrorMessage(
                    `From Date must be earlier than To Date for facility: ${name}`,
                    "error",
                    "divValidateMsg"
                );
                return; // skip this invalid row
            }

            // If valid, push meta
            metaArray.push({
                ClientID: ClientID,
                PhysicianFacilityID: PhysicianFacilityID,
                FacilityID: facilityID,
                PhysiciansMasterID: _GlobalPhysicianFacility.selPhysician,
                PhysicianNPI: _GlobalPhysicianFacility.selPhysicainNPI,
                FacilityName: name,
                Location: "",
                Speciality: "",
                FromDate: fromDate,
                ToDate: toDate,
                IsChecked: true
            });
        });

        // If any row had error, return empty to block submission
        if (hasError) return [];

        // Final guard: if after validation nothing made it through
        if (metaArray.length === 0) {
            _$modxAppCore.showErrorMessage("Please select at least one facility.", "error", "divValidateMsg");
            return [];
        }

        return metaArray;
    },


    //fucntion to save new physician in mappping table 
    SavePhysicianToPhysicianFacility: async function (npi) {
        var meta = {}
        meta.PhysicianNPI = npi
        meta.ClientID = $('#inpClient').val()
        if (meta.PhysicianNPI == '') {
            _$modxAppCore.showErrorMessage('Provide npi to save new physician record.', 'error', 'divAddNpiMsg');
            return
        }

        _$modxAppCore.showErrorMessage('', 'success', 'divAddNpiMsg');

        _$modxAppProgressBar.show();

        var functionName = "SavePhysicianToPhysicianFacility";
        var url = _GlobalPhysicianFacility.url + functionName;
        var ajaxOut = await __PromisAsyncPostBack(meta, url);
        if (ajaxOut.Success == false && ajaxOut.Sender == "ExitInPhysicianFacility") {
            _$modxAppCore.showErrorMessage('A physician is already available for the mapped facility.', 'error', 'divAddNpiMsg');
            _$modxAppProgressBar.hide();
            return;
        }
        if (ajaxOut.Success == false) {

            this.showNoPhysicianMessage();
            _$modxAppProgressBar.hide();
            return;
        }

        if (ajaxOut.Success) {
            $('#npiSearch').val('')
            $('#npiDropdown').html('')
            $('#addMappedPhysicain').addClass('d-none')
            _$modxAppProgressBar.hide();
            _$modxAppCore.showErrorMessage(ajaxOut.Message, 'success', 'divAddNpiMsg')
            this.GetAllPhysicianFacility(Core.gridDefault);
        }

    },
    showNoPhysicianMessage: function () {
        const html = `
        <div class="mngFaclit-empty-state text-center p-5 m-0">
            <i class="fa-solid fa-user-md text-muted mb-4 mngFaclit-empty-icon"></i>
            <p class="mb-0">
                <strong>No record found for your search in the Physician Master.</strong>
            </p>
            <p>
                You can 
                <a href="#" id="lnkAddPhysician" data-ev="EV_AddPhysician" class="mngFaclit-cta-link">
                    <i class="fas fa-plus-circle me-1"></i>Click here to add a physician
                </a> 
                or navigate to the <strong>Physician Master</strong> section to add one.
            </p>
        </div>
    `;

        $('#PhysicianNoSelection').html(html).removeClass('d-none');
        $('#PhysicianTabl').addClass('d-none')
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
        _$modxAppCore.showErrorMessage('', 'success', 'divValidateMsgMap');

        _$modxAppProgressBar.show();
        meta.Source = 'PhysicianFacility'
        var functionName = "SavePhysicianMaster";
        var url = '../../../apix/ManagePhysician/' + functionName;
        var ajaxOut = await __PromisAsyncPostBack(meta, url);
        if (ajaxOut.Success == false) {
            _$modxAppCore.showErrorMessage(ajaxOut.Message, 'error', 'divValidateMsgMap')
            _$modxAppProgressBar.hide();
            return;
        }

        if (ajaxOut.Success) {
            _$modxAppProgressBar.hide();
            _$modxAppCore.showErrorMessage(ajaxOut.Message, 'success', 'divValidateMsgMap')
            this.GetAllPhysicianFacility(Core.gridDefault);

        }
    },
    resetFacilityUI: function () {
        _$modxAppCore.showErrorMessage('', 'success', 'divAddNpiMsg');
        $('#PhysicianTabl').removeClass('d-none')
        $('#npiSearch').val('')
        $('#facilityGrid').addClass('d-none')
        $('#SerchFacilityDivId').addClass('d-none')
        $('#divSaveMappingBtn').addClass('d-none')
        $('#FacilityNoSelection').removeClass('d-none')
    },
    handleEvent: function (ev) {
        var target = ev.target;
        var evCase = target.getAttribute('data-ev');

        switch (evCase) {
            case 'EV_CloseSubMenu':
                $('#FacilityPhysician').removeClass('custom-margin-dictionary')
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

            case 'EV_AddPhysicianFacility':
                $('#btnAddPhysicianFacility').css('margin-right', '510px');
                $('#FacilityNoMsg').css('margin-left', '-200px');
                $('#divPhysicianFacilityMap').removeClass('d-none');
                $("#npiDropdown").children().remove();
                this.resetCtle();
                $('#inpName').focus();
                break;

            //case 'EV_Facility_Change':
            //    if (ev.type == 'change') {
            //        this.hidePhysicianFacilityAddUpdateForm() //-----------------Hide form
            //        this.GetAllPhysicianFacility(Core.gridDefault);
            //    }
            //    break;;
            case 'Ev_OnChange_Client':
                if (ev.type == 'change') {
                    this.resetFacilityUI();
                    this.GetFacilityList();
                    this.GetAllPhysicianFacility(Core.gridDefault);
                }
                break;
            case 'EV_SaveMapping':
                this.savePhysicianFacility();
                break;

            case 'EV_ManagePhysicianFacility':
                this.resetPage();
                break;

            case 'EV_DeleteMapping':
                this.deleteFacilityConfirm();
                break;

            case 'EV_CANCELDelFacility':
                _$modxAppCore.hideinlineConfirm('alertFacility');
                break;

            case 'EV_CONFRIM_DeleteFacility':
                this.deleteFacilityPhysician();
                break;
            case 'EV_ClosePhysicianFacilityMap':
                this.hidePhysicianFacilityAddUpdateForm();
                break;

            case 'EV_ViewPhysicianDetail':
                this.viewPhysicianDetails(ev);
                break;

            //case 'EV_SavePhysician':
            //    this.SavePhysicianToPhysicianFacility()
            //    break;
            case 'EV_CloseAddUpdatePhysician':
                this.hidePhysicianAddUpdateForm();
                break;
            case 'EV_Save':
                this.savePhysician();
                break;

            case 'Ev_showPhysicanDetails':
                this.GetNpiDrDetail();
                break;

            case 'Show_Add_Physician':
                const val = $('#npiSearch').val().trim();
                if (!isNaN(val) && val !== '') {
                    this.SavePhysicianToPhysicianFacility(val);
                } else {
                    $('#addMappedPhysicain').removeClass('d-none');
                    $('#inpPhysicianNpi').focus();
                }
               
                break;
            case 'EV_AddMappedPhysician':
                const npi = $('#inpPhysicianNpi').val().trim();
                this.SavePhysicianToPhysicianFacility(npi);
                break;
            case 'Ev_Save_PhysicianFacility':
                this.savePhysicianFacility();

                break;

            case 'EV_SearchPhysicin':
                this.resetFacilityUI();
                this.GetAllPhysicianFacility(Core.gridDefault);
                break;

            case 'EV_AddPhysician':
                Core.getStateList('inpState');
                $('#divAddEditPhysician').removeClass('d-none');

                break;
            case 'Ev_searchFacility':
                var meta = {};
                meta.Name = $('#inpSearchByFacility').val().trim();
                meta.PhysiciansMasterID = _GlobalPhysicianFacility.selPhysician
                meta.ClientID = $('#inpClient').val().trim();
                if (meta.Name == '') {
                    $('#inpSearchByFacility').focus();
                    retur;
                }
                this.GePhysicianMappedFacility(meta);
                break;

            case 'EV_Save_PhysicainMaster':
                this.savePhysician();
                break;
            case 'EV_ResetPhysician':
                window.location.reload(true);
                break;
            case 'Ev_ResumeOrder':
                const orderId = _GlobalPhysicianFacility.OrderId;
                const status = 'ResumeOrder';
                const encodedId = btoa(orderId);
                const encodedStatus = btoa(status);
                // Build URL with encoded query parameters
                window.location.href = "orderEntry.html?id=" + encodedId + "&status=" + encodedStatus;
                break;
            case 'Ev_searchPhysician':
                break;

        }
    }
}


PhysicianFacility.Init();

$(document).ready(function () {
    var postbackUrl = "../../../apix/UserSession/GetUserRolesByPage";
    var meta = {};
    meta.PageName = 'manageFacilityPhysician.html';

    __DoAsyncPostBack(meta, postbackUrl, function (ajxOut) {
        if (ajxOut.Success == false) {
            return '';
        }

        if (ajxOut.Success == true) {
            var rolValue = ajxOut.ResultData;
            if (rolValue.includes('A') == false && rolValue.includes('E') == false) {
                $('#saveBtn').remove();
            }
        }
    });
});