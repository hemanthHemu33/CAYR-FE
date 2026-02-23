"use strict";
 
var _GlobalDashboard = {
    url: '../../../apix/Dashboard/'
};

 
var Dashboard = {
 
    Init: function () {
        //this.bindEvents();
        this.loadAllCharts();
    },

    /**
     * Binds click events for refresh buttons
     */
    bindEvents: function () {
        var self = this;

        $(document).on('click', '.dshb-btn-refresh', function () {
            var $btn = $(this);
            var chartId = $btn.data('chart');

            $btn.addClass('dshb-spinning');

            self.refreshChart(chartId).finally(function () {
                $btn.removeClass('dshb-spinning');
            });
        });

        /* Retry button click handler */
        $(document).on('click', '.dshb-btn-retry', function () {
            var chartId = $(this).data('chart');
            Dashboard.refreshChart(chartId);
        });
    },

    /**
     * Loads all dashboard charts
     */
    loadAllCharts: function () {
        this.GetOrderStatusByVolume();
        this.GetHighestVolumeByProviderAndPatient();
        this.GetScheduleInfo();

        //Admin
        this.GetProviderByStatusAndVolume();
        this.GetPatientByStatusAndVolume();
        this.GetOrderVolumneTrend();
        this.GetOrderVolumeTrendByStatus();
        this.GetOrderStatusByTurnaroundTime();
    },

    /**
     * Refreshes specific chart by ID
     */
    refreshChart: function (chartId) {
        switch (chartId) {
            case 'dshbEndUserStatusBarChart':
                return this.GetOrderStatusByVolume();
            case 'dshbEndUserProviderPieChart':
            case 'dshbEndUserPatientPieChart':
                return this.GetHighestVolumeByProviderAndPatient();
            default:
                return Promise.resolve();
        }
    },

    /**
     * Fetches order status by volume and renders bar chart
     */
    GetOrderStatusByVolume: async function () {
        var containerId = "dshbEndUserStatusBarChart";

        try {
            DashboardChart.showSkeleton(containerId, 'bar');

            var url = _GlobalDashboard.url + "GetOrderStatusByVolume";
            var ajx = await __PromisAsyncPostBack({}, url);

            if (ajx.Success && Array.isArray(ajx.ResultData) && ajx.ResultData.length) {
                DashboardChart.renderBarChart({
                    containerId: containerId,
                    data: ajx.ResultData,
                    label: 'Orders',
                    xAxisLabel: 'Order Status',
                    yAxisLabel: 'Number of Orders'
                });
            } else {
                DashboardChart.showEmptyState(containerId, 'No order data available');
            }

        } catch (err) {
            console.error("Order status chart load failed:", err);
            DashboardChart.showErrorState(containerId, 'Failed to load chart');
        }
    },

    /**
     * Fetches provider and patient volume data
     */
    GetHighestVolumeByProviderAndPatient: async function () {
        var providerContainerId = "dshbEndUserProviderPieChart";
        var patientContainerId = "dshbEndUserPatientPieChart";

        try {
            DashboardChart.showSkeleton(providerContainerId, 'pie');
            DashboardChart.showSkeleton(patientContainerId, 'pie');

            var url = _GlobalDashboard.url + "GetHighestVolumeByProviderAndPatient";
            var ajx = await __PromisAsyncPostBack({}, url);

            if (ajx.Success) {
                /* Provider Chart */
                if (Array.isArray(ajx.ResultData) && ajx.ResultData.length) {
                    DashboardChart.renderPieChart({
                        containerId: providerContainerId,
                        data: ajx.ResultData
                    });
                } else {
                    DashboardChart.showEmptyState(providerContainerId, 'No provider data');
                }

                /* Patient Chart */
                if (Array.isArray(ajx.CommandArgs) && ajx.CommandArgs.length) {
                    DashboardChart.renderPieChart({
                        containerId: patientContainerId,
                        data: ajx.CommandArgs
                    });
                } else {
                    DashboardChart.showEmptyState(patientContainerId, 'No patient data');
                }

            } else {
                DashboardChart.showErrorState(providerContainerId, 'Failed to load data');
                DashboardChart.showErrorState(patientContainerId, 'Failed to load data');
            }

        } catch (err) {
            console.error("Pie charts load failed:", err);
            DashboardChart.showErrorState(providerContainerId, 'Error loading chart');
            DashboardChart.showErrorState(patientContainerId, 'Error loading chart');
        }
    },

    /**
    * Fetches schedule orders information
    */
    GetScheduleInfo: async function () {
        var containerId = "appointmentDashboardCards";

        try {
            DashboardChart.showSkeleton(containerId, 'bar');

            var url = _GlobalDashboard.url + "GetScheduleInfo";
            var ajx = await __PromisAsyncPostBack({}, url);

            if (ajx.Success && Array.isArray(ajx.ResultData) && ajx.ResultData.length) {
                this.renderAppointmentDashboardCards(ajx);
            } else {
                DashboardChart.showEmptyState(containerId, 'No order data available');

            }

        } catch (err) {
            console.error("Schedule appoinment load failed:", err);
            DashboardChart.showErrorState(containerId, 'Failed to load appoinment');
        }
    },
    renderAppointmentDashboardCards: function (ajax) {
        var container = document.getElementById("appointmentDashboardCards");
        if (!container || !ajax || ajax.Success !== true) return;

        var scheduledAppointments = Array.isArray(ajax.ResultData) ? ajax.ResultData : [];
        var pastAppointments = Array.isArray(ajax.CommandArgs) ? ajax.CommandArgs : [];

        container.innerHTML = `
        ${this.buildAppointmentCard(
            "Scheduled Appointments Overview",
            "Next 10 appointments in the scheduling pipeline",
            scheduledAppointments
        )}

        ${this.buildAppointmentCard(
            "Recently Completed Appointments",
            "Record of the 10 most recent completed patient visits.",
            pastAppointments
        )}
    `;
    },
    buildAppointmentCard: function (title, description, data) {

        let rows = "";

        if (!Array.isArray(data) || data.length === 0) {
            rows = `
          <tr>
            <td colspan="3" class="text-muted text-center py-4">No records available</td>
          </tr>`;
        } else {
            data.forEach(item => {
                rows += `
              <tr>
                <td class="fw-semibold">#${item.OrderNumber}</td>
                <td class="text-muted">
                  <i class="fa fa-calendar me-1"></i>${item.ScheduleDate}
                </td>
                <td class="text-end">
                  <button class="dshb-ui-link view-summary-btn" data-order-number="${item.orderid}">
                    View
                  </button>
                </td>
              </tr>`;
            });
        }

        return `
      <div class="col-lg-6">
        <div class="dshb-ui-card">
          <div class="dshb-ui-header">
            <div>
              <h6 class="dshb-ui-title">${title}</h6>
              <p class="dshb-ui-sub">${description}</p>
            </div>
          </div>

          <div class="dshb-ui-body p-0">
            <div class="table-responsive dshb-table-scroll">
              <table class="table table-bordered table-striped table-hover gridLayoutFix">
                <thead>
                  <tr>
                    <th>Order</th>
                    <th>Date</th>
                    <th class="text-end">Action</th>
                  </tr>
                </thead>
                <tbody>${rows}</tbody>
              </table>
            </div>
          </div>
        </div>
      </div>`;
    },


    //Admin
    /**
    * Fetches order status by volume and renders bar chart
    */
 
    GetProviderByStatusAndVolume: async function () {
        var containerId = "dshbAdminUserStatusBarChart";

        try {
            DashboardChart.showSkeleton(containerId, 'bar');

            var url = _GlobalDashboard.url + "GetProviderByStatusAndVolume";
            var ajx = await __PromisAsyncPostBack({}, url);

            if (ajx.Success && Array.isArray(ajx.ResultData) && ajx.ResultData.length) {
                DashboardChart.renderStackedBarChart({
                    containerId: containerId,
                    xAxisLabel: "Providers",
                    yAxisLabel: "Orders",
                    data: ajx.ResultData
                });
            } else {
                DashboardChart.showEmptyState(containerId, 'No order data available');
            }

        } catch (err) {
            console.error("Order status chart load failed:", err);
            DashboardChart.showErrorState(containerId, 'Failed to load chart');
        }
    },
    GetPatientByStatusAndVolume: async function () {
        var containerId = "dshbAdminPatientStatusBarChart";

        try {
            DashboardChart.showSkeleton(containerId, 'bar');

            var url = _GlobalDashboard.url + "GetPatientByStatusAndVolume";
            var ajx = await __PromisAsyncPostBack({}, url);
            if (ajx.Success && Array.isArray(ajx.ResultData) && ajx.ResultData.length) {
                DashboardChart.renderStackedBarChart({
                    containerId: containerId,
                    xAxisLabel: "Providers",
                    yAxisLabel: "Orders",
                    data: ajx.ResultData
                });
            } else {
                DashboardChart.showEmptyState(containerId, 'No order data available');
            }

        } catch (err) {
            console.error("Order status chart load failed:", err);
            DashboardChart.showErrorState(containerId, 'Failed to load chart');
        }
    },
    GetOrderVolumneTrend: async function () {
        var containerId = "dshbAdminOrderVolumeTrend";

        try {
            DashboardChart.showSkeleton(containerId, 'chart');

            var url = _GlobalDashboard.url + "GetOrderVolumeTrend";
            var ajx = await __PromisAsyncPostBack({}, url);

            if (ajx.Success && Array.isArray(ajx.ResultData) && ajx.ResultData.length) {
                DashboardChart.renderLineChart({
                    containerId: containerId,
                    data: ajx.ResultData,
                    label: 'Avg Orders Per Day',
                    xAxisLabel: 'Last N Days',
                    yAxisLabel: 'Orders Volumne'
                });
 
            } else {
                DashboardChart.showEmptyState(containerId, 'No order data available');
            }

        } catch (err) {
            console.error("Order status chart load failed:", err);
            DashboardChart.showErrorState(containerId, 'Failed to load chart');
        }
    },
    GetOrderVolumeTrendByStatus: async function () {
        var containerId = "dshbAdminOrderVolumeTrendByStatus";

        try {
            DashboardChart.showSkeleton(containerId, 'chart');

            var url = _GlobalDashboard.url + "GetOrderVolumeTrendByStatus";
            var ajx = await __PromisAsyncPostBack({}, url);

            if (ajx.Success && Array.isArray(ajx.ResultData) && ajx.ResultData.length) {
                console.log(ajx)
                DashboardChart.renderMultiLineChart({
                    containerId: containerId,
                    data: ajx.ResultData,
                    label: 'OrderVolumne',
                    xAxisLabel: 'Order Status',
                    yAxisLabel: 'Months'
                });

            } else {
                DashboardChart.showEmptyState(containerId, 'No order data available');
            }

        } catch (err) {
            console.error("Order status chart load failed:", err);
            DashboardChart.showErrorState(containerId, 'Failed to load chart');
        }
    },
    GetOrderStatusByTurnaroundTime: async function () {
        var containerId = "dshbAdminOrderTurnaroundTimeTrend";

        try {
            DashboardChart.showSkeleton(containerId, 'chart');

            var url = _GlobalDashboard.url + "GetOrderStatusByTurnaroundTime";
            var ajx = await __PromisAsyncPostBack({}, url);

            if (ajx.Success && Array.isArray(ajx.ResultData)) {

                const statusOrder = [
                    "Draft",
                    "Submitted",
                    "UnderReview",
                    "Approved",
                    "Scheduled",
                    "Dispatched",
                    "Completed"
                ];

                // Build a lookup map from API response
                const resultMap = {};
                ajx.ResultData.forEach(item => {
                    resultMap[item.xAxis] = item;
                });

                // Normalize data: ensure all statuses exist
                const normalizedResult = statusOrder.map(status => {
                    if (resultMap[status]) {
                        return resultMap[status];
                    }
                    return {
                        xAxis: status,
                        yAxis: 0
                    };
                });

                console.log("Order turnaround by status (normalized)", normalizedResult);

                DashboardChart.renderSimpleLineChart({
                    containerId: containerId,
                    data: normalizedResult,
                    label: 'Avg Turnaround Time',
                    xAxisLabel: 'Order Status',
                    yAxisLabel: 'Avg Turnaround Time'
                });

            } else {
                DashboardChart.showEmptyState(containerId, 'No order data available');
            }

        } catch (err) {
            console.error("Order status chart load failed:", err);
            DashboardChart.showErrorState(containerId, 'Failed to load chart');
        }
    },

  
};

/* ==========================================================================
   Dashboard Chart Utilities
   ========================================================================== */
var DashboardChart = (function () {

    var chartInstances = {};

    var defaultColors = [
        '#4e73df',
        '#1cc88a',
        '#36b9cc',
        '#f6c23e',
        '#e74a3b',
        '#858796',
        '#5a5c69',
        '#2e59d9'
    ];

    function destroyChart(chartId) {
        if (chartInstances[chartId]) {
            chartInstances[chartId].destroy();
            delete chartInstances[chartId];
        }
    }

    function showSkeleton(containerId, type) {
        var $container = $('#' + containerId);
        destroyChart(containerId);
        $container.empty();

        var skeletonHtml = '';

        if (type === 'bar') {
            skeletonHtml = `
        <div class="dshb-skeleton-wrapper">
            <div class="dshb-skeleton-bar-group">
                <div class="dshb-skeleton-bar"></div>
                <div class="dshb-skeleton-bar"></div>
                <div class="dshb-skeleton-bar"></div>
                <div class="dshb-skeleton-bar"></div>
                <div class="dshb-skeleton-bar"></div>
            </div>
            <div class="dshb-skeleton-axis"></div>
        </div>`;
        }

        else if (type === 'chart') {
            skeletonHtml = `
        <div class="dshb-skeleton-wrapper">
            <div class="dshb-skeleton-line"></div>
            <div class="dshb-skeleton-axis"></div>
        </div>`;
        }

        else if (type === 'pie') {
            skeletonHtml = `
        <div class="dshb-skeleton-wrapper dshb-skeleton-pie-wrap">
            <div class="dshb-skeleton-pie"></div>
            <div class="dshb-skeleton-legend">
                <div class="dshb-skeleton-legend-item"></div>
                <div class="dshb-skeleton-legend-item"></div>
                <div class="dshb-skeleton-legend-item"></div>
            </div>
        </div>`;
        }

        else if (type === 'table') {
            skeletonHtml = `
        <div class="dshb-skeleton-wrapper">
            <div class="dshb-skeleton-table">
                <div class="dshb-skeleton-row"></div>
                <div class="dshb-skeleton-row"></div>
                <div class="dshb-skeleton-row"></div>
                <div class="dshb-skeleton-row"></div>
                <div class="dshb-skeleton-row"></div>
            </div>
        </div>`;
        }

        $container.html(skeletonHtml);
    }


    function showEmptyState(containerId, message) {
        var $container = $('#' + containerId);
        destroyChart(containerId);
        $container.html(`
            <div class="dshb-state-container">
                <div class="dshb-state-message">${message}</div>
            </div>
        `);
    }

    function showErrorState(containerId, message) {
        var $container = $('#' + containerId);
        destroyChart(containerId);
        $container.html(`
            <div class="dshb-state-container">
                <div class="dshb-state-message">${message}</div>
            </div>
        `);
    }
    function transformLineChartData(data) {
        var labels = [];
        var values = [];
        var meta = [];

        data.forEach(function (item) {
            labels.push(item.xAxis);
            values.push(parseInt(item.yAxis, 10) || 0);

            meta.push({
                totalOrder: item.yAxis,
                avgOrdersPerDay: item.AvgOrdersPerDay
            });
        });
        return {
            labels: labels,
            values: values,
            meta: meta
        };
    }

    function renderSimpleLineChart(config) {
        var $container = $('#' + config.containerId);
        if (!$container.length || !Array.isArray(config.data)) return;

            destroyChart(config.containerId);
            $container.empty();

            $container.html(`
            <div class="dshb-chart-canvas-wrapper">
                <canvas id="canvas_${config.containerId}"></canvas>
            </div>
        `);

        var labels = config.data.map(item => item.xAxis);
        var values = config.data.map(item => Number(item.yAxis));

        var ctx = document
            .getElementById('canvas_' + config.containerId)
            .getContext('2d');

        chartInstances[config.containerId] = new Chart(ctx, {
            type: 'line',
            data: {
                labels: labels,
                datasets: [{
                    label: config.label || 'Average Days',
                    data: values,
                    borderWidth: 2
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                scales: {
                    x: {
                        title: {
                            display: true,
                            text: config.xAxisLabel || 'Order Status'
                        }
                    },
                    y: {
                        beginAtZero: true,
                        title: {
                            display: true,
                            text: config.yAxisLabel || 'Average Days'
                        }
                    }
                }
            }
        });
    }


    /* =========================
        LINE CHART
   ========================= */
    function renderLineChart(config) {
        var $container = $('#' + config.containerId);
        if (!$container.length) return;

        destroyChart(config.containerId);
        $container.empty();

        var chartHtml = `
        <div class="dshb-chart-canvas-wrapper">
            <canvas id="canvas_${config.containerId}"></canvas>
        </div>`;

        $container.html(chartHtml);

        var chartData = transformLineChartData(config.data);
        var ctx = document.getElementById('canvas_' + config.containerId).getContext('2d');

        chartInstances[config.containerId] = new Chart(ctx, {
            type: 'line',
            data: {
                labels: chartData.labels,
                datasets: [{
                    label: config.label || 'Orders Trend',
                    data: chartData.values,
                    fill: false,
                    borderColor: 'rgb(75, 192, 192)',
 
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                interaction: {
                    mode: 'index',
                    intersect: false
                },
                plugins: {
                    tooltip: {
                        callbacks: {
                            label: function (context) {
                                var index = context.dataIndex;
                                var meta = chartData.meta[index];
                   
                                return [
                                    'TotalOrder - ' + meta.totalOrder,
                                    'AvgOrdersPerDay - ' + meta.avgOrdersPerDay
                                ];
                            }
                        }
                    }
                },
                scales: {
                    x: {
                        display: true,
                        grid: {
                            display: true
                        },
                        title: {
                            display: true,
                            text: config.xAxisLabel || 'Last N Days'
                        }
                    },
                    y: {
                        display: true,
                        beginAtZero: true,
                        grid: {
                            display: true
                        },
                        title: {
                            display: true,
                            text: config.yAxisLabel || 'Total Orders'
                        }
                    }
                }
            }
        });
    }




    /* =========================
       BAR CHART
       ========================= */

    function transformChartData(data) {
        var labels = [];
        var values = [];

        data.forEach(function (item) {
            labels.push(item.xAxis || '');
            values.push(Number(item.yAxis) || 0);
        });

        return { labels: labels, values: values };
    }

    function renderBarChart(config) {
        var $container = $('#' + config.containerId);
        if (!$container.length) return;

        destroyChart(config.containerId);
        $container.empty();

        var chartHtml = `
            <div class="dshb-chart-canvas-wrapper">
                <canvas id="canvas_${config.containerId}"></canvas>
            </div>`;

        $container.html(chartHtml);

        var chartData = transformChartData(config.data);
        var ctx = document.getElementById('canvas_' + config.containerId).getContext('2d');

        chartInstances[config.containerId] = new Chart(ctx, {
            type: 'bar',
            data: {
                labels: chartData.labels,
                datasets: [{
                    label: config.label || 'Value',
                    data: chartData.values,
                    backgroundColor: defaultColors,
                    borderWidth: 0,
                    borderRadius: 1,
                    barThickness: 50,
                    maxBarThickness: 30
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                scales: {
                    x: { grid: { display: false } },
                    y: { beginAtZero: true }
                }
            }
        });
    }

    /* =========================
       PIE CHART
       ========================= */

    function renderPieChart(config) {
        var $container = $('#' + config.containerId);
        if (!$container.length) return;

        destroyChart(config.containerId);
        $container.empty();

        var filteredData = config.data.filter(function (item) {
            return item.xAxis && Number(item.yAxis) > 0;
        });

        if (!filteredData.length) {
            showEmptyState(config.containerId, 'No data available');
            return;
        }

        var chartHtml = `
            <div class="dshb-chart-canvas-wrapper" style="height: 220px;">
                <canvas id="canvas_${config.containerId}"></canvas>
            </div>`;

        $container.html(chartHtml);

        var chartData = transformChartData(filteredData);
        var ctx = document.getElementById('canvas_' + config.containerId).getContext('2d');

        chartInstances[config.containerId] = new Chart(ctx, {
            type: 'pie',
            data: {
                labels: chartData.labels,
                datasets: [{
                    data: chartData.values,
                    backgroundColor: defaultColors.slice(0, chartData.values.length)
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false
            }
        });
    }

    /* =========================
       STACKED BAR CHART
       ========================= */
    function transformStackedChartData(apiData) {
        var providers = [];              
        var fullProviderMap = {};       
        var statusMap = {};
        var maxLabelLength = 12;

        apiData.forEach(function (item) {
            var fullProvider = item.Provider || "";

            var trimmedProvider =
                fullProvider.length > maxLabelLength
                    ? fullProvider.slice(0, maxLabelLength) + "..."
                    : fullProvider;

            var status = item.xAxis;
            var value = parseInt(item.yAxis, 10) || 0;

            if (!fullProviderMap[trimmedProvider]) {
                fullProviderMap[trimmedProvider] = fullProvider;
            }

            if (!providers.includes(trimmedProvider)) {
                providers.push(trimmedProvider);
            }

            if (!statusMap[status]) {
                statusMap[status] = {};
            }

            statusMap[status][trimmedProvider] = value;
        });

        var datasets = [];

        Object.keys(statusMap).forEach(function (status) {
            var data = [];

            providers.forEach(function (provider) {
                data.push(statusMap[status][provider] || 0);
            });

            datasets.push({
                label: status,
                data: data
            });
        });

        return {
            labels: providers,
            datasets: datasets,
            fullProviderMap: fullProviderMap
        };
    }


    function trimLabel(value, maxLength) {
        if (!value) return '';
        value = String(value);
        return value.length > maxLength
            ? value.substring(0, maxLength) + '...'
            : value;
    }

    function renderStackedBarChart(config) {
        var $container = $('#' + config.containerId);
        if (!$container.length) return;

        destroyChart(config.containerId);
        $container.empty();

        var chartHtml = `
            <div class="dshb-chart-canvas-wrapper">
                <canvas id="canvas_${config.containerId}"></canvas>
            </div>`;

        $container.html(chartHtml);

        var ctx = document.getElementById('canvas_' + config.containerId).getContext('2d');
        var chartData = transformStackedChartData(config.data);

        var datasets = chartData.datasets.map(function (ds, index) {
            return {
                label: ds.label,
                data: ds.data,
                backgroundColor: defaultColors[index % defaultColors.length],
                borderWidth: 0,
                borderRadius: 6,
                stack: 'stack1'
            };
        });

        chartInstances[config.containerId] = new Chart(ctx, {
            type: 'bar',
            data: {
                labels: chartData.labels,
                datasets: datasets
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    tooltip: {
                        callbacks: {
                            title: function (tooltipItems) {
                                var chartData = tooltipItems[0].chart.config.data;
                                var trimmedLabel = tooltipItems[0].label;

                                if (chartData.fullProviderMap && chartData.fullProviderMap[trimmedLabel]) {
                                    return chartData.fullProviderMap[trimmedLabel];
                                }

                                return trimmedLabel;
                            }
                        }
                    }
                },
                scales: {
                    x: {
                        ticks: {
                            autoSkip: false,
                            maxRotation: 45,
                            minRotation: 0
                        }
                    },
                    y: {
                        beginAtZero: true
                    }
                }
            }

        });
    }

    /* =========================
   MULTIPLE LINE CHART DATA TRANSFORM
   ========================= */
    function transformMonthlyMultiLineChartData(apiData) {
        var months = [];
        var statusMap = {};

        apiData.forEach(function (item) {
            var month = item.month;
            var status = item.xAxis;
            var value = parseFloat(item.yAxis) || 0;

            if (!months.includes(month)) {
                months.push(month);
            }

            if (!statusMap[status]) {
                statusMap[status] = {};
            }

            statusMap[status][month] = value;
        });

        var datasets = [];

        Object.keys(statusMap).forEach(function (status) {
            var data = [];

            months.forEach(function (month) {
                data.push(statusMap[status][month] || 0);
            });

            datasets.push({
                label: status,
                data: data,
                fill: false,
                tension: 0.1,
                pointRadius: 2,
                borderWidth: 2
            });
        });

        return {
            labels: months,
            datasets: datasets
        };
    }


    /* =========================
   MULTIPLE LINE CHART RENDER
   ========================= */
 
    function renderMonthlyMultiLineChart(config) {
        var $container = $('#' + config.containerId);
        if (!$container.length) return;

        destroyChart(config.containerId);
        $container.empty();

        var chartHtml = `
        <div class="dshb-chart-canvas-wrapper">
            <canvas id="canvas_${config.containerId}"></canvas>
        </div>`;

        $container.html(chartHtml);

        var ctx = document
            .getElementById('canvas_' + config.containerId)
            .getContext('2d');

        var chartData = transformMonthlyMultiLineChartData(config.data);

        var datasets = chartData.datasets.map(function (ds, index) {
            return {
                label: ds.label,
                data: ds.data,
                fill: false,
                tension: ds.tension,
                pointRadius: ds.pointRadius,
                borderWidth: ds.borderWidth,
                borderColor: defaultColors[index % defaultColors.length]
            };
        });

        chartInstances[config.containerId] = new Chart(ctx, {
            type: 'line',
            data: {
                labels: chartData.labels,
                datasets: datasets
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,

                interaction: {
                    mode: 'index',
                    intersect: false
                },

                plugins: {
                    legend: {
                        display: true,
                        position: 'top'
                    },
                    tooltip: {
                        callbacks: {
                            label: function (context) {
                                return context.dataset.label + " - " + context.formattedValue;
                            }
                        }
                    }
                },

                scales: {
                    x: {
                        title: {
                            display: true,
                            text: 'Month'
                        }
                    },
                    y: {
                        beginAtZero: true,
                        title: {
                            display: true,
                            text: 'Total Orders'
                        }
                    }
                }
            }
        });
    }

    return {
        renderBarChart: renderBarChart,
        renderPieChart: renderPieChart,
        renderStackedBarChart: renderStackedBarChart,
        renderMultiLineChart: renderMonthlyMultiLineChart,
        renderLineChart: renderLineChart,
        renderSimpleLineChart: renderSimpleLineChart,
        destroyChart: destroyChart,
        showSkeleton: showSkeleton,
        showEmptyState: showEmptyState,
        showErrorState: showErrorState
    };

})();

 
$(document).ready(function () {
    Dashboard.Init();
});

$(document).ready(function () {
    var postbackUrl = "../../../apix/UserSession/GetUserRolesByPage";
    var meta = {};
    meta.PageName = 'dashboard.html';

    __DoAsyncPostBack(meta, postbackUrl, function (ajxOut) {
        if (ajxOut.Success == false) {
            return '';
        }

        if (ajxOut.Success == true) {
           
            var rolValue = ajxOut.ResultData;
            if (rolValue.includes('DV') == true ) {
                $('#dshBordSupervisorAdmin').remove();
                $('#dshBordEndUser').remove();
            }
 
        }
    });
});