"use strict"
var _GlobalWorkQue = {
    url: '../../../apix/WorkQueue/',
    selActivity: null
};

var WorkQueue = {
    gridDefault: {
        currentPage: 1,
        totalPages: '',
        totalRecords: 0,
        recordsPerPage: 50,
        sortname: '',
        sortOrder: 'desc',
        query: '',
        queryType: ''
    },
    _OrderListGrid: {},

    // =============================
    // Initialize
    // =============================
    Init: function () {
        document.getElementById('divMain').addEventListener('click', this);
        document.getElementById('divMain').addEventListener('change', this);
        this.showSubMenu();
        this.initilizeGridsonPage();
        OrdersAdvanceSearch.Init();
        this.populateWorkFlowStatusSection();
        this.GetWorkQueueList().then(() => {
            let UrlParmMea = this.getOrderMetaFromUrl();
            if (UrlParmMea.source == "WorkFlow") {
                this.clickWorkflowById(UrlParmMea.workQueueId);
                this.mangeSidePannelAccordian();
                this.GetOrderList(this.gridDefault);
            }
        });
    },

    initilizeGridsonPage: function () {
        this._OrderListGrid = new QCGrid();
        this._OrderListGrid.width = '100%';
        this._OrderListGrid.height = 'calc(52vh - 160px)';
        this._OrderListGrid.id = 'tblOrdersGrid';
        this._OrderListGrid.containerID = 'OrdersGrid';
        this._OrderListGrid.class = 'table table-bordered table-striped table-hover gridLayoutFix';
    },

    showSubMenu: function () {
        $('#WorkFlowStatusMainSection').addClass('custom-margin-dictionary');
        $('#WorkQueueMainSection').addClass('custom-margin-dictionary');
        $('#WorkFlowStatusMainSection').addClass('custom-margin-dictionary');
        $("body").addClass("sidebar-icon-only");
        $('#theme-settings').css('display', 'block');
        $('#submenuIcon').remove();
    },
    mangeSidePannelAccordian: function () {
        $('#lm_WorkQueue > div').addClass('active')
        $('#workFlowStatusList').removeClass('open')
        $('#lm_WorkQueueStatus > div').removeClass('active')
        $('#workQueueList').addClass('open')
    },
    // =============================
    // Order List Functions
    // =============================
    GetOrderList: async function (gridParam) {
        _$modxAppProgressBar.show();
        let meta = {};
        meta.WorkQueueID = this.getActiveWorkQueueId();
        meta.QCGridParam = gridParam;
        let functionName = 'GetWorkQuesOrdersList';
        var url = _GlobalWorkQue.url + functionName;
        var qcGrid = await __PromisAsyncPostBack(meta, url);
        var grid = WorkQueue._OrderListGrid;

        if (!qcGrid.success) {
            _$modxAppProgressBar.hide();
            return false;
        }

        if (qcGrid.data.length == 0) {
            grid.clearBind();
            this.showNoOrderWorkQMessage('OrdersGrid');
            _$modxAppProgressBar.hide();
            return;
        }

        this.bindOrderGrid(grid, qcGrid);
        this.showOrderGridSection();
        _$modxAppProgressBar.hide();

        grid.onSubmit = function (gridParam) {
            WorkQueue.GetOrderList(gridParam);
        };

        grid.onRowDblClick = function (rowNum, colNum, row, colModel) {
            WorkQueue.handleOrderRowDoubleClick(row);
        };
    },

    getActiveWorkQueueId: function () {
        return $('li.wfs-workqueue-item.active-queue').data('workqueue-id');
    },

    getActiveWorkflowStateId: function () {
        return $('li.wfs-workqueue-item.active-queue').data('workflowstate-id');
    },

    bindOrderGrid: function (grid, qcGrid) {
        grid.gridData = qcGrid;
        grid.clearBind();
        grid.bind();
    },

    showOrderGridSection: function () {
        $('#WorkFlowStatusMainSection').addClass('d-none');
        $('#WorkQueueMainSection').removeClass('d-none');
    },

    handleOrderRowDoubleClick: function (row) {
        this.clearRowSelection();
        this.highlightSelectedRow();
        this.showWorkflowSections();
        this.setOrderWorkflowFields(row);
        this.clearWorkflowErrorMessages();
        this.loadOrderWorkflowState(row);
        this.populateOrderPreviewSection(row.OrderId);
    },

    clearRowSelection: function () {
        $('.table-primary').removeClass('table-primary');
    },

    highlightSelectedRow: function () {
        $('.tr-select').addClass('table-primary');
    },

    showWorkflowSections: function () {
        $('#WorkflowStatusDiv').removeClass('d-none');
        $('#WorkFlowActivitySection').removeClass('d-none');
        $('#WorkFlowSection').removeClass('d-none');
    },

    setOrderWorkflowFields: function (row) {
        $('#workFlowOrderNumber').attr('data-id', row.OrderId);
        $('#workFlowOrderNumber').val(row.OrderNumber);
    },

    clearWorkflowErrorMessages: function () {
        $('#errorMsgOrderWorkFlowState').html('');
        $('#errorMsgWorkFlowOrderAct').html('');
    },

    loadOrderWorkflowState: function (row) {
        const OrdWorkFlowId = row.OrderWorkFlowID;
        if (OrdWorkFlowId == null || OrdWorkFlowId == 0) {
            $('#drpDwnWorkflowStateID').val('').trigger('change');
            this.loadActivitiesByState(null);
        } else {
            $('#drpDwnWorkflowStateID').val(OrdWorkFlowId);
            this.loadActivitiesByState(OrdWorkFlowId);
        }
        $('#OrderWorkFlowID').val(OrdWorkFlowId);
    },

    showNoOrderWorkQMessage: function (containerId) {
        const container = document.getElementById(containerId);
        container.innerHTML = this.buildNoOrderMessage();
    },

    buildNoOrderMessage: function () {
        return `
        <div class="text-center text-muted py-5">
            <i class="fa fa-inbox fa-3x mb-3"></i>
            <p class="mb-0">No order found for the work queue</p>
        </div>
        `;
    },

    // =============================
    // WorkQueue Functions
    // =============================
    GetWorkQueueList: async function () {
        _$modxAppProgressBar.show();
        var functionName = "GetWorkQueueList";
        var url = _GlobalWorkQue.url + functionName;
        var ajaxOut = await __PromisAsyncPostBack({}, url);
        _$modxAppProgressBar.hide();

        if (!ajaxOut || ajaxOut.Success === false) {
            _$modxAppCore.alert("Failed to load WorkQueue list.", "Error");
            return;
        }

        this.clearWorkQueueContainers();
        this.renderCustomWorkQueues(ajaxOut.CommandArgs, 'systemConfiguredWorkList');

        if (!ajaxOut.ResultData || ajaxOut.ResultData.length === 0) {
            return;
        }

        this.renderCustomWorkQueues(ajaxOut.ResultData, 'workQueueChildList');
    },

    clearWorkQueueContainers: function () {
        $('#systemConfiguredWorkList').empty();
        $('#workQueueChildList').empty();
    },

    renderCustomWorkQueues: function (data, containerId) {
        const $container = $('#' + containerId);

        if (!$container.length || !Array.isArray(data) || data.length === 0) {
            return;
        }

        var self = this;
        data.forEach(function (item) {
            var $li = self.buildWorkQueueListItem(item);
            $container.append($li);
        });
    },

    buildWorkQueueListItem: function (item) {
        const $li = $('<li>', {
            class: 'wfs-workqueue-item',
            'data-queue-type': 'CUSTOM',
            'data-workqueue-id': item.WorkQueueID,
            'data-ev': 'EV_GetWorkQueueOrders'
        });

        const $content = $('<div>', {
            class: 'wfs-workqueue-item-content',
            'data-workqueue-id': item.WorkQueueID,
            'data-ev': 'EV_GetWorkQueueOrders'
        });

        const $label = $('<span>', {
            class: 'wfs-workqueue-item-label',
            text: item.Name,
            title: item.Name,
            'data-workqueue-id': item.WorkQueueID,
            'data-ev': 'EV_GetWorkQueueOrders'
        });

        $content.append($label);
        $li.append($content);

        return $li;
    },

    getWorkQueueDetail: async function (workQueueID) {
        _$modxAppProgressBar.show();
        const meta = {};
        meta.WorkQueueID = workQueueID;
        var functionName = "GetWorkQueueDetail";
        var url = _GlobalWorkQue.url + functionName;
        var ajaxOut = await __PromisAsyncPostBack(meta, url);
        _$modxAppProgressBar.hide();

        if (!ajaxOut || ajaxOut.Success === false) {
            _$modxAppCore.alert("Failed to load WorkQueue detail.", "Error");
            return;
        }

        _$modxAppCore.putAppCoreModel('WorkQueueMeta', ajaxOut.ResultData);
        OrdersAdvanceSearch.LoadCriteria(ajaxOut.ResultData.Criteria);
    },

    getWorkQueueOrders: function (ev) {
        var workQueueId = ev.target.getAttribute('data-workqueue-id');
        WorkQueue.gridDefault.query = workQueueId;
        this.setActiveWorkQueue(workQueueId);
        this.GetOrderList(WorkQueue.gridDefault);
    },

    setActiveWorkQueue: function (workQueueId) {
        $('.wfs-workqueue-item').removeClass('active-queue');
        $('li.wfs-workqueue-item[data-workqueue-id="' + workQueueId + '"]').addClass('active-queue');
    },

    getStandardWorkQ: function (ev) {
        // Implementation placeholder
    },

    saveWorkQueue: async function () {
        const WorkQueueMeta = _$modxAppCore.getAppCoreModel('WorkQueueMeta');

        if (!this.validateWorkQueueMeta(WorkQueueMeta)) {
            return;
        }

        WorkQueueMeta.Criteria = this.buildWorkQueueCriteria();

        if (WorkQueueMeta.Criteria.trim() == "") {
            _$modxAppCore.showErrorMessage('Please enter WorkQueue Criteria', 'error', 'workQErrorMessage');
            return;
        }

        $('#workQErrorMessage').html('');
        _$modxAppProgressBar.show();
        var functionName = "SaveWrokQueue";
        var url = _GlobalWorkQue.url + functionName;
        var ajaxOut = await __PromisAsyncPostBack(WorkQueueMeta, url);
        _$modxAppProgressBar.hide();

        if (!ajaxOut || ajaxOut.Success === false) {
            _$modxAppCore.showErrorMessage(ajaxOut.Message, 'error', 'workQErrorMessage');
            return;
        }

        _$modxAppCore.showErrorMessage(ajaxOut.Message, 'Success', 'workQErrorMessage');
        if (WorkQueueMeta.WorkQueueID == 0) {
            this.GetWorkQueueList();
        }
    },

    validateWorkQueueMeta: function (meta) {
        if (meta.Name.trim() == "") {
            $('#txtWorkQName').focus();
            _$modxAppCore.showErrorMessage('Please enter WorkQueue Name', 'error', 'workQErrorMessage');
            return false;
        }
        if (meta.Description.trim() == "") {
            $('#txtDescription').focus();
            _$modxAppCore.showErrorMessage('Please enter WorkQueue Description', 'error', 'workQErrorMessage');
            return false;
        }
        return true;
    },

    buildWorkQueueCriteria: function () {
        var filters = this.collectFilterValues();
        return this.convertFiltersToCriteria(filters);
    },

    collectFilterValues: function () {
        var filters = {};
        var filterContainer = $('#filterContainer');

        filterContainer.find('.adv-filter-row').each(function () {
            var key = $(this).data('key');
            var $ctrl = $(this).find('select, input').first();
            var val = $ctrl.val();

            if (val !== null && val !== undefined) {
                val = String(val).trim();
                if (val !== "") {
                    filters[key] = val;
                }
            }
        });

        return filters;
    },

    convertFiltersToCriteria: function (filters) {
        return Object.entries(filters)
            .map(function (entry) {
                var key = entry[0];
                var value = entry[1];
                var isNumeric = !isNaN(value) && value !== "";

                return isNumeric
                    ? key + ' = ' + value
                    : key + " = '" + value.replace(/'/g, "''") + "'";
            })
            .join(" AND ");
    },

    // =============================
    // WorkFlow Status Functions
    // =============================
    populateWorkFlowStatusSection: async function () {
        _$modxAppProgressBar.show();
        var functionName = "GetWorkFlowStatusList";
        var url = _GlobalWorkQue.url + functionName;
        var ajaxOut = await __PromisAsyncPostBack({}, url);
        _$modxAppProgressBar.hide();

        if (!ajaxOut || ajaxOut.Success === false) {
            _$modxAppCore.alert("Failed to load WorkFlow Status list.", "Error");
            return;
        }

        const childList = $('#workFlowStatusList');
        childList.empty();

        if (!ajaxOut.ResultData || ajaxOut.ResultData.length === 0) {
            return;
        }

        Core.bindSelectList('drpDwnWorkflowStateID', ajaxOut.ResultData, 'WorkflowStateID', 'WorkflowState', '-Select WorkFlow-');
        this.renderWorkFlowStatusList(ajaxOut.ResultData);
    },

    renderWorkFlowStatusList: function (data) {
        const $container = $('#workFlowStatusList');
        var self = this;

        data.forEach(function (item) {
            var $li = self.buildWorkFlowStatusListItem(item);
            $container.append($li);
        });
    },

    buildWorkFlowStatusListItem: function (item) {
        const $li = $('<li>', {
            class: 'wfs-workqueue-item',
            'data-queue-type': 'CUSTOM',
            'data-workflowstate-id': item.WorkflowStateID,
            'data-ev': 'EV_GetSelectedWorkFlowStatusInformation'
        });

        const $content = $('<div>', {
            class: 'wfs-workqueue-item-content',
            'data-workflowstate-id': item.WorkflowStateID,
            'data-ev': 'EV_GetSelectedWorkFlowStatusInformation'
        });

        const $label = $('<span>', {
            class: 'wfs-workqueue-item-label',
            text: item.WorkflowState,
            title: item.WorkflowState,
            'data-workflowstate-id': item.WorkflowStateID,
            'data-ev': 'EV_GetSelectedWorkFlowStatusInformation'
        });

        $content.append($label);
        $li.append($content);

        return $li;
    },

    saveWorkFlowStatus: async function () {
        const workFlowStatusMeta = _$modxAppCore.getAppCoreModel('WorkFlowStatusMeta');

        if (!this.validateWorkFlowStatusMeta(workFlowStatusMeta)) {
            return;
        }

        $('#workQStateMsg').html('');
        _$modxAppProgressBar.show();
        var functionName = "SaveWorkflowState";
        var url = _GlobalWorkQue.url + functionName;
        var ajaxOut = await __PromisAsyncPostBack(workFlowStatusMeta, url);
        _$modxAppProgressBar.hide();

        if (!ajaxOut || ajaxOut.Success === false) {
            _$modxAppCore.showErrorMessage(ajaxOut.Message, 'error', 'workQStateMsg');
            return;
        }

        _$modxAppCore.showErrorMessage(ajaxOut.Message, "Success", "workQStateMsg");
        $('#WorkflowStateID').val(ajaxOut.ResultData);

        this.populateWorkFlowStatusSection().then(() => {
            this.clickWorkStateById(ajaxOut.ResultData);
        });
    },

    validateWorkFlowStatusMeta: function (meta) {
        if (!meta.WorkflowState || meta.WorkflowState.trim() === '') {
            $('#txtWorkFlowStatus').focus();
            _$modxAppCore.showErrorMessage('Please enter WorkFlow State', 'error', 'workQStateMsg');
            return false;
        }
        if (!meta.Description || meta.Description.trim() === '') {
            $('#txtWorkFlowStatusDescription').focus();
            _$modxAppCore.showErrorMessage('Please enter Description', 'error', 'workQStateMsg');
            return false;
        }
        return true;
    },

    clickWorkflowById: function (dataId) {
        const li = document.querySelector(
            '#workQueueList li[data-workqueue-id="' + dataId + '"]'
        );

        if (!li) {
            return;
        }

        li.click();
    },
    clickWorkStateById: function (dataId) {
        const li = document.querySelector(
            '#workFlowStatusList li[data-workflowstate-id="' + dataId + '"]'
        );

        if (!li) {
            return;
        }

        li.click();
    },


    getWorkFlowDetail: async function (ev) {
        _$modxAppProgressBar.show();

        const meta = {};
        meta.WorkflowStateID = ev.target.getAttribute('data-workflowstate-id');

        this.setActiveWorkflowState(meta.WorkflowStateID);

        var functionName = "GetWorkFlowDetails";
        var url = _GlobalWorkQue.url + functionName;
        var ajaxOut = await __PromisAsyncPostBack(meta, url);
        _$modxAppProgressBar.hide();

        if (!ajaxOut || ajaxOut.Success === false) {
            _$modxAppCore.showErrorMessage('Failed to load WorkFlow Status Information.', 'error', 'workQStateMsg');
            return;
        }

        $('#workQStateMsg').html('');
        _$modxAppCore.putAppCoreModel('WorkFlowStatusMeta', ajaxOut.ResultData);
        this.showWorkFlowStatusSection();
    },

    setActiveWorkflowState: function (workflowStateId) {
        $('.wfs-workqueue-item').removeClass('active-queue');
        $('li.wfs-workqueue-item[data-workflowstate-id="' + workflowStateId + '"]').addClass('active-queue');
    },

    showWorkFlowStatusSection: function () {
        $('#WorkQueueMainSection').addClass('d-none');
        $('#WorkFlowStatusMainSection').removeClass('d-none');
    },

    resetWorkFlowStatus: function () {
        $('#workQActivityMsg').html('');
        $('#workQStateMsg').html('');
        document.getElementById('wfActivityContainer').innerHTML = '';
        _$modxAppCore.putAppCoreModel('WorkFlowStatusMeta', '');
        $('#noActivityMsg').removeClass('d-none');
    },

    // =============================
    // Order WorkFlow Functions
    // =============================
    saveOrderWorkFlow: async function () {
        const meta = this.buildOrderWorkFlowMeta();

        if (!this.validateOrderWorkFlowMeta(meta)) {
            return;
        }

        _$modxAppProgressBar.show();
        var functionName = "SaveOrderWorkFlow";
        var url = _GlobalWorkQue.url + functionName;
        var ajaxOut = await __PromisAsyncPostBack(meta, url);
        _$modxAppProgressBar.hide();

        if (!ajaxOut || ajaxOut.Success === false) {
            _$modxAppCore.showErrorMessage(ajaxOut.Message, 'error', 'errorMsgOrderWorkFlowState');
            return;
        }

        $('#OrderWorkFlowID').val(ajaxOut.ResultData);
        _$modxAppCore.showErrorMessage(ajaxOut.Message, 'success', 'errorMsgOrderWorkFlowState');
        this.loadActivitiesByState(meta.WorkflowStateID);
    },

    buildOrderWorkFlowMeta: function () {
        return {
            OrderID: document.getElementById('workFlowOrderNumber').getAttribute('data-id'),
            WorkflowStateID: $('#drpDwnWorkflowStateID').val(),
            OrderWorkFlowID: $('#OrderWorkFlowID').val(),
            WorkQueueID: this.getActiveWorkQueueId()
        };
    },

    validateOrderWorkFlowMeta: function (meta) {
        if (!meta.OrderID) {
            _$modxAppCore.showErrorMessage('Please select an Order.', 'error', 'errorMsgOrderWorkFlowState');
            return false;
        }
        if (!meta.WorkflowStateID) {
            _$modxAppCore.showErrorMessage('Please select a Workflow State.', 'error', 'errorMsgOrderWorkFlowState');
            return false;
        }
        return true;
    },

    // =============================
    // Status Activity Functions
    // =============================
    populateStatusActivityList: async function (ev) {
        _$modxAppProgressBar.show();
        const meta = {};
        meta.WorkflowStateID = ev.target.getAttribute('data-workflowstate-id');
        var functionName = "GetActivityList";
        var url = _GlobalWorkQue.url + functionName;
        var ajaxOut = await __PromisAsyncPostBack(meta, url);
        _$modxAppProgressBar.hide();

        if (!ajaxOut || ajaxOut.Success === false) {
            _$modxAppCore.showErrorMessage('Failed to load Status Activity list.', 'error', 'workQActivityMsg');
            return;
        }

        $('#workQActivityMsg').html('');
        this.renderWorkFlowActivity("wfActivityContainer", ajaxOut.ResultData);
    },

    loadActivitiesByState: async function (workflowStateID) {
        _$modxAppProgressBar.show();
        var functionName = "GetActivityList";
        var url = _GlobalWorkQue.url + functionName;
        var orderID = document.getElementById('workFlowOrderNumber').getAttribute('data-id');
        var payload = { WorkflowStateID: workflowStateID, orderID: orderID };
        var ajaxOut = await __PromisAsyncPostBack(payload, url);
        _$modxAppProgressBar.hide();

        if (!ajaxOut || ajaxOut.Success === false) {
            _$modxAppCore.showErrorMessage(ajaxOut.Message, 'error', 'errorMsgWorkFlowOrderAct');
            return;
        }

        this.renderActivities(ajaxOut.ResultData);
    },

    renderActivities: function (activities) {
        var container = document.getElementById('activityContainer');
        var template = document.getElementById('activityItemTemplate');
        var noActivitiesMsg = document.getElementById('noActivitiesMsg');

        if (!container) return;

        container.innerHTML = '';

        if (!activities || activities.length === 0) {
            if (noActivitiesMsg) noActivitiesMsg.classList.remove('d-none');
            return;
        }

        if (noActivitiesMsg) noActivitiesMsg.classList.add('d-none');

        var self = this;
        activities.forEach(function (activity) {
            self.renderActivityRow(container, template, activity);
        });
    },

    renderActivityRow: function (container, template, activity) {
        var clone = template.content.cloneNode(true);
        var rows = clone.querySelectorAll('tr');
        var activityRow = rows[0];
        var notesRow = rows[1];

        this.populateActivityRowFields(activityRow, activity);
        this.handleCompletedActivityState(activityRow, activity);
        this.linkNotesRow(activityRow, notesRow, activity);

        container.appendChild(clone);
    },

    populateActivityRowFields: function (activityRow, activity) {
        activityRow.querySelector('[data-model-prop="StatusActivityID"]').value = activity.StatusActivityID;
        activityRow.querySelector('[data-model-prop="ActivityID"]').value = activity.StatusActivityID;
        activityRow.querySelector('[data-model-prop="Description"]').textContent = activity.Description;

        var checkbox = activityRow.querySelector('[data-model-prop="IsCompleted"]');
        checkbox.checked = activity.ActivityStatus === 'COMP';

        var statusDropdown = activityRow.querySelector('[data-model-prop="ActivityStatus"]');
        statusDropdown.value = activity.ActivityStatus || 'NS';
    },

    handleCompletedActivityState: function (activityRow, activity) {
        if (activity.ActivityStatus === 'COMP') {
            activityRow.classList.add('wfs-activity-completed');
            var checkbox = activityRow.querySelector('[data-model-prop="IsCompleted"]');
            checkbox.checked = true;
            checkbox.disabled = true;
            this._lockActivityRow(activityRow);
        }
    },

    linkNotesRow: function (activityRow, notesRow, activity) {
        activityRow.dataset.activityId = activity.StatusActivityID;
        notesRow.dataset.activityId = activity.StatusActivityID;
    },

    renderWorkFlowActivity: function (containerId, activityList) {
        if (!containerId || !Array.isArray(activityList)) return;

        const container = document.getElementById(containerId);
        if (!container) return;

        var html = this.buildActivityTableHeader();
        html += this.buildActivityTableBody(activityList);
        html += '</tbody></table>';

        container.innerHTML = html;
    },

    buildActivityTableHeader: function () {
        return `
        <table class="table table-bordered table-sm mb-0">
            <thead class="table-light">
                <tr>
                    <th width="50">Rank</th>
                    <th>Description</th>
                    <th width="80" class="text-center">Required</th>
                    <th width="70" class="text-center">Action</th>
                </tr>
            </thead>
            <tbody>
        `;
    },

    buildActivityTableBody: function (activityList) {
        if (activityList.length === 0) {
            $('#noActivityMsg').removeClass('d-none');
            return '';
        }

        $('#noActivityMsg').addClass('d-none');
        var html = '';

        activityList.forEach(function (item) {
            html += WorkQueue.buildActivityTableRow(item);
        });

        return html;
    },

    buildActivityTableRow: function (item) {
        var requiredBadgeClass = item.IsRequired ? 'badge-yes' : 'badge-no';
        var requiredBadgeText = item.IsRequired ? 'Yes' : 'No';

        return `
        <tr data-activity-id="${item.StatusActivityID}">
            <td class="text-center">${item.ActivityRank || '-'}</td>
            <td>
                ${item.Description || ''}
                <input type="hidden" class="wf-status-activity-id" value="${item.StatusActivityID}">
            </td>
            <td class="text-center">
                <span class="wfs-badge ${requiredBadgeClass}">
                    ${requiredBadgeText}
                </span>
            </td>
            <td class="text-center">
                <a href="javascript:void(0)" class="wfs-table-action text-primary mx-2" 
                   data-activity-id="${item.StatusActivityID}" 
                   data-ev="EV_EditStatusActivity" title="Edit">
                    <i class="fa fa-edit"></i>
                </a>
                <a href="javascript:void(0)" class="wfs-table-action text-danger" 
                   data-activity-id="${item.StatusActivityID}" 
                   data-ev="EV_DeleteStatusActivity" title="Delete">
                    <i class="fas fa-xmark"></i>
                </a>
            </td>
        </tr>
        `;
    },

    saveStatusActivity: async function () {
        const statusActivityMeta = _$modxAppCore.getAppCoreModel('StatusActivityMeta');
        const workflowStateID = $('#WorkflowStateID').val();

        if (!this.validateStatusActivityMeta(statusActivityMeta, workflowStateID)) {
            return;
        }

        $('#workQActivityMsg').html('');
        statusActivityMeta.WorkflowStateID = workflowStateID;
        statusActivityMeta.CurrentRank = this.determineCurrentRank(statusActivityMeta);

        _$modxAppProgressBar.show();
        var functionName = "SaveStatusActivity";
        var url = _GlobalWorkQue.url + functionName;
        var ajaxOut = await __PromisAsyncPostBack(statusActivityMeta, url);
        _$modxAppProgressBar.hide();

        if (!ajaxOut || ajaxOut.Success === false) {
            _$modxAppCore.showErrorMessage(ajaxOut.Message, 'error', 'workQActivityMsg');
            return;
        }

        _$modxAppCore.showErrorMessage(ajaxOut.Message, 'Success', 'workQActivityMsg');
        this.resetStatusActivity();

        this.loadActivitiesByState(workflowStateID).then(() => {
            this.clickWorkStateById(workflowStateID);
        });
    },

    validateStatusActivityMeta: function (meta, workflowStateID) {
        if (!workflowStateID || workflowStateID === '0') {
            _$modxAppCore.showErrorMessage('Please save WorkFlow State first', 'error', 'workQActivityMsg');
            return false;
        }
        if (!meta.Description || meta.Description.trim() === '') {
            $('#txtStatusActivityDescription').focus();
            _$modxAppCore.showErrorMessage('Please enter Activity Description.', 'error', 'workQActivityMsg');
            return false;
        }
        return true;
    },

    determineCurrentRank: function (statusActivityMeta) {
        if (statusActivityMeta.StatusActivityID == '0' || statusActivityMeta.StatusActivityID == '') {
            return '0';
        }
        return statusActivityMeta.ActivityRank;
    },

    resetStatusActivity: function () {
        $('#hdnStatusActivityID').val('');
        $('#txtStatusActivityDescription').val('');
        $('#inpActivityRank').val('');
        $('#chkIsRequired').prop('checked', false);
    },

    onEditStatusActivity: async function (statusActivityId) {
        if (!statusActivityId) return;

        _$modxAppProgressBar.show();
        var functionName = "GetStatusActivityDetail";
        var url = _GlobalWorkQue.url + functionName;
        var ajaxOut = await __PromisAsyncPostBack({ StatusActivityID: statusActivityId }, url);
        _$modxAppProgressBar.hide();

        if (!ajaxOut || ajaxOut.Success === false) {
            _$modxAppCore.alert("Failed to load activity details.", "Error");
            return;
        }

        this.populateStatusActivityForm(ajaxOut.ResultData);
    },

    populateStatusActivityForm: function (data) {
        if (!data) return;

        $('#hdnStatusActivityID').val(data.StatusActivityID);
        $('#txtStatusActivityDescription').val(data.Description || '');
        $('#inpActivityRank').val(data.ActivityRank || '');
        $('#chkIsRequired').prop('checked', data.IsRequired === true || data.IsRequired === 1);
    },

    deleteStatusActivity: async function (statusActivityId) {
        if (!statusActivityId) return;

        _$modxAppProgressBar.show();
        var functionName = "DeleteStatusActivity";
        var url = _GlobalWorkQue.url + functionName;
        var ajaxOut = await __PromisAsyncPostBack({ StatusActivityID: statusActivityId }, url);
        _$modxAppProgressBar.hide();

        if (!ajaxOut || ajaxOut.Success === false) {
            _$modxAppCore.alert("Failed to delete Activity.", "Error");
            return;
        }

        _$modxAppCore.alert("Activity deleted successfully.", "Success");
        var workflowStateID = $('#WorkflowStateID').val();
        Core.hideinlineAlert('alertFilter');
        this.clickWorkStateById(workflowStateID);
    },

    confirmDeleteActicity: function (activityName) {
        var msg = 'Are you sure you want to delete the activity :  "' + activityName + '"?';
        Core.showinlineAlert('inlinealertMessageDivFilterGroup', 'alertFilter', msg, "primary", "EV_CONFRIM_DeleteStatusActivity", "EV_CANCELDelFilterStatusActivity");
    },

    // =============================
    // Activity Notes Functions
    // =============================
    loadActivityNotes: async function (notesRow, activityID) {
        if (!activityID) return;

        var functionName = "GetActivityNotes";
        const ordId = document.getElementById('workFlowOrderNumber').getAttribute('data-id');
        var url = _GlobalWorkQue.url + functionName;
        var payload = { StatusActivityID: activityID, OrderID: ordId };
        var ajaxOut = await __PromisAsyncPostBack(payload, url);

        if (!ajaxOut || ajaxOut.Success === false) {
            return;
        }

        this.renderActivityNotes(notesRow, ajaxOut.ResultData);
    },

    renderActivityNotes: function (notesRow, notes) {
        var notesContainer = notesRow.querySelector('[data-container="ActivityNotes"]');
        if (!notesContainer) return;

        notesContainer.innerHTML = '';

        if (!notes || notes.length === 0) {
            return;
        }

        var self = this;
        notes.forEach(function (note) {
            var noteHtml = self.buildNoteItemHtml(note);
            notesContainer.insertAdjacentHTML('beforeend', noteHtml);
        });
    },

    buildNoteItemHtml: function (note) {
        return `
        <div class="wfs-note-item">
            <div class="wfs-note-meta">
                <span class="wfs-note-author"><i class="fa fa-user"></i> ${note.CreateBy}</span>
                <span class="wfs-note-date"><i class="fa fa-calendar"></i> ${note.CreateDate}</span>
            </div>
            <div class="wfs-note-text">${note.NoteText}</div>
        </div>
        `;
    },

    saveActivityNote: async function (element) {
        var notesRow = element.closest('tr[data-notes-row]');
        var noteInput = notesRow.querySelector('[data-model-prop="ActivityNote"]');
        var activityID = notesRow.dataset.activityId;
        var orderID = document.getElementById('workFlowOrderNumber').getAttribute('data-id');

        var noteText = noteInput.value.trim();

        if (!noteText) {
            _$modxAppCore.showErrorMessage('Please enter a note.', 'error', 'workQActivityMsg');
            return;
        }

        var payload = {
            OrderID: orderID,
            StatusActivityID: activityID,
            NoteText: noteText
        };

        _$modxAppProgressBar.show();
        var functionName = "SaveActivityNote";
        var url = _GlobalWorkQue.url + functionName;
        var ajaxOut = await __PromisAsyncPostBack(payload, url);
        _$modxAppProgressBar.hide();

        if (!ajaxOut || ajaxOut.Success === false) {
            _$modxAppCore.showErrorMessage(ajaxOut.Message, 'error', 'errorMsgWorkFlowOrderAct');
            return;
        }

        noteInput.value = '';
        this.loadActivityNotes(notesRow, activityID);
        _$modxAppCore.showErrorMessage('Note added successfully.', 'success', 'errorMsgWorkFlowOrderAct');
    },

    // =============================
    // Toggle Notes
    // =============================
    toggleNotes: function (element) {
        var activityRow = element.closest('tr');
        var activityId = activityRow.dataset.activityId;
        var notesRow = document.querySelector('tr[data-notes-row][data-activity-id="' + activityId + '"]');

        if (notesRow) {
            notesRow.classList.toggle('d-none');
        }
        this.loadActivityNotes(notesRow, activityId);
    },

    // =============================
    // Activity Status Change
    // =============================
    activityCheckChanged: function (element) {
        var activityRow = element.closest('tr');
        var statusDropdown = activityRow.querySelector('[data-model-prop="ActivityStatus"]');

        if (element.checked) {
            statusDropdown.value = 'COMP';
        } else {
            statusDropdown.value = 'NS';
        }
    },

    activityStatusChanged: function (element) {
        var activityRow = element.closest('tr');
        if (!activityRow) return;

        var checkbox = activityRow.querySelector('[data-model-prop="IsCompleted"]');
        var isCompleted = (element.value === 'COMP');

        if (checkbox) {
            checkbox.checked = isCompleted;
            checkbox.disabled = isCompleted;
        }

        if (isCompleted) {
            activityRow.classList.add('wfs-activity-completed');
        } else {
            activityRow.classList.remove('wfs-activity-completed');
        }
    },

    _lockActivityRow: function (row) {
        row.querySelectorAll('input, select, a').forEach(function (el) {
            if (el.tagName.toLowerCase() === 'a') {
                el.style.pointerEvents = 'none';
            } else {
                el.disabled = true;
            }
        });
        row.classList.add('wfs-row-disabled');
    },

    _unlockActivityRow: function (row) {
        row.querySelectorAll('input, select, button, a').forEach(function (el) {
            if (el.tagName.toLowerCase() === 'a') {
                el.style.pointerEvents = '';
            } else {
                el.disabled = false;
            }
        });
        row.classList.remove('wfs-row-disabled');
    },

    // =============================
    // Save Activity
    // =============================
    saveActivity: async function (element) {
        var activityRow = element.closest('tr');
        var selActivity = activityRow.getAttribute('data-activity-id');
        var activityItemMeta = this.getActivityRowModelById(selActivity);
        activityItemMeta.OrderID = document.getElementById('workFlowOrderNumber').getAttribute('data-id');

        _$modxAppProgressBar.show();
        var functionName = "saveActivityStatus";
        var url = _GlobalWorkQue.url + functionName;
        var ajaxOut = await __PromisAsyncPostBack(activityItemMeta, url);
        _$modxAppProgressBar.hide();

        if (!ajaxOut || ajaxOut.Success === false) {
            _$modxAppCore.showErrorMessage(ajaxOut.Message, 'error', 'errorMsgWorkFlowOrderAct');
            return;
        }

        this.updateActivityRowCompletedState(activityRow, activityItemMeta.ActivityStatus);
        $('#errorMsgOrderWorkFlowState').html('');
        const selworkFlowStatusId = $('#drpDwnWorkflowStateID').val();
        WorkQueue.loadActivitiesByState(selworkFlowStatusId);
        _$modxAppCore.showErrorMessage('Activity saved successfully', 'success', 'errorMsgWorkFlowOrderAct');
    },

    updateActivityRowCompletedState: function (activityRow, activityStatus) {
        if (activityStatus === 'COMP') {
            activityRow.classList.add('completed');
        } else {
            activityRow.classList.remove('completed');
        }
    },

    getActivityRowModelById: function (activityId) {
        if (!activityId) {
            return null;
        }

        var row = document.querySelector(
            'tr[data-model="ActivityItemMeta"][data-activity-id="' + activityId + '"]'
        );

        if (!row) {
            return null;
        }

        return this.extractModelFromRow(row);
    },

    extractModelFromRow: function (row) {
        var model = {};

        row.querySelectorAll('[data-model-prop]').forEach(function (el) {
            var propName = el.getAttribute('data-model-prop');
            var value;

            if (el.type === 'checkbox') {
                value = el.checked;
            } else if (el.tagName === 'SPAN' || el.tagName === 'TD') {
                value = el.textContent.trim();
            } else {
                value = el.value;
            }

            model[propName] = value;
        });

        return model;
    },

    // =============================
    // Accordion Functions
    // =============================
    toggleAccordion: function (element) {
        var header = element.closest('.wfs-accordion-header');
        var targetId = header.getAttribute('data-target');
        var body = document.getElementById(targetId);
        var isActive = header.classList.contains('active');

        this.closeAllAccordions();

        if (!isActive) {
            header.classList.add('active');
            body.classList.add('open');
        }
    },

    closeAllAccordions: function () {
        document.querySelectorAll('.wfs-accordion-header').forEach(function (h) {
            h.classList.remove('active');
        });
        document.querySelectorAll('.wfs-accordion-body').forEach(function (b) {
            b.classList.remove('open');
        });
    },

    setActiveChild: function (element) {
        document.querySelectorAll('.wfs-accordion-child').forEach(function (c) {
            c.classList.remove('active');
        });
        element.classList.add('active');
    },

    // =============================
    // Populate Order Summary Section
    // =============================
    populateOrderPreviewSection: async function (OrderId) {
        _$modxAppProgressBar.show();
        var meta = {};
        meta.OrderId = OrderId;
        var functionName = "GetOrderPreviewInforamtion";
        var url = '../../../apix/OrdersEntery/' + functionName;
        var ajaxOut = await __PromisAsyncPostBack(meta, url);
        $('#OrderPreviewSection').removeClass('d-none');
        Core.applyOrderPreview(ajaxOut);
        _$modxAppProgressBar.hide();
    },

    hideWokQueueGrid: function () {
        this.restWorkQueueForm();
        $('.wfs-workqueue-item').removeClass('active-queue');
        $('#WorkQorderActiviy').addClass('d-none');
        $('#WorkQueueConfiguration').removeClass('d-none');
    },

    getOrderMetaFromUrl: function () {
        const params = new URLSearchParams(window.location.search);

        var meta = {
            OrderID: '',
            status: '',
            source: '',
            workQueueId: ''
        };

        meta.OrderID = this.decodeBase64Param(params, 'OrderID');
        meta.status = this.decodeBase64Param(params, 'status');
        meta.source = this.decodeBase64Param(params, 'source');
        meta.workQueueId = this.decodeBase64Param(params, 'WorkQueueId');

        return meta;
    },

    decodeBase64Param: function (params, key) {
        var value = params.get(key);

        if (!value) {
            return '';
        }

        try {
            return atob(value);
        } catch (e) {
            console.error('Invalid Base64 value for ' + key + ':', value);
            return '';
        }
    },

    restWorkQueueForm: function () {
        $('#filterContainer').html('');
        $('#workQErrorMessage').html('');
        $('#ddlFilterType').val('');
        _$modxAppCore.putAppCoreModel('WorkQueueMeta', '');
    },

    // =============================
    // Navigation Helper Functions
    // =============================
    navigateToOrder: function () {
        var OrderID = document.getElementById('workFlowOrderNumber').getAttribute('data-id');
        var wId = this.getActiveWorkQueueId();
        var encodedId = btoa(OrderID);
        var encodedWoekQId = btoa(wId);
        var source = btoa("WorkFlow");
        window.location.href = "orderEntry.html?id=" + encodedId + "&WorkQueueId=" + encodedWoekQId + "&source=" + source;
    },

    showStatusConfigurationSection: function () {
        this.resetWorkFlowStatus();
        $('#WorkQueueMainSection').addClass('d-none');
        $('.wfs-workqueue-item').removeClass('active-queue');
        $('#WorkFlowStatusMainSection').removeClass('d-none');
    },

    showWorkQueueSection: function () {
        $('#workQErrorMessage').html('');
        $('#WorkFlowStatusMainSection').addClass('d-none');
        $('#WorkQorderActiviy').addClass('d-none');
        $('#WorkQueueConfiguration').removeClass('d-none');
        $('#WorkQueueMainSection').removeClass('d-none');
        this.hideWokQueueGrid();
    },

    showWorkQueueOrdersSection: function () {
        $('#WorkFlowSection').addClass('d-none');
        $('#WorkQorderActiviy').removeClass('d-none');
        $('#WorkQueueConfiguration').addClass('d-none');
        $('#WorkFlowStatusMainSection').addClass('d-none');
        $('#WorkFlowStatusMeta').removeClass('d-none');
        $('#WorkQueueMainSection').removeClass('d-none');
    },

    handleEditWorkQueue: function () {
        $('#workQErrorMessage').html('');
        $('#WorkQorderActiviy').addClass('d-none');
        $('#WorkQueueConfiguration').removeClass('d-none');
        var workQId = this.getActiveWorkQueueId();
        if (workQId == undefined) {
            _$modxAppCore.showErrorMessage('Select a work queue in order to proceed with editing.', 'error', 'workQErrorMessage');
        } else {
            $('#workQErrorMessage').html('');
        }
        this.getWorkQueueDetail(workQId);
    },

    // =============================
    // Event Handler
    // =============================
    handleEvent: function (ev) {
        var target = ev.target.closest('[data-ev]');
        if (!target) return;

        var evCase = target.getAttribute('data-ev');

        switch (evCase) {
            case 'EV_ToggleAccordion':
                this.toggleAccordion(target);
                break;

            // Navigation
            case 'EV_CloseSubMenu':
                $('#WorkFlowStatusMainSection').removeClass('custom-margin-dictionary');
                $('#WorkQueueMainSection').removeClass('custom-margin-dictionary');
                $('#WorkFlowStatusMainSection').removeClass('custom-margin-dictionary');
                Core.closeSubMenu();
                break;

            case 'EV_ShowSubMenu':
                this.showSubMenu();
                break;

            case 'Ev_ShowStatusConfiguration':
                this.showStatusConfigurationSection();
                break;

            case 'Ev_ShowWorkQueue':
                this.showWorkQueueSection();
                break;

            // WorkQueue
            case 'EV_GetSelctedWorkQueueInformation':
                this.getWorkQueueDetail(ev);
                break;

            case 'EV_GetWorkQueueOrders':
                this.showWorkQueueOrdersSection();
                this.getWorkQueueOrders(ev);
                break;

            case 'EV_GetStandardWorkQueue':
                this.getStandardWorkQ(ev);
                break;

            case 'EV_AddWorkQueue':
                this.hideWokQueueGrid();
                $('.wfs-workqueue-item').removeClass('active-queue');
                break;

            // WorkFlow Status
            case 'EV_GetSelectedWorkFlowStatusInformation':
                $('#workQStateMsg').html('');
                this.getWorkFlowDetail(ev);
                this.populateStatusActivityList(ev);
                break;

            case 'EV_SaveWorkflowState':
                this.saveWorkFlowStatus();
                break;

            case 'Ev_AddWorkFlowState':
                this.resetWorkFlowStatus();
                break;

            case 'EV_ResetValuesWorkFlowStatus':
                this.resetWorkFlowStatus();
                break;

            // Order WorkFlow
            case 'EV_SaveOrderWorkflowState':
                this.saveOrderWorkFlow();
                break;

            // Status Activity
            case 'Ev_AddStatusActivity':
                this.resetStatusActivity();
                $('#StatusActivityCrudSection').removeClass('d-none');
                break;

            case 'EV_SaveStatusActivity':
                this.saveStatusActivity();
                break;

            case 'EV_EditStatusActivity':
                var activityId = target.getAttribute('data-activity-id');
                this.onEditStatusActivity(activityId);
                break;

            case 'EV_DeleteStatusActivity':
                var activityName = this.getActivityNameFromTarget(target);
                _GlobalWorkQue.selActivity = target.getAttribute('data-activity-id');
                this.confirmDeleteActicity(activityName);
                break;

            case 'EV_CONFRIM_DeleteStatusActivity':
                this.deleteStatusActivity(_GlobalWorkQue.selActivity);
                break;

            case 'EV_CANCELDelFilterStatusActivity':
                Core.hideinlineAlert('alertFilter');
                break;

            // Activity
            case 'EV_SaveActivity':
                if ($('#OrderWorkFlowID').val() == 0) {
                    _$modxAppCore.showErrorMessage('Please save the state before updating the activity.', 'error', 'errorMsgOrderWorkFlowState');
                    return;
                }
                this.saveActivity(target);
                break;

            case 'EV_ToggleNotes':
                this.toggleNotes(target);
                break;

            case 'EV_SaveActivityNote':
                this.saveActivityNote(target);
                break;

            // Activity Status Change
            case 'EV_ActivityCheckChanged':
                this.activityCheckChanged(target);
                break;

            case 'EV_ActivityStatusChanged':
                this.activityStatusChanged(target);
                break;

            case 'Ev_LoadOrderStatusActivityList':
                if (ev.type === 'change') {
                    var selId = ev.target.value;
                    this.loadActivitiesByState(selId);
                    return;
                }
                break;

            case 'Ev_open_document':
                Core.downloadDocument(ev);
                break;

            case 'EV_NavigateOrder':
                this.navigateToOrder();
                break;

            case 'EV_EditWorkQueue':
                this.handleEditWorkQueue();
                break;
        }
    },

    getActivityNameFromTarget: function (target) {
        return target.parentElement
            .previousElementSibling
            .previousElementSibling
            .textContent
            .trim();
    }
};

// =============================
// Orders Advance Search
// =============================
var OrdersAdvanceSearch = {

    filterContainer: null,
    filterTemplates: null,

    Init: function () {
        this.filterContainer = $('#filterContainer');
        this.initFilterTemplates();
        this.bindFilterContainerEvents();
        this.bindDocumentEvents();
    },

    initFilterTemplates: function () {
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
            patientSSN: this.CreateTextSSNInput,
            requestedDos: this.CreateDateInput,
            cptCode: this.CreateTextInput,
            orderStatus: this.CreateSelectInput([
                { value: 'Cancelled', label: 'Cancelled' },
                { value: 'Draft', label: 'Draft' },
                { value: 'Submitted', label: 'Submitted' },
                { value: 'Scheduled', label: 'Scheduled' }
            ]),
            serviceLocationName: this.CreateTextInput,
            clientName: this.CreateTextInput,
            priority: this.CreateSelectInput([
                { value: 'Low', label: 'Low' },
                { value: 'Medium', label: 'Medium' },
                { value: 'High', label: 'High' },
                { value: 'Critical', label: 'Critical' }
            ])
        };
    },

    bindFilterContainerEvents: function () {
        this.filterContainer.on('click', '.btn-remove', function () {
            $(this).closest('.adv-filter-row').remove();
        });
    },

    bindDocumentEvents: function () {
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
                WorkQueue.restWorkQueueForm();
                OrdersAdvanceSearch.ResetValues();
                break;
            case 'EV_SaveWorkQueue':
                WorkQueue.saveWorkQueue();
                break;
        }
    },

    CreateTextInput: function (label) {
        var titleLabel = OrdersAdvanceSearch.ToTitle(label);
        return '<div class="adv-filter-row" data-key="' + label + '">' +
            '<label>' + titleLabel + '</label>' +
            '<input type="text" class="form-control" placeholder="Enter ' + titleLabel + '">' +
            '<button class="btn-remove" title="Remove"><i class="fas fa-xmark"></i></button>' +
            '</div>';
    },

    CreateSelectInput: function (options) {
        return function (label) {
            var opts = options.map(function (o) {
                return '<option value="' + o.value + '">' + o.label + '</option>';
            }).join('');

            var titleLabel = OrdersAdvanceSearch.ToTitle(label);
            return '<div class="adv-filter-row" data-key="' + label + '">' +
                '<label>' + titleLabel + '</label>' +
                '<select class="form-control">' +
                opts +
                '</select>' +
                '<button class="btn-remove" title="Remove"><i class="fas fa-xmark"></i></button>' +
                '</div>';
        };
    },

    CreateTextSSNInput: function (label) {
        var titleLabel = OrdersAdvanceSearch.ToTitle(label);
        return '<div class="adv-filter-row" data-key="' + label + '">' +
            '<label>' + titleLabel + '</label>' +
            '<input type="text" class="form-control" placeholder="Enter ' + titleLabel + '">' +
            '<button class="btn-remove" title="Remove"><i class="fas fa-xmark"></i></button>' +
            '</div>';
    },

    CreateDateInput: function (label) {
        var titleLabel = OrdersAdvanceSearch.ToTitle(label);
        return '<div class="adv-filter-row" data-key="' + label + '">' +
            '<label>' + titleLabel + '</label>' +
            '<input type="date" class="form-control">' +
            '<button class="btn-remove" title="Remove"><i class="fas fa-xmark"></i></button>' +
            '</div>';
    },

    ToTitle: function (key) {
        return key
            .replace(/([A-Z]+)([A-Z][a-z])/g, '$1 $2')
            .replace(/([a-z\d])([A-Z])/g, '$1 $2')
            .replace(/^./, function (str) { return str.toUpperCase(); });
    },

    AddFilter: function () {
        _$modxAppCore.showErrorMessage('', 'error', 'errorMsgAdvSearch');
        const selected = $('#ddlFilterType').val();
        if (!selected) return;

        if (this.isFilterAlreadyAdded(selected)) {
            _$modxAppCore.showErrorMessage('Filter already added.', 'error', 'errorMsgAdvSearch');
            return;
        }

        var addRow = this.filterTemplates[selected];
        if (addRow) {
            this.filterContainer.append(addRow(selected));
        }
    },

    isFilterAlreadyAdded: function (filterKey) {
        return this.filterContainer.find('[data-key="' + filterKey + '"]').length > 0;
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
        var $applyBtn = $('#btnApplyFilters');
        $applyBtn.prop('disabled', true).text('Applying...');

        var filters = this.GetCurrentFilters();

        Orders.GetOrderList(Core.gridDefault, 'advanceSearch', filters)
            .then(function () {
                $('#btnAdvanceCloseModel').click();
            })
            .catch(function (err) {
                console.error('Error applying filters:', err);
            })
            .finally(function () {
                $applyBtn.prop('disabled', false).text('Apply Filters');
            });
    },

    // =============================
    //  EDIT FUNCTIONALITY
    // =============================

    LoadCriteria: function (criteriaString) {
        if (!criteriaString || criteriaString.trim() === '') {
            return;
        }

        _$modxAppCore.showErrorMessage('', 'error', 'errorMsgAdvSearch');
        this.filterContainer.empty();

        try {
            var filters = this.ParseCriteria(criteriaString);
            var self = this;
            filters.forEach(function (filter) {
                self.LoadFilter(filter.key, filter.value);
            });
        } catch (error) {
            console.error('Error loading criteria:', error);
            _$modxAppCore.showErrorMessage('Error loading search criteria.', 'error', 'errorMsgAdvSearch');
        }
    },

    ParseCriteria: function (criteriaString) {
        var filters = [];
        var conditions = criteriaString.split(/\s+AND\s+/i);

        conditions.forEach(function (condition) {
            condition = condition.trim();
            var match = condition.match(/(\w+)\s*=\s*['"]?([^'"]+)['"]?/);

            if (match) {
                var key = match[1].trim();
                var value = match[2].trim();
                value = value.replace(/^['"]|['"]$/g, '');
                filters.push({ key: key, value: value });
            }
        });

        return filters;
    },

    LoadFilter: function (key, value) {
        if (!this.filterTemplates[key]) {
            console.warn('Filter template not found for key: ' + key);
            return;
        }

        if (this.isFilterAlreadyAdded(key)) {
            console.warn('Filter already exists for key: ' + key);
            return;
        }

        var addRow = this.filterTemplates[key];
        var $row = $(addRow(key));
        this.filterContainer.append($row);

        var $input = $row.find('input, select');
        if ($input.length > 0) {
            $input.val(value);
        }
    },

    GetCurrentFilters: function () {
        var filters = {};

        this.filterContainer.find('.adv-filter-row').each(function () {
            var key = $(this).attr('data-key');
            var $input = $(this).find('input, select');
            var value = $input.val();

            if (value && value.trim() !== '') {
                filters[key] = value.trim();
            }
        });

        return filters;
    },

    GetCriteriaString: function () {
        var filters = this.GetCurrentFilters();
        var conditions = [];

        for (var key in filters) {
            if (filters.hasOwnProperty(key)) {
                var value = filters[key];
                if (!isNaN(value) && value !== '') {
                    conditions.push(key + ' = ' + value);
                } else {
                    conditions.push(key + " = '" + value + "'");
                }
            }
        }

        return conditions.join(' AND ');
    },

    OpenForEdit: function (criteriaString) {
        $('#advanceSearchModal').modal('show');

        var self = this;
        setTimeout(function () {
            self.LoadCriteria(criteriaString);
        }, 100);
    }
};

// Initialize
WorkQueue.Init();