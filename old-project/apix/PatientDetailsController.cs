using CAYR.core;
using CAYR.meta;
using modxCore.apix;
using modxCore.meta;
using modxDataConnect.model.QCGrid;
using System.Collections.Generic;
using System.Threading.Tasks;
using System.Web.Http;
using static CAYR.meta.OrdersMeta;

namespace CAYRWeb.apix {
    public class PatientDetailsController:ModxApixController {
        [HttpPost]
        public async Task<QCGridMeta> GetPatientDetailsData(PatientDetailsMeta meta) {
            PatientDetailsCore patientDetailsCore = new PatientDetailsCore();   
            return await patientDetailsCore.GetPatientDetailsData(meta);
        }
        [HttpPost]
        public async Task<QCGridMeta> GetAllPatientProcedures(PatientProceduresMeta meta) {
            PatientDetailsCore patientDetailsCore = new PatientDetailsCore();
            return await patientDetailsCore.GetAllPatientProcedures(meta);
        }
        [HttpPost]
        public async Task<QCGridMeta> GetPatientDiagnosis(PatientDiagnosisMeta meta) {
            PatientDetailsCore patientDetailsCore = new PatientDetailsCore();
            return await patientDetailsCore.GetPatientDiagnosis(meta);
        }
        [HttpPost]
        public async Task<QCGridMeta> GetPatientInsurance(PatientInsuranceMeta meta) {
            PatientDetailsCore patientDetailsCore = new PatientDetailsCore();
            return await patientDetailsCore.GetPatientInsurance(meta);
        }
        [HttpPost]
        public async Task<QCGridMeta> GetPatientDemographics(PatientDemographicsMeta meta) {
            PatientDetailsCore patientDetailsCore = new PatientDetailsCore();
            return await patientDetailsCore.GetPatientDemographics(meta);
        }
        [HttpPost]
        public async Task<QCGridMeta> GetPatientDemographicsHistory(PatientDemographicsHistoryMeta meta) {
            PatientDetailsCore patientDetailsCore = new PatientDetailsCore();
            return await patientDetailsCore.GetPatientDemographicsHistory(meta);
        }
        [HttpPost]
        public async Task<QCGridMeta> GetPatientInsuranceHistory(PatientInsuraneHistoryMeta meta) {
            PatientDetailsCore patientDetailsCore = new PatientDetailsCore();
            return await patientDetailsCore.GetPatientInsuranceHistory(meta);
        }
        [HttpPost]
        public AjaxOutput SavePatientDetails(PatientDemographicsMeta meta) {
            AjaxOutput ajaxOutput = new AjaxOutput();
            PatientDetailsCore patientDetailsCore = new PatientDetailsCore();
            ajaxOutput = patientDetailsCore.SavePatientDetails(meta);
            if (ajaxOutput.Success && meta.InputSource == "OrderEntery") {
                OrderHeaderMeta headerMeta = new OrderHeaderMeta();
                OrdersEnteryCore ordersCore = new OrdersEnteryCore();
                headerMeta.ClientID = meta.ClientID;
                headerMeta.FacilityID = meta.FacilityID;
                headerMeta.PatientID = (int)ajaxOutput.CommandArgs;
                headerMeta.CurrentStep = meta.CurrentStep;
                headerMeta.OrderID = meta.OrderID;
                headerMeta.ServiceLocationName = meta.ServiceLocationName;
                headerMeta.ServiceLocationType = meta.ServiceLocationType;
                if (headerMeta.OrderID == 0) {
                    ajaxOutput.ResultData = ordersCore.GenrateOrderHeaderInformation(headerMeta);
                }
                else {
                    ajaxOutput.ResultData = ordersCore.UpdateHeaderInformation(headerMeta);
                }
               
            }
            return ajaxOutput;
        }
        [HttpPost]
        public AjaxOutput SavePatientInsurance(PatientInsuranceMeta meta) {
            AjaxOutput ajaxOutput = new AjaxOutput();
            PatientDetailsCore patientDetailsCore = new PatientDetailsCore();
            ajaxOutput = patientDetailsCore.SavePatientInsurance(meta);
            if (ajaxOutput.Success && meta.InputSource == "OrderEntery") {
                OrderHeaderMeta headerMeta = new OrderHeaderMeta();
                OrdersEnteryCore ordersCore = new OrdersEnteryCore();
                headerMeta.InsuranceID = meta.PatientInsuranceID;
                headerMeta.OrderID = meta.OrderID;
                headerMeta.CurrentStep = meta.CurrentStep;
                ajaxOutput.CommandArgs = ordersCore.GenrateOrderHeaderInformation(headerMeta);
            }
            return ajaxOutput;
        }
       // [HttpPost]

    }
}