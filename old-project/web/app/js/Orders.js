"use strict"
var _GlobalOrders = {
    url: '../../../apix/Orders/',
    OrderID: 0,

};
var Orders = {
    _OrderListGrid: {},
    Init: function () {
        document.getElementById('divMain').addEventListener('click', this);
        document.getElementById('searchType').addEventListener('change', this);

        $('.accordion-content-dict').css('display', 'block');
        $(document).on('focus', '.dt', function () {
            if (!this._flatpickr) {
                flatpickr(this, {
                    dateFormat: "m-d-Y",
                    defaultDate: null,
                    onChange: function (selectedDates, dateStr, instance) {
                        instance.close();
                    }
                });
            }
        });
        $(document).on('focus', '.sdl', function () {
            if (!this._flatpickr) {
                flatpickr(this, {
                    dateFormat: "m-d-Y",
                    defaultDate: null,
                    minDate: new Date(), // minimum date is today
                    allowInput: true,
                    disableMobile: true,
                    clickOpens: true,
                    onChange: function (selectedDates, dateStr, instance) {
                        instance.close();
                    }
                });
            }
        });

        this.showSubMenu();
        this.showDefaultMessage();
        this.initilizeGridsonPage();
        OrdersAdvanceSearch.Init();
        let UrlParmMea = this.getOrderMetaFromUrl();

        if (UrlParmMea.status.trim() !== "") {
            // Define status - submenu mapping
            const statusMap = {
                "Draft": "EV_Init_DraftOrders",
                "Submitted": "EV_Init_SubmittedOrders",
                "Cancelled": "EV_Init_CancelledOrders",
                "Scheduled": "EV_Init_ScheduledOrders"
            };

            // Reset all submenu highlights
            $("#subMenuList li[data-ev]").css({
                "background-color": "",
                "border-radius": "4px"
            });

            // Apply highlight to active one
            const activeKey = statusMap[UrlParmMea.status];
            if (activeKey) {
                $(`#subMenuList li[data-ev='${activeKey}']`).css({
                    "background-color": "lightgray",
                    "transition": "background-color 0.3s ease"
                });
            }

            // Hide preview section and load orders
            $('#OrderPreviewSection').addClass('d-none');

            // Load data asynchronously
            Orders.GetOrderList(Core.gridDefault, UrlParmMea.status)
                .then(() => {
                    _GlobalOrders.OrderID = UrlParmMea.OrderId;
                    $('tbody[data-evl="EVL_QC_BODY"] tr:first')
                        .addClass('tr-select table-primary');
                    Orders.populateOrderPreviewSection(_GlobalOrders.OrderID);
                })
                .catch(err => {
                    console.error("Error while loading data:", err);
                });

        } else {
            this.GetOrderList(Core.gridDefault, 'All Orders');
        }

    },
    showSubMenu: function () {
        $("body").addClass("sidebar-icon-only");
        $('#theme-settings').css('display', 'block')
        $('#submenuIcon').remove();
    },
    getOrderMetaFromUrl: function () {
        const params = new URLSearchParams(window.location.search);
        const meta = { OrderId: '', status: '' };

        // Decode ID
        const encodedId = params.get("OrderId");
        if (encodedId) {
            try {
                meta.OrderId = atob(encodedId);
            } catch (e) {
                console.error("Invalid Base64 value for id:", encodedId);
            }
        }

        // Decode Status
        const encodedStatus = params.get("status");
        if (encodedStatus) {
            try {
                meta.status = atob(encodedStatus);
            } catch (e) {
                console.error("Invalid Base64 value for status:", encodedStatus);
            }
        }

        return meta;
    },
    showDefaultMessage: function () {
        Core.showNoGridDataMessage('defaultMsg', "Please choose a menu item.")
    },
    initilizeGridsonPage: function () {
        //PhysicianFacility Grid
        this._OrderListGrid = new QCGrid();
        this._OrderListGrid.width = '100%';
        this._OrderListGrid.height = 'calc(52vh - 160px)';
        this._OrderListGrid.id = 'tblOrdersGrid'
        this._OrderListGrid.containerID = 'OrdersGrid';
        this._OrderListGrid.class = 'table table-bordered table-striped table-hover gridLayoutFix';

    },
    GetOrderList: async function (gridParam, orderStaus, advanceSearchMeta) {
        _$modxAppProgressBar.show();
        let meta = {}
        const valMeta = _$modxAppCore.getAppCoreModel('ValMeta');
        if (valMeta.SearchVal.trim() != '') {
            Core.gridDefault.query = valMeta.SearchVal.trim();
            Core.gridDefault.queryType = $('#searchType').val();
        }
        if (orderStaus == 'advanceSearch') {
            Core.gridDefault.queryType = orderStaus
            meta.orderAdvanceSearchMeta = advanceSearchMeta
        }
        meta.OrderStatus = orderStaus
        meta.QCGridParam = gridParam;

        let fucntionName = 'GetOrdersList';
        var url = _GlobalOrders.url + fucntionName;
        var qcGrid = await __PromisAsyncPostBack(meta, url);
        var grid = Orders._OrderListGrid;
        if (!qcGrid.success) {
            this.hideSummary();
            _$modxAppProgressBar.hide();
            return false;
        }
        if (qcGrid.data.length == 0) {
            this.hideSummary();
            grid.clearBind();
            $("#" + grid.containerID).html("No records found matching your search criteria.");
            _$modxAppProgressBar.hide();
            return;
        }
        $('#defaultMsg').addClass('d-none')
        this.hideSummary();
        //code to plot the grid
        grid.gridData = qcGrid;
        grid.clearBind();
        grid.bind();
        _$modxAppProgressBar.hide();

        grid.onSubmit = function (gridParam) {
            Orders.GetOrderList(gridParam, orderStaus, advanceSearchMeta)
        }

        grid.onRowDblClick = function (rowNum, colNum, row, colModel) {
            $('.table-primary').removeClass('table-primary');
            $('.tr-select').addClass('table-primary');
            Orders.populateOrderPreviewSection(row.OrderId);
            if (orderStaus == "Submitted") {
                _GlobalOrders.OrderId = row.OrderId
                _$modxAppCore.showErrorMessage('', 'error', 'orderErrorMsg')
                $('#cancelOrder').removeClass('d-none')
            } else if (orderStaus == "Scheduled") {
                _GlobalOrders.OrderId = row.OrderId
                _$modxAppCore.showErrorMessage('', 'error', 'orderErrorMsg')
                $("#btnScheduleOrder").html('<i class="fas fa-calendar-plus me-1" data-ev="EV_Schedule_Ord"></i> Reschedule');
                $('#cancelOrder').removeClass('d-none')
            } else if (orderStaus == "Cancelled") {
                Orders.getOrderCancelStatus(row.OrderId)
            }
        }
    },
    hideSummary: function () {
        $('.table-primary').removeClass('table-primary');
        $('#OrderPreviewSection').addClass('d-none')
    },
    populateOrderPreviewSection: async function (OrderId) {
        _$modxAppProgressBar.show();
        let meta = {}
        meta.OrderId = OrderId
        var functionName = "GetOrderPreviewInforamtion";
        var url = '../../../apix/OrdersEntery/' + functionName;
        var ajaxOut = await __PromisAsyncPostBack(meta, url);
        $('#OrderPreviewSection').removeClass('d-none')
        Core.applyOrderPreview(ajaxOut)
        OrderScheduler.renderOrderScheduling(ajaxOut, 'order-schedule-container', (payload) => {
            this.saveScheduleInformation(payload);
        });
        _$modxAppProgressBar.hide();

    },
    getOrderCancelStatus: async function (OrderId) {
 
        let meta = {}
        meta.OrderID = OrderId
        var functionName = "GetOrderCancelStatus";
        var url = '../../../apix/Orders/' + functionName;
        var ajaxOut = await __PromisAsyncPostBack(meta, url);
        let data = ajaxOut.ResultData;
        $('#OrderPreviewSection').removeClass('d-none')
        $('#CancelReaonInfo').removeClass('d-none')
        $("#valCancelReason").text(data.CancelReason);
        $("#valCancelBy").text(data.CancelBy);
        $("#valCancelDate").text(data.CancelDate);
 
 
    },
    applyOrderPreview: (data) => {
        $('#OrderNumber').html(data.ResultData.OrderNumber);
        $('#OrderDate').html(data.ResultData.SubmitDate);
        $('#OrderDate_submit').html(data.ResultData.SubmitDate);
        $('#Location').html(data.ResultData.Location);
        $('#SubmittedBy').html(data.ResultData.SubmittedBy);
        $('#PatientName').html(data.ResultData.PatientName);
        $('#DOB').html(data.ResultData.PatientDOB);
        $('#MRN').html(data.ResultData.MRN);
        $('#ProviderName').html(data.ResultData.Provider);
        $('#NPI').html(data.ResultData.ProviderInfo);

        // --- Recurring details ---
        const isRecurring = data.ResultData.IsRecurring || '';
        const recurringFreq = data.ResultData.RecurringFrequency || '';
        const recurringEndDate = data.ResultData.RecurringEndDate || '';

        $('#IsRecurring').html(isRecurring);
        $('#RecurringFrequency').html(recurringFreq);
        $('#RecurringEndDate').html(recurringEndDate);

        if (recurringFreq !== '' && recurringEndDate !== '') {
            $('#headerReccuring').removeClass('d-none');
        }

        // Existing order items preview

        // Documents list  
        const docs =
            data?.ResultData?.orderDocumentMetas ??
            data?.ResultData?.orderDocumentMetas ??
            [];

        Orders.buildOrderDocumentsList(docs, '#orderDocsHost', 'Ev_open_document');
        Orders.buildOrderItemsPreview(data.CommandArgs, '#orderItemsHost');
    },
    
   


    saveCancelReason: async function () {
        var meta = {};
        meta.OrderID = _GlobalOrders.OrderId
        if (meta.OrderID == '') {
            return;
        }
        meta.CancelReason = $('#CancelNotes').val().trim();
        if (meta.CancelReason == '') {
            _$modxAppCore.showErrorMessage("Please enter a cancellation reason for this order.", 'error', 'orderErrorMsg')
            return
        }
        _$modxAppProgressBar.show();
        var functionName = "SaveOrderCancelStatus";
        var url = '../../../apix/OrdersEntery/' + functionName;
        var ajaxOut = await __PromisAsyncPostBack(meta, url);
        if (ajaxOut.Success == false) {
            _$modxAppCore.showErrorMessage(ajaxOut.Message, 'error', 'orderErrorMsg')
            _$modxAppProgressBar.hide();
            return;
        }
        window.location.href = "../app/orders.html";
        _$modxAppProgressBar.hide();
    },
    saveScheduleInformation: async function (meta) {
        let scheduleMeta = {}
        scheduleMeta.orderNumber = meta.orderNumber;
        scheduleMeta.scheduleDate = meta.scheduleDate;
        scheduleMeta.level = meta.level;
        _$modxAppProgressBar.show();
        var functionName = "SaveScheduleInformation";
        var url = '../../../apix/Orders/' + functionName;
        var ajaxOut = await __PromisAsyncPostBack(scheduleMeta, url);
        if (ajaxOut.Success == false) {
            _$modxAppCore.showErrorMessage(ajaxOut.Message, 'error', 'orderErrorMsg')
            _$modxAppProgressBar.hide();
            return;
        }
        _$modxAppCore.showErrorMessage(ajaxOut.Message, 'sucess', 'orderErrorMsg')
        _$modxAppProgressBar.hide();
    },
    toggleInstructionVissiblity: function (targetId) {
        $('#searchType').val('')
        $('#CancelReaonInfo').addClass('d-none')
        Core.gridDefault.queryType = ''
        _$modxAppCore.showErrorMessage("", 'error', 'orderErrorMsg')
        const container = document.getElementById('searchVal');
        container.innerHTML = `
                  <label for="searchValue" class="fw-bold mb-1">Search Value</label>
                <input type="text" class="form-control form-control-sm" 
                       id="searchVal" placeholder="Enter Search Value..." 
                       autocomplete="off" data-model-prop="SearchVal" 
                       style="background:white;">`
        $('#ordAcc_panel_0_0 ul.list-unstyled.mb-0.small').each(function () {
            if (this.id === targetId) {
                $(this).removeClass('d-none');
            } else {
                $(this).addClass('d-none');
            }
        });
    },
    highlightSelectedMenu: function (evValue) {

        // Remove active class from all menu items
        $("#subMenuList li").removeClass("active");

        // Add active class to the selected menu item
        $("#subMenuList li[data-ev='" + evValue + "']").addClass("active");
    },

    handleSearchTypeChange: function (optionVal) {
        const container = document.getElementById('searchVal');
        // clear any existing content
        container.innerHTML = '';
        switch (optionVal) {
            case 'orderType':
                container.innerHTML = `
                  <label for="searchValue" class="fw-bold mb-1">Search Value</label>
                <select class="form-select form-select-sm" id="searchVal" data-model-prop="SearchVal" style="background:white;">
                    <option value="1">Diagnostic Imaging</option>
                    <option value="2">Home Health</option>
                    <option value="4">Laboratory</option>
                    <option value="5">Skilled Nursing</option>
                </select>
            `;
                break;

            case 'orderStatus':
                container.innerHTML = `
                  <label for="searchValue" class="fw-bold mb-1">Search Value</label>
                <select class="form-select form-select-sm" id="searchVal" data-model-prop="SearchVal" style="background:white;">
                    <option value="All Orders">All Orders</option>
                    <option value="Cancelled">Cancelled</option>
                    <option value="Draft">Draft</option>
                    <option value="Submitted">Submitted</option>
                    <option value="Scheduled">Scheduled</option>
                </select>
            `;
                break;
            case 'priority':
                container.innerHTML = `
                <label for="searchValue" class="fw-bold mb-1">Search Value</label>
                <select class="form-select form-select-sm" id="searchVal" data-model-prop="SearchVal" style="background:white;">
                    <option value="Critical">Critical</option>
                    <option value="High">High</option>
                    <option value="Standard">Standard</option>
                </select>
            `;
                break;
            case 'patientDob':
            case 'requestedDos':
                container.innerHTML = `
                <label for="searchValue" class="fw-bold mb-1">Search Value</label>
              <input  type="text" class="form-control form-control-sm dt fromDate flatpickr-input active" value="" placeholder="mm/dd/yyyy"
                       id="searchVal"  
                       autocomplete="off" data-model-prop="SearchVal"
                       style="background:white;">
            `;
                break;
            case 'serviceLocationId':
                container.innerHTML = `
                  <label for="searchValue" class="fw-bold mb-1">Search Value</label>
                 <select class="form-select form-select-sm" data-model-prop="SearchVal" id="inpServiceLocationCode">
                                                    <option value="01">01: Pharmacy</option>
                                                    <option value="02">02: Telehealth Provided Other Than in Patient's Home</option>
                                                    <option value="03">03: School</option>
                                                    <option value="04">04: Homeless Shelter</option>
                                                    <option value="11">11: Office</option>
                                                    <option value="12">12: Home</option>
                                                    <option value="15">15: Mobile Unit</option>
                                                    <option value="17">17: Walk-in Retail Health Clinic</option>
                                                    <option value="19">19: Off Campus-Outpatient Hospital</option>
                                                    <option value="20">20: Urgent Care Facility</option>
                                                    <option value="21">21: Inpatient Hospital</option>
                                                    <option value="22">22: On Campus-Outpatient Hospital</option>
                                                    <option value="23">23: Emergency Room – Hospital</option>
                                                    <option value="24">24: Ambulatory Surgical Center</option>
                                                    <option value="31">31: Skilled Nursing Facility</option>
                                                    <option value="32">32: Nursing Facility</option>
                                                    <option value="50">50: Federally Qualified Health Center</option>
                                                    <option value="72">72: Rural Health Clinic</option>
                                                </select>
                `
                break;
            case 'patientSSN':
                container.innerHTML = `
                  <label for="searchValue" class="fw-bold mb-1">Search Value</label>
                  <input type="text"
                       class="form-control form-control-sm"
                       maxlength="11"
                       data-model-prop="SearchVal"
                       id="searchVal"
                       placeholder="XXX-XX-XXXX"
                       pattern="\\d{3}-\\d{2}-\\d{4}"
                       title="Enter a valid SSN (XXX-XX-XXXX)"
                       oninput="Core.formatSSN(this)">
            `;
                break
            default:
                container.innerHTML = `
                  <label for="searchValue" class="fw-bold mb-1">Search Value</label>
                <input type="text" class="form-control form-control-sm" 
                       id="searchVal" placeholder="Enter Search Value..." 
                       autocomplete="off" data-model-prop="SearchVal" 
                       style="background:white;">
            `;
                break;
        }
    },
    getSelectedStatus: function () {
        const selected = $("#subMenuList li.active").text().trim();
        if (selected) {
            return selected;
        } else {
            return null;
        }
    },
    downlaodOrders: function (gridParam) {
        let meta = {}
        let orderStaus = '';
       let advanceSearchMeta = this.getAdvancedFilters('#filterContainer');
        if (Object.keys(advanceSearchMeta).length != 0) {
            Core.gridDefault.queryType = 'advanceSearch'
            meta.orderAdvanceSearchMeta = advanceSearchMeta
        } else {
                meta.OrderStatus= $("#subMenuList li.active").text().trim();
        }
        
        const valMeta = _$modxAppCore.getAppCoreModel('ValMeta');
        if (valMeta.SearchVal.trim() != '') {
            Core.gridDefault.query = valMeta.SearchVal.trim();
            Core.gridDefault.queryType = $('#searchType').val();
            meta.OrderStatus = 'All Orders'
        }
       
        meta.QCGridParam = gridParam;

        download.DownloadData('Orders', 'DownloadOrders', meta, 'downloadStatusArea');
    },
    getAdvancedFilters: function () {
        const filters = {};

        $("#filterContainer .adv-filter-row").each(function () {
            const key = $(this).data("key");
            const val = $(this).find("input, select").val();
            filters[key] = val;
        });

        return filters;
    },
    showSubMenu: function () {
        $('#PatientTbl').addClass('custom-margin-dictionary')
        $('#OrderPreviewSection').addClass('custom-margin-dictionary')
        $('#cancelOrder').addClass('custom-margin-dictionary')
        $("body").addClass("sidebar-icon-only");
        $('#theme-settings').css('display', 'block')
        $('#submenuIcon').remove();
    },
    handleEvent: function (ev) {
        var target = ev.target;
        var evCase = target.getAttribute('data-ev');


        switch (evCase) {
            case 'EV_Init_AllOrders':
                this.toggleInstructionVissiblity('OrdersAllIns')
                $('#OrderPreviewSection').addClass('d-none')
                $('#cancelOrder').addClass('d-none')
                this.highlightSelectedMenu(evCase);
                this.GetOrderList(Core.gridDefault, 'All Orders');
                break;
            case 'EV_Init_DraftOrders':
                this.toggleInstructionVissiblity('OrdersDraftIns')
                $('#OrderPreviewSection').addClass('d-none')
                $('#cancelOrder').addClass('d-none')
                this.highlightSelectedMenu(evCase);
                this.GetOrderList(Core.gridDefault, 'Draft');
                break;
            case 'EV_Init_SubmittedOrders':
                this.toggleInstructionVissiblity('OrdersSubmittedIns')
                $('#OrderPreviewSection').addClass('d-none')
                $('#cancelOrder').addClass('d-none')
                this.highlightSelectedMenu(evCase);
                this.GetOrderList(Core.gridDefault, 'Submitted');
                break;
            case 'EV_EditDraftOrder':
                var orderId = ev.target.getAttribute("data-id");
                var orderStatus = "Draft";

                // Encode both orderId and orderStatus in query params
                const encodedId = btoa(orderId);
                const encodedStatus = btoa(orderStatus);

                window.location.href = "orderEntry.html?id=" + encodedId + "&status=" + encodedStatus;
                break;

            case 'Ev_open_document':
                Core.downloadDocument(ev);
                break;

            case 'EV_Init_CancelledOrders':
                this.toggleInstructionVissiblity('OrdersCancelledIns')
                $('#OrderPreviewSection').addClass('d-none')
                $('#cancelOrder').addClass('d-none')
                this.highlightSelectedMenu(evCase);
                this.GetOrderList(Core.gridDefault, 'Cancelled');
                break;

            case 'EV_Init_ScheduledOrders':
                this.toggleInstructionVissiblity('OrdersScheduledIns')
                $('#OrderPreviewSection').addClass('d-none')
                $('#cancelOrder').addClass('d-none')
                this.highlightSelectedMenu(evCase);
                this.GetOrderList(Core.gridDefault, 'Scheduled');
                break;

            case 'EV_Cancel_Ord':
                $('#cancelNotesDiv').removeClass('d-none')
                $('#order-schedule-container').addClass('d-none')
                $('#orderScheduleMsg').addClass('d-none')
                $('#CancelNotes').focus();
                break;

            case 'EV_Save_CancelRsn':
                $('#cancelNotesDiv').addClass('d-none')
                $('#orderScheduleMsg').removeClass('d-none')
                break;
            case 'EV_SaveCancelRsn':
                this.saveCancelReason();
                break;
            case 'EV_Schedule_Ord':
                $('#order-schedule-container').focus();
                $('#cancelNotesDiv').addClass('d-none')
                $('#orderScheduleMsg').removeClass('d-none')
                $('#order-schedule-container').removeClass('d-none')
                break;
            case 'Ev_SearchPhysOption':
                if (ev.type == 'change') {
                    _$modxAppCore.putAppCoreModel('ValMeta', {});
                    const searchType = $('#searchType').val()
                    this.handleSearchTypeChange(searchType);
                }
                break;
            case 'Ev_searchOrders':
                if ($('#searchType').val().trim() == '') {
                    return;
                }
                const status = this.getSelectedStatus()
                this.GetOrderList(Core.gridDefault, status);
                break;

            case 'Ev_Downlaod_Orders':
                // Show loading state or disable apply button (optional)
                $('#btnDownloadOrder').prop('disabled', true).text('Downloading...');
                this.downlaodOrders(Core.gridDefault);
                break;

            case 'Ev_Close_DownloadProgress':
                $('#downloadStatusArea').html('');
                break;
            case 'EV_CloseSubMenu':
                $('#PatientTbl').removeClass('custom-margin-dictionary')
                $('#OrderPreviewSection').removeClass('custom-margin-dictionary')
                $('#cancelOrder').removeClass('custom-margin-dictionary')
                Core.closeSubMenu();
                break;
            case 'EV_ShowSubMenu':
                this.showSubMenu();
                break;

        }
    }
}
const OrderScheduler = {
    renderOrderScheduling: function (ajaxOut, containerId, onSave = (p) => console.log('Saved', p)) {
        if (!ajaxOut || !containerId) return;
        const el = document.getElementById(containerId);
        if (!el) { console.error('Container not found:', containerId); return; }
        el.innerHTML = '';

        const toHtmlDate = (val) => {
            if (!val || val === '--') return '';
            if (/^\d{4}-\d{2}-\d{2}$/.test(val)) return val;
            const m = val.match(/^(\d{2})[-\/](\d{2})[-\/](\d{4})$/);
            return m ? `${m[3]}-${m[1]}-${m[2]}` : '';
        };

        const setSaving = (btn, saving = true) => {
            if (!btn) return;
            btn.disabled = !!saving;
            btn.innerHTML = saving
                ? '<i class="fas fa-spinner fa-spin"></i>'
                : '<i class="fas fa-save"></i>';
        };

        const header = ajaxOut.ResultData || {};
        const items = Array.isArray(ajaxOut.CommandArgs) ? ajaxOut.CommandArgs : [];
        const orderId = header.OrderNumber || 'ORDER';

        // Card
        const card = document.createElement('div');
        el.appendChild(card);

        // Card Header (Order level)
        const headerEl = document.createElement('div');
        headerEl.className = 'card-header p-0';
        headerEl.innerHTML = `
            <div class="d-flex flex-wrap align-items-center justify-content-between gap-2">
              <div class="d-flex align-items-center flex-wrap gap-3">
                <div class="d-flex">
                  <input class="mx-2 ordPrv-k" type="checkbox" id="os_chk_${orderId}">
                  <label class="form-check-label fw-semibold" for="os_chk_${orderId}">
                    Is Order Reviewed
                  </label>
                </div>
                <div class="text-muted small">
                  <span class="fw-semibold me-1">Order#:</span>
                  <span>${orderId}</span>
                </div>
              </div>

              <div class="ms-auto d-flex align-items-center gap-2 flex-wrap justify-content-end" style="min-width: 260px;">
                <div class="input-group input-group-sm flex-nowrap" style="max-width: 260px;">
                  <span class="input-group-text text-nowrap bg-light fw-semibold">Schedule Date</span>
                  <input type="date"
                         id="os_order_date_${orderId}"
                         class="form-control sdl"
                          autocomplete="off"
                         aria-label="Schedule Date" style="height: 30px;" placeholder = "mm-dd-yyyy">
                </div>
                <button id="os_btn_save_order_${orderId}" class="custom-del-btn btn-outline-primary" title="Save">
                  <i class="fas fa-save"></i>
                </button>
              </div>
            </div>`;
        card.appendChild(headerEl);

        // Card Body (Items nested)
        const body = document.createElement('div');
        body.className = 'card-body py-2';
        card.appendChild(body);

        const nested = document.createElement('div');
        nested.className = 'mx-4 border-start border-3 border-info';
        body.appendChild(nested);

        const table = document.createElement('table');
        table.className = 'table table-sm align-middle mb-0 table-hover';
        nested.appendChild(table);

        const tbody = document.createElement('tbody');
        table.appendChild(tbody);

        // --- ITEM LOOP ---
        items.forEach((item, idx) => {
            const itemId = `${orderId}_item_${idx}`;
            const tr = document.createElement('tr');
            tr.innerHTML = `
              <td style="max-width:fit-content !important;" class="tblePadding">
                <div class="form-check m-0">
                  <input class="form-check-input mx-2" type="checkbox" id="os_chk_${itemId}">
                  <label class="form-check-label" for="os_chk_${itemId}">Is Order Item Reviewed</label>
                </div>
              </td>
              <td class="tblePadding">
                <div class="text-muted small">
                  <span class="fw-semibold me-1">Order Item Number:</span><span>${item?.OrderNumber ?? '--'}</span>
                </div>
              </td>
              <td class="text-end tblePadding" style="max-width:fit-content !important;">
                <label class="small">Schedule Date</label>
                <input type="date" id="os_item_date_${itemId}" class="form-control form-control-sm sdl d-inline-block"
                       style="max-width: 180px;" placeholder = "mm-dd-yyyy"
                        autocomplete="off" />
                <button id="os_btn_save_${itemId}" class="custom-del-btn btn-outline-primary" title="Save">
                  <i class="fas fa-save"></i>
                </button>
              </td>`;
            tbody.appendChild(tr);

            // Wire up
            const chk = tr.querySelector(`#os_chk_${itemId}`);
            const dateEl = tr.querySelector(`#os_item_date_${itemId}`);
            const btnSave = tr.querySelector(`#os_btn_save_${itemId}`);

            chk.addEventListener('change', () => {
                tr.classList.toggle('table-active', chk.checked);
            });

            btnSave.addEventListener('click', async () => {
                const isChecked = chk?.checked;
                const dateValue = dateEl?.value?.trim();

                if (!isChecked) {
                    _$modxAppCore.showErrorMessage('Please check the confirmation checkbox before saving the item.', 'error', 'orderErrorMsg');
                    return;
                }
                if (!dateValue) {
                    _$modxAppCore.showErrorMessage('Please select or enter a valid date before saving the item.', 'error', 'orderErrorMsg');
                    return;
                }

                _$modxAppCore.showErrorMessage('', 'error', 'orderErrorMsg');

                const payload = {
                    level: 'item',
                    orderNumber: item?.OrderNumber ?? orderId,
                    itemIndex: idx,
                    scheduleDate: dateValue,
                    itemMeta: item
                };

                try {
                    setSaving(btnSave, true);
                    await Promise.resolve(onSave(payload));
                } catch (error) {
                    console.error('Error while saving item:', error);
                } finally {
                    setSaving(btnSave, false);
                }
            });
        });

        // --- ORDER HEADER EVENTS ---
        const chkOrder = headerEl.querySelector(`#os_chk_${orderId}`);
        const orderDate = headerEl.querySelector(`#os_order_date_${orderId}`);
        const btnSaveOrder = headerEl.querySelector(`#os_btn_save_order_${orderId}`);

        const setItemsHidden = (hide) => {
            nested.classList.toggle('d-none', hide);
            nested.querySelectorAll('input,button,select,textarea').forEach(el => el.disabled = hide);
        };

        chkOrder.addEventListener('change', (e) => setItemsHidden(e.target.checked));

        btnSaveOrder.addEventListener('click', async () => {
            const isChecked = chkOrder?.checked;
            const dateValue = orderDate?.value?.trim();

            if (!isChecked) {
                _$modxAppCore.showErrorMessage('Please check the confirmation checkbox before saving the order.', 'error', 'orderErrorMsg');
                return;
            }
            if (!dateValue) {
                _$modxAppCore.showErrorMessage('Please select or enter a valid date before saving the order.', 'error', 'orderErrorMsg');
                return;
            }

            _$modxAppCore.showErrorMessage('', 'error', 'orderErrorMsg');

            const payload = {
                level: 'order',
                orderNumber: orderId,
                scheduleDate: dateValue,
                headerMeta: header
            };

            try {
                setSaving(btnSaveOrder, true);
                await Promise.resolve(onSave(payload));
            } catch (error) {
                console.error('Error while saving order:', error);
            } finally {
                setSaving(btnSaveOrder, false);
            }
        });

        // Default hide if recurring
        if (String(header?.IsRecurring || '').toLowerCase() === 'yes') {
            chkOrder.checked = true;
            setItemsHidden(true);
        }
    }
};

var OrdersAdvanceSearch = {

    Init: function () {
        this.filterContainer = $('#filterContainer');

        this.filterTemplates = {
            orderNumber: this.CreateTextInput,
            orderType: this.CreateSelectInput([
                { value: '1', label: 'Diagnostic Imaging' },
                { value: '2', label: 'Home Health' },
                { value: '4', label: 'Laboratory' },
                { value: '5', label: 'Skilled Nursing' }
            ]),
            orderingProviderNpi: this.CreateTextInput,
            patientName: this.CreateTextInput,
            patientDOB: this.CreateDateInput,
            patientGender: this.CreateSelectInput([
                { value: 'Male', label: 'Male' },
                { value: 'Female', label: 'Female' },
                { value: 'Other', label: 'Other' }
            ]),
            patientSSN: this.CreateTextSSNInput,
            requestedDos: this.CreateDateInput,
            cptCode: this.CreateTextInput,
            orderStatus: this.CreateSelectInput([
                { value: 'Cancelled', label: 'Cancelled' },
                { value: 'Draft', label: 'Draft' },
                { value: 'Submitted', label: 'Submitted' },
                { value: 'Scheduled', label: 'Scheduled' }
            ]),
            serviceLocationId: this.CreateSelectInput([
                { value: '01', label: '01: Pharmacy' },
                { value: '02', label: "02: Telehealth Provided Other Than in Patient's Home" },
                { value: '03', label: '03: School' },
                { value: '04', label: '04: Homeless Shelter' },
                { value: '11', label: '11: Office' },
                { value: '12', label: '12: Home' },
                { value: '15', label: '15: Mobile Unit' },
                { value: '17', label: '17: Walk-in Retail Health Clinic' },
                { value: '19', label: '19: Off Campus-Outpatient Hospital' },
                { value: '20', label: '20: Urgent Care Facility' },
                { value: '21', label: '21: Inpatient Hospital' },
                { value: '22', label: '22: On Campus-Outpatient Hospital' },
                { value: '23', label: '23: Emergency Room – Hospital' },
                { value: '24', label: '24: Ambulatory Surgical Center' },
                { value: '31', label: '31: Skilled Nursing Facility' },
                { value: '32', label: '32: Nursing Facility' },
                { value: '50', label: '50: Federally Qualified Health Center' },
                { value: '72', label: '72: Rural Health Clinic' }
            ]),
            serviceLocationName: this.CreateTextInput,
            clientName: this.CreateTextInput,
            submittedBy: this.CreateTextInput,
            priority: this.CreateSelectInput([
                { value: 'Low', label: 'Low' },
                { value: 'Medium', label: 'Medium' },
                { value: 'High', label: 'High' },
                { value: 'Critical', label: 'Critical' }
            ])
        };

        // Remove filter row on click
        this.filterContainer.on('click', '.btn-remove', function () {
            $(this).closest('.adv-filter-row').remove();
        });

        // Delegate click events for buttons having data-ev attribute
        $(document).on('click', '[data-ev]', function (ev) {
            OrdersAdvanceSearch.HandleEvent(ev);
        });
    },

    HandleEvent: function (ev) {
        _$modxAppCore.showErrorMessage('', 'error', 'errorMsgAdvSearch');
        const evCase = $(ev.target).closest('[data-ev]').attr('data-ev');
        if (!evCase) return;

        switch (evCase) {
            case 'EV_AddFilter':
                OrdersAdvanceSearch.AddFilter();
                break;
            case 'EV_ResetAll':
                OrdersAdvanceSearch.ResetAll();
                break;
            case 'EV_ResetValues':
                OrdersAdvanceSearch.ResetValues();
                break;
            case 'EV_ApplyFilters':
                OrdersAdvanceSearch.ApplyFilters();
                break;
        }
    },
    CreateTextSSNInput: function (label) {
        return `<div class="adv-filter-row" data-key="${label}">
                <label>${OrdersAdvanceSearch.ToTitle(label)}</label>
                <input type="text"
                       class="form-control form-control-sm"
                       maxlength="11"
                       data-model-prop="PatientSSN"
                       id="inpPatientSSN"
                       placeholder="XXX-XX-XXXX"
                       pattern="\\d{3}-\\d{2}-\\d{4}"
                       title="Enter a valid SSN (XXX-XX-XXXX)"
                       oninput="Core.formatSSN(this)">
                <button class="btn-remove" title="Remove"><i class="fa fa-trash"></i></button>
            </div>`;
    },

    CreateTextInput: function (label) {
        return `<div class="adv-filter-row" data-key="${label}">
                    <label>${OrdersAdvanceSearch.ToTitle(label)}</label>
                    <input type="text" class="form-control" placeholder="Enter ${OrdersAdvanceSearch.ToTitle(label)}">
                    <button class="btn-remove" title="Remove"><i class="fa fa-trash"></i></button>
                </div>`;
    },

    CreateDateInput: function (label) {
        return `<div class="adv-filter-row" data-key="${label}">
                    <label>${OrdersAdvanceSearch.ToTitle(label)}</label>
                    <input  type="text" class="form-control form-control-sm dt fromDate flatpickr-input active" value="" placeholder="mm/dd/yyyy">
                    <button class="btn-remove" title="Remove"><i class="fa fa-trash"></i></button>
                </div>`;
    },

    CreateSelectInput: function (options) {
        return function (label) {
            const opts = options.map(o => `<option value="${o.value}">${o.label}</option>`).join('');
            return `<div class="adv-filter-row" data-key="${label}">
                        <label>${OrdersAdvanceSearch.ToTitle(label)}</label>
                        <select class="form-control">
                             ${opts}
                        </select>
                        <button class="btn-remove" title="Remove"><i class="fa fa-trash"></i></button>
                    </div>`;
        };
    },

    ToTitle: function (key) {
        return key
            .replace(/([A-Z]+)([A-Z][a-z])/g, '$1 $2')
            .replace(/([a-z\d])([A-Z])/g, '$1 $2')
            .replace(/^./, str => str.toUpperCase());
    },
    AddFilter: function () {
        _$modxAppCore.showErrorMessage('', 'error', 'errorMsgAdvSearch');
        const selected = $('#ddlFilterType').val();
        if (!selected) return;

        const container = this.filterContainer;
        if (container.find(`[data-key="${selected}"]`).length > 0) {
            _$modxAppCore.showErrorMessage('Filter already added.', 'error', 'errorMsgAdvSearch');
            return;
        }

        const addRow = this.filterTemplates[selected];
        if (addRow) container.append(addRow(selected));
    },

    ResetAll: function () {
        _$modxAppCore.showErrorMessage('', 'error', 'errorMsgAdvSearch');
        $('#ddlFilterType').val('');
        this.filterContainer.empty();
    },

    ResetValues: function () {
        _$modxAppCore.showErrorMessage('', 'error', 'errorMsgAdvSearch');
        this.filterContainer.find('input, select').val('');
    },

    ApplyFilters: function () {
        const filters = {};

        // Collect filter values
        this.filterContainer.find('.adv-filter-row').each(function () {
            const key = $(this).data('key');
            const val = $(this).find('input, select').val();
            filters[key] = val;
        });

        const $applyBtn = $('#btnApplyFilters');
        $applyBtn.prop('disabled', true).text('Applying...');

        // Close modal with a slight delay after confirming the data is processed
        Orders.GetOrderList(Core.gridDefault, 'advanceSearch', filters)
            .then(() => {
                $('#btnAdvanceCloseModel').click()
            })
            .catch((err) => {
                console.error('Error applying filters:', err);
            })
            .finally(() => {
                $applyBtn.prop('disabled', false).text('Apply Filters');
            });
    }

};

Orders.Init();

$(document).ready(function () {
    var postbackUrl = "../../../apix/UserSession/GetUserRolesByPage";
    var meta = {};
    meta.PageName = 'orders.html';

    __DoAsyncPostBack(meta, postbackUrl, function (ajxOut) {
        if (ajxOut.Success == false) {
            return '';
        }

        if (ajxOut.Success == true) {
            var rolValue = ajxOut.ResultData;
            if (rolValue.includes('V') == false) {
                $('#subMenuList').remove();
            }

            if (rolValue.includes('OE') == false) {
                $('.orderEdit').remove();
            }
        }
    });
});