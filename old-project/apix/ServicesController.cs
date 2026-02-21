using System.Collections.Generic;
using System.Threading.Tasks;
using System.Web.Http;
using CAYR.core;
using CAYR.meta;
using modxCore.apix;
using modxCore.meta;
using modxDataConnect.model.QCGrid;

namespace CAYRWeb.apix {
    public class ServicesController:ModxApixController {
        [HttpPost]
        public async Task<QCGridMeta> GetFacilites(FacilitesMeta meta) {
            ServiceCore serviceCore = new ServiceCore();
            return await serviceCore.GetFacilites(meta);
        }
        [HttpPost]
        public async Task<QCGridMeta> GetAllServiceData(ServiceMeta meta) {
            ServiceCore serviceCore = new ServiceCore();
            return await serviceCore.GetAllServiceData(meta);
        }
        [HttpPost]
        public AjaxOutput SaveServiceType(ServiceMeta meta) {
            AjaxOutput ajaxOutput = new AjaxOutput();
            ServiceCore serviceCore = new ServiceCore();
            ajaxOutput = serviceCore.SaveServiceType(meta);
            return ajaxOutput;

        }
        [HttpPost]
        public AjaxOutput DeleteServiceType(ServiceMeta meta) {
            AjaxOutput ajaxOutput = new AjaxOutput();
            ServiceCore serviceCore = new ServiceCore();
            serviceCore.DeleteServiceType(meta);
            ajaxOutput = serviceCore.AjxOut;
            return ajaxOutput;
        }

        //==============================Service Detials=======================================================================//
        [HttpPost]
        public AjaxOutput SaveServiceDetails(ServicesDetailsMeta meta) {
            AjaxOutput ajaxOutput = new AjaxOutput();
            ServiceCore serviceCore = new ServiceCore();
            ajaxOutput = serviceCore.SaveServiceDetails(meta);
            return ajaxOutput;

        }
        [HttpPost]
        public async Task<QCGridMeta> GetAllServiceDetailsData(ServicesDetailsMeta meta) {
            ServiceCore serviceCore = new ServiceCore();
            return await serviceCore.GetAllServiceDetailsData(meta);
        }
        [HttpPost]
        public AjaxOutput DeleteService(ServicesDetailsMeta meta) {
            AjaxOutput ajaxOutput = new AjaxOutput();
            ServiceCore serviceCore = new ServiceCore();
            serviceCore.DeleteService(meta);
            ajaxOutput = serviceCore.AjxOut;
            return ajaxOutput;
        }

        //============================== Facility Service =======================================================================//

        [HttpPost]
        public async Task<QCGridMeta> GetFacilityServiceData(ServicesDetailsMeta meta) {
            ServiceCore serviceCore = new ServiceCore();
            return await serviceCore.GetFacilityServiceData(meta);
        }

        [HttpPost]
        public async Task<List<ServicecType>> GetServiceType(ServicecType meta) {
            ServiceCore serviceCore = new ServiceCore();
            return await serviceCore.GetServiceType(meta);
        }
        [HttpPost]
        public async Task<List<ServicecType>> GetServiceDetails(ServicecType meta) {
            ServiceCore serviceCore = new ServiceCore();
            return await serviceCore.GetServiceDetails(meta);
        }
        [HttpPost]
        public async Task<List<string>> GetServiceListDetails(ServicecType meta) {
            ServiceCore serviceCore = new ServiceCore();
            return await serviceCore.GetServiceListDetails(meta);
        }

        [HttpPost]
        public AjaxOutput SaveFacilityService(FacilityServiceMeta meta) {
            AjaxOutput ajaxOutput = new AjaxOutput();
            ServiceCore serviceCore = new ServiceCore();
            ajaxOutput = serviceCore.SaveFacilityService(meta);
            return ajaxOutput;

        }
        [HttpPost]
        public AjaxOutput DeleteFacilityService(FacilityServiceMeta meta) {
            AjaxOutput ajaxOutput = new AjaxOutput();
            ServiceCore serviceCore = new ServiceCore();
            serviceCore.DeleteFacilityService(meta);
            ajaxOutput = serviceCore.AjxOut;
            return ajaxOutput;
        }

        //============================== Facility Service Schedlue =======================================================================//
        [HttpPost]
        public AjaxOutput SaveFacilityServiceSchedule(ServiceScheduleMeta meta) {
            AjaxOutput ajaxOutput = new AjaxOutput();
            ServiceCore serviceCore = new ServiceCore();
            ajaxOutput = serviceCore.SaveFacilityServiceSchedule(meta);
            return ajaxOutput;

        }
        [HttpPost]
        public async Task<QCGridMeta> GetFacilityServiceSchedule(ServicesDetailsMeta meta) {
            ServiceCore serviceCore = new ServiceCore();
            return await serviceCore.GetFacilityServiceSchedule(meta);
        }
        [HttpPost]
        public AjaxOutput DeleteFacilityServiceAvialblity(ServiceScheduleMeta meta) {
            AjaxOutput ajaxOutput = new AjaxOutput();
            ServiceCore serviceCore = new ServiceCore();
            serviceCore.DeleteFacilityServiceAvialblity(meta);
            ajaxOutput = serviceCore.AjxOut;
            return ajaxOutput;
        }
        //============================== CPT Service =======================================================================//
        [HttpPost]
        public async Task<QCGridMeta> GetAllCptService(CptServiceInpMeta meta) {
            ServiceCore serviceCore = new ServiceCore();
            return await serviceCore.GetAllCptService(meta);
        }

        [HttpPost]
        public AjaxOutput SaveCptSerivceMapping(CptServiceMapMeta meta) {
            AjaxOutput ajaxOutput = new AjaxOutput();
            ServiceCore serviceCore = new ServiceCore();
            ajaxOutput = serviceCore.SaveCptSerivceMapping(meta);
            return ajaxOutput;

        }
    }
}