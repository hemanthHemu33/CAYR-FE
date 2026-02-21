"use strict";

// Shared state
const downloadState = {
    url: "../../../apix/Download/",
    statusIntervalId: null,
    uiProgressIntervalId: null,
    canGetStatus: false,
    currentFilePath: "",
    currentDownloadLabel: "",
    downloadType: "",
    threadId: 0,
    uiProgress: 0,
    containerId: "downloadStatusArea"
};

// DOM helper
const $id = (id) => document.getElementById(id);

// Extract file name
function extractFileName(path) {
    if (!path) return "";
    return path.split(/[/\\]/).pop();
}

// UI builder
const downloadUI = {

    init(containerId, labelText) {
        downloadState.containerId = containerId;
        downloadState.uiProgress = 0;

        const container = $id(containerId);
        if (!container) {
            console.error("Container not found:", containerId);
            return;
        }

        container.innerHTML = `
        <div class="fa fa-close" data-ev="Ev_Close_DownloadProgress" style="position: absolute;right: 19px;font-size: 18px;top: 84px;cursor: pointer;transition: 0.2s;color: rgb(136, 136, 136);"></div>
    <div style="padding:12px; border:1px solid #ddd; ">
        
 

        <div id="downloadStatusMessage"
            style="font-size:14px; margin-bottom:10px; color:#444;">
            ${labelText}
        </div>

        <div id="downloadProgressWrapper"
            style="width:100%; background:#e9ecef; border-radius:4px; height:22px; overflow:hidden;">

            <div id="downloadProgressBar"
                style="width:0%; height:100%; background:#007bff;
                       color:white; text-align:center; font-size:13px;
                       line-height:22px; font-weight:bold;">
                0%
            </div>
        </div>

        <div id="downloadStatusExtra"  class="bg-secondary" style="margin-top:8px;"></div>
    </div>
`;

    },

    setMessage(text) {
        const el = $id("downloadStatusMessage");
        if (el) el.innerHTML = text;
    },

    setProgress(percent) {
        const bar = $id("downloadProgressBar");
        if (!bar) return;

        const v = Math.round(Math.min(100, Math.max(0, percent)));

        bar.style.width = v + "%";
        bar.textContent = v + "%";
    },

    hideProgressBar() {
        const wrapper = $id("downloadProgressWrapper");
        if (wrapper) wrapper.style.display = "none";
    },

    showSuccess(fileName) {
        const area = $id("downloadStatusExtra");
        if (!area) return;

        area.innerHTML = `
        <div class="bg-secondary" style="
            text-align:center;
            background:#ffffff;
        ">
            <!-- Animated Check Icon -->
            <div style="font-size:55px; color:#28a745; margin-bottom:15px;">
                <i class="fa fa-check-circle" 
                   style="animation:popIn 0.5s ease-out;"></i>
            </div>

            <h6 style="margin:0;   font-weight:600; color:#1b1b1b;">
                File Generated Successfully!
            </h62>

            <p style="margin-top:8px; color:#555; font-size:15px;">
                Your file is ready.    <a href="../app/DownloadFile.aspx?fileName=${encodeURIComponent(fileName)}"
               target="_blank"
               "> Click here
            </a> to download.
            </p>

         
        </div>

        <!-- Animation Keyframes -->
        <style>
            @keyframes popIn {
                0% { transform: scale(0.2); opacity:0; }
                60% { transform: scale(1.2); opacity:1; }
                100% { transform: scale(1); }
            }
        </style>
    `;
    }


};

// Main controller
const download = {

    DownloadData(type, fn, meta, containerId) {
        downloadState.currentDownloadLabel = " for " + type;
        downloadState.downloadType = type;
        downloadState.currentFilePath = "";

        downloadUI.init(containerId, `Preparing download <b>${downloadState.currentDownloadLabel}</b>`);
        downloadUI.setProgress(0);

        downloadState.canGetStatus = true;

        this.startBackendPolling();
        this.startUIProgress();

        this.callApi("EV_DOWNLOAD", fn, meta || {});
    },

    // UI progress
    startUIProgress() {
        this.stopUIProgress();

        downloadState.uiProgressIntervalId = setInterval(() => {
            if (downloadState.uiProgress < 95) {
                downloadState.uiProgress += Math.floor(Math.random() * 7) + 5;
                downloadUI.setProgress(downloadState.uiProgress);
            }
        }, 3000);
    },

    stopUIProgress() {
        if (downloadState.uiProgressIntervalId !== null) {
            clearInterval(downloadState.uiProgressIntervalId);
            downloadState.uiProgressIntervalId = null;
        }
    },

    // Backend polling
    startBackendPolling() {
        this.stopBackendPolling();

        downloadState.statusIntervalId = setInterval(() => {
            this.getDownloadStatus();
        }, 1000);
    },

    stopBackendPolling() {
        if (downloadState.statusIntervalId !== null) {
            clearInterval(downloadState.statusIntervalId);
            downloadState.statusIntervalId = null;
        }
    },

    getDownloadStatus() {
        if (!downloadState.canGetStatus) return;
        this.callApi("DownloadStatus", "getDownloadStatus", {});
    },

    downloadStatusResponse(objout) {

        if (objout.Success === false && objout.Sender === "NoSession") {
            $('#btnDownloadOrder').prop('disabled', false).html('<i class="fa-solid fa-cloud-download-alt" data-ev="Ev_Downlaod_Orders" aria-hidden="true"></i>');
            this.finishWithError("Your session has expired. Please refresh the page.");
            return;
        }

        const rows = Array.isArray(objout.ResultData) ? objout.ResultData : [];
        if (rows.length === 0) {
            $('#btnDownloadOrder').prop('disabled', false).html('<i class="fa-solid fa-cloud-download-alt" data-ev="Ev_Downlaod_Orders" aria-hidden="true"></i>');
            return;
        }

        let completed = 0;

        rows.forEach(row => {
            downloadState.threadId = row.ThreadId;
            downloadState.currentFilePath = row.FilePath || "";

            const current = Number(row.count) || 0;
            const total = Number(row.TotalCount) || 1;

            const backendPercent = Math.min(100, (current / total) * 100);

            if (backendPercent > downloadState.uiProgress) {
                downloadState.uiProgress = backendPercent;
                downloadUI.setProgress(backendPercent);
            }

            if (row.Status === "Done") {
                completed++;
            }
        });

        if (completed === rows.length) {
            this.onDownloadComplete();
        }
    },

    onDownloadComplete() {
        downloadState.canGetStatus = false;

        this.stopBackendPolling();
        this.stopUIProgress();

        downloadUI.setProgress(100);

        const fileName = extractFileName(downloadState.currentFilePath);
        downloadUI.showSuccess(fileName);

        this.callApi("threadKill", "KillThread", { ThreadID: downloadState.threadId });
        $('#btnDownloadOrder').prop('disabled', false).html('<i class="fa-solid fa-cloud-download-alt" data-ev="Ev_Downlaod_Orders" aria-hidden="true"></i>');
    },

    finishWithError(msg) {
        downloadState.canGetStatus = false;

        this.stopBackendPolling();
        this.stopUIProgress();

        downloadUI.hideProgressBar();
        downloadUI.setMessage(msg);
    },

    callApi(event, fn, meta) {
        const url = downloadState.url + "/" + fn;

        __DoAsyncPostBack(meta, url, (response) => {

            if (!response || response.Success === false) {
                $('#btnDownloadOrder').prop('disabled', false).html('<i class="fa-solid fa-cloud-download-alt" data-ev="Ev_Downlaod_Orders" aria-hidden="true"></i>');
                this.finishWithError(response?.Message || "Unable to complete request.");
                return;
            }

            this.callBackApi(event, response);
        });
    },

    callBackApi(event, response) {
        switch (event) {
            case "EV_DOWNLOAD": break;
            case "DownloadStatus": this.downloadStatusResponse(response); break;
            case "threadKill": 
                break;
      
        }
    }
};
