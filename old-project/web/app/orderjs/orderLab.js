"use strict";
 

var _GlobalOrderLab = {
    url: '../../../apix/OrdersEntery/',
 
};
 
var OrderLab = {
    Init: function () {
        $('#FastFlagChkBox').removeClass('d-none')
        $('#Service_Lab').removeClass('d-none')

    },

    SaveOrderForLab: async function (isSubmit, currentIndx) {
        try {

            if (currentIndx == null) {
                console.warn("No currentIndx found for OrderItemMeta.");
                return;
            }

            const $id = (base) => $('#' + base + currentIndx);
            const val = (base) => $id(base).val();
            const txt = (base) => {
                const $el = $id(base);
                if (!$el.length) return null;
                if ($el.is('select')) {
                    const t = $el.find('option:selected').text();
                    return t ? t.trim() : null;
                }
                const t = $el.text();
                return t ? t.trim() : null;
            };
            const toInt = (v) => {
                const n = parseInt(v, 10);
                return Number.isNaN(n) ? null : n;
            };

            let OrderItemMeta = {
                OrderID: _GlobalOrder.OrderId,
                ServiceType: toInt(val('inpServiveTypeNameDrp_')),    
                ServiceID: toInt(val('inpServiceID_')),
                ServiceTypeValue: txt('inpServiveTypeNameDrp_'),
                Priority: val('inpPriority_') ?? null,
                IsRecurring: $id('inpIsRecurring_').is(':checked'),
                RecurringFrequency: val('inpRecurringFrequency_') ?? null,
                RecurringEndDate: val('inpRecurringEndDate_') ?? null,
                RequestedServiceDate: val('inpRequestedServiceDate_') ?? null,
                RequestedServiceTime: val('inpRequestedServiceTime_') ?? null,
                PrimaryOrderNumber: $('#orderNumber').text().trim(),

                // Nested: LAB
                OrderLabMeta: {
                    CptCodes: val('inpCptCodes_') ?? null,
                    IsFasting: $id('inpIsFasting_').is(':checked') ? 1 : 0,
                    Symptom1: val('inpSymptom1_').trim() || null,
                    Symptom2: val('inpSymptom2_').trim() || null,
                    PortabilityReason: val('inpPortabilityReason_').trim() || null,
                    AccessionNumber: val('inpAccessionNumber_').trim() || null,
                    PrimaryICD10Code: val('inpLabPrimaryICD_').trim() || null, 
                    SecondaryICD10Code: val('inpLabSecondaryICD_').trim() || null,
                    TertiaryICD10Code: val('inpLabTertiaryICD_').trim() || null
                },
            };
            //validation
            var requiredFields = ['ServiceType', 'ServiceID', 'Priority'];
            var validation = Core.validateInputs(requiredFields, OrderItemMeta);
            var lineItemrequiredFields = ['CptCodes', 'AccessionNumber','PrimaryICD10Code'];
            var lineItemvalidation = Core.validateInputs(lineItemrequiredFields, OrderItemMeta.OrderLabMeta);
            if (validation.isValid == false) {
                _$modxAppCore.showErrorMessage(`${validation.error}`, 'error', `orderErrorMsg_${currentIndx}`);
                $('#inp' + validation['missingField'] + '_' + currentIndx).focus();
                return;
            }

            else if (lineItemvalidation.isValid == false) {
                _$modxAppCore.showErrorMessage(`${lineItemvalidation.error}`, 'error', `orderErrorMsg_${currentIndx}`);
                $('#inp' + validation['missingField'] + '_' + currentIndx).focus();
                return;
            }
            
            _$modxAppProgressBar.show();
            OrderItemMeta.OrderItemID = $(`#OrderItemId_${currentIndx}`).val()
            OrderItemMeta.OrderLabMeta.OrderLabId = $(`#OrderItemLineId_${currentIndx}`).val()
            var functionName = "SaveOrderItemLevelInformation";
            var url = _GlobalOrderLab.url + functionName;
            var ajaxOut = await __PromisAsyncPostBack(OrderItemMeta, url);

            _$modxAppProgressBar.hide();

            if (ajaxOut.Success) {
                $(`#OrderItemId_${currentIndx}`).val(ajaxOut.ResultData)
                const headerEl = $(`#ord-acc-title-OrdN-${currentIndx}`);

                //make it empty
                headerEl.empty();

                //Set the order header
                headerEl.text(`(${OrderItemMeta.PrimaryOrderNumber}-${ajaxOut.ResultData})`);
                $(`#OrderItemLineId_${currentIndx}`).val(ajaxOut.CommandArgs.ResultData)
                _$modxAppCore.showErrorMessage(ajaxOut.Message, 'success', `orderErrorMsg_${currentIndx}`);
                return ajaxOut;
            } else {
                _$modxAppCore.showErrorMessage(ajaxOut.Message, 'error', `orderErrorMsg_${currentIndx}`);
                return false;
            } 
            
    
        } catch (error) {
            _$modxAppProgressBar.hide();
          //  _$modxAppCore.showErrorMessage("An unexpected error occurred.", 'error', `orderErrorMsg_${currentIndx}`);
            return false;
        }
    },

 
    handleEvent: function (ev) {
        var target = ev.target;
        var evCase = target.getAttribute('data-ev');

        switch (evCase) {

            
        }
    }
};
