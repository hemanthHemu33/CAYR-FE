"use strict";
var _GlobalHomeHealth = {
    url: '../../../apix/OrdersEntery/',

};

var OrderHomeHealth = {
    Init: function () {
        $('#Service_HomeHealth').removeClass('d-none')

    },
    SaveOrderForHomeHealth: async function (isSubmit, currentIndx) {
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
                if (v == null || v === '') return null;
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
                // Order Home Health Meta
                OrderHomeHealthMeta: {
                    CptCodes: val('inpCptCodes_') ?? null,
                    Frequency: val('inpNursingFrequency_') ?? null,
                    Duration: val('inpDurationHH_') ?? null,
                    CertificationPeriod: val('inpCertificationPeriod_') ?? null,
                    RequestedStartDate: val('inpHHRequestedStartDate_') ?? null,
                    EndDate: val('inpHHRequestedEndDate_') ?? null,
                    SpecialInstructions: val('inpSpecialInstructionsHH_') ?? null,
                    ClinicalReason: val('inpClinicalReason_') ?? null,
                    FunctionalLimitations: val('inpFunctionalLimitations_') ?? null,
                    MentalStatus: val('inpMentalStatus_') ?? null,
                    Prognosis: val('inpPrognosis_') ?? null,
                    PrimaryICD10Code: val('inpHHPrimaryICD_')  || null,
                    SecondaryICD10Code: val('inpHHSecondaryICD_')  || null,
                    TertiaryICD10Code: val('inpHHTertiaryICD_')  || null
                },
            }
            //validation 
            var requiredFields = ['ServiceType', 'ServiceID', 'Priority'];
            var validation = Core.validateInputs(requiredFields, OrderItemMeta);
            var lineItemrequiredFields = ['CptCodes', 'Frequency', 'Duration', 'CertificationPeriod', 'RequestedStartDate', 'EndDate', 'SpecialInstructions', 'ClinicalReason', 'FunctionalLimitations', 'MentalStatus', 'Prognosis', 'PrimaryICD10Code','PrimaryICD10Code'];
            var lineItemvalidation = Core.validateInputs(lineItemrequiredFields, OrderItemMeta.OrderHomeHealthMeta);
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
            OrderItemMeta.OrderHomeHealthMeta.OrderHomeHealthId = $(`#OrderItemLineId_${currentIndx}`).val()
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



        }
        catch (error) {
            _$modxAppProgressBar.hide();
           // _$modxAppCore.showErrorMessage("An unexpected error occurred.", 'error', `orderErrorMsg_${currentIndx}`);
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
