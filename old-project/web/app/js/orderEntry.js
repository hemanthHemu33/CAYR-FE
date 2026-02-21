"use strict";
var _GlobalOrder = {
    url: '../../../apix/OrdersEntery/',
    patientDetailsUrl: '../../../apix/PatientDetails/',
    totalSteps: 6,
    currentStep: 1,
    OrderId: '',
    hasAddPhyRole: false,
};

let manageFacilityWin = null;
var Orders = {
    _PatientGrid: {},
    _PatientGridRecount: 0,
    Init: function () {
        document.getElementById('divMain').addEventListener('click', this);
        this.initilizeGridsonPage();
        document.getElementById('searchType').addEventListener('change', this);
        document.getElementById('inpOrderClient').addEventListener('change', this);
        // document.getElementById('inpOrderFacility').addEventListener('change', this);
        document.getElementById('physicianDropdown').addEventListener('click', this);
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
        $(function () {
            $('#inpPatientDOB, #inpPrimaryInsuredDOB').each(function () {
                flatpickr(this, {
                    dateFormat: "m-d-Y",
                    maxDate: "today",
                    defaultDate: null,
                    allowInput: true
                });
            });
        });
        $(function () {
            $('#hdrRecurringEndDate').each(function () {
                flatpickr(this, {
                    dateFormat: "m-d-Y",
                    minDate: "today",
                    maxDate: new Date().fp_incr(365),
                    defaultDate: null,
                    onChange: function (selectedDates, dateStr, instance) {
                        instance.close();
                    }
                });
            });

        });
        const toggleSSN = document.getElementById("toggleSSN");
        const inpSSN = document.getElementById("inpSSN");

        toggleSSN.addEventListener("click", () => {
            if (inpSSN.type === "password") {
                inpSSN.type = "text";
                toggleSSN.classList.replace("fa-eye", "fa-eye-slash");
            } else {
                inpSSN.type = "password";
                toggleSSN.classList.replace("fa-eye-slash", "fa-eye");
            }
        });
        $(function () {
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

        // Initialize wizard
        Orders.gotoStep(_GlobalOrder.currentStep);
        Core.GetAllClients('OrderEntery');

        Core.getStateList('inpPatientState');
        Core.getStateList('inpInsuranceCompanyState');
        Core.getStateList('inpPrimaryInsuredAddressState');



        let UrlParmMea = this.getOrderMetaFromUrl();
        _GlobalOrder.OrderId = UrlParmMea.id
        _GlobalOrder.OrderStatus = UrlParmMea.status
        _GlobalOrder.workQueueId = UrlParmMea.workQueueId  
        if (UrlParmMea.source == "WorkFlow") {
            $('#btnWorkflowResume').removeClass('d-none')
        } else {
            $('#btnWorkflowResume').addClass('d-none')
        }
        if (_GlobalOrder.OrderId != '') {
            $('#btnCancelOrder').removeClass('d-none')
            this.GetPatientDetail(_GlobalOrder.OrderId)
        }


    },
    initilizeGridsonPage: function () {
        //PhysicianFacility Grid
        this._PatientGrid = new QCGrid();
        this._PatientGrid.width = '100%';
        /* this._PatientGrid.height = 'calc(52vh - 138px)';*/
        this._PatientGrid.id = 'tblPatientGrid'
        this._PatientGrid.containerID = 'PatientGrid';
        this._PatientGrid.class = 'table table-bordered table-striped table-hover gridLayoutFix';

    },
    getOrderMetaFromUrl: function () {
        const params = new URLSearchParams(window.location.search);

        const meta = {
            id: '',
            status: '',
            source: '',
            workQueueId: ''
        };

        const decodeBase64Param = function (key) {
            const value = params.get(key);

            if (!value) {
                return '';
            }

            try {
                return atob(value);
            } catch (e) {
                console.error('Invalid Base64 value for ' + key + ':', value);
                return '';
            }
        };

        meta.id = decodeBase64Param('id');
        meta.status = decodeBase64Param('status');
        meta.source = decodeBase64Param('source');
        meta.workQueueId = decodeBase64Param('WorkQueueId');

        return meta;
    },

    LoadExistingOrder: async function (OrderId, orderStatus, hosId, CurrentStep) {
        var meta = {}
        meta.OrderID = OrderId;
        meta.CurrentStep = CurrentStep;
        let fucntionName = 'GetDraftOrderInforamtion';
        var url = _GlobalOrder.url + fucntionName;
        var ajxOut = await __PromisAsyncPostBack(meta, url);
        if (!ajxOut.Success) {
            _$modxAppProgressBar.hide();
            _$modxAppCore.showErrorMessage(ajxOut.Message, 'error', 'NoPatinetMessage');
            return false;
        }
        if (orderStatus == "Draft") {
            OrderInformation.plotExistingOrderItems(ajxOut.ResultData)
            Orders.processPatientDocuments(ajxOut.CommandArgs.Result)
            //Orders.buildDocsUI(ajxOut.CommandArgs.Result, "#" + hosId);
        } else {
            Orders.buildDocsUI(ajxOut.CommandArgs.Result, "#" + hosId);
        }
        _$modxAppProgressBar.hide();
    },
    processPatientDocuments: function (resultArray) {
        if (!Array.isArray(resultArray)) return;

        // Filter Patient ID documents
        const patientIdDocs = resultArray.filter(
            x => x.DocumentType === "Patient ID"
        );
        if (patientIdDocs.length > 0) {
            Orders.buildDocsUI(patientIdDocs, "#PatientDocHost");
            $('#patientDocAttach').html('');
            $('#PatientDocHost').removeClass('d-none')
        }

        // Filter Insurance Card documents
        const insuranceDocs = resultArray.filter(
            x => x.DocumentType === "Insurance Card"
        );
        if (insuranceDocs.length > 0) {
            Orders.buildDocsUI(insuranceDocs, "#PatientInsDocHost");
            $('#patientDocAttach').html('');
            $('#PatientInsDocHost').removeClass('d-none')
        }

        //  load all documents  
        Orders.buildDocsUI(resultArray, "#OrderDraftDocHost");
    },

    //Funciton to get PatientDetailID for the draftOrder Edit 
    GetPatientDetail: async function (OrderId) {
        _$modxAppProgressBar.show();
        var meta = {}
        meta.OrderID = OrderId;
        let fucntionName = 'GetOrderDraftHeaderInfromation';
        var url = _GlobalOrder.url + fucntionName;
        var ajxOut = await __PromisAsyncPostBack(meta, url);
        if (!ajxOut.Success) {
            _$modxAppProgressBar.hide();
            _$modxAppCore.showErrorMessage(ajxOut.Message, 'error', 'NoPatinetMessage');
            return false;
        }
        // Initialize Selectize
        var clientSelect = $('#inpOrderClient').selectize()[0].selectize;
        // Set ClientID (selects the value)
        clientSelect.setValue(ajxOut.ResultData.ClientID);
        $('#facilitySearch').val(ajxOut.ResultData.FacilityName)
        _GlobalOrder.FacilityID = ajxOut.ResultData.FacilityID
        await this.GetFacilityNpi(ajxOut.OrderingPhysician,'MappedPhysicianInFacility');
        this.updatePhysicianFields(ajxOut.ResultData)
        $('#inpServiceLocationName').val(ajxOut.ResultData.ServiceLocationName)
        $('#inpServiceLocationType').val(ajxOut.ResultData.ServiceLocationType)
        // get ordeing physician on the basis of facilityID
        try {
            await Orders.GetPatientInformation(ajxOut.ResultData.PatientID);
            if (_GlobalOrder.OrderStatus === "ResumeOrder") {
                _$modxAppProgressBar.hide();
                Orders.gotoStep(3);
                return; // stop further work
            }

            await this.setDraftOrderUi(ajxOut.ResultData);
            await Orders.LoadExistingOrder(_GlobalOrder.OrderId, "Draft");

        } catch (err) {
            if (err === "__STOP__") return; // intentional short-circuit
            console.error("Error fetching Facility NPI:", err);
            _$modxAppCore.showErrorMessage("Failed to fetch Facility NPI", "error", "divValidateMsgMap");
        }


        _$modxAppProgressBar.hide();
    },
    buildDocsUI: function (resultArray, hostSelector) {
        const $host = $(hostSelector);
        if (!$host.length) return;

        const rows = Array.isArray(resultArray) ? resultArray : [];
        $host.empty();

        // Table shell
        const $table = $('<table/>', {
            class: 'table table-sm table-hover align-middle mb-0'
        });

        // Header
        const $thead = $('<thead/>').append(
            $('<tr/>')
                // hidden ID column header (still present for semantics)
                .append($('<th/>', { class: 'd-none', text: 'OrderDocumentsId' }))
                .append($('<th/>', { text: 'Document Description' }))
                .append($('<th/>', { text: 'Original Document Name' }))
                .append($('<th/>', { text: 'Document Tag' }))
                .append($('<th/>', { text: 'Document Type' }))
                .append($('<th/>', { text: 'Uploaded By' }))
                .append($('<th/>', { text: 'Remove' }))
        );

        const $tbody = $('<tbody/>');

        if (rows.length === 0) {
            $tbody.append(
                $('<tr/>').append(
                    $('<td/>', {
                        colspan: 4,
                        class: 'text-muted small',
                        text: 'No documents available.'
                    })
                )
            );
        } else {
            rows.forEach(r => {
                const id = r?.OrderDocumentsId ?? '';
                const docName = ((r?.DocumentName ?? '') + '').trim() || '--';
                const origName = ((r?.OriginalDocumentName ?? '') + '').trim() || '--';
                const docTag = ((r?.DocumentTag ?? '') + '').trim() || '--';
                const docType = ((r?.DocumentType ?? '') + '').trim() || '--';
                const createdBy = ((r?.CreatedBy ?? '') + '').trim() || '--';

                const $tr = $('<tr/>', { 'data-id': id });

                $tr.append($('<td/>', { class: 'd-none', text: id }));

                // DocumentName
                $tr.append($('<td/>', { text: docName }));

                // OriginalDocumentName as link
                const $link = $('<a/>', {
                    href: '#',
                    text: origName,
                    'data-ev': 'Ev_open_document',
                    'data-model-prop': 'FileName',
                    'data-for': `tktDoc${id}`,
                    'data-original-name': origName,
                    'data-id': id
                });
                $tr.append($('<td/>').append($link));

                $tr.append($('<td/>', { text: docTag }));
                $tr.append($('<td/>', { text: docType }));
                // CreatedBy
                $tr.append($('<td/>', { text: createdBy }));
                let DelPrntElm = hostSelector.replace(/^#+/, "");
                // Delete icon button
                const $delBtn = $('<button/>', {
                    type: 'button',
                    class: 'btn btn-link p-0 text-danger',
                    html: `<i class="fa fa-trash" data-ev="Ev_delete_document_${DelPrntElm}" data-id = ${id}></i>`,
                    'data-ev': `Ev_delete_document_${DelPrntElm}`,
                    'data-id': id

                });
                $tr.append($('<td/>', { class: 'text-left p-0' }).append($delBtn));
                $tbody.append($tr);
            });
        }

        $table.append($thead, $tbody);
        $host.append($table);
        $('#OrderDraftDocHost').removeClass('d-none')
    },

    setDraftOrderUi: function (data) {
        $('#inpServiceLocationCode').val(data.ServiceLocationCode)

        $('#inpServiceLocationUnit').val(data.ServiceLocationUnit)
        $('#inpPatientRoomNumber').val(data.PatientRoomNumber)
        $('#inpPatientBed').val(data.PatientBed)

        $('#orderNumber').text('# ' + data.PrimaryOrderNumber)

        $('#clientName').text(data.ClientName)
        $('#facilityName').text(data.FacilityName)
        $('#providerName').text(data.PhysicianName)



    },
    updatePhysicianFields: function (data) {
        // Build "NPI (Name)" only if Name exists
        const npi = (data?.PhysicianNPI ?? '').toString().trim();
        const name = (data?.PhysicianName ?? '').toString().trim();
        /*        const provider = name ? `${npi} (${name})` : npi;*/

        // Set value in Selectize element if available, otherwise plain input
        //const el = document.getElementById('FacilityNpi');
        //if (el && el.selectize) {
        //    el.selectize.setTextboxValue(provider);
        //} else {
        //    $('#FacilityNpi-selectized').val(provider);
        //}
        const selector = `#physicianDropdown li[data-value="${data.OrderingPhysician}"]`;
        const item = document.querySelector(selector);

        if (item) {
            item.click();
        }
        // $('#OrderingNpi').val(`${npi}(${name})` )

        // Fill other related inputs
        $('#inpUPIN').val(data?.UPIN ?? '');
        $('#inpCredential').val(data?.Speciality ?? '');
        $('#inpPhysicianName').val(data?.PhysicianName ?? '');
        $('#inpSpeciality').val(data?.Speciality ?? '');
    },
    //============================ Wizzared related code ===============================================================//

    setProgress: function (step) {
        var pct = ((step - 1) / (_GlobalOrder.totalSteps - 1)) * 100;
        $('.wizard-progress-bar').css('width', pct + '%');
    },
    setSteps: function (step) {
        // $('.wizard-step').removeClass('active completed');
        $('.wizard-step').each(function (i, el) {
            var idx = i + 1;
            if (idx < step) $(el).addClass('completed');
            if (idx < step) $(el).removeClass('active');
            if (idx === step) $(el).addClass('active');
        });
        $("#wizard-header-current").text(step);
    },
    showPane: function (step) {
        $('.wizard-pane').addClass('d-none');
        $('.wizard-pane[data-pane=' + step + ']').removeClass('d-none').css('opacity', 0).animate({ opacity: 1 }, 240);
    },

    // Updates navigation buttons based on the current step
    updateButtons: function (step) {
        $('.wizard-prev').prop('disabled', step === 1);

        if (step === _GlobalOrder.totalSteps - 1 || step === 6) {
            $('#NextBtnOrder').addClass('d-none');

            // Change to "Save & Preview"  
            $('#btnSaveOrder')
                .attr('data-ev', 'EV_Save_Preview')
                .attr('aria-label', 'Save and preview order')
                .html('<i class="fa fa-eye ms-1" data-ev="EV_Save_Preview" aria-hidden="true"></i> Save &amp; Preview ');
        } else {
            $('#NextBtnOrder').removeClass('d-none');

            // Revert to original "Save"  
            $('#btnSaveOrder')
                .attr('data-ev', 'EV_Save')
                .attr('aria-label', 'Save order')
                .html('<i class="fa fa-save ms-1" data-ev = "EV_Save" aria-hidden="true"></i> Save &amp; Next');
        }


        var $nextBtn = $('.wizard-next');
        if (step === _GlobalOrder.totalSteps) {
            $('#btnSubmitOrder').removeClass('d-none')
            $('#btnSaveOrder').addClass('d-none');
        } else {
            $('#btnSubmitOrder').addClass('d-none')
            $('#btnSaveOrder').removeClass('d-none');
            $nextBtn.html('Next');
        }
    },

    // Navigates to a specific step in the wizard
    gotoStep: function (step) {
        $('#inlineNavigationAlert').html('');
        _GlobalOrder.currentStep = step;
        if (step > 6) {
            return;
        }
        this.setProgress(step);
        this.setSteps(step);
        this.showPane(step);
        this.updateButtons(step);

    },

    // Handles saving data for the current step (async safe)
    handleSave: async function () {
        _$modxAppCore.showErrorMessage('', 'success', 'orderErrorMsg');

        const saveFunctions = {
            1: Orders.SavePatientDetails,
            2: Orders.SavePatientInsurance,
            3: Orders.GenrateOrderHeaderInformation,
            4: Orders.SaveServiceLocationInformation,
            5: OrderInformation.GetOrderHeaderInformation(_GlobalOrder.OrderId),
            6: () => this.saveFinalStep(true)
        };

        const saveFn = saveFunctions[_GlobalOrder.currentStep];
        if (typeof saveFn === 'function') {
            const isSaved = await saveFn.call(this);
            if (isSaved) {
                _$modxAppCore.showErrorMessage('Step saved successfully!', 'success', 'orderErrorMsg');
                if (_GlobalOrder.currentStep < _GlobalOrder.totalSteps) {
                    _$modxAppCore.showErrorMessage('', 'success', 'orderErrorMsg');
                    Orders.gotoStep(_GlobalOrder.currentStep + 1);
                    return;
                }
            }
        } else {
            console.warn(`No save function defined for step ${_GlobalOrder.currentStep}`);
        }

        //if (_GlobalOrder.currentStep < _GlobalOrder.totalSteps) {
        //    _$modxAppCore.showErrorMessage('', 'success', 'orderErrorMsg');
        //    Orders.gotoStep(_GlobalOrder.currentStep + 1);
        //    return;
        //}
    },

    handleNext: async function () {
        _$modxAppCore.showErrorMessage('', 'success', 'orderErrorMsg');
        if (_GlobalOrder.OrderId != '') {
            // OrderInformation.GetOrderHeaderInformation(_GlobalOrder.OrderId)
        }
        if (_GlobalOrder.currentStep < _GlobalOrder.totalSteps) {
            _$modxAppCore.showErrorMessage('', 'success', 'orderErrorMsg');
            Orders.gotoStep(_GlobalOrder.currentStep + 1);
            return;
        }
        //const saveFunctions = {
        //    1: Orders.SavePatientDetails,
        //    2: Orders.SavePatientInsurance,
        //    3: Orders.GenrateOrderHeaderInformation,
        //    4: Orders.SaveServiceLocationInformation,
        //    5: () => true,
        //    6: () => this.saveFinalStep(true)
        //};

        //const saveFn = saveFunctions[_GlobalOrder.currentStep];
        //if (typeof saveFn === 'function') {
        //    const isSaved = await saveFn.call(this);
        //    if (isSaved) {
        //        _$modxAppCore.showErrorMessage('Step saved successfully!', 'success', 'orderErrorMsg');
        //        if (_GlobalOrder.currentStep < _GlobalOrder.totalSteps) {
        //            _$modxAppCore.showErrorMessage('', 'success', 'orderErrorMsg');
        //            Orders.gotoStep(_GlobalOrder.currentStep + 1);
        //            return;
        //        }
        //    }  
        //}
        //if (_GlobalOrder.currentStep < _GlobalOrder.totalSteps) {
        //    _$modxAppCore.showErrorMessage('', 'success', 'orderErrorMsg');
        //    Orders.gotoStep(_GlobalOrder.currentStep + 1);
        //    return;
        //}


    },

    handlePrev: function () {
        _$modxAppCore.showErrorMessage('', 'success', 'orderErrorMsg');
        if (_GlobalOrder.currentStep > 1) this.gotoStep(_GlobalOrder.currentStep - 1);
    },
    handleStepClick: function (stepIdx) {

        if (stepIdx <= _GlobalOrder.currentStep) this.gotoStep(stepIdx);
    },

    saveFinalStep: async function (isSubmit, currentIndx) {
        _$modxAppProgressBar.show();
        let meta = {}
        meta.OrderID = _GlobalOrder.OrderId
        var functionName = "UpdateOrderStatus";
        var url = _GlobalOrderLab.url + functionName;
        var ajaxOut = await __PromisAsyncPostBack(meta, url);
        if (ajaxOut.Success) {
            _$modxAppCore.showErrorMessage('', 'success', 'orderErrorMsg');
            //Handles post-submission success view
            const proceedToSuccess = (ajax) => {
                Orders.setSteps(6);
                $('.wizard-pane').addClass('d-none');
                $('.wizard-next, .wizard-prev').prop('disabled', true);


                const orderNumber = $('#OrderNumber').text().trim();

                $('.wizard-content').html(`
                <div class="wizard-success-animate text-center py-5">
                    <span class="fa-stack fa-2x success-icon-animate mb-3">
                        <i class="fa-solid fa-circle fa-stack-2x text-success" style="opacity:0.16;"></i>
                        <i class="fa-solid fa-check fa-stack-1x text-success"></i>
                    </span>
                    <h4 class="fw-bold mt-2 mb-2" style="letter-spacing:.01em;">Order Completed!</h4>
                    <div class="mb-2 text-muted" style="font-size:1.02rem;">
                        Your order has been <span class="text-success fw-semibold">successfully submitted</span>.
                    </div>
                    <div class="mb-2">
                        <a href="#"
                           class="fw-semibold text-decoration-none"
                           data-id="${_GlobalOrder.OrderId}"
                           data-ev="Ev_ShowOrder_detail">
                           View Order Details #${orderNumber}
                        </a>
                    </div>
                    <button class="btn btn-primary btn-sm px-3 mt-3" onclick="location.reload()">
                        <i class="fa fa-plus me-1"></i> New Order
                    </button>
                </div>
            `);
            };
            _$modxAppProgressBar.hide();
            proceedToSuccess(true).call(this);
            _$modxAppCore.showErrorMessage('', 'error', 'orderErrorMsg');
        }
        _$modxAppProgressBar.hide();
    },
    //=================================================================================================================//

    //====================================== Patient Information start ===============================================================||


    toggleSearchFields: function (selected) {
        const key = (selected || document.getElementById('searchType')?.value || 'mrn').toLowerCase();
        const groups = {
            mrn: 'mrnFields',
            account: 'AccountFields',
            patientid: 'patientIdField',
            patientname: 'patientNameField',
            dob: 'patientDobField',
            ssn: 'ssnField'
        };

        const chosen = groups[key];
        Object.values(groups).forEach(id => {
            const wrap = document.getElementById(id);
            if (!wrap) return;
            wrap.classList.add('d-none');
            wrap.setAttribute('aria-hidden', 'true');
            wrap.querySelectorAll('input, select, textarea').forEach(el => {
                if (el._flatpickr) {
                    try { el._flatpickr.clear(); } catch { el.value = ''; }
                } else {
                    el.value = '';
                }
                el.disabled = true;
                el.removeAttribute('aria-invalid');
            });
        });

        if (!chosen) return;
        const target = document.getElementById(chosen);
        if (!target) return;

        target.classList.remove('d-none');
        target.removeAttribute('aria-hidden');
        target.querySelectorAll('input, select, textarea').forEach(el => { el.disabled = false; });

        (target.querySelector('[data-default-focus]') || target.querySelector('input, select, textarea'))?.focus({ preventScroll: true });
    },


    //fucntion to check weather order npi is selcted or not     
    isOptionSelected: function (selectId) {
        let val = $(`#${selectId}`).val();
        return val !== null && val !== "";
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

                    Orders.GetFacilityNpi('', 'MappedPhysicianInFacility');
                    Orders.GetFacilityInformation();
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
    GetFacilityInformation: async function () {
        const meta = {};
        meta.FacilityID = _GlobalOrder.FacilityID || $('#facilitySearch').attr('data-selected-id');
 

        const functionName = "GetFacilityInformation";
        const url = _GlobalOrder.url + functionName;

        const ajax = await __PromisAsyncPostBack(meta, url);
        if (ajax.Success) {
            $('#inpServiceLocationName').val(ajax.ResultData.ServiceLocationName)
            $('#inpServiceLocationType').val(ajax.ResultData.ServiceLocationType)
        }
 
    },
    GetPatientInformation: async function (PatientDetailID) {
        var meta = {}
        meta.PatientDetailID = PatientDetailID;
        let fucntionName = 'GetPatientInformation';
        var url = _GlobalOrder.url + fucntionName;
        var ajxOut = await __PromisAsyncPostBack(meta, url);
        if (!ajxOut.Success) {
            _$modxAppProgressBar.hide();
            _$modxAppCore.putAppCoreModel('PatientDemographicsMeta', {});
            _$modxAppCore.putAppCoreModel('PatientInsuranceMeta', {});
            _$modxAppCore.showErrorMessage(ajxOut.Message, 'error', 'NoPatinetMessage');
            return false;
        }
        if (ajxOut.ResultData.Result.data.length == 0) {
            _$modxAppCore.putAppCoreModel('PatientDemographicsMeta', {});
            _$modxAppCore.putAppCoreModel('PatientInsuranceMeta', {});
            _$modxAppCore.showErrorMessage('No patient found matching your search.', 'information', 'NoPatinetMessage');
            _$modxAppProgressBar.hide();
            return false;
        }
        _$modxAppCore.showErrorMessage('', 'information', 'NoPatinetMessage');
        _$modxAppCore.putAppCoreModel(
            'PatientDemographicsMeta',
            ajxOut?.ResultData?.Result?.data?.[0] || {}
        );
        if (ajxOut.CommandArgs.Result.data[0].EligibilityStatus == 'Active') {
            ajxOut.CommandArgs.Result.data[0].EligibilityStatus = 1
        } else {
            ajxOut.CommandArgs.Result.data[0].EligibilityStatus = 0
        }
        const $chkDirectBill = $('[data-ev="Ev_CheckedDirectBillToMemb"]');

        if (ajxOut.CommandArgs.Result.data[0].InsuranceType === 'DirectBillToPatient') {
            // Clear the InsuranceType value and check the box
            ajxOut.CommandArgs.Result.data[0].InsuranceType = '';
            $chkDirectBill.prop('checked', true);
            this.togglePatientInsuranceFields(true);

        } else {
            // Uncheck the box and enable all fields
            $chkDirectBill.prop('checked', false);
            this.togglePatientInsuranceFields(false);

        }
        _$modxAppCore.putAppCoreModel(
            'PatientInsuranceMeta',
            ajxOut?.CommandArgs?.Result?.data?.[0] || {}
        );

        _$modxAppProgressBar.hide();

    },
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
    validateSearch: function (searchType) {
        const key = (searchType || '').toLowerCase();
        const reqMap = {
            mrn: ['ClientID', 'FacilityID', 'MRN'],
            account: ['ClientID', 'FacilityID', 'AccountNumber'],
            patientid: ['ClientID', 'FacilityID', 'PatientID'],
            patientname: ['ClientID', 'FacilityID', 'PatientName'],
            ssn: ['ClientID', 'FacilityID', 'SSN']
        };

        const required = reqMap[key] || null;
        const meta = _$modxAppCore.getAppCoreModel('PatientInformationMeta');
        meta.FacilityID = $('#facilitySearch').attr('data-selected-id');
        if (!required) return meta;

        const { isValid, error, missingField } = Core.validateInputs(required, meta) || {};
        if (!isValid) {
            _$modxAppCore.showErrorMessage(error || 'Invalid input.', 'error', 'NoPatinetMessage');
            const sel = missingField ? `#inp${missingField}` : null;
            if (sel && $(sel).length) $(sel).focus();
            return false;
        }
        return meta;
    },
    /**
 * Checks whether the currently active wizard step is marked as completed.
 * @returns {boolean} True if the active wizard step also has the 'completed' class; otherwise, false.
 */
    isActiveWizardStepCompleted: function () {
        const activeStep = document.querySelector('.wizard-step.active');
        if (!activeStep) return false; // No active step found

        return activeStep.classList.contains('completed');
    },

    //=======================================================Patient Information ends =================================================||
    GetPatientSearchResult: async function (meta) {
        _$modxAppProgressBar.show();
        meta.QCGridParam = Core.gridDefault;
        let fucntionName = 'GetPatinentDetails';
        var url = _GlobalOrder.url + fucntionName;
        var qcGrid = await __PromisAsyncPostBack(meta, url);
        if (!qcGrid.success) {
            _$modxAppProgressBar.hide();
            _$modxAppCore.putAppCoreModel('PatientDemographicsMeta', {});
            _$modxAppCore.putAppCoreModel('PatientInsuranceMeta', {});
            _$modxAppCore.showErrorMessage(qcGrid.Message, 'error', 'NoPatinetMessage');
            return false;
        }
        if (qcGrid.data.length == 0) {
            _$modxAppCore.putAppCoreModel('PatientDemographicsMeta', {});
            _$modxAppCore.putAppCoreModel('PatientInsuranceMeta', {});
            _$modxAppCore.showErrorMessage('No matching patient records were found. Please provide the details below to create a new record.', 'information', 'PatientGrid');
            $('#inpMRN').focus();
            _$modxAppProgressBar.hide();
            return false;
        }
        _$modxAppProgressBar.hide();
        //code to plot the grid
        var grid = Orders._PatientGrid;
        grid.gridData = qcGrid;
        grid.clearBind();
        grid.bind();
        Orders._PatientGridRecount = qcGrid.param.totalRecords;
        _$modxAppProgressBar.hide();
        grid.onSubmit = function (gridParam) {

        }

        grid.onRowDblClick = function (rowNum, colNum, row, colModel) {
            $('.table-primary').removeClass('table-primary');
            $('.tr-select').addClass('table-primary');
            Orders.GetPatientInformation(row.PatientDetailID);
        }
    },
    GetFacilityNpi: async function (physVal, source) {

        const meta = {};
        meta.FacilityID = _GlobalOrder.FacilityID || $('#facilitySearch').attr('data-selected-id');
        meta.ClientID = parseInt($('#inpOrderClient').val(), 10) || 0;
        meta.OrderId = _GlobalOrder.OrderId;
        meta.OrdPhysician = physVal;
        meta.Source = source;

        const functionName = "GetFacilityNpi";
        const url = _GlobalOrder.url + functionName;

        const ajax = await __PromisAsyncPostBack(meta, url);

        if (ajax && ajax.Success) {
            this.bindPhysicianSearchDropDown(ajax, "OrderingNpi", "physicianDropdown");
        }
    },

    bindSelcize: function (elementId, data, valueField, labelField, placeholderText) {
        // Destroy existing selectize instance if already initialized
        if ($('#' + elementId)[0].selectize) {
            $('#' + elementId)[0].selectize.destroy();
        }

        // Initialize Selectize
        $('#' + elementId).selectize({
            valueField: valueField,
            labelField: labelField,
            searchField: labelField,
            options: data || [],
            placeholder: placeholderText || 'Select an option...',
            persist: true,
            selectOnTab: true,
            render: {
                option: function (item, escape) {
                    return "<div>" + escape(item[labelField]) + "</div>";
                },
                no_results: function () {
                    return '<div class="selectize-no-data">No data available</div>';
                }
            },
            onChange: function (value) {
                if (!value) return;

                var selectedOption = this.options[value];
                var selectedText = selectedOption && selectedOption.FacilityID ? selectedOption.FacilityID : '';
                this.$control.attr('title', selectedText);
                Orders.GetPhysicianInfo(value);

            }
        });
    },

    GetPhysicianInfo: async function (PhysiciansMasterID) {
        var meta = {}
        meta.PhysicianID = PhysiciansMasterID;
        var functionName = "GetPhysicianInfo";
        var url = _GlobalOrder.url + functionName;
        var data = await __PromisAsyncPostBack(meta, url);
        _$modxAppCore.putAppCoreModel('PhysicianInfoMeta', data.ResultData);
        _$modxAppCore.showErrorMessage('', 'success', 'orderErrorMsg');
    },
    GetServiceDetails: async (serviceType) => {
        var meta = {}
        meta.FacilityID = $('#facilitySearch').attr('data-selected-id');
        meta.Id = serviceType
        var url = '../../../apix/Services/GetServiceDetails'
        var data = await __PromisAsyncPostBack(meta, url);
        Core.bindSelectList('inpServiceID', data, 'Id', 'Name', 'Select');
    },
    GetCptCodes: async function () {
        var meta = {}
        meta.ServiceID = $('#inpServiceID').val().trim();
        var functionName = "GetLabCptCodes";
        var url = _GlobalOrder.url + functionName;
        var data = await __PromisAsyncPostBack(meta, url);

        Core.bindSelectList('inpCptCodes', data, 'CptCodes', 'CptName', 'Select');

    },
    //=======================================================Order Header Start=================================================||
    GenrateOrderHeaderInformation: async function () {
        //Order header already genrated for the order
        //if (_GlobalOrder.OrderId != '') {
        //    OrderInformation.GetOrderHeaderInformation(_GlobalOrder.OrderId)
        //    return true;
        //}
        try {

            // OrderItemMeta
            let OrderHeaderMeta = {}
            // Set fields
            OrderHeaderMeta.OrderID = _GlobalOrder.OrderId
            OrderHeaderMeta.OrderingPhysician = $("#OrderingNpi").attr("data-selected-id");
            OrderHeaderMeta.CurrentStep = "ProviderInformation";
            if (OrderHeaderMeta.OrderingPhysician == undefined) {
                _$modxAppCore.showErrorMessage('Please provide Provider Npi', 'error', 'orderErrorMsg');
                $('#FacilityNpi').focus();
                return false;
            }

            _$modxAppProgressBar.show();

            var functionName = "GenrateOrderHeaderInformation";
            var url = _GlobalOrderLab.url + functionName;
            var ajaxOut = await __PromisAsyncPostBack(OrderHeaderMeta, url);
            if (ajaxOut.Success) {
                _GlobalOrder.PrimaryOrderNumber = ajaxOut.CommandArgs;
                _$modxAppCore.showErrorMessage('', 'success', 'orderErrorMsg');
                _$modxAppProgressBar.hide();
                return true;
            } else if (!ajaxOut.Success) {
                //_GlobalOrder.OrderId = '';
                //_GlobalOrder.PrimaryOrderNumber = '';
                _$modxAppProgressBar.hide();
                _$modxAppCore.showErrorMessage(ajaxOut.Message, 'error', 'orderErrorMsg');
                return false
            }

        } catch (error) {
            _$modxAppProgressBar.hide();
            _$modxAppCore.showErrorMessage("An unexpected error occurred.", 'error', 'orderErrorMsg');
            return false;
        }
    },
    SaveServiceLocationInformation: async function () {
        try {
            // OrderItemMeta
            let ServiceLocationMeta = _$modxAppCore.getAppCoreModel('OrderServiceLocation');
            if (ServiceLocationMeta == {}) {
                return
            }
            ServiceLocationMeta.OrderID = _GlobalOrder.OrderId;
            _$modxAppProgressBar.show();

            var functionName = "SaveServiceLocationInformation";
            var url = _GlobalOrderLab.url + functionName;
            var ajaxOut = await __PromisAsyncPostBack(ServiceLocationMeta, url);
            _$modxAppProgressBar.hide();
            return true; //TODO
        } catch (error) {
            _$modxAppProgressBar.hide();
            _$modxAppCore.showErrorMessage("An unexpected error occurred.", 'error', 'orderErrorMsg');
            return false;
        }
    },


    //========================================================Order Header ends =================================================||
    showServiceField: function (serviceType) {
        Orders.hideallField();
        $('#orderDetails').removeClass('d-none')
        switch (serviceType) {
            case 'Laboratory':
                this.GetCptCodes();
                OrderLab.Init();
                break;

            case 'Diagnostic Imaging':
                this.GetCptCodes();
                OrderImaging.Init();
                break;
            case 'Skilled Nursing':
                this.GetCptCodes();
                OrderNursing.Init();
                break;
            case 'Home Health':
                this.GetCptCodes();
                OrderHomeHealth.Init()
                break;


        }
        $('#CPTCodes').removeClass('d-none')
        $('#orderInfoSec').removeClass('d-none')

    },
    hideallField: function (visibleId) {
        $('#inpCptCodes').html('<option value="">Select</option>');
        $('#FastFlagChkBox').addClass('d-none') // Fasting flas 
        $('#CPTCodes').addClass('d-none')
        $('#orderInfoSec').addClass('d-none')
        $('#orderDetails').addClass('d-none')
        var allSectionIds = ['Service_Lab', 'Service_Imaging', 'Service_Nursing', 'Service_HomeHealth'];

        allSectionIds.forEach(function (id) {
            var el = document.getElementById(id);
            el.classList.add('d-none');
        });
    },
    // PatientDetails
    SavePatientDetails: async function () {
        var meta = _$modxAppCore.getAppCoreModel('PatientDemographicsMeta');
        var requiredFields = [
            'PatientFirstName', 'PatientLastName', 'PatientDOB', 'PatientSSN',
            'PatientGender', 'PatientPhoneNumber', 'PatientEmail', 'PatientAddress1',
            'PatientCity', 'PatientState', 'PatientZip'
        ];

        var validation = Core.validateInputs(requiredFields, meta);

        if (!validation.isValid) {
            _$modxAppCore.showErrorMessage(`${validation.error}`, 'error', 'orderErrorMsg');
            $('#inp' + validation['missingField']).focus();
            return false; //  
        }
        var len = 12;
        var isValid = Core.checkInputValues(meta.PatientPhoneNumber, len);
        if (isValid == 0) {
            _$modxAppCore.showErrorMessage(`PhoneNumber has to consist of exactly 10 digits`, 'error', 'orderErrorMsg');
            $('#inpPatientPhoneNumber').focus();
            return;
        }
        if (_$AppValidatte.validateEmail(meta.PatientEmail) == false) {
            _$modxAppCore.showErrorMessage(`Please enter valid ContactEmail`, 'error', 'orderErrorMsg');
            $('#inpContactEmail').focus();
            return;
        }
        var len = 5;
        if (meta.PatientZip.length < 5) {
            var isValid = Core.checkInputValues(meta.PatientZip, len);
            if (isValid == 0) {
                _$modxAppCore.showErrorMessage(`Zip has to consist of minimum 5 digits`, 'error', 'orderErrorMsg');
                $('#inpPatientZip').focus();
                return;
            }
        }
        _$modxAppCore.showErrorMessage('', 'success', 'orderErrorMsg');
        meta.ClientID = $('#inpOrderClient').val();
        meta.FacilityID = $('#facilitySearch').attr('data-selected-id') || _GlobalOrder.FacilityID;
        meta.InputSource = "OrderEntery";
        meta.CurrentStep = "PatientInformation";
        meta.OrderID = _GlobalOrder.OrderId

        if (meta.ClientID == '') {
            _$modxAppCore.showErrorMessage('ClientID is missing or empty', 'error', 'NoPatinetMessage');
            return;
        }
        if (meta.FacilityID == null || meta.FacilityID == '') {
            _$modxAppCore.showErrorMessage('FacilityID is missing or empty', 'error', 'NoPatinetMessage');
            return;
        }
        let srvloctionMeta = _$modxAppCore.getAppCoreModel('OrderServiceLocation');
        meta.ServiceLocationType = srvloctionMeta.ServiceLocationType;
        meta.ServiceLocationName = srvloctionMeta.ServiceLocationName;
        _$modxAppCore.showErrorMessage('', 'error', 'NoPatinetMessage');
        _$modxAppProgressBar.show();

        var functionName = "SavePatientDetails";
        var url = _GlobalOrder.patientDetailsUrl + functionName;
        var ajaxOut = await __PromisAsyncPostBack(meta, url);
        _$modxAppProgressBar.hide();

        if (!ajaxOut.Success) {

            _$modxAppCore.showErrorMessage(ajaxOut.Message, 'error', 'orderErrorMsg');
            return false;
        }
        if (_GlobalOrder.OrderId == '') {
            _GlobalOrder.OrderId = ajaxOut.ResultData.Result.ResultData;
        }
        $('#btnCancelOrder').removeClass('d-none')
        $('#inpPatientDetailID').val(ajaxOut.CommandArgs)

        return true; //  
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
                "MedicareCarrier",
                "MBI",
                "MemberRelationship",
                "EligibilityStatus",
                "EligibilityStartDate",
                "EligibilityEndDate",
                "GroupNumber",
                "GroupName",
                "InsuranceCompanyName",
                "InsuranceCoPhoneNumber",
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
                _$modxAppCore.showErrorMessage(`${validation.error}`, 'error', 'orderErrorMsg');
                $('#inp' + validation['missingField']).focus();
                return false;
            }
            var len = 12;
            var isValid = Core.checkInputValues(meta.InsuranceCoPhoneNumber, len);
            if (isValid == 0) {
                _$modxAppCore.showErrorMessage(`CoPhoneNumber has to consist of exactly 10 digits`, 'error', 'orderErrorMsg');
                $('#inpInsuranceCoPhoneNumber').focus();
                return;
            }
            var len = 5;
            if (meta.PrimaryInsuredAddressZip.length < 5) {
                var isValid = Core.checkInputValues(meta.PrimaryInsuredAddressZip, len);
                if (isValid == 0) {
                    _$modxAppCore.showErrorMessage(`Zip Code has to consist of minimum 5 digits`, 'error', 'orderErrorMsg');
                    $('#inpPrimaryInsuredAddressZip').focus();
                    return;
                }
            }
        }


        _$modxAppCore.showErrorMessage('', 'success', 'orderErrorMsg');
        meta.PatientDetailID = $('#PatientDetailID').val();
        meta.PatientDetailID = $('#inpPatientDetailID').val();
        meta.CurrentStep = "PatientInsurance";
        meta.InputSource = "OrderEntery";
        meta.OrderId = _GlobalOrder.OrderId
        _$modxAppProgressBar.show();
        var functionName = "SavePatientInsurance";
        var url = _GlobalOrder.patientDetailsUrl + functionName;
        var ajaxOut = await __PromisAsyncPostBack(meta, url);
        if (ajaxOut.Success == false) {
            _$modxAppCore.showErrorMessage(ajaxOut.Message, 'error', 'orderErrorMsg')
            _$modxAppProgressBar.hide();
            return false;
        }

        if (ajaxOut.Success) {

            _$modxAppProgressBar.hide();
            /* _$modxAppCore.showErrorMessage(ajaxOut.Message, 'success', 'orderErrorMsg')*/
            return true;
        }
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
    formatRoomOrService: function (el) {
        if (!el) return;

        let value = el.value;

        // Allow only alphanumeric
        value = value.replace(/[^A-Za-z0-9]/g, "");

        // Hard limit to 6 characters
        if (value.length > 6) {
            value = value.substring(0, 6);
        }

        // Update final value
        el.value = value;

        // Clear any error message (no length requirement now)
        _$modxAppCore.showErrorMessage("", "error", "orderErrorMsg");
    },

    IsReccuringOrderInfoPresent: async function () {
        let meta = {}
        meta.OrderId = _GlobalOrder.OrderId
        if (meta.OrderId == '') {
            return;
        }
        var functionName = "IsReccuringOrderInfoPresent";
        var url = _GlobalOrder.url + functionName;
        var ajaxOut = await __PromisAsyncPostBack(meta, url);
        return ajaxOut.Success;
    },
    // Populates the Order Preview section with merged data from the current step
    populateOrderPreviewSection: async function (data) {

        let meta = {}
        meta.OrderId = _GlobalOrder.OrderId
        if (meta.OrderId == '') {
            return;
        }
        //TOD : impliment story 2342
        //_$modxAppCore.showErrorMessage(" ", 'error', 'orderErrorMsg')
        //let isReccuingDateAvl = await this.IsReccuringOrderInfoPresent()
        //if (!isReccuingDateAvl) {
        //    _$modxAppCore.showErrorMessage("Please select a recurrence frequency ", 'error', 'orderErrorMsg')
        //    return;
        //}
        meta.IsRecurring = $('#hdrIsRecurring').is(":checked") ? 1 : 0;
        meta.RecurringFrequency = $('#hdrRecurringFrequency').val();
        meta.RecurringEndDate = $('#hdrRecurringEndDate').val();

        var functionName = "GetOrderPreviewInforamtion";
        var url = _GlobalOrder.url + functionName;
        var ajaxOut = await __PromisAsyncPostBack(meta, url);

        this.applyOrderPreview(ajaxOut)
        //Move to next
        Orders.gotoStep(_GlobalOrder.currentStep + 1);
        return true

    },
    GetDraftOrderInforamtion: async function (data) {

        let meta = {}
        meta.OrderId = _GlobalOrder.OrderId

        if (meta.OrderId == '') {
            return;
        }


        var functionName = "GetDraftOrderInforamtion";
        var url = _GlobalOrder.url + functionName;
        var ajaxOut = await __PromisAsyncPostBack(meta, url);

        this.applyOrderPreview(ajaxOut)
        //Move to next
        Orders.gotoStep(_GlobalOrder.currentStep + 1);
        return true

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
    buildOrderItemsPreview: function (items, host) {
        const $host = $(host);
        if (!$host.length) return;
        $host.empty();

        if (items.length === 0) {
            $('#btnSubmitOrder')
                .prop('disabled', true)
                .attr('title', 'No order items for the order');
            _$modxAppCore.showErrorMessage('You cannot submit this order, as no order items are available. Please add at least one order item before submitting.', 'error', 'orderErrorMsg');
            return;
        } else {
            $('#btnSubmitOrder')
                .prop('disabled', false)
                .attr('title', 'Submit Order');
            _$modxAppCore.showErrorMessage('', 'error', 'orderErrorMsg');
        }




        // ---- Group items by ServiceType ----
        const groups = {};
        (items || []).forEach(it => {
            const key = ((it.ServiceType ?? '') + '').trim() || 'Other';
            if (!groups[key]) groups[key] = [];
            groups[key].push(it);
        });

        // ---- Render each group ----
        Object.keys(groups).forEach(serviceType => {
            const orders = groups[serviceType];
            const $groupWrap = $('<div/>', { class: 'ordPrv-group mb-2' });

            // Optional: group heading
            $groupWrap.append(
                $('<div/>', { class: 'ordPrv-groupTitle fw-bold mb-2', text: serviceType })
            );

            orders.forEach((it, idx) => {
                //const orderNo = idx + 1;
                const orderNumber = `#${it.OrderNumber}` || '';
                // Item values
                const service = ((it.Service ?? '') + '').trim() || '--';
                const cpt = ((it.CPT ?? '') + '').trim() || '--';
                const priority = ((it.Priority ?? '') + '').trim() || '--';
                const reqDate = ((it.RequestedServiceDate ?? '') + '').trim();

                // Recurring fields (render only if ALL present)
                const rawIsRec = it.IsRecurring;
                const freqStr = ((it.RecurringFrequency ?? '') + '').trim();
                const endDateStr = ((it.RecurringEndDate ?? '') + '').trim();
                const hasAllRecurring = Boolean(rawIsRec && freqStr && endDateStr);

                // Order card
                const $card = $('<div/>', { class: 'ordPrv-card mb-1 p-2' });

                $card.append(
                    $('<div/>', {
                        class: 'ordPrv-orderTitle fw-bold mb-2',
                        text: `Order Item ${orderNumber} `
                    })
                );

                $card.append(`<div class="ordPrv-row"><strong>Service:</strong> ${service}</div>`);
                $card.append(`<div class="ordPrv-row"><strong>CPT:</strong> ${cpt}</div>`);
                $card.append(`<div class="ordPrv-row"><strong>Priority:</strong> ${priority}</div>`);
                if (serviceType == "Diagnostic Imaging") {
                    let note = ((it.Note ?? '') + '').trim() || '--';
                    $card.append(`<div class="ordPrv-row"><strong>Note:</strong> ${note}</div>`);
                }
                if (reqDate) $card.append(`<div class="ordPrv-row"><strong>Requested Date:</strong> ${reqDate}</div>`);

                // Recurring Details (only if all 3 exist)
                if (hasAllRecurring) {
                    const $recWrap = $('<div/>')
                    $recWrap.append(`<div class="ordPrv-row"><strong>Is Recurring:</strong> ${rawIsRec}</div>`);
                    $recWrap.append(`<div class="ordPrv-row"><strong>Frequency:</strong> ${freqStr}</div>`);
                    $recWrap.append(`<div class="ordPrv-row"><strong>End Date:</strong> ${endDateStr}</div>`);
                    $card.append($recWrap);
                }

                $groupWrap.append($card);
            });

            $host.append($groupWrap);
        });
    },
    buildOrderDocumentsList: function (docs, hostSel, evName = 'Ev_open_document') {
        const $host = $(hostSel);
        if (!$host.length) return;

        $host.empty();

        const items = Array.isArray(docs) ? docs : [];
        if (!items.length) {
            $('#orderDocsEmpty').removeClass('d-none');
            return;
        }
        $('#orderDocsEmpty').addClass('d-none');

        items.forEach(d => {
            const docId = d?.OrderDocumentsId ?? d?.OrderDocumentsID ?? d?.id ?? '';
            const docName = (d?.OriginalDocumentName ?? d?.DocumentName ?? '--') + '';
            const docType = d?.DocumentType ? ` (${d.DocumentType})` : '';

            const $li = $('<li/>');
            const $a = $('<a/>', {
                href: '#',
                text: docName + docType,
                'data-id': docId,
                'data-ev': evName
            });
            $li.append($a);
            $host.append($li);
        });
    },


    animateProgressBar: function ({ rowId, stepPercent = 10, intervalMs = 3000, holdAt = 95 }) {
        const $wrap = $(`#orderDocProgOrd_${rowId}`);
        const $bar = $(`#orderDocProgress_${rowId}`);
        if ($bar.length === 0) return { stop: () => { }, set: () => { } };

        // Reset + show
        $wrap.removeClass('d-none');
        $bar.removeClass('bg-success bg-danger').addClass('bg-info')
            .css('width', '0%').text('0%');

        let width = 0;
        const timer = setInterval(() => {
            width = Math.min(width + stepPercent, holdAt);
            $bar.css('width', width + '%').text(width + '%');
            if (width >= holdAt) clearInterval(timer);
        }, intervalMs);

        return {
            stop: () => clearInterval(timer),
            set: (val, clsAdd = null, text = null) => {
                const v = Math.max(0, Math.min(100, val));
                $bar.css('width', v + '%').text(text ?? (v + '%'));
                if (clsAdd) $bar.removeClass('bg-info bg-success bg-danger').addClass(clsAdd);
            }
        };
    },

    /* File uploader file */

    uploadSingleFile: function (formData, rowId) {
        const barSel = `#orderDocProgress_${rowId}`;
        const wrapSel = `#orderDocProgOrd_${rowId}`;
        $(wrapSel).removeClass('d-none').attr('aria-hidden', 'false');

        return $.ajax({
            type: "POST",
            url: '../../apix/OrdersEntery/UploadFile',
            data: formData,
            processData: false,
            contentType: false,
            xhr: function () {
                const xhr = $.ajaxSettings.xhr();
                if (xhr.upload) {
                    xhr.upload.addEventListener('progress', function (e) {
                        if (!e.lengthComputable) return;
                        const pct = Math.floor((e.loaded / e.total) * 100);
                        // Update bar 
                        const $bar = $(barSel);
                        const bounded = Math.min(pct, 95);
                        $bar.css('width', bounded + '%').text(bounded + '%');
                    }, false);
                }
                return xhr;
            },
            success: function (ajxOut) {
                //TODO Fe after success
                // Let the caller handle final UI (done callback)
            },
            error: function () {

            }
        });
    },
    downloadDocument: function (ev) {
        _$modxAppProgressBar.show();
        var docId = ev.target.getAttribute('data-id');
        var url = '../../../apix/OrdersEntery/GetDocumentFile/' + docId;
        window.open(url, '_blank', 'noreferrer');
        _$modxAppProgressBar.hide();
        return;
    },
    deleteOrderDocument: async function () {
        var meta = {};
        meta.OrderDocumentsId = _GlobalOrder.OrderDocumentsId;
        if (meta.OrderDocumentsId == '') {
            _$modxAppCore.showErrorMessage('Select document to delete', 'error', 'orderAtchErrorMsg_orddoc_1')
            return;
        }
        _$modxAppProgressBar.show();
        var functionName = "DeleteOrderDocument";
        var url = _GlobalOrder.url + functionName;
        var ajaxOut = await __PromisAsyncPostBack(meta, url);
        if (ajaxOut.Success == false) {
            _$modxAppCore.showErrorMessage(ajaxOut.Message, 'error', 'orderAtchErrorMsg_orddoc_1')
            _$modxAppProgressBar.hide();
            return;
        }
        $(`tr[data-id="${_GlobalOrder.OrderDocumentsId}"]`).remove();
        _GlobalOrder.OrderDocumentsId = ''
        $('#inlineConfirm').addClass('d-none')
        $('#inlineConfirmPtInf').addClass('d-none')
        $('#inlineConfirmPtInsf').addClass('d-none')
        _$modxAppProgressBar.hide();


    },
    populateInstructions: function (data) {
        Object.values(data).forEach(section => {
            const ul = document.getElementById(section.ulId);
            if (!ul) return;
            section.steps.forEach(step => {
                const li = document.createElement("li");
                li.className = "d-flex mb-2";
                if (step.icon) {
                    const icon = document.createElement("i");
                    icon.className = `fa-solid ${step.icon} me-2 mt-1`;
                    li.appendChild(icon);
                }
                const text = document.createElement("span");
                text.textContent = step.instruction;
                li.appendChild(text);
                ul.appendChild(li);
            });
        });
    },
    redirectWithEncodedParams: function () {
        const orderId = btoa(_GlobalOrder.OrderId);                 // encode
        const clientId = btoa($('#inpOrderClient').val() || '');
        const facilityId = btoa($('#facilitySearch').attr('data-selected-id') || '');

        // Build URL with encoded query parameters
        const url = `../app/manageFacilityPhysician.html?order=${orderId}&client=${clientId}&facility=${facilityId}`;
        window.location.href = url;
    },
    saveCancelReason: async function () {
        var meta = {};
        meta.OrderID = _GlobalOrder.OrderId
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
        var url = _GlobalOrder.url + functionName;
        var ajaxOut = await __PromisAsyncPostBack(meta, url);
        if (ajaxOut.Success == false) {
            _$modxAppCore.showErrorMessage(ajaxOut.Message, 'error', 'orderErrorMsg')
            _$modxAppProgressBar.hide();
            return;
        }
        window.location.href = "../app/orders.html";
        _$modxAppProgressBar.hide();
    },
    CheckOrderCancelEligiblity: async function () {
        var meta = {};
        meta.OrderID = _GlobalOrder.OrderId
        if (meta.OrderID == '') {
            return;
        }
        _$modxAppProgressBar.show();
        var functionName = "CheckOrderCancelEligiblity";
        var url = _GlobalOrder.url + functionName;
        var ajaxOut = await __PromisAsyncPostBack(meta, url);
        if (ajaxOut.Success == false) {
            _$modxAppCore.showErrorMessage(ajaxOut.Message, 'error', 'orderErrorMsg')
            _$modxAppProgressBar.hide();
            return;
        }
        $('#cancelNotesDiv').removeClass('d-none')
        $('#CancelNotes').focus();

        _$modxAppProgressBar.hide();
    },
    /**
* Enable or disable all input/select/textarea fields inside #divPatientInsurance,
* except checkboxes (they remain clickable).
*
* @param {boolean} disable - true to disable, false to enable
*/
    togglePatientInsuranceFields: function (disable) {
        const container = document.getElementById("pane-insurance");
        if (!container) return;

        // Select all input, select, textarea elements
        const fields = container.querySelectorAll("input, select, textarea");

        fields.forEach(el => {
            // Leave checkboxes active (not disabled)
            if (el.type === "checkbox") return;

            // Toggle disable based on flag
            el.disabled = disable;
        });

        // Optionally disable buttons too (if you want)
        const buttons = container.querySelectorAll("button.custom-add-btn");
        buttons.forEach(btn => btn.disabled = disable);
    },
    toggleSSNVisibility: function () {
        const input = document.getElementById("inpPatientSSN");
        const span = document.getElementById("unMaskedSSN");
        const icon = document.getElementById("toggleSSN");

        if (!input || !span || !icon) return;

        // Store both values before any DOM changes
        const inputValue = input.value?.trim() || "";
        const spanValue = span.textContent?.trim() || "";
        span.textContent = inputValue;
        input.value = spanValue;

    },
    showUnsavedChangesWarning: function () {
        const container = document.getElementById("inlineNavigationAlert");
        if (!container) return;

        const message = `
        <div class="alert alert-primary  d-flex flex-column flex-md-row align-items-start align-items-md-center
                    justify-content-between shadow-sm border-primary mx-2" role="alert"
                    style="border-left: 4px solid #f0ad4e;padding: 0px 18px;">

            <div class="d-flex align-items-start">
                <i class="fa fa-exclamation-triangle text-primary  me-2 mt-1"></i>
                <span class="fw-semibold" style="font-size: 0.92rem;">
                    Changes haven't been saved. Please click on the Save button to save your changes, 
                    or click Cancel to leave this page without saving.
                </span>
            </div>

            <div class="mt-2 mt-md-0 d-flex align-items-center">
                <button class="custom-add-btn btn btn-xs btn-outline-primary me-2"
                        data-ev="Ev_Confirm_Save_Navigate">
                    <i class="fa fa-save me-1"data-ev="Ev_Confirm_Save_Navigate"></i> Save
                </button>

                <button class="custom-del-btn btn btn-xs btn-outline-danger"
                        data-ev="Ev_Cancel_And_Navivage">
                    <i class="fa fa-times me-1"></i> Cancel
                </button>
            </div>
        </div>
    `;

        container.innerHTML = message;
    },

    handleWizardStep: function (ev, showWarningCallback) {
        const stepEl = ev.target.closest('.wizard-step');

        if (!stepEl) return;

        if (stepEl.classList.contains('completed')) {
            const step = parseInt(stepEl.getAttribute('data-step'), 10);
            _GlobalOrder.targetSetp = step;

            if (typeof showWarningCallback === 'function') {
                showWarningCallback();
            }
        }
    },

    bindPhysicianSearchDropDown: function (ajax, inputId, dropdownId) {

        const input = document.getElementById(inputId);
        const dropdown = document.getElementById(dropdownId);
        const loader = document.getElementById("physicianLoader");
        const msgContainer = document.getElementById("physicianMsgContainer");

        if (!input || !dropdown) return;

        function showLoader() {
            if (loader) loader.classList.remove("d-none");
        }

        function hideLoader() {
            if (loader) loader.classList.add("d-none");
        }

        function clearMessages() {
            if (msgContainer) msgContainer.innerHTML = "";
        }

        function clearDropdown() {
            if (!dropdown) return;
            dropdown.querySelectorAll("li[data-item='physician']").forEach(li => li.remove());
        }

        function hideDropdown() {
            dropdown.classList.add("d-none");
        }

        function showDropdown() {
            dropdown.classList.remove("d-none");
        }

        function showNoPhysicianInFacilityMessage() {
            if (!msgContainer) return;

            msgContainer.innerHTML = `
            <div class="alert alert-danger d-flex align-items-center" role="alert" style="color:black;">
                <i class="fa-solid fa-user-doctor me-2"></i>
                <span>
                    No physician record found for the selected facility.
                    In order to add a physician to the facility
                    <a href="#" data-ev="EV_AddPhysician" class="fw-bold text-primary">click here</a>.
                </span>
            </div>
        `;
        }

        function showPhysicianMappingMessage(physicianId) {
            if (!msgContainer) return;
            $('#physicianMsgContainer').removeClass('d-none')
            msgContainer.innerHTML = `
            <div class="alert alert-warning p-2 mt-2" style="color:black;">
                This physician is already mapped to the client, but is not mapped to the selected facility.
                <br>
                Would you like to map this physician to this facility?
                <a href="#" id="lnkMapPhysician"
                   class="ms-1 text-primary text-decoration-underline"
                   data-ev="Ev_MappOrdPhysician">
                    Click here
                </a>
            </div>
        `;

            const link = document.getElementById("lnkMapPhysician");
            if (link) {
                link.addEventListener("click", function (e) {
                    e.preventDefault();
                    Orders.showPhysicainMappConfiramtion(physicianId);
                });
            }
        }

        function bindDropdown(list) {

            clearDropdown();

            if (!Array.isArray(list) || list.length === 0) {
                dropdown.classList.add("d-none");
                return;
            }

            list.forEach(item => {

                const li = document.createElement("li");
                li.className = "list-group-item list-group-item-action";
                li.setAttribute("data-item", "physician");

                li.textContent = item.PhysicianNPI || "";
                li.dataset.value = item.PhysicianID || "";

                li.addEventListener("click", function () {
                    input.value = this.textContent.trim();
                    input.dataset.selectedId = this.dataset.value;

                    dropdown.classList.add("d-none");

                    if (this.dataset.value) {
                        Orders.GetPhysicianInfo(this.dataset.value);
                    }
                });

                dropdown.appendChild(li);
            });

            dropdown.classList.remove("d-none");
        }

        function processResponse() {
            hideLoader();
            if (msgContainer) msgContainer.innerHTML = "";

            const data = ajax.ResultData || [];

            switch (ajax.Sender) {

                case "MappedPhysicianInFacility":
                    if (data.length === 0) {
                        clearDropdown();
                        dropdown.classList.add("d-none");
                        showNoPhysicianInFacilityMessage();
                        return;
                    }
                    bindDropdown(data);
                    return;

                case "MappedPhysicianInClient":
                    bindDropdown(data);
                    return;

                case "PhysicianExistNotMapped":
                    clearDropdown();
                    dropdown.classList.add("d-none");
                    showPhysicianMappingMessage(
                        ajax.CommandArgs ? ajax.CommandArgs.PhysicianID : null
                    );
                    return;

                case "PhysicianNotExistInMaster":
                    clearDropdown();
                    dropdown.classList.add("d-none");
                    Orders.renderPhysicianNotFoundMessage("physicianMsgContainer");
                    return;

                default:
                    bindDropdown(data);
                    return;
            }
        }


        processResponse();

        input.addEventListener("focus", function () {
            if (dropdown.querySelectorAll("li[data-item='physician']").length > 0) {
                showDropdown();
            }
        });

        document.addEventListener("click", function (e) {
            if (!dropdown.contains(e.target) && e.target !== input) {
                hideDropdown();
            }
        });
    },



    renderPhysicianNotFoundMessage: function (containerId) {
        const html = `
      <div class="alert alert-warning py-2 mb-3" style="font-size:14px;">
            <strong>This physician is not present in the system.</strong>
            <div>To add this physician, please complete the steps below.</div>
        </div>

 
        <div class="form-check mx-4 d-flex align-items-center">
            <input class="form-check-input" type="checkbox" id="chkConfirmAddPhysician">
            <label class="form-check-label ms-2 mt-2" for="chkConfirmAddPhysician">
                I confirm that I want to add this physician.
            </label>
        </div>

 
        <div id="physicianExtraSection" class="d-none">

            <div class="row align-items-end g-2" data-model="PhysicianMeta">

   
                <div class="form-group col-md-3">
                    <label  >
                        Physician NPI <span class="text-danger">*</span>
                    </label>
                    <input type="text"
                           class="form-control form-control-sm numeric-only"
                           data-model-prop="PhysicianNPI"
                           maxlength="10"
                           id="inpPhysicianNPI"
                           pattern="\d*"
                           inputmode="numeric"
                           title="Only numeric values allowed"
                           autocomplete="off">
                </div>
                                                    <div class="form-group col-md-3">
                                        <label>First Name <span class="text-danger">*</span></label>
                                        <input type="text" class="form-control form-control-sm"
                                               data-model-prop="PhysicianFirstName"
                                               id="inpPhysicianFirstName"
                                               autocomplete="off">
                                    </div>

                                    <div class="form-group col-md-3">
                                        <label>Middle Name</label>
                                        <input type="text" class="form-control form-control-sm"
                                               data-model-prop="PhysicianMiddleName"
                                               id="inpPhysicianMiddleName"
                                               autocomplete="off">
                                    </div>

                                    <div class="form-group col-md-3">
                                        <label>Last Name <span class="text-danger">*</span></label>
                                        <input type="text" class="form-control form-control-sm"
                                               data-model-prop="PhysicianLastName"
                                               id="inpPhysicianLastName"
                                               autocomplete="off">
                                    </div>
            </div>
                    <div class="col-md-auto">
                    <div class="d-flex gap-2">
                        <button id="btnAddPhysician" class="custom-add-btn btn-outline-primary" data-ev = "Ev_Add_NotVarifiedPhysician">
                            Add Physician
                        </button>

                        <button id="btnCancelAddPhysician" class="custom-add-btn btn-light wizard-prev">
                            Cancel
                        </button>
                        <span id='spanRoleMessage' class='text-danger' style='margin-top:10px'></span>
                    </div>
                </div>
        </div>


    `;

        const $container = $("#" + containerId);
        $container.html(html).removeClass("d-none");

        // Toggle NPI section   buttons when checkbox is clicked
        $(document).on("change", "#chkConfirmAddPhysician", function () {
            var isChk = false;
            if (this.checked) {
                isChk = true;
                $("#physicianExtraSection").removeClass("d-none");
                $("#inpPhysicianNPI").focus();
            } else {
                isChk = false;
                $("#physicianExtraSection").addClass("d-none");
                $("#inpPhysicianNPI").val("");
            }

            $('#spanRoleMessage').html('');
            if (isChk = true && _GlobalOrder.hasAddPhyRole == false) {
                $('#btnAddPhysician').remove();
                $('#spanRoleMessage').html('You do not have access of add Physician role');
            }
        });

        // Cancel button 
        $(document).on("click", "#btnCancelAddPhysician", function () {
            $container.addClass("d-none").html("");
        });
    },

    saveUnVarifiedPhyscian: async function () {
        // Add button 
        var phyAddMeta = _$modxAppCore.getAppCoreModel('PhysicianMeta');
        const requiredPhysicianField = [
            "PhysicianNPI",
            "PhysicianFirstName",
            "PhysicianLastName"
        ];

        var validation = Core.validateInputs(requiredPhysicianField, phyAddMeta);

        if (validation.isValid == false) {
            _$modxAppCore.showErrorMessage(`${validation.error}`, 'error', 'orderErrorMsg');
            $('#inp' + validation['missingField']).focus();
            return;
        }
        _$modxAppCore.showErrorMessage('', 'error', 'orderErrorMsg');

        const meta = {
            PhysicianNPI: phyAddMeta.PhysicianNPI,
            PhysicianFirstName: phyAddMeta.PhysicianFirstName,
            PhysicianLastName: phyAddMeta.PhysicianLastName,
            PhysicianMiddleName: phyAddMeta.PhysicianMiddleName,
            OrderId: _GlobalOrder.OrderId
        };

        if (!meta.PhysicianNPI) return;

        const url = _GlobalOrder.url + "SaveUnVarifiedPhyscian";
        const ajaxOut = await __PromisAsyncPostBack(meta, url);

        if (!ajaxOut.Success) {
            _$modxAppCore.showErrorMessage(ajaxOut.Message, 'error', 'orderErrorMsg');
            return;
        }
        if (ajaxOut.Success) {
            this.GetMappedPhysician()
        }

    },
    showPhysicainMappConfiramtion: function (physicianId) {
        const container = document.getElementById("inlinePhysMappConfiramtion");
        if (!container) return;
        container.innerHTML = '';
        let selFacility = $('#facilitySearch').val();
        $('#physicianMsgContainer').removeClass('d-none');
        const message = `
        <div class="  d-flex flex-column flex-md-row align-items-start
                    align-items-md-center justify-content-between shadow-sm border-warning mx-2 px-2 p-0"
             role="alert" style="border-left: 4px solid #ffc107; padding: 10px 18px;">

            <!-- Message Section -->
            <div class="d-flex align-items-start">
                <i class="fa fa-exclamation-circle text-warning me-2 mt-1"></i>
                <span style="font-size: 0.95rem;">
                    Are you sure you want to map this physician to facility - ${selFacility} ?
                </span>
            </div>

            <!-- Action Buttons -->
            <div class="mt-2 mt-md-0 d-flex align-items-center">
                <button class="custom-add-btn"
                        data-ev="Ev_ConfirmPhysicianFacilityMapping"
                        data-physician-id="${physicianId}">
                    <i class="fa fa-check me-1" data-ev="Ev_ConfirmPhysicianFacilityMapping"></i> Yes, Map
                </button>

                <button class="custom-del-btn"
                        data-ev="Ev_CancelPhysicianFacilityMapping">
                    <i class="fa fa-times me-1" data-ev="Ev_CancelPhysicianFacilityMapping"></i> Cancel
                </button>
            </div>
        </div>
    `;

        container.innerHTML = message;
    },

    MapPhysicianToFacility: async function (physicainId) {
        // Build date values
        const today = new Date();
        const nextYear = new Date();
        nextYear.setFullYear(today.getFullYear() + 1);

        // Format as YYYY-MM-DD
        const FromDate = today.toISOString().split("T")[0];
        const ToDate = nextYear.toISOString().split("T")[0];

        //Physician Map
        let PhysicianMap = [];
        PhysicianMap.push({
            OrderId: _GlobalOrder.OrderId,
            PhysiciansMasterID: physicainId,
            FromDate: FromDate,
            ToDate: ToDate
        });
        _$modxAppProgressBar.show();
        var url = "../../../apix/ManagePhysician/savePhysicianFacility";
        var ajaxOut = await __PromisAsyncPostBack(PhysicianMap, url);
        if (ajaxOut.Success == false) {
            _$modxAppCore.showErrorMessage(ajaxOut.Message, 'error', 'orderErrorMsg')
            _$modxAppProgressBar.hide();
            return;
        }
        _$modxAppProgressBar.hide();
        $('#inlinePhysMappConfiramtion').html('');
        $('#physicianMsgContainer').html('');
        this.GetFacilityNpi('', 'MappedPhysicianInFacility');
    },



    handleEvent: function (ev) {
        var target = ev.target;
        var evCase = target.getAttribute('data-ev');

        switch (evCase) {
            case 'Ev_Add_NotVarifiedPhysician':
                Orders.saveUnVarifiedPhyscian();
                break;
            case 'EV_Save':
                Orders.handleSave();
                break;
            case 'EV_Save_Preview':
                Orders.populateOrderPreviewSection();
                break;
            case 'EV_SubmitOrder':
                Orders.handleSave();
                break;
            case 'EV_NextStep':
                Orders.handleNext();
                break;

            case 'EV_PrevStep':
                Orders.handlePrev();
                break;
            case 'EV_StepNav':
                var stepIdx = parseInt($(this).data('step'), 10);
                Orders.handleStepClick(stepIdx);
                break;

            case 'Ev_getPatientInfo':
                var meta = {}
                let searchType = $('#searchType').val();
                meta = this.validateSearch(searchType);
                if (!meta) {
                    return;
                }
                meta.SearchType = searchType;
                _$modxAppCore.showErrorMessage('', 'error', 'NoPatinetMessage');
                //_$modxAppCore.showErrorMessage('', 'error', 'orderErrorMsg');
                _$modxAppProgressBar.show();
                this.GetPatientSearchResult(meta);
                break;
            case 'Ev_OhterProviderShow':
                $('#orderOhterDiv').removeClass('d-none')
                break;

            case 'EV_OnChangeClient':
                if (ev.type == 'change') {
                    _$modxAppCore.showErrorMessage('', 'error', 'NoPatinetMessage');
                    _$modxAppCore.showErrorMessage('', 'error', 'PhysicianInfoMeta');
                }
                break

            case 'EV_OnChangeNPI':
                if (ev.type == 'change') {
                    this.GetPhysicianInfo(ev.target.value)
                }
                break;

            case 'Ev_SameAsPatient':
                this.InsuredInofSameAsPatient();
                break;

            case 'Ev_ShowOrder_detail':
                let orderStatus = "Submitted";
                let OrderId = btoa(_GlobalOrder.OrderId)
                const encodedStatus = btoa(orderStatus);
                window.location.href = "../app/orders.html?status=" + encodedStatus + "&OrderId=" + OrderId;
                break;

            case 'Ev_ShowSearchOption':
                if (ev.type == 'change') {
                    this.toggleSearchFields(ev.target.value)
                }
                break
            case 'Ev_attatch_OrdDoc':
                var $header = $("#ordAcc_hdr_0");
                var $panel = $("#ordAcc_panel_0");
                // Mark it expanded
                $header.attr("aria-expanded", "true");
                $panel.css("max-height", $panel.prop("scrollHeight") + "px");
                $header.find(".ord-acc-chevron")
                    .addClass("rotate-180");

                break;
            case 'Ev_attatchPat_OrdDoc':
                var $header = $("#patAcc_hdr_0");
                var $panel = $("#patAcc_panel_0");
                // Mark it expanded
                $header.attr("aria-expanded", "true");
                $panel.css("max-height", $panel.prop("scrollHeight") + "px");
                $header.find(".ord-acc-chevron")
                    .addClass("rotate-180");

                break;
            case 'Ev_attatchPatIns_OrdDoc':
                var $header = $("#patInsAcc_panel_0");
                var $panel = $("#patInsAcc_panel_0");
                // Mark it expanded
                $header.attr("aria-expanded", "true");
                $panel.css("max-height", $panel.prop("scrollHeight") + "px");
                $header.find(".ord-acc-chevron")
                    .addClass("rotate-180");
                break;
            case 'Ev_open_document':
                this.downloadDocument(ev);
                break;

            case 'Ev_delete_document_PatientInsDocHost':
                _GlobalOrder.OrderDocumentsId = ev.target.getAttribute('data-id');
                $('#inlineConfirmPtInsf').removeClass('d-none')
                break;
            case 'Ev_delete_document_OrderDraftDocHost':
                _GlobalOrder.OrderDocumentsId = ev.target.getAttribute('data-id');
                $('#inlineConfirm').removeClass('d-none')
                break;
            case 'Ev_delete_document_PatientDocHost':
                _GlobalOrder.OrderDocumentsId = ev.target.getAttribute('data-id');
                $('#inlineConfirmPtInf').removeClass('d-none')
                break;

            case 'EV_CancelDelet_doc':
                _GlobalOrder.OrderDocumentsId = ''
                $('#inlineConfirm').addClass('d-none')
                $('#inlineConfirmPtInf').addClass('d-none')
                $('#inlineConfirmPtInsf').addClass('d-none')

                break;
            case 'EV_ConfirmDelete_doc':
                this.deleteOrderDocument();
                break;
            case 'EV_AddPhysician':
                this.redirectWithEncodedParams();
                break;

            case 'Ev_ReloadProviderDropDown':
                const selFcl = $('#facilitySearch').attr('data-selected-id')
                this.GetFacilityNpi(selFcl);
                break;

            case 'EV_Cancel_Ord':
                this.CheckOrderCancelEligiblity();

                break;

            case 'EV_Save_CancelRsn':
                $('#cancelNotesDiv').addClass('d-none')
                break;
            case 'EV_SaveCancelRsn':
                this.saveCancelReason();
                break;

            case 'Ev_CheckedDirectBillToMemb':
                const isChecked = ev.target.checked;
                if (isChecked) {
                    this.togglePatientInsuranceFields(true);
                } else {
                    this.togglePatientInsuranceFields(false);
                }
                break;

            case 'Ev_SSNdata_Toggle':
                this.toggleSSNVisibility();
                break;

            case 'Ev_Cancel_And_Navivage':
                Orders.gotoStep(_GlobalOrder.targetSetp);
                break;
            case 'Ev_Confirm_Save_Navigate':

                switch (_GlobalOrder.currentStep) {
                    case 1:
                        Orders.SavePatientDetails();
                        break;

                    case 2:
                        const a = ev.target.closest('.wizard-step');
                        if (a && a.classList.contains('active')) {
                            console.log(a.getAttribute('data-step'));
                        }
                        ////Orders.SavePatientInsurance();
                        ////Orders.gotoStep(_GlobalOrder.currentStep);
                        break;

                    case 3:
                        Orders.GenrateOrderHeaderInformation();

                        break;

                    case 4:
                        Orders.SaveServiceLocationInformation();
                        break;

                    case 5:
                        OrderInformation.GetOrderHeaderInformation(_GlobalOrder.OrderId);

                        break;

                    default:
                        console.warn("Unknown step: " + _GlobalOrder.currentStep);
                        break;
                }
                Orders.gotoStep(_GlobalOrder.targetSetp);
                break;

            case 'Ev_ShowProviderInfo':
            case 'Ev_ShowPatientInsurance':
            case 'Ev_ShowPatientInformation':
            case 'Ev_ShowSrvLocation':
            case 'Ev_ShowSrvLocation':
            case 'Ev_Show_OrdInfo':
                this.handleWizardStep(ev, this.showUnsavedChangesWarning.bind(this));

                break;
            case "Ev_ConfirmPhysicianFacilityMapping":
                let phyId = ev.target.getAttribute("data-physician-id");
                Orders.MapPhysicianToFacility(phyId);
                break;

            case "Ev_CancelPhysicianFacilityMapping":
                $('#inlinePhysMappConfiramtion').addClass('d-none')
                $('#physicianMsgContainer').removeClass('d-none');
                break;

            case "Ev_MappOrdPhysician":
                $('#physicianMsgContainer').addClass('d-none');
                $('#inlinePhysMappConfiramtion').removeClass('d-none')
                break;
            case 'Ev_resumeWorkFlow':
                const wId =_GlobalOrder.workQueueId
                const encodedWoekQId = btoa(wId);
                const source = btoa("WorkFlow");
                window.location.href = "workQueue.html?WorkQueueId=" + encodedWoekQId + "&source=" + source;
                break;
        }
    }

}
//document upload 
function createDocUploadUI(userCfg) {

    // Default configuration
    const cfg = $.extend(true, {
        container: '#orderDocAttach',
        attachBtn: '#btnAttachOrdDoc',
        allowedTypes: ['image/png', 'image/jpeg', 'application/pdf'],
        maxSizeMB: 15,
        target: 'OrderDocument',



        // Default messages
        messages: {
            noFile: 'Please choose a file first (click the preview area).',
            noName: 'Please provide a document name.',
            noType: 'Please select a document type.',
            typeNotAllowed: 'Allowed file types are Word/PDF/Excel/Text and images.',
            sizeTooLarge: function (maxSizeMB) { return 'File is too large. Max ' + maxSizeMB + ' MB.'; },
            uploadSuccess: 'The document has been uploaded successfully.',
            uploadFailed: 'Upload failed.',
            uploadError: 'Whoops, something went wrong during upload.',
            nameRequiredInline: 'Please provide a document name.'
        },

        /**
         * ctx = {
         *   $card, rowId, file, name, tag, docType
         * }
         */
        buildMeta: function (ctx) {
            return {
                // Default meta – can be overridden per usage
                OrderId: window._GlobalOrder && _GlobalOrder.OrderId,
                DocumentName: ctx.name,
                DocumentType: ctx.documentTypes,
                DocumentTag: ctx.tag,
                OriginalDocumentName: ctx.file.name,
                FileType: ctx.file.type
            };
        },

        upload: function (fd, rowId, meta) {
            return Orders.uploadSingleFile(fd, rowId);
        },


        onUploadSuccess: function (res, ctx) {

        },

        onUploadError: function (res, ctx) {
            // Default: do nothing. Caller can override.
        }

    }, userCfg || {});

    let seq = 0;

    function init() {
        // Add a new card when the main "Attach Document" button is clicked
        $(cfg.attachBtn).on('click', function (e) {
            e.preventDefault();
            addRow();
        });

        const $container = $(cfg.container);

        $container.on('click', '.btn-upload', function (e) {
            e.preventDefault();

            const $card = $(this).closest('.ord-doc-card');
            const rowId = $card.attr('id');
            const errId = 'orderAtchErrorMsg_' + rowId;

            const name = ($card.find('input[name="DocumentName"]').val() || '').trim();
            const tag = ($card.find('input[name="DocumentTag"]').val() || '').trim();
            const docType = ($card.find('select[name="DocumentType"]').val() || '').trim();
            const liveInput = $card.find('input[type="file"]')[0];
            const liveFile = liveInput && liveInput.files && liveInput.files[0];
            const file = liveFile || $card.data('file') || null;

            // ---- Validation ----
            if (!file) {
                _$modxAppCore.showErrorMessage(cfg.messages.noFile, 'error', errId);
                return;
            }
            if (!name) {
                _$modxAppCore.showErrorMessage(cfg.messages.noName, 'error', errId);
                const $nameInput = $card.find('input[name="DocumentName"]');
                if ($nameInput.length) {
                    $nameInput.focus();
                }
                return;
            }
            if (!docType) {
                _$modxAppCore.showErrorMessage(cfg.messages.noType, 'error', errId);
                const $sel = $card.find('select[name="DocumentType"]');
                if ($sel.length) {
                    $sel.focus();
                }
                return;
            }
            if (typeof isAllowedType === 'function' && !isAllowedType(file)) {
                _$modxAppCore.showErrorMessage(cfg.messages.typeNotAllowed, 'error', errId);
                return;
            }

            // Clear any previous error
            _$modxAppCore.showErrorMessage('', 'error', errId);

            // ---- Build metadata  ----
            const meta = cfg.buildMeta({
                $card: $card,
                rowId: rowId,
                file: file,
                name: name,
                tag: tag,
                docType: docType
            });

            // ---- Start progress UI ----
            const progress = Orders.animateProgressBar({
                rowId: rowId,
                stepPercent: 10,
                intervalMs: 1200,
                holdAt: 85
            });

            // ---- Build FormData for server ----
            const fd = new FormData();
            fd.append('UploadedDocument', file);
            fd.append('target', cfg.target);
            fd.append(cfg.target + '-metaData', JSON.stringify(meta)); // must be string

            // ---- Upload ----
            cfg.upload(fd, rowId, meta)
                .done(function (ajxOut) {
                    const ok = ajxOut && (ajxOut.Success === true || ajxOut.success === true);

                    progress.set(ok ? 100 : 95, ok ? 'bg-success' : 'bg-danger', ok ? '100%' : 'Failed');
                    progress.stop();

                    const ctx = { rowId: rowId, $card: $card, meta: meta, file: file, response: ajxOut };

                    if (ok) {
                        _$modxAppCore.showErrorMessage(cfg.messages.uploadSuccess, 'success', errId);

                        // Call hook for caller-specific work (e.g., reload section)
                        cfg.onUploadSuccess(ajxOut, ctx);

                        setTimeout(function () {
                            $('#orderDocProgOrd_' + rowId).addClass('d-none').attr('aria-hidden', 'true');
                        }, 700);
                    } else {
                        _$modxAppCore.showErrorMessage(ajxOut && ajxOut.Message ? ajxOut.Message : cfg.messages.uploadFailed, 'error', errId);
                        cfg.onUploadError(ajxOut, ctx);
                    }
                })
                .fail(function (xhr) {
                    progress.set(95, 'bg-danger', 'Failed');
                    progress.stop();

                    const ctx = { rowId: rowId, $card: $card, meta: meta, file: file, xhr: xhr };

                    _$modxAppCore.showErrorMessage(cfg.messages.uploadError, 'error', errId);
                    cfg.onUploadError(xhr, ctx);

                    setTimeout(function () {
                        $('#orderDocProgOrd_' + rowId).addClass('d-none').attr('aria-hidden', 'true');
                    }, 800);
                    console.error('Upload failed', xhr && (xhr.responseText || xhr.statusText) || xhr);
                });
        });

        // Remove card
        $container.on('click', '.btn-remove', function (e) {
            e.preventDefault();
            $(this).closest('.ord-doc-card').remove();
        });

        // Click preview area to open file chooser
        $container.on('click', '.doc-preview', function () {
            $(this).closest('.ord-doc-card').find('input[type="file"]').trigger('click');
        });

        // File selected (delegated change)
        $container.on('change', 'input[type="file"]', onFileSelected);
    }

    function addRow(preset) {
        preset = preset || {};
        const rowId = 'orddoc_' + (++seq);
        const $card = $(buildCardHtml(rowId, preset.name || ''));
        $(cfg.container).append($card);
        $card.find('input[name="DocumentName"]').focus();
        return rowId;
    }

    function buildCardHtml(id, docName) {
        const escapedName = escapeHtml(docName || '');
        const docTypeOptions = buildDocTypeOptions();

        return [
            '<div id="' + id + '" class="ord-doc-card" data-has-file="false" aria-live="polite">',
            '  <div class="row g-3 align-items-start">',
            '    <div class="row mt-2">',
            '      <div class="col-4 form-group">',
            '        <label for="' + id + '_name">Document Description <span class="text-danger">*</span></label>',
            '        <input type="text" class="form-control form-control-sm" id="' + id + '_name"',
            '               name="DocumentName" placeholder="e.g., Physician Prescription"',
            '               value="' + escapedName + '" maxlength="150" aria-describedby="' + id + '_name_help">',
            '        <div id="' + id + '_name_help" class="form-text" style="font-size: x-small;">',
            '          Provide a short, descriptive.',
            '        </div>',
            '        <div class="mt-2 file-meta small text-muted" id="' + id + '_meta"></div>',
            '      </div>',
            '      <div class="col-4 form-group">',
            '        <label for="' + id + '_TagName">Document Tag</label>',
            '        <input type="text" class="form-control form-control-sm" id="' + id + '_TagName"',
            '               name="DocumentTag" placeholder="e.g., Ins Card Front"',
            '               value="" maxlength="150" aria-describedby="' + id + '_DocTagname_help">',
            '        <div id="' + id + '_DocTagname_help" class="form-text" style="font-size: x-small;">',
            '          Provide a tag.',
            '        </div>',
            '      </div>',
            '      <div class="col-4 form-group">',
            '        <label for="' + id + '_type">Document Type <span class="text-danger">*</span></label>',
            '        <select class="form-select form-select-sm" id="' + id + '_type"',
            '                name="DocumentType" aria-describedby="' + id + '_type_help" required>',
            '          <option value="" selected disabled>-- Select Document Type --</option>',
            docTypeOptions,
            '        </select>',
            '        <div id="' + id + '_type_help" class="form-text" style="font-size: x-small;">',
            '          Specify the type of document.',
            '        </div>',
            '      </div>',
            '    </div>',

            '    <div class="mt-0 form-group">',
            '      <label>Preview</label>',
            '      <input type="file" id="' + id + '_file"',
            '             accept=".png,.jpg,.jpeg,.pdf,image/*,application/pdf"',
            '             style="display:none" />',
            '      <div class="doc-preview empty border rounded-2 p-2"',
            '           id="' + id + '_preview" role="img" aria-label="Document preview"',
            '           style="min-height:120px; cursor:pointer; display:flex; align-items:center; justify-content:center;">',
            '        <span class="text-muted">',
            '          <i class="fa-regular fa-file me-2"></i>Click to choose a file',
            '        </span>',
            '      </div>',
            '    </div>',

            '    <div class="progress my-2 mb-0 d-none" role="progressbar"',
            '         aria-label="Document upload progress"',
            '         aria-valuemin="0" aria-valuemax="100" style="padding:0px;width:98%;margin-left: 12px;" id="orderDocProgOrd_' + id + '">',
            '      <div id="orderDocProgress_' + id + '" class="progress-bar progress-bar-striped bg-info"',
            '           style="width:0%">0%</div>',
            '    </div>',

            '    <div class="d-flex gap-3 mt-0">',
            '      <div>',
            '        <button class="btnAddOrderDocAttach btn-upload" title="Collect meta for upload">',
            '          <i class="fa-solid fa-upload me-1"></i> Upload',
            '        </button>',
            '        <button class="btnRemoveOrderDocAttach btn-remove" title="Remove document">',
            '          <i class="fa-solid fa-trash-can me-1"></i> Remove',
            '        </button>',
            '      </div>',
            '      <div id="orderAtchErrorMsg_' + id + '" class="mt-4"></div>',
            '    </div>',
            '  </div>',
            '</div>'
        ].join('');
    }

    function buildDocTypeOptions() {
        if (!cfg.documentTypes || !cfg.documentTypes.length) {
            return '';
        }
        return cfg.documentTypes.map(function (dt) {
            return '<option value="' + escapeHtml(dt.value) + '">' + escapeHtml(dt.label) + '</option>';
        }).join('');
    }

    function onFileSelected(e) {
        const input = e.target;
        const file = input.files && input.files[0];

        // Clear input
        input.value = '';

        if (!file) {
            return;
        }

        const $row = $(input).closest('.ord-doc-card');

        // Validate type (prefer MIME, fall back to extension)
        if (!isAllowedType(file)) {
            feedback(cfg.messages.typeNotAllowed);
            return;
        }

        // Validate size
        if (file.size > cfg.maxSizeMB * 1024 * 1024) {
            feedback(typeof cfg.messages.sizeTooLarge === 'function'
                ? cfg.messages.sizeTooLarge(cfg.maxSizeMB)
                : cfg.messages.sizeTooLarge);
            return;
        }

        // Store file on the row (for later collection)
        $row.data('file', file);
        $row.attr('data-has-file', 'true');

        // Update meta text
        const metaText = file.name + ' • ' + (file.size / (1024 * 1024)).toFixed(2) + ' MB';
        $row.find('.file-meta').text(metaText);

        // Render preview
        renderPreview($row, file);

        const name = ($row.find('input[name="DocumentName"]').val() || '').trim();
        $row.data('meta', { DocumentName: name, File: file });
    }

    function isAllowedType(file) {
        if (file.type && cfg.allowedTypes.indexOf(file.type) !== -1) {
            return true;
        }
        const name = file.name || '';
        const dotIdx = name.lastIndexOf('.');
        if (dotIdx === -1) {
            return false;
        }
        const ext = name.slice(dotIdx + 1).toLowerCase();
        return ['png', 'jpg', 'jpeg', 'pdf'].indexOf(ext) !== -1;
    }

    function renderPreview($row, file) {
        const $prev = $row.find('.doc-preview').empty().removeClass('empty');
        const url = URL.createObjectURL(file);

        if (file.type === 'application/pdf' || /\.pdf$/i.test(file.name)) {
            $('<iframe>', {
                src: url,
                style: 'width:100%;height:240px;border:0;border-radius:8px;',
                title: 'PDF preview'
            }).appendTo($prev);
        } else {
            $('<img>', {
                src: url,
                alt: 'Image preview',
                class: 'img-fluid rounded',
                style: 'width:100%;height:240px;border:0;border-radius:8px;object-fit:contain;'
            }).appendTo($prev);
        }

        const panel = document.getElementById('ordAcc_panel_0');
        const patPannel = document.getElementById('patAcc_panel_0');
        const patPanIns = document.getElementById('patInsAcc_panel_0');
        if (panel) {
            panel.style.maxHeight = panel.scrollHeight + 'px';

        }
        if (patPannel) {
            patPannel.style.maxHeight = patPannel.scrollHeight + 'px';
        } if (patPanIns) {
            patPanIns.style.maxHeight = patPanIns.scrollHeight + 'px';
        }
    }

    function getPayload() {
        const out = [];
        $(cfg.container).children('.ord-doc-card').each(function () {
            const $card = $(this);
            const name = ($card.find('input[name="DocumentName"]').val() || '').trim();
            const file = $card.data('file') || null;
            if (name || file) {
                out.push({ name: name, file: file });
            }
        });
        return out;
    }

    function validateAll() {
        let ok = true;
        $(cfg.container).children('.ord-doc-card').each(function () {
            const $card = $(this);
            const hasFile = $card.attr('data-has-file') === 'true';
            const name = ($card.find('input[name="DocumentName"]').val() || '').trim();
            const $inp = $card.find('input[name="DocumentName"]');

            if (hasFile && !name) {
                ok = false;
                $inp.addClass('is-invalid');
                if (!$card.find('.invalid-feedback').length) {
                    $('<div class="invalid-feedback">' + cfg.messages.nameRequiredInline + '</div>')
                        .insertAfter($inp);
                }
            } else {
                $inp.removeClass('is-invalid');
                $card.find('.invalid-feedback').remove();
            }
        });
        return ok;
    }

    function feedback(msg) {
        console.warn(msg);
        alert(msg);
    }

    function escapeHtml(str) {
        return String(str).replace(/[&<>"']/g, function (m) {
            return {
                '&': '&amp;',
                '<': '&lt;',
                '>': '&gt;',
                '"': '&quot;',
                '\'': '&#39;'
            }[m];
        });
    }

    return {
        init: init,
        addRow: addRow,
        getPayload: getPayload,
        validateAll: validateAll
    };
}

const OrderDocUI = this.createDocUploadUI({
    container: '#orderDocAttach',
    attachBtn: '#btnAttachOrdDoc',
    target: 'OrderDocument',
    documentTypes: [
        { value: 'Electronic Prescription', label: 'Electronic Prescription' },
        { value: 'Insurance Card', label: 'Insurance Card' },
        { value: 'Patient ID', label: 'Patient ID' },
        { value: 'Written Prescription', label: 'Written Prescription' }
    ],
    buildMeta: function (ctx) {
        return {
            OrderId: _GlobalOrder.OrderId,
            DocumentName: ctx.name,
            DocumentType: ctx.docType,
            DocumentTag: ctx.tag,
            OriginalDocumentName: ctx.file.name,
            FileType: ctx.file.type
        };
    },

    upload: function (fd, rowId, meta) {
        return Orders.uploadSingleFile(fd, rowId);
    },

    onUploadSuccess: function (res, ctx) {
        // Refresh the document section after successful upload
        Orders.LoadExistingOrder(_GlobalOrder.OrderId, '', 'OrderDraftDocHost');
        $('#orderDocAttach').html('');
    }
});
const PatientDocUI = this.createDocUploadUI({
    container: '#patientDocAttach',
    attachBtn: '#btnAttachPatientDoc',
    target: 'OrderDocument',

    // Pass document types as parm
    documentTypes: [
        { value: 'Patient ID', label: 'Patient ID' }

    ],

    buildMeta: function (ctx) {
        return {
            OrderId: _GlobalOrder.OrderId == "" ? 0 : _GlobalOrder.OrderId,
            DocumentName: ctx.name,
            DocumentType: ctx.docType,     // stays dynamic based on dropdown
            DocumentTag: ctx.tag,
            OriginalDocumentName: ctx.file.name,
            CurrentStep: "PatientInformation",
            FileType: ctx.file.type
        };
    },

    upload: function (fd, rowId, meta) {
        return Orders.uploadSingleFile(fd, rowId);
    },

    onUploadSuccess: function (res, ctx) {
        if (_GlobalOrder.OrderId == "") {
            _GlobalOrder.OrderId = ctx.response.ResultData.OrderId
        }
        Orders.LoadExistingOrder(_GlobalOrder.OrderId, '', 'PatientDocHost', 'PatientInformation');
        $('#patientDocAttach').html('');
        $('#PatientDocHost').removeClass('d-none')
    }
});
const PatientInsuranceDocUI = this.createDocUploadUI({
    container: '#patientInsDocAttach',
    attachBtn: '#btnAttachPatientInsDoc',
    target: 'OrderDocument',

    // Pass document types as parm
    documentTypes: [
        { value: 'Insurance Card', label: 'Insurance Card' }

    ],

    buildMeta: function (ctx) {
        return {
            OrderId: _GlobalOrder.OrderId,
            DocumentName: ctx.name,
            DocumentType: ctx.docType,     // stays dynamic based on dropdown
            DocumentTag: ctx.tag,
            OriginalDocumentName: ctx.file.name,
            CurrentStep: "PatientInsurance",
            FileType: ctx.file.type
        };
    },

    upload: function (fd, rowId, meta) {
        return Orders.uploadSingleFile(fd, rowId);
    },

    onUploadSuccess: function (res, ctx) {
        if (_GlobalOrder.OrderId == "") {
            _GlobalOrder.OrderId = ctx.response.ResultData.OrderId
        }
        Orders.LoadExistingOrder(_GlobalOrder.OrderId, '', 'PatientInsDocHost', 'PatientInsurance');
        $('#patientInsDocAttach').html('');
        $('#PatientInsDocHost').removeClass('d-none')
    }
});
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
            Orders.GetFacilityBySearch(value);
        }, DEBOUNCE_DELAY);
    }

    function clearSearch() {
        // Clear inner search input
        innerSearchEl.value = "";

 
        const dropdown = document.getElementById("facilityDropdown");
        dropdown.querySelectorAll(
            "li:not(#facilityLoader):not(.facility-inner-search)"
        ).forEach(li => li.remove());

        // Hide loader if it was visible
        if (facilityDropdown) {
            facilityDropdown.hideLoader();
        }

        //// Optional: clear selected facility state
        //const mainInput = document.getElementById("facilitySearch");
        //mainInput.value = "";
        //mainInput.removeAttribute("data-selected-id");

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
    facilityDropdown = Orders.bindFacilitySearchDropDown(
        "facilitySearch",
        "facilityDropdown"
    );
});
// --------------------------------------------
// Searchable Input  
// --------------------------------------------
const FacilityNPISearch = (() => {

    let debounceTimer = null;
    const DEBOUNCE_DELAY = 300;

    function init() {
        const inputEl = document.getElementById("OrderingNpi");
        if (!inputEl) return;
        inputEl.addEventListener("input", handleInputChange);
    }

    function handleInputChange(ev) {
        const value = ev.target.value.trim();

        const loader = document.getElementById("physicianLoader");
        const dropdown = document.getElementById("physicianDropdown");

        clearTimeout(debounceTimer);

        debounceTimer = setTimeout(() => {
            if (value.length >= 4) {

                if (loader) loader.classList.remove("d-none");
                if (dropdown) dropdown.classList.remove("d-none");

                // Scenario 1 by default: client + facility mapped
                Orders.GetFacilityNpi(value, "MappedPhysicianInFacility");
            }

            if (value.length === 0) {
                $("#OrderingNpi").removeAttr("data-selected-id");
                $("#physicianDropdown").addClass("d-none");
                $("#physicianMsgContainer").html("");
                Orders.GetFacilityNpi('', "MappedPhysicianInFacility");
            }
        }, DEBOUNCE_DELAY);
    }


    return { init };

})();


// Initialize after DOM is loaded
document.addEventListener("DOMContentLoaded", () => {
    FacilityNPISearch.init();
});

Orders.Init();
OrderDocUI.init();
PatientInsuranceDocUI.init();
PatientDocUI.init();

$(document).ready(function () {
    var postbackUrl = "../../../apix/UserSession/GetUserRolesByPage";
    var meta = {};
    meta.PageName = 'orderEntry.html';

    __DoAsyncPostBack(meta, postbackUrl, function (ajxOut) {
        if (ajxOut.Success == false) {
            return '';
        }

        if (ajxOut.Success == true) {
            var rolValue = ajxOut.ResultData;
            if (rolValue.includes('A') == false && rolValue.includes('E') == false) {
                $('#btnSaveOrder').remove();
            }
            if (rolValue.includes('C') == false) {
                $('#btnCancelOrder').remove();
            }
            if (rolValue.includes('OID') == false) {
                $('.ordItm-btn-remove').remove();
            }
            if (rolValue.includes('P') == false) {  //Check for Add Physician 
                _GlobalOrder.hasAddPhyRole = false;
            }
            else {
                _GlobalOrder.hasAddPhyRole = true;
            }
        }
    });
});