"use strict";

var OrderInformation = {
    state: {
        idx: 0,
        hostSel: "#orderItm",
        addBtnSel: "[data-ev='Ev_add_NewOrderItm']",
        accPrefix: "ordAcc",
        singleOpen: true
    },

    init: function () {
        var host = this.qs(this.state.hostSel);
        if (host) {
            var so = host.getAttribute("data-single-open");
            this.state.singleOpen = (so === "true" || so === true);
        }
        this.initHeaderRecurring();

        document.addEventListener("click", this.handleEvent.bind(this), false);
        document.addEventListener("change", this.handleEvent.bind(this), false);
        document.addEventListener("keydown", this.handleKeydown.bind(this), false);
    },

    dateBounds: function () {
        const today = new Date();
        const max = new Date(today);
        max.setFullYear(today.getFullYear() + 1);
        today.setHours(0, 0, 0, 0);
        max.setHours(23, 59, 59, 999);
        return { today, max };
    },

    attachDatePickers: function (i) {
        const { today, max } = this.dateBounds();
        const byId = (id) => document.getElementById(id);

        const rsd = byId(`inpRequestedServiceDate_${i}`);
        const red = byId(`inpRecurringEndDate_${i}`);

        const ns = byId(`inpRqstNursStartDate_${i}`);
        const ne = byId(`inpRqstNursEndDate_${i}`);

        const hhs = byId(`inpHHRequestedStartDate_${i}`);
        const hhe = byId(`inpHHRequestedEndDate_${i}`);

        const baseOpts = {
            dateFormat: "m/d/Y",
            minDate: today,
            maxDate: max,
            onChange: function (_, __, fp) { fp.close(); }
        };

        const initPicker = (el) => {
            if (!el) return null;
            if (el._flatpickr) return el._flatpickr;
            return flatpickr(el, baseOpts);
        };

        const linkStartEnd = (startEl, endEl) => {
            if (!startEl || !endEl) return;

            const linkKey = `${startEl.id}__${endEl.id}`;
            if (startEl.dataset.fpLinkedTo === linkKey && endEl.dataset.fpLinkedFrom === linkKey) {
                const sFP = startEl._flatpickr, eFP = endEl._flatpickr;
                if (sFP && eFP) {
                    eFP.set('minDate', sFP.selectedDates?.[0] || today);
                    sFP.set('maxDate', eFP.selectedDates?.[0] || max);
                }
                return;
            }

            const sFP = initPicker(startEl);
            const eFP = initPicker(endEl);
            if (!sFP || !eFP) return;

            const syncMin = () => {
                const s = sFP.selectedDates?.[0];
                eFP.set('minDate', s || today);
            };
            const syncMax = () => {
                const e = eFP.selectedDates?.[0];
                sFP.set('maxDate', e || max);
            };

            syncMin();
            syncMax();
            sFP.config.onChange.push(syncMin);
            eFP.config.onChange.push(syncMax);

            startEl.dataset.fpLinkedTo = linkKey;
            endEl.dataset.fpLinkedFrom = linkKey;
        };

        const linkRecurring = (startEl, endEl) => {
            if (!startEl || !endEl) return;
            const linkKey = `rec_${startEl.id}__${endEl.id}`;
            if (startEl.dataset.fpRecLinked === linkKey) {
                const sFP = startEl._flatpickr, eFP = endEl._flatpickr;
                if (sFP && eFP) eFP.set('minDate', sFP.selectedDates?.[0] || today);
                return;
            }
            const sFP = initPicker(startEl);
            const eFP = initPicker(endEl);
            if (!sFP || !eFP) return;

            const sync = () => {
                const s = sFP.selectedDates?.[0];
                eFP.set('minDate', s || today);
            };
            sync();
            sFP.config.onChange.push(sync);

            startEl.dataset.fpRecLinked = linkKey;
        };

        initPicker(rsd);
        initPicker(red);
        initPicker(ns);
        initPicker(ne);
        initPicker(hhs);
        initPicker(hhe);

        linkStartEnd(ns, ne);
        linkStartEnd(hhs, hhe);
        linkRecurring(rsd, red);
    },

    toggleRecurring: function (idx, isOn) {
        const byId = (id) => document.getElementById(id);

        const sec = byId(`orderRecurringSec_${idx}`);
        const freq = byId(`inpRecurringFrequency_${idx}`);
        const end = byId(`inpRecurringEndDate_${idx}`);
        const freqLbl = byId(`inpRecurringFrequencyLbl_${idx}`);
        const endLbl = byId(`inpRecurringEndDateLbl_${idx}`);

        if (!sec) return;

        if (typeof isOn !== "boolean") {
            const itemChk = byId(`inpIsRecurring_${idx}`);
            isOn = !!(itemChk && itemChk.checked);
        }

        const setWrapperHidden = (el, hidden) => {
            if (!el) return;
            const block = el.closest('.form-group, .mb-3, .input-group, fieldset, .col, [class*="col-"]') || el;
            block.classList.toggle('d-none', hidden);
        };

        const setSelfHidden = (el, hidden) => {
            if (!el) return;
            el.classList.toggle('d-none', hidden);
        };

        [freq, end].forEach((el) => {
            setWrapperHidden(el, !isOn);

            if ('disabled' in el) el.disabled = !isOn;
            if (!isOn && 'value' in el) {
                if (el._flatpickr) el._flatpickr.clear(); else el.value = '';
            }
        });

        [freqLbl, endLbl].forEach((lbl) => {

            if (lbl) setWrapperHidden(lbl, !isOn);

            if (lbl) setSelfHidden(lbl, !isOn);
        });

        if (typeof this.reflow === 'function') this.reflow(sec);
    },


    initHeaderRecurring: function () {
        const chk = document.getElementById('hdrIsRecurring');
        const freq = document.getElementById('hdrRecurringFrequency');
        const end = document.getElementById('hdrRecurringEndDate');
        const freqLbl = document.getElementById('hdrRecurringFrequencyLbl');
        const endLbl = document.getElementById('hdrRecurringEndDateLbl') || document.getElementById('hdrRecurringEndDatelbl');

        const setHidden = (el, hidden) => {
            if (!el) return;
            const block = el.closest('.form-group, .mb-3, .input-group, fieldset, .col, [class*="col-"]') || el;
            block.classList.toggle('d-none', hidden);
        };
        const setLabelHidden = (lbl, hidden) => { if (lbl) lbl.classList.toggle('d-none', hidden); };

        const resetSelect = (el) => {
            if (!el) return;
            if (window.jQuery && window.$ && $(el).hasClass('select2-hidden-accessible')) {
                $(el).val(null).trigger('change');
            } else {
                el.selectedIndex = 0;
                el.value = '';
            }
        };
        const resetDate = (el) => {
            if (!el) return;
            if (el._flatpickr) el._flatpickr.clear(); else el.value = '';
        };

        const setItemRecurringUI = (idx, isOn) => {
            const f = document.getElementById(`inpRecurringFrequency_${idx}`);
            const e = document.getElementById(`inpRecurringEndDate_${idx}`);
            const fLb = document.getElementById(`inpRecurringFrequencyLbl_${idx}`);
            const eLb = document.getElementById(`inpRecurringEndDateLbl_${idx}`);
            [f, e].forEach(el => setHidden(el, !isOn));
            [fLb, eLb].forEach(el => setLabelHidden(el, !isOn));
            if (!isOn) {
                if (f) resetSelect(f);
                if (e) resetDate(e);
            }
        };

        const getIdx = (id) => (id.match(/_(\d+)$/) || [])[1];

        const toggle = () => {
            const on = !!(chk && chk.checked);

            resetSelect(freq);
            resetDate(end);

            setHidden(freq, !on);
            setHidden(end, !on);
            setLabelHidden(freqLbl, !on);
            setLabelHidden(endLbl, !on);
            if (freq) { freq.disabled = !on; freq.title = on ? "" : "Enable header recurring first"; }
            if (end) { end.disabled = !on; end.title = on ? "" : "Enable header recurring first"; }

            document.querySelectorAll("input[type='checkbox'][id^='inpIsRecurring_']").forEach(box => {
                const idx = getIdx(box.id);
                if (!idx) return;
                setHidden(box, on);
                if (on) {
                    box.checked = false;
                    box.title = "Controlled by header recurring";
                    setItemRecurringUI(idx, false);
                } else {
                    box.title = "";
                    setItemRecurringUI(idx, !!box.checked);
                }
            });
        };

        if (chk) {
            chk.setAttribute('data-ev', 'EV_ToggleHdrRecurring');
            chk.addEventListener('change', toggle, { passive: true });
            toggle();
        }

        document.querySelectorAll('.text-danger').forEach(span => {
            const label = span.closest('label, .form-label');
            if (label) label.classList.add('is-required');
        });
    },

    GetOrderHeaderInformation: async function (OrderId) {
        var meta = { OrderId: OrderId };
        const functionName = 'GetOrderHeaderInformation'
        var url = _GlobalOrder.url + functionName;
        var ajax = await __PromisAsyncPostBack(meta, url);
        if (ajax.Success) {
            let res = ajax.ResultData
            $("#orderNumber").text(res.OrderNumber ? "#" + res.OrderNumber : '');
            $("#clientName").text(res.ClientName ?? '');
            $("#facilityName").text(res.FacilityName ?? '');
            $("#providerName").text(res.ProviderName ?? '');
        }
    },

    handleEvent: function (ev) {
        var target = ev.target;
        var evCase = target.getAttribute && target.getAttribute('data-ev');
        const currentIndx = evCase?.match(/(\d+)$/)?.[0] || null;

        switch (evCase) {
            case 'Ev_add_NewOrderItm':
                if (ev.type === 'click') {
                    ev.preventDefault();
                    if (_GlobalOrder.OrderId == '') {
                        Orders.gotoStep(3);
                        _$modxAppCore.showErrorMessage('To add an order, you first need to select the NPI and save the record.', 'error', 'orderErrorMsg');
                        $('#FacilityNpi').focus();
                        return;
                    }
                    this.addItem();
                    return;
                }
                break;

            case 'EV_OnChangeServiceType':
                if (ev.type === 'change') {
                    ev.preventDefault();
                    this.onChangeServiceType(target);
                    return;
                }
                break;

            case 'EV_OnChangeService':
                if (ev.type === 'change') {
                    ev.preventDefault();
                    this.onChangeService(target);
                    return;
                }
                break;

            case `EV_SaveOrder_Item_${currentIndx}`:
                if (ev.type === 'click') {
                    ev.preventDefault();
                    this.saveFinalStep(true, currentIndx);
                }
                break;

            case `EV_DelOrder_Item_${currentIndx}`:
                if (ev.type === 'click') {
                    ev.preventDefault();
                    $('#inlineConfirm_' + currentIndx).removeClass('d-none')
                    return;
                }
                break;

            case `EV_ConfirmDelete_${currentIndx}`:
                if (ev.type === 'click') {
                    ev.preventDefault();
                    const itemEl = document.getElementById(this.ids.item(currentIndx));
                    if (!itemEl) break;
                    this.deleteOrderItem(currentIndx, itemEl)
                }
                break;

            case `EV_CancelDelete_${currentIndx}`:
                if (ev.type === 'click') {
                    ev.preventDefault();
                    $('#inlineConfirm_' + currentIndx).addClass('d-none')
                }
                break;
        }

        var hdr = target.closest(".ord-acc-header");
        if (hdr && !target.closest(".ord-acc-remove")) {
            ev.preventDefault();
            this.toggleItem(hdr.closest(".ord-acc-item"));
            return;
        }

        if (target.closest(".ord-acc-remove")) {
            ev.preventDefault();
            this.removeItem(target.closest(".ord-acc-item"));
            return;
        }

        if (ev.type === 'change' && target.id && target.id.indexOf('inpIsRecurring_') === 0) {
            const idx = target.id.split('_').pop();
            this.toggleRecurring(idx, target.checked);
            return;
        }
    },

    deleteOrderItem: async function (orderItemId, itemEl) {
        var meta = {};
        meta.OrderItemID = $('#OrderItemId_' + orderItemId).val();
        _$modxAppProgressBar.show();
        var functionName = "DeleteOrderItem";
        var url = _GlobalOrder.url + functionName;
        var ajaxOut = await __PromisAsyncPostBack(meta, url);
        if (ajaxOut.Success == false) {
            _$modxAppCore.showErrorMessage(ajaxOut.Message, 'error', 'divValidateMsgMap')
            _$modxAppProgressBar.hide();
            return;
        }

        if (ajaxOut.Success) {
            _$modxAppProgressBar.hide();
            this.removeItem(itemEl);
        }
    },

    handleKeydown: function (ev) {
        var hdr = ev.target.closest && ev.target.closest(".ord-acc-header");
        if (!hdr) return;

        var headers = this.headerList();
        var idx = headers.indexOf(hdr);
        if (idx < 0) return;

        switch (ev.key) {
            case " ":
            case "Enter":
                ev.preventDefault();
                this.toggleItem(hdr.closest(".ord-acc-item"));
                break;
            case "ArrowDown":
                ev.preventDefault();
                this.focusHeaderAt(idx + 1);
                break;
            case "ArrowUp":
                ev.preventDefault();
                this.focusHeaderAt(idx - 1);
                break;
            case "Home":
                ev.preventDefault();
                this.focusHeaderAt(0);
                break;
            case "End":
                ev.preventDefault();
                this.focusHeaderAt(headers.length - 1);
                break;
        }
    },

    addItem: function () {
        this.state.idx += 1;
        const i = this.state.idx;
        const host = this.qs(this.state.hostSel);
        if (!host) return;

        const html = this.buildItem(i);
        host.insertAdjacentHTML("beforeend", html);

        this.relabelHeaders();

        const item = host.querySelector("#" + this.ids.item(i));
        if (item) this.toggleItem(item, true);

        const svcType = this.qs("#" + this.ids.svcType(i));
        if (svcType) requestAnimationFrame(() => svcType.focus());

        this.attachDatePickers(i);
        this.toggleRecurring(i, false);

        const hdrChk = document.getElementById('hdrIsRecurring');
        const headerOn = !!(hdrChk && hdrChk.checked);
        const recurWrap = document.getElementById('IsRecurring_' + i);
        if (recurWrap) {
            recurWrap.classList.toggle('d-none', headerOn);
        }
    },

    relabelHeaders: function () {
        const host = this.qs(this.state.hostSel);
        if (!host) return;

        host.querySelectorAll(".ord-acc-item").forEach((node, idx) => {
            const label = node.querySelector('.ord-acc-title [data-role="ord-label"]');
            if (label) label.textContent = `Order Item ${idx + 1}`;
        });
    },


    removeItem: function (itemEl) {
        const host = this.qs(this.state.hostSel);
        if (!host || !itemEl) return;

        const indexToRemove = [...host.children].indexOf(itemEl);
        itemEl.remove();

        // Re-label using the safe method
        this.relabelHeaders();

        const headers = this.headerList();
        const next = Math.max(0, indexToRemove - 1);
        if (headers[next]) headers[next].focus();
    },

    onChangeServiceType: async function (selectEl) {
        var itemEl = selectEl.closest('.ord-acc-item');
        if (!itemEl) return;

        var idx = selectEl.id.split('_').pop();
        var val = selectEl.value;

        var svcSel = itemEl.querySelector('#ServiceSel_' + idx);
        var cptCodes = itemEl.querySelector('#CPTCodes_' + idx);
        var infoSec = itemEl.querySelector('#orderInfoSec_' + idx);
        var reccuSec = itemEl.querySelector('#orderRecurringSec_' + idx);
        var details = itemEl.querySelector('#orderDetails_' + idx);

        this.hideServiceBlocks(details);

        var hasGlobalServiceBlocks =
            document.getElementById('Service_Imaging') ||
            document.getElementById('Service_Lab') ||
            document.getElementById('Service_Nursing') ||
            document.getElementById('Service_HomeHealth');

        if (window.Orders && typeof Orders.hideallField === 'function' && hasGlobalServiceBlocks) {
            try { Orders.hideallField('Service_Imaging'); } catch (_e) { }
        }

        if (val !== '') {
            this.show(svcSel, cptCodes, infoSec, details, reccuSec);
            await this.GetServiceDetails(val, idx);
        } else {
            this.hide(svcSel, cptCodes, infoSec, details, reccuSec);
        }

        this.reflow(details);
    },

    onChangeService: function (serviceSelectEl) {
        var itemEl = serviceSelectEl.closest('.ord-acc-item');
        if (!itemEl) return;

        var idx = serviceSelectEl.id.split('_').pop();
        var serviceTypeSel = itemEl.querySelector('#inpServiveTypeNameDrp_' + idx);
        var serviceTypeText = (serviceTypeSel && serviceTypeSel.selectedOptions[0])
            ? serviceTypeSel.selectedOptions[0].textContent.trim()
            : '';

        this.showServiceField(serviceTypeText, idx);

        var details = itemEl.querySelector('#orderDetails_' + idx);
        this.reflow(details);
    },

    hideServiceBlocks: function (detailsEl) {
        if (!detailsEl) return;
        detailsEl.querySelectorAll("[id^='Service_']").forEach(function (n) {
            if (n) n.classList.add('d-none');
        });
    },

    GetServiceDetails: async function (serviceType, idx) {
        var meta = { Id: serviceType };
        meta.FacilityID = _GlobalOrder.FacilityID || $('#facilitySearch').attr('data-selected-id');
        var url = '../../../apix/Services/GetServiceDetails';
        var data = await __PromisAsyncPostBack(meta, url);
        Core.bindSelectList(`inpServiceID_${idx}`, data, 'Id', 'Name', 'Select');
    },

    GetCptCodes: async function (idx) {
        var svcEl = document.getElementById(`inpServiceID_${idx}`);
        var serviceID = (svcEl && svcEl.value) ? svcEl.value.trim() : '';
        var meta = { ServiceID: serviceID };
        var functionName = "GetLabCptCodes";
        var url = _GlobalOrder.url + functionName;
        var data = await __PromisAsyncPostBack(meta, url);
        Core.bindSelectList(`inpCptCodes_${idx}`, data, 'CptCodes', 'CptName', 'Select');
    },

    showServiceField: function (serviceType, idx) {
        var itemEl = document.getElementById(this.ids.item(idx));
        if (!itemEl) return;

        var orderDetails = itemEl.querySelector('#orderDetails_' + idx);
        var cptWrap = itemEl.querySelector('#CPTCodes_' + idx);
        var infoSec = itemEl.querySelector('#orderInfoSec_' + idx);

        this.hideServiceBlocks(orderDetails);

        var hasGlobalServiceBlocks =
            document.getElementById('Service_Imaging') ||
            document.getElementById('Service_Lab') ||
            document.getElementById('Service_Nursing') ||
            document.getElementById('Service_HomeHealth');

        if (window.Orders && typeof Orders.hideallField === 'function' && hasGlobalServiceBlocks) {
            try { Orders.hideallField(); } catch (_e) { }
        }

        this.show(orderDetails, cptWrap, infoSec);

        var detailsOf = function (base) { return itemEl.querySelector('#' + base + '_' + idx); };

        switch (serviceType) {
            case 'Laboratory':
                this.GetCptCodes(idx);
                this.showOnly(detailsOf('Service_Lab'));
                if (window.OrderLab && typeof OrderLab.Init === 'function') OrderLab.Init();
                break;

            case 'Diagnostic Imaging':
                this.GetCptCodes(idx);
                this.showOnly(detailsOf('Service_Imaging'));
                if (window.OrderImaging && typeof OrderImaging.Init === 'function') OrderImaging.Init();
                break;

            case 'Skilled Nursing':
                this.GetCptCodes(idx);
                this.showOnly(detailsOf('Service_Nursing'));
                if (window.OrderNursing && typeof OrderNursing.Init === 'function') OrderNursing.Init();
                break;

            case 'Home Health':
                this.GetCptCodes(idx);
                this.showOnly(detailsOf('Service_HomeHealth'));
                if (window.OrderHomeHealth && typeof OrderHomeHealth.Init === 'function') OrderHomeHealth.Init();
                break;
        }
    },

    showOnly: function (toShowEl) {
        if (!toShowEl) return;
        var details = toShowEl.closest('fieldset');
        if (!details) return;
        details.querySelectorAll("[id^='Service_']").forEach(function (n) { if (n) n.classList.add('d-none'); });
        toShowEl.classList.remove('d-none');
    },

    toggleItem: function (itemEl, forceOpen) {
        if (!itemEl) return;
        var header = itemEl.querySelector(".ord-acc-header");
        var panel = itemEl.querySelector(".ord-acc-panel");
        if (!header || !panel) return;

        var expand = (forceOpen === true) ? true : (header.getAttribute("aria-expanded") !== "true");

        if (this.state.singleOpen && expand) {
            var host = this.qs(this.state.hostSel);
            Array.prototype.forEach.call(host.querySelectorAll(".ord-acc-item"), function (el) {
                if (el === itemEl) return;
                var h = el.querySelector(".ord-acc-header");
                var p = el.querySelector(".ord-acc-panel");
                if (h && p && h.getAttribute("aria-expanded") === "true") {
                    h.setAttribute("aria-expanded", "false");
                    OrderInformation.closePanel(p);
                }
            });
        }

        header.setAttribute("aria-expanded", expand ? "true" : "false");
        if (expand) this.openPanel(panel); else this.closePanel(panel);
    },

    openPanel: function (panel) { panel.style.maxHeight = panel.scrollHeight + "px"; },
    closePanel: function (panel) { panel.style.maxHeight = "0px"; },

    reflow: function (scopeEl) {
        if (!scopeEl) return;
        var panel = scopeEl.closest('.ord-acc-panel');
        if (!panel) return;
        if (panel.previousElementSibling && panel.previousElementSibling.getAttribute('aria-expanded') === 'true') {
            panel.style.maxHeight = 'none';
            var h = panel.scrollHeight;
            panel.style.maxHeight = h + 'px';
        }
    },

    headerList: function () {
        var host = this.qs(this.state.hostSel);
        return host ? Array.from(host.querySelectorAll(".ord-acc-header")) : [];
    },
    focusHeaderAt: function (index) {
        var list = this.headerList();
        if (!list.length) return;
        var i = Math.max(0, Math.min(index, list.length - 1));
        list[i].focus();
    },

    ids: {
        item: i => OrderInformation.state.accPrefix + "_item_" + i,
        header: i => OrderInformation.state.accPrefix + "_hdr_" + i,
        panel: i => OrderInformation.state.accPrefix + "_panel_" + i,
        svcType: i => "inpServiveTypeNameDrp_" + i
    },

    buildItem: function (i) {
        var ids = this.ids;
        var itemId = ids.item(i);
        var headerId = ids.header(i);
        var panelId = ids.panel(i);

        var bodyHTML = `
       <fieldset class="patiInf-fieldset border p-2 rounded mb-3" data-model="OrderHeaderMeta">
    <legend class="float-none w-auto px-2 text-primary">Order Information</legend>
          <input class='d-none' id = "OrderItemId_${i}"/>
          <input class='d-none' id = "OrderItemLineId_${i}"/>

          <div class="row">
            <div class="form-group col-md-3">
              <label>Service Type<span class="text-danger">*</span></label>
              <select class="form-select form-select-sm"
                      data-model-prop="ServiceTypeName"
                      id="inpServiveTypeNameDrp_${i}"
                      data-ev="EV_OnChangeServiceType">
                <option value="">--Select--</option>
                <option value="1">Diagnostic Imaging</option>
                <option value="2">Home Health</option>
                <option value="4">Laboratory</option>
                <option value="5">Skilled Nursing</option>
              </select>
            </div>

            <div class="form-group col-md-3 d-none" id="ServiceSel_${i}">
              <label>Select Service<span class="text-danger">*</span></label>
              <select class="form-select form-select-sm"
                      id="inpServiceID_${i}"
                      data-model-prop="ServiceName"
                      data-ev="EV_OnChangeService">
                <option value="">Select Service</option>
              </select>
            </div>

            <div class="d-none form-group col-md-6" id="CPTCodes_${i}">
              <label>CPT Codes <span class="text-danger">*</span></label>
              <select class="form-select form-select-sm" data-model-prop="CptCodes" id="inpCptCodes_${i}"></select>
            </div>
          </div>

          <div class="row d-none mt-2" id="orderInfoSec_${i}">
            <div class="form-group col-md-3" id="Priority_${i}">
              <label>Priority <span class="text-danger">*</span></label>
              <select class="form-select form-select-sm" data-model-prop="Priority" id="inpPriority_${i}">
                <option value="Critical">Critical</option>
                <option value="High">High</option>
                <option value="Standard" selected>Standard</option>
              </select>
            </div>

            <div class="form-group col-md-3" id="RequestedServiceDate_${i}">
              <label>Requested Service Date</label>
              <input id="inpRequestedServiceDate_${i}"
                     placeholder="mm/dd/yyyy"
                     class="form-control form-control-sm"
                     data-model-prop="RequestedServiceDate"/>
            </div>

            <div class="form-group col-md-3" id="RequestedServiceTime_${i}">
              <label for="inpRequestedServiceTime_${i}">Requested Service Time</label>
              <input type="time"
                     id="inpRequestedServiceTime_${i}"
                     class="form-control form-control-sm tm"
                     data-model-prop="RequestedServiceTime"
                     placeholder="hh:mm AM/PM"/>
            </div>
          </div>

          <div class="row d-none mt-2" id="orderRecurringSec_${i}">
            <div class="form-group col-md-1 mx-2" id="IsRecurring_${i}" style="text-align: left;">
                <label class="form-check-label mb-0 d-block">Recurring</label>
                <div class="form-checkbox">
                    <input class="form-control-sm"
                           type="checkbox"
                           id="inpIsRecurring_${i}"
                           data-model-prop="IsRecurring">
                </div>
            </div>

            <div class="form-group col-md-3">
              <label id="inpRecurringFrequencyLbl_${i}">Recurring Frequency</label>
              <select class="form-select form-select-sm"
                      id="inpRecurringFrequency_${i}"
                      data-model-prop="RecurringFrequency">
                <option value="">Select</option>
                <option value="Weekly">Weekly</option>
                <option value="Every 2 weeks">Every 2 weeks</option>
                <option value="Monthly">Monthly</option>
                <option value="Quarterly">Quarterly</option>
                <option value="Every 6 months">Every 6 months</option>
                <option value="Yearly">Yearly</option>
              </select>
            </div>

            <div class="form-group col-md-3">
              <label id="inpRecurringEndDateLbl_${i}">Recurring End Date</label>
              <input id="inpRecurringEndDate_${i}"
                     type="text"
                     class="form-control form-control-sm"
                     data-model-prop="RecurringEndDate"
                     placeholder="mm/dd/yyyy"
                     autocomplete="off"/>
            </div>
          </div>
        </fieldset>

        <fieldset class="patiInf-fieldset border p-2 rounded mb-3 d-none" id="orderDetails_${i}">
          <legend class="float-none w-auto px-2 text-primary">Order Details</legend>

          <div id="Service_Lab_${i}" data-ev="EV_Lab" class="d-none mt-2" data-model="OrderLabMeta">
            <div class="row align-items-center mb-2 mt-3">
              <div class="col-md-2 col-12 d-flex align-items-center" id="FastFlagChkBox_${i}">
                <label class="mb-0 me-2" style="min-width:70px;">Fasting</label>
              </div>
              <div class="col-md-10 d-none d-md-block">
                <input type="checkbox" class="form-check-input" id="inpIsFasting_${i}" style="margin-top:0;" data-model-prop="IsFasting"/>
              </div>
            </div>

            <div class="row align-items-center mb-2">
              <div class="col-md-2 col-12 d-flex align-items-center">
                <label for="inpSymptom1_${i}" class="mb-0 me-2" style="min-width:110px;">Symptom 1</label>
              </div>
              <div class="col-md-10 col-12">
                <textarea id="inpSymptom1_${i}" class="form-control form-control-sm" data-model-prop="Symptom1" maxlength="255" autocomplete="off" rows="2" style="resize:vertical;min-height:40px"></textarea>
              </div>
            </div>

            <div class="row align-items-center mb-2">
              <div class="col-md-2 col-12 d-flex align-items-center">
                <label for="inpSymptom2_${i}" class="mb-0 me-2" style="min-width:110px;">Symptom 2</label>
              </div>
              <div class="col-md-10 col-12">
                <textarea id="inpSymptom2_${i}" class="form-control form-control-sm" data-model-prop="Symptom2" maxlength="255" autocomplete="off" rows="2" style="resize:vertical;min-height:40px"></textarea>
              </div>
            </div>

            <div class="row align-items-center mb-2">
              <div class="col-md-2 col-12 d-flex align-items-center">
                <label for="inpPortabilityReason_${i}" class="mb-0 me-2" style="min-width:110px;">Portability Reason</label>
              </div>
              <div class="col-md-10 col-12">
                <textarea id="inpPortabilityReason_${i}" class="form-control form-control-sm" data-model-prop="PortabilityReason" maxlength="255" autocomplete="off" rows="2" style="resize:vertical; min-height:40px"></textarea>
              </div>
            </div>
           <div class="row align-items-center mb-2">
              <div class="col-md-2 col-12 d-flex align-items-center">
                <label for="inpAccessionNumber_${i}" class="mb-0 me-2" style="min-width:110px;">Accession Number <span class="text-danger">*</span></label>
              </div>
              <div class="col-md-10 col-12">
                   <input id="inpAccessionNumber_${i}" 
                           type="text" 
                           class="form-control form-control-sm" 
                           data-model-prop="AccessionNumber" 
                           maxlength="80"
                           autocomplete="off">
              </div>
            </div>
            
             <!-- Primary ICD-10 Code -->
                <div class="row align-items-center mb-2 mt-2">
                  <div class="col-md-2 col-12 d-flex align-items-center">
                    <label for="inpPrimaryICD_${i}" class="mb-0 me-2" style="min-width:110px;">Primary ICD-10 <span class="text-danger">*</span></label>
                  </div>
                  <div class="col-md-10 col-4">
                    <input id="inpLabPrimaryICD_${i}" 
                           type="text" 
                           class="form-control form-control-sm" 
                           data-model-prop="PrimaryICD10Code" 
                           maxlength="50"
                           autocomplete="off">
                  </div>
                </div>

                <!-- Secondary ICD-10 Code -->
                <div class="row align-items-center mb-2 mt-2">
                  <div class="col-md-2 col-12 d-flex align-items-center">
                    <label for="inpSecondaryICD_${i}" class="mb-0 me-2" style="min-width:110px;">Secondary ICD-10 <span class="text-danger"></span></label>
                  </div>
                  <div class="col-md-10 col-4">
                    <input id="inpLabSecondaryICD_${i}" 
                           type="text" 
                           class="form-control form-control-sm" 
                           data-model-prop="SecondaryICD10Code" 
                           maxlength="50"
                           autocomplete="off">
                  </div>
                </div>

                <!-- Tertiary ICD-10 Code -->
                <div class="row align-items-center mb-2 mt-2">
                  <div class="col-md-2 col-12 d-flex align-items-center">
                    <label for="inpTertiaryICD_${i}" class="mb-0 me-2" style="min-width:110px;">Tertiary ICD-10 <span class="text-danger"></span></label>
                  </div>
                  <div class="col-md-10 col-4">
                    <input id="inpLabTertiaryICD_${i}" 
                           type="text" 
                           class="form-control form-control-sm" 
                           data-model-prop="TertiaryICD10Code" 
                           maxlength="50"
                           autocomplete="off">
                  </div>
                </div>

          </div>

          <div id="Service_Imaging_${i}" data-ev="EV_Imaging" class="d-none" data-model="OrderImagingMeta">
            <div class="row align-items-center mb-2 mt-2">
              <div class="col-md-2 col-12 d-flex align-items-center">
                <label for="inpLaterality_${i}" class="mb-0 me-2" style="min-width:110px;">Laterality <span class="text-danger">*</span></label>
              </div>
              <div class="col-md-10 col-4">
                <select class="form-select form-select-sm" data-model-prop="Laterality" id="inpLaterality_${i}">
                  <option value="">Select</option>
                  <option value="LT">Left side</option>
                  <option value="RT">Right side</option>
                  <option value="50">Bilateral</option>
                </select>
              </div>
            </div>

            <div class="row align-items-center mb-2 mt-2">
              <div class="col-md-2 col-12 d-flex align-items-center">
                <label for="inpNote_${i}" class="mb-0 me-2" style="min-width:110px;">Note <span class="text-danger"></span></label>
              </div>
              <div class="col-md-10 col-4">
                <textarea id="inpNote_${i}" class="form-control form-control-sm" data-model-prop="Note" maxlength="255" autocomplete="off" rows="3" style="resize:vertical; min-height:40px"></textarea>
              </div>
            </div>
                <!-- Primary ICD-10 Code -->
                <div class="row align-items-center mb-2 mt-2">
                  <div class="col-md-2 col-12 d-flex align-items-center">
                    <label for="inpPrimaryICD_${i}" class="mb-0 me-2" style="min-width:110px;">Primary ICD-10 <span class="text-danger">*</span></label>
                  </div>
                  <div class="col-md-10 col-4">
                    <input id="inpImgPrimaryICD_${i}" 
                           type="text" 
                           class="form-control form-control-sm" 
                           data-model-prop="PrimaryICD10Code" 
                           maxlength="50"
                           autocomplete="off">
                  </div>
                </div>

                <!-- Secondary ICD-10 Code -->
                <div class="row align-items-center mb-2 mt-2">
                  <div class="col-md-2 col-12 d-flex align-items-center">
                    <label for="inpSecondaryICD_${i}" class="mb-0 me-2" style="min-width:110px;">Secondary ICD-10 <span class="text-danger"></span></label>
                  </div>
                  <div class="col-md-10 col-4">
                    <input id="inpImgSecondaryICD_${i}" 
                           type="text" 
                           class="form-control form-control-sm" 
                           data-model-prop="SecondaryICD10Code" 
                           maxlength="50"
                           autocomplete="off">
                  </div>
                </div>

                <!-- Tertiary ICD-10 Code -->
                <div class="row align-items-center mb-2 mt-2">
                  <div class="col-md-2 col-12 d-flex align-items-center">
                    <label for="inpTertiaryICD_${i}" class="mb-0 me-2" style="min-width:110px;">Tertiary ICD-10 <span class="text-danger"></span></label>
                  </div>
                  <div class="col-md-10 col-4">
                    <input id="inpImgTertiaryICD_${i}" 
                           type="text" 
                           class="form-control form-control-sm" 
                           data-model-prop="TertiaryICD10Code" 
                           maxlength="50"
                           autocomplete="off">
                  </div>
                </div>

          </div>

          <div id="Service_Nursing_${i}" data-ev="EV_Nursing" class="d-none" data-model="OrderNursingMeta">
            <div class="row mt-1">
              <div class="form-group col-md-3">
                <label for="inpFrequency_${i}">Frequency<span class="text-danger">*</span></label>
                <select id="inpFrequency_${i}" class="form-control form-control-sm" data-model-prop="Frequency">
                  <option value="">Select Frequency</option>
                  <option value="Daily">Daily</option>
                  <option value="3xWeek">3x/week</option>
                  <option value="Weekly">Weekly</option>
                  <option value="Other">Other</option>
                </select>
              </div>
              <div class="form-group col-md-3">
                <label for="inpDuration_${i}">Duration<span class="text-danger">*</span></label>
                <input id="inpDuration_${i}" type="text" class="form-control form-control-sm" data-model-prop="Duration" placeholder="e.g., 30 days, 2 weeks" maxlength="50" autocomplete="off"/>
              </div>
              <div class="form-group col-md-3">
                <label for="inpStartDate_${i}">Requested Start Date<span class="text-danger">*</span></label>
                <input id="inpRqstNursStartDate_${i}" type="text" class="form-control form-control-sm" data-model-prop="RequestedStartDate" placeholder="mm/dd/yyyy" autocomplete="off"/>
              </div>
              <div class="form-group col-md-3">
                <label for="inpEndDate_${i}">Requested End Date<span class="text-danger">*</span></label>
                <input id="inpRqstNursEndDate_${i}" type="text" class="form-control form-control-sm" data-model-prop="EndDate" placeholder="mm/dd/yyyy" autocomplete="off"/>
              </div>
            </div>
            <div class="row mt-1">
              <div class="form-group col-md-12">
                <label for="inpSpecialInstructions_${i}">Special Instructions<span class="text-danger">*</span></label>
                <textarea id="inpSpecialInstructions_${i}" class="form-control form-control-sm" data-model-prop="SpecialInstructions" maxlength="255" rows="3" style="resize:vertical; min-height:40px" autocomplete="off"></textarea>
              </div>
            </div>
             <!-- Primary ICD-10 Code -->
                <div class="row align-items-center mb-2 mt-2">
                  <div class="col-md-2 col-12 d-flex align-items-center">
                    <label for="inpPrimaryICD_${i}" class="mb-0 me-2" style="min-width:110px;">Primary ICD-10 <span class="text-danger">*</span></label>
                  </div>
                  <div class="col-md-10 col-4">
                    <input id="inpSknPrimaryICD_${i}" 
                           type="text" 
                           class="form-control form-control-sm" 
                           data-model-prop="PrimaryICD10Code" 
                           maxlength="50"
                           autocomplete="off">
                  </div>
                </div>

                <!-- Secondary ICD-10 Code -->
                <div class="row align-items-center mb-2 mt-2">
                  <div class="col-md-2 col-12 d-flex align-items-center">
                    <label for="inpSecondaryICD_${i}" class="mb-0 me-2" style="min-width:110px;">Secondary ICD-10 <span class="text-danger"></span></label>
                  </div>
                  <div class="col-md-10 col-4">
                    <input id="inpSknSecondaryICD_${i}" 
                           type="text" 
                           class="form-control form-control-sm" 
                           data-model-prop="SecondaryICD10Code" 
                           maxlength="50"
                           autocomplete="off">
                  </div>
                </div>

                <!-- Tertiary ICD-10 Code -->
                <div class="row align-items-center mb-2 mt-2">
                  <div class="col-md-2 col-12 d-flex align-items-center">
                    <label for="inpTertiaryICD_${i}" class="mb-0 me-2" style="min-width:110px;">Tertiary ICD-10 <span class="text-danger"></span></label>
                  </div>
                  <div class="col-md-10 col-4">
                    <input id="inpSknTertiaryICD_${i}" 
                           type="text" 
                           class="form-control form-control-sm" 
                           data-model-prop="TertiaryICD10Code" 
                           maxlength="50"
                           autocomplete="off">
                  </div>
                </div>
          </div>

          <div id="Service_HomeHealth_${i}" data-ev="EV_HomeHealth" class="d-none" data-model="OrderHomeHealthMeta">
            <div class="row mt-2">
              <div class="form-group col-md-2">
                <label for="inpNursingFrequency_${i}">Frequency<span class="text-danger">*</span></label>
                <select id="inpNursingFrequency_${i}" class="form-control form-control-sm" data-model-prop="Frequency">
                  <option value="">Select Frequency</option>
                  <option value="Daily">Daily</option>
                  <option value="3xWeek">3x/week</option>
                  <option value="Weekly">Weekly</option>
                  <option value="Other">Other</option>
                </select>
              </div>
              <div class="form-group col-md-2">
                <label for="inpDurationHH_${i}">Duration <span class="text-danger">*</span></label>
                <input id="inpDurationHH_${i}" type="text" class="form-control form-control-sm" data-model-prop="Duration" maxlength="100" autocomplete="off"/>
              </div>
              <div class="form-group col-md-2">
                <label for="inpCertificationPeriod_${i}">Certification Period<span class="text-danger">*</span></label>
                <input id="inpCertificationPeriod_${i}" type="text" class="form-control form-control-sm" data-model-prop="CertificationPeriod" placeholder="e.g., 60 days" maxlength="100" autocomplete="off"/>
              </div>
              <div class="form-group col-md-3">
                <label for="inpRequestedStartDate_${i}">Requested Start Date<span class="text-danger">*</span></label>
                <input id="inpHHRequestedStartDate_${i}" type="text" class="form-control form-control-sm" data-model-prop="RequestedStartDate" placeholder="mm/dd/yyyy" autocomplete="off"/>
              </div>
              <div class="form-group col-md-3">
                <label for="inpEndDateHH_${i}">End Date<span class="text-danger">*</span></label>
                <input id="inpHHRequestedEndDate_${i}" type="text" class="form-control form-control-sm" data-model-prop="EndDate" placeholder="mm/dd/yyyy" autocomplete="off"/>
              </div>
            </div>

            <div class="row mt-1">
              <div class="form-group col-md-12">
                <label for="inpSpecialInstructionsHH_${i}">Special Instructions<span class="text-danger">*</span></label>
                <textarea id="inpSpecialInstructionsHH_${i}" class="form-control form-control-sm" data-model-prop="SpecialInstructions" maxlength="255" rows="2" style="resize:vertical; min-height:40px" autocomplete="off"></textarea>
              </div>
              <div class="form-group col-md-12">
                <label for="inpClinicalReason_${i}">Clinical Reason for Service<span class="text-danger">*</span></label>
                <textarea id="inpClinicalReason_${i}" class="form-control form-control-sm" data-model-prop="ClinicalReason" maxlength="255" rows="2" style="resize:vertical; min-height:40px" autocomplete="off"></textarea>
              </div>
            </div>

            <div class="row mt-1">
              <div class="form-group col-md-12">
                <label for="inpFunctionalLimitations_${i}">Functional Limitations<span class="text-danger">*</span></label>
                <textarea id="inpFunctionalLimitations_${i}" class="form-control form-control-sm" data-model-prop="FunctionalLimitations" maxlength="255" rows="2" style="resize:vertical; min-height:40px" autocomplete="off"></textarea>
              </div>
            </div>
            <div class="row mt-1">
              <div class="form-group col-md-12">
                <label for="inpMentalStatus_${i}">Mental Status<span class="text-danger">*</span></label>
                <textarea id="inpMentalStatus_${i}" class="form-control form-control-sm" data-model-prop="MentalStatus" maxlength="255" rows="2" style="resize:vertical; min-height:40px" autocomplete="off"></textarea>
              </div>
            </div>
            <div class="row mt-1">
              <div class="form-group col-md-12">
                <label for="inpPrognosis_${i}">Prognosis<span class="text-danger">*</span></label>
                <textarea id="inpPrognosis_${i}" class="form-control form-control-sm" data-model-prop="Prognosis" maxlength="255" rows="2" style="resize:vertical; min-height:40px" autocomplete="off"></textarea>
              </div>
            </div>
             <!-- Primary ICD-10 Code -->
                <div class="row align-items-center mb-2 mt-2">
                  <div class="col-md-2 col-12 d-flex align-items-center">
                    <label for="inpPrimaryICD_${i}" class="mb-0 me-2" style="min-width:110px;">Primary ICD-10 <span class="text-danger">*</span></label>
                  </div>
                  <div class="col-md-10 col-4">
                    <input id="inpHHPrimaryICD_${i}" 
                           type="text" 
                           class="form-control form-control-sm" 
                           data-model-prop="PrimaryICD10Code" 
                           maxlength="50"
                           autocomplete="off">
                  </div>
                </div>

                <!-- Secondary ICD-10 Code -->
                <div class="row align-items-center mb-2 mt-2">
                  <div class="col-md-2 col-12 d-flex align-items-center">
                    <label for="inpSecondaryICD_${i}" class="mb-0 me-2" style="min-width:110px;">Secondary ICD-10 <span class="text-danger"></span></label>
                  </div>
                  <div class="col-md-10 col-4">
                    <input id="inpHHSecondaryICD_${i}" 
                           type="text" 
                           class="form-control form-control-sm" 
                           data-model-prop="SecondaryICD10Code" 
                           maxlength="50"
                           autocomplete="off">
                  </div>
                </div>

                <!-- Tertiary ICD-10 Code -->
                <div class="row align-items-center mb-2 mt-2">
                  <div class="col-md-2 col-12 d-flex align-items-center">
                    <label for="inpTertiaryICD_${i}" class="mb-0 me-2" style="min-width:110px;">Tertiary ICD-10 <span class="text-danger"></span></label>
                  </div>
                  <div class="col-md-10 col-4">
                    <input id="inpHHTertiaryICD_${i}" 
                           type="text" 
                           class="form-control form-control-sm" 
                           data-model-prop="TertiaryICD10Code" 
                           maxlength="50"
                           autocomplete="off">
                  </div>
                </div>
          </div>

          <div class="wizard-actions d-flex align-items-center gap-2">
            <div id="orderErrorMsg_${i}" class="py-1 px-3 mb-0 flex-grow-1 me-3"></div>

            <button type="button"
                    class="ordItm-btn ordItm-btn-save"
                    data-ev="EV_SaveOrder_Item_${i}"
                    data-idx="${i}"
                    aria-label="Save Order Item #${i}">
              <i class="fa fa-save" aria-hidden="true" data-ev="EV_SaveOrder_Item_${i}"></i>
            </button>

            <button type="button"
                    class="ordItm-btn ordItm-btn-remove"
                    title="Remove this order item"
                    aria-label="Remove Order Item #${i}"
                    data-ev="EV_DelOrder_Item_${i}"
                    data-idx="${i}">
              <i class="fa fa-trash" aria-hidden="true" data-ev="EV_DelOrder_Item_${i}"></i>
            </button>

            <div class="inline-confirm d-none" id="inlineConfirm_${i}" role="alert" aria-live="assertive">
              <div class="ic-icon text-danger"><i class="fa fa-exclamation-triangle"></i></div>
              <div class="ic-content">
                <div class="ic-msg">Are you sure you want to delete this item?</div>
              </div>
              <div class="ic-actions">
                <button type="button"
                        class="ic-icon-btn text-danger"
                        data-ev="EV_ConfirmDelete_${i}"
                        data-idx="${i}"
                        title="Confirm delete"
                        aria-label="Confirm delete">
                  <i class="fa fa-trash" data-ev="EV_ConfirmDelete_${i}"></i>
                </button>
                <button type="button"
                        class="ic-icon-btn text-muted"
                        data-ev="EV_CancelDelete_${i}"
                        data-idx="${i}"
                        title="Cancel delete"
                        aria-label="Cancel delete">
                  <i class="fa fa-times" data-ev="EV_CancelDelete_${i}"></i>
                </button>
              </div>
            </div>
          </div>
        </fieldset>`;

        return `
       <div class="ord-acc-item" id="${itemId}">
          <button class="ord-acc-header" id="${headerId}" type="button" aria-expanded="false" aria-controls="${panelId}">
            <span class="d-flex">
              <span class="ord-acc-title">
                <i class="fa fa-file-medical"></i>
                <span data-role="ord-label">Order Item ${i}</span>
              </span>
              <span class="mx-1" id="ord-acc-title-OrdN-${i}"></span>
            </span>
            <span class="ord-acc-icons">
              <i class="fa fa-chevron-down ord-acc-chevron" aria-hidden="true"></i>
            </span>
          </button>
          <div id="${panelId}" class="ord-acc-panel" role="region" aria-labelledby="${headerId}">
            <div class="ord-acc-inner">${bodyHTML}</div>
          </div>
        </div>

            `;
    },

    qs: function (sel, root) { return (root || document).querySelector(sel); },
    show: function () {
        Array.prototype.forEach.call(arguments, function (el) { if (el) el.classList.remove('d-none'); });
    },
    hide: function () {
        Array.prototype.forEach.call(arguments, function (el) { if (el) el.classList.add('d-none'); });
    },

    saveFinalStep: async function (isSubmit, currentIndx) {
        const errBoxId = `orderErrorMsg_${currentIndx}`;
        const showMsg = (msg, level = 'error') => _$modxAppCore.showErrorMessage(msg || '', level, errBoxId);

        showMsg('', 'success');

        const sel = document.getElementById(`inpServiveTypeNameDrp_${currentIndx}`);
        if (!sel) {
            console.warn(`Service type select not found for index ${currentIndx}`);
            return false;
        }

        const serviceValue = sel.value;
        const serviceText = sel.selectedOptions[0]?.textContent?.trim() || '';

        if (!serviceValue) {
            showMsg('Please select a service type.');
            sel.focus();
            return false;
        }

        const serviceHandlers = {
            'Laboratory': OrderLab?.SaveOrderForLab,
            'Diagnostic Imaging': OrderImaging?.SaveOrderForImaging,
            'Skilled Nursing': OrderNursing?.SaveOrderForNursing,
            'Home Health': OrderHomeHealth?.SaveOrderForHomeHealth
        };

        const handler = serviceHandlers[serviceText];
        if (!handler) {
            console.warn("Unknown/unsupported service type:", serviceText);
            showMsg('Unsupported service type selected.');
            return false;
        }

        try {
            const result = await handler(isSubmit, currentIndx);
            if (result?.Success) {
                showMsg('Saved successfully.', 'success');
                return result;
            } else {
                return false;
            }
        } catch (err) {
            console.error("Error saving order:", err);
            showMsg('Unexpected error while saving.');
            return false;
        }
    },

    plotExistingOrderItems: async function (payload) {
      $('#orderItm').addClass('d-none')
        const OI = this;
        const byId = (id) => document.getElementById(id);

        const setSelectValue = (id, value, trigger = true) => {
            const el = byId(id);
            if (!el) return false;
            el.value = (value ?? '').toString();
            if (trigger) el.dispatchEvent(new Event('change', { bubbles: true }));
            return true;
        };

        const setTextValue = (id, value) => {
            const el = byId(id);
            if (!el) return;
            el.value = value ?? '';
        };

        const setCheckValue = (id, boolVal) => {
            const el = byId(id);
            if (!el) return;
            el.checked = !!boolVal;
            el.dispatchEvent(new Event('change', { bubbles: true }));
        };

        const waitForOptions = async (id, { mustContainValue = null, timeoutMs = 8000, intervalMs = 60 } = {}) => {
            const start = Date.now();
            return new Promise((resolve, reject) => {
                const tick = () => {
                    const el = byId(id);
                    if (!el) return setTimeout(tick, intervalMs);
                    const hasOptions = el.options && el.options.length > 1;
                    const contains = mustContainValue != null
                        ? Array.from(el.options).some(o => o.value == mustContainValue)
                        : hasOptions;

                    if (contains) return resolve(true);
                    if (Date.now() - start > timeoutMs) return reject(new Error(`Timeout waiting for ${id} options`));
                    setTimeout(tick, intervalMs);
                };
                tick();
            });
        };

        const setDateSmart = (id, dateStr) => {
            if (!dateStr) return;
            const el = byId(id);
            if (!el) return;
            const fp = el._flatpickr;
            const fmt = (dateStr.includes('-') ? "m-d-Y" : (dateStr.includes('/') ? "m/d/Y" : null));
            if (fp) {
                try { fp.setDate(dateStr, true, fmt || fp.config?.dateFormat || "m/d/Y"); }
                catch { fp.setDate(dateStr, true); }
            } else {
                el.value = dateStr;
            }
            el.dispatchEvent(new Event('change', { bubbles: true }));
        };

        const SERVICE_MAP = {
            "1": "Diagnostic Imaging",
            "2": "Home Health",
            "4": "Laboratory",
            "5": "Skilled Nursing"
        };

        const isHeaderRecurringOn = () => {
            const chk = document.getElementById('hdrIsRecurring');
            return !!(chk && chk.checked);
        };

        const applyHeaderRecurring = async (header) => {
            if (!header) return;
            const hdrChk = document.getElementById('hdrIsRecurring');
            const hdrFreq = document.getElementById('hdrRecurringFrequency');
            const hdrEnd = document.getElementById('hdrRecurringEndDate');
            if (!hdrChk) return;

            hdrChk.checked = !!header.IsRecurring;
            hdrChk.dispatchEvent(new Event('change', { bubbles: true }));

            if (hdrChk.checked) {
                if (hdrFreq) {
                    hdrFreq.value = (header.RecurringFrequency ?? '').toString();
                    hdrFreq.dispatchEvent(new Event('change', { bubbles: true }));
                }
                if (hdrEnd && header.RecurringEndDate) {
                    const fp = hdrEnd._flatpickr;
                    const dateStr = header.RecurringEndDate;
                    const fmt = (dateStr.includes('-') ? "m-d-Y" : (dateStr.includes('/') ? "m/d/Y" : null));
                    if (fp) { try { fp.setDate(dateStr, true, fmt || fp.config?.dateFormat || "m/d/Y"); } catch { fp.setDate(dateStr, true); } }
                    else { hdrEnd.value = dateStr; }
                    hdrEnd.dispatchEvent(new Event('change', { bubbles: true }));
                }
            }
        };

        const applyItemRecurring = (i, meta) => {
            const itemChk = byId(`inpIsRecurring_${i}`);
            const itemFreq = byId(`inpRecurringFrequency_${i}`);
            const itemEnd = byId(`inpRecurringEndDate_${i}`);
            if (!itemChk) return;

            const isOn = !!meta?.IsRecurring;
            itemChk.checked = isOn;
            itemChk.dispatchEvent(new Event('change', { bubbles: true }));
            if (typeof OI.toggleRecurring === 'function') OI.toggleRecurring(i, isOn);

            if (isOn) {
                if (itemFreq) {
                    itemFreq.value = (meta.RecurringFrequency ?? '').toString();
                    itemFreq.dispatchEvent(new Event('change', { bubbles: true }));
                }
                if (itemEnd && meta.RecurringEndDate) {
                    const fp = itemEnd._flatpickr;
                    const dateStr = meta.RecurringEndDate;
                    const fmt = (dateStr.includes('-') ? "m-d-Y" : (dateStr.includes('/') ? "m/d/Y" : null));
                    if (fp) { try { fp.setDate(dateStr, true, fmt || fp.config?.dateFormat || "m/d/Y"); } catch { fp.setDate(dateStr, true); } }
                    else { itemEnd.value = dateStr; }
                    itemEnd.dispatchEvent(new Event('change', { bubbles: true }));
                }
            }
        };

        const host = this.qs(this.state.hostSel);
        const addSkeleton = (count = 2) => {
            if (!host) return;
            if (!document.getElementById('ord-skel-style')) {
                const st = document.createElement('style');
                st.id = 'ord-skel-style';
                st.textContent = '@keyframes ordSkPulse{0%{opacity:.6}50%{opacity:1}100%{opacity:.6}}.ord-skel-wrap{margin-top:.25rem}.ord-skel-item{border:1px solid #eee;border-radius:6px;padding:12px;margin-bottom:8px;background:#f7f7f7}.ord-skel-header{height:18px;background:#e3e3e3;border-radius:4px;margin-bottom:10px;animation:ordSkPulse 1.2s ease-in-out infinite}.ord-skel-line{height:12px;background:#e8e8e8;border-radius:4px;margin-bottom:8px;animation:ordSkPulse 1.2s ease-in-out infinite}';
                document.head.appendChild(st);
            }
            const wrap = document.createElement('div');
            wrap.id = 'ord-skel-wrap';
            wrap.className = 'ord-skel-wrap';
            let html = '';
            for (let i = 0; i < count; i++) {
                html += '<div class="ord-skel-item" aria-hidden="true"><div class="ord-skel-header" style="width:40%"></div><div class="ord-skel-body"><div class="ord-skel-line" style="width:90%"></div><div class="ord-skel-line" style="width:70%"></div><div class="ord-skel-line" style="width:60%"></div></div></div>';
            }
            wrap.innerHTML = html;
            //host.appendChild(wrap);
            host.parentNode.insertBefore(wrap, host);

        };
        const removeSkeleton = () => {
            const w = document.getElementById('ord-skel-wrap');
            if (w) w.remove();
        };

        addSkeleton(3);
        try {
            await applyHeaderRecurring(payload?.Header);

            const renderOne = async (meta) => {
                OI.addItem();
                const i = OI.state.idx;
                const svcOrderItmId = `OrderItemId_${i}`;
                setTextValue(svcOrderItmId, meta.OrderItemID ?? '');

                const svcTypeId = `inpServiveTypeNameDrp_${i}`;
                setSelectValue(svcTypeId, meta.ServiceType ?? '');

                const serviceSelId = `inpServiceID_${i}`;
                try { await waitForOptions(serviceSelId, { mustContainValue: meta.ServiceID }); } catch (e) { console.warn(`Service options not found for item ${i}`, e); }
                setSelectValue(serviceSelId, meta.ServiceID ?? '');

                if (meta.CptCodes) {
                    const cptSelId = `inpCptCodes_${i}`;
                    try { await waitForOptions(cptSelId, { mustContainValue: meta.CptCodes }); } catch (e) { }
                    setSelectValue(cptSelId, meta.CptCodes, false);
                }

                if (meta.Priority) setSelectValue(`inpPriority_${i}`, meta.Priority, false);
                if (meta.RequestedServiceDate) setDateSmart(`inpRequestedServiceDate_${i}`, meta.RequestedServiceDate);
                if (meta.RequestedServiceTime) setTextValue(`inpRequestedServiceTime_${i}`, meta.RequestedServiceTime);

                if (!isHeaderRecurringOn()) {
                    if ('IsRecurring' in meta || 'RecurringFrequency' in meta || 'RecurringEndDate' in meta) {
                        applyItemRecurring(i, meta);
                    }
                }

                const svcName = ({
                    "1": "Diagnostic Imaging",
                    "2": "Home Health",
                    "4": "Laboratory",
                    "5": "Skilled Nursing"
                })[String(meta.ServiceType || '')] || '';

                switch (svcName) {
                    case 'Laboratory':
                        const srvLbId = `OrderItemLineId_${i}`;
                        $(`#ord-acc-title-OrdN-${i}`).append(`(#${meta.OrderNumber})`)
                        setTextValue(srvLbId, meta.OrderLabId ?? '');
                        setCheckValue(`inpIsFasting_${i}`, Number(meta.IsFasting) === 1);
                        setTextValue(`inpSymptom1_${i}`, meta.Symptom1);
                        setTextValue(`inpSymptom2_${i}`, meta.Symptom2);
                        setTextValue(`inpPortabilityReason_${i}`, meta.PortabilityReason);
                        setTextValue(`inpAccessionNumber_${i}`, meta.AccessionNumber);
                        setTextValue(`inpLabPrimaryICD_${i}`, meta.PrimaryICD10Code);
                        setTextValue(`inpLabSecondaryICD_${i}`, meta.SecondaryICD10Code);
                        setTextValue(`inpLabTertiaryICD_${i}`, meta.TertiaryICD10Code);
                        break;

                    case 'Diagnostic Imaging':
                        const srvImgId = `OrderItemLineId_${i}`;
                        $(`#ord-acc-title-OrdN-${i}`).append(`(#${meta.OrderNumber})`)
                        setTextValue(srvImgId, meta.OrderImagingId ?? '');
                        setSelectValue(`inpLaterality_${i}`, meta.Laterality ?? '', false);
                        setTextValue(`inpNote_${i}`, meta.Note);
                        setTextValue(`inpImgPrimaryICD_${i}`, meta.PrimaryICD10Code);
                        setTextValue(`inpImgSecondaryICD_${i}`, meta.SecondaryICD10Code);
                        setTextValue(`inpImgTertiaryICD_${i}`, meta.TertiaryICD10Code);
                        break;

                    case 'Skilled Nursing':
                        const srvNurId = `OrderItemLineId_${i}`;
                        $(`#ord-acc-title-OrdN-${i}`).append(`(#${meta.OrderNumber})`)
                        setTextValue(srvNurId, meta.OrderSkillNursingId ?? '');
                        setSelectValue(`inpFrequency_${i}`, meta.Frequency ?? '', false);
                        setTextValue(`inpDuration_${i}`, meta.Duration);
                        setDateSmart(`inpRqstNursStartDate_${i}`, meta.RequestedStartDate);
                        setDateSmart(`inpRqstNursEndDate_${i}`, meta.EndDate);
                        setTextValue(`inpSpecialInstructions_${i}`, meta.SpecialInstructions);
                        setTextValue(`inpSknPrimaryICD_${i}`, meta.PrimaryICD10Code);
                        setTextValue(`inpSknSecondaryICD_${i}`, meta.SecondaryICD10Code);
                        setTextValue(`inpSknTertiaryICD_${i}`, meta.TertiaryICD10Code);
                        break;

                    case 'Home Health':
                        const srvHhId = `OrderItemLineId_${i}`;
                        setTextValue(srvHhId, meta.OrderHomeHealthId ?? '');
                        $(`#ord-acc-title-OrdN-${i}`).append(`(#${meta.OrderNumber})`)
                        setSelectValue(`inpNursingFrequency_${i}`, meta.Frequency ?? '', false);
                        setTextValue(`inpDurationHH_${i}`, meta.Duration);
                        setTextValue(`inpCertificationPeriod_${i}`, meta.CertificationPeriod);
                        setDateSmart(`inpHHRequestedStartDate_${i}`, meta.RequestedStartDate);
                        setDateSmart(`inpHHRequestedEndDate_${i}`, meta.EndDate);
                        setTextValue(`inpSpecialInstructionsHH_${i}`, meta.SpecialInstructions);
                        setTextValue(`inpClinicalReason_${i}`, meta.ClinicalReasonForService);
                        setTextValue(`inpFunctionalLimitations_${i}`, meta.FunctionalLimitations);
                        setTextValue(`inpMentalStatus_${i}`, meta.MentalStatus);
                        setTextValue(`inpPrognosis_${i}`, meta.Prognosis);
                        setTextValue(`inpHHPrimaryICD_${i}`, meta.PrimaryICD10Code);
                        setTextValue(`inpHHSecondaryICD_${i}`, meta.SecondaryICD10Code);
                        setTextValue(`inpHHTertiaryICD_${i}`, meta.TertiaryICD10Code);
                        break;
                }

                const details = byId(`orderDetails_${i}`);
                if (details) OI.reflow(details);
            };

            const toArray = (val) => {
                if (!val) return [];
                return Array.isArray(val) ? val : [val];
            };

            if (Array.isArray(payload?.OrderLabMeta)) {
                for (const lab of payload.OrderLabMeta) { await renderOne(lab); }
            }

            const imagingList = payload?.OrderImagMeta || payload?.OrderImagingMeta || [];
            if (Array.isArray(imagingList)) {
                for (const img of imagingList) { await renderOne(img); }
            }

            for (const n0 of toArray(payload?.OrderNursingMeta)) {
                const n = { ...n0, ServiceType: n0?.ServiceType };
                if (hasMeaningfulData(n)) await renderOne(n);
            }

            for (const h0 of toArray(payload?.OrderHomeHealthMeta)) {
                const h = { ...h0, ServiceType: h0?.ServiceType };
                if (hasMeaningfulData(h)) await renderOne(h);
            }

            if (typeof OI.initHeaderRecurring === 'function') OI.initHeaderRecurring();

            function hasMeaningfulData(obj) {
                if (!obj) return false;
                return Object.values(obj).some(v => v !== null && v !== '' && v !== 0);
            }
        } finally {
            removeSkeleton();
            $('#orderItm').removeClass('d-none')
        }
    }

} 


 

// Auto-init when file is loaded
document.addEventListener("DOMContentLoaded", function () {
    OrderInformation.init();
});
