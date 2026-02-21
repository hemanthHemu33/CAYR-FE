using System.Collections.Generic;
using System.Threading.Tasks;
using System.Web.Http;
using CAYR.core;
using CAYR.meta;
using modxCore.apix;
using modxCore.meta;
using modxDataConnect.model.QCGrid;

namespace CAYRWeb.apix {
    public class ManagePhysicianController:ModxApixController {
        [HttpPost]
        public async Task<QCGridMeta> GetPhysiciansData(PhysicianMeta meta) {
            PhysicianCore physicianCore = new PhysicianCore();
            return await physicianCore.GetPhysiciansData(meta);
        }
        [HttpPost]
        public async Task<QCGridMeta> GetPhysicianFacilitysData(PhysicainMapData meta) {
            PhysicianCore physicianCore = new PhysicianCore();
            return await physicianCore.GetPhysicianFacilitysData(meta);
        }
        [HttpPost]
        public async Task<List<FacilityMeta>> GetAllFacility(FacilityMeta facility) {
            PhysicianCore physicianCore = new PhysicianCore();
            return await physicianCore.GetAllFacility(facility);
        }
        [HttpPost]
        public async Task<List<FacilityMeta>> GetAllPhyscianFacility(FacilityMeta facility) {
            PhysicianCore physicianCore = new PhysicianCore();
            return await physicianCore.GetAllPhyscianFacility(facility);
        }

        [HttpPost]
        public async Task<List<FacilityMeta>> GetAllNPI(PhysicianFilterMeta meta) {
            PhysicianCore physicianCore = new PhysicianCore();
            return await physicianCore.GetAllNPI(meta);
        }
        [HttpPost]
        public async Task<AjaxOutput> GeClientFacility(PhysicianFilterMeta meta) {
            PhysicianCore physicianCore = new PhysicianCore();
            return await physicianCore.GeClientFacility(meta);
        }
        //GetPhysicianAssignFacilityList
        [HttpPost]
        public async Task<List<PhysicainMapData>> GetNpiDrDetail(PhysicainMapData mapData) {
            PhysicianCore physicianCore = new PhysicianCore();
            return await physicianCore.GetNpiDrDetail(mapData);
        }

        [HttpPost]
        public AjaxOutput SavePhysicianMaster(PhysicianMeta meta) {
            AjaxOutput ajaxOutput = new AjaxOutput();
            PhysicianCore physicianCore = new PhysicianCore();
            ajaxOutput = physicianCore.SavePhysicianMaster(meta);
            return ajaxOutput;

        }
        //
        [HttpPost]
        public AjaxOutput SavePhysicianToPhysicianFacility(PhysicianMeta meta) {
            AjaxOutput ajaxOutput = new AjaxOutput();
            PhysicianCore physicianCore = new PhysicianCore();
            ajaxOutput = physicianCore.SavePhysicianToPhysicianFacility(meta);
            return ajaxOutput;

        }

        [HttpPost]
        public AjaxOutput DeletePhysician(PhysicianMeta meta) {
            AjaxOutput ajaxOutput = new AjaxOutput();
            PhysicianCore physicianCore = new PhysicianCore();
            physicianCore.DeletePhysician(meta);
            ajaxOutput = physicianCore.AjxOut;
            return ajaxOutput;
        }
        [HttpPost]
        public AjaxOutput SavePhysicianFacility(List<PhysicainMapData> meta) {
            AjaxOutput ajaxOutput = new AjaxOutput();
            PhysicianCore physicianCore = new PhysicianCore();
            ajaxOutput = physicianCore.SavePhysicianFacility(meta);
            return ajaxOutput;

        }
        //[HttpPost]
        //public AjaxOutput DeleteFacilityPhysician(PhysicainMapData meta) {
        //    AjaxOutput ajaxOutput = new AjaxOutput();
        //    PhysicianCore physicianCore = new PhysicianCore();
        //    physicianCore.DeleteFacilityPhysician(meta);
        //    ajaxOutput = physicianCore.AjxOut;
        //    return ajaxOutput;
        //}

        [HttpPost]
        public async Task<AjaxOutput> GetPhysicianAdditionalInfo(PhysicainMapData meta) {
            PhysicianCore physicianCore = new PhysicianCore();
            return await physicianCore.GetPhysicianAdditionalInfo(meta);
        }
        [HttpPost]
        public List<string> GetFacilityList(FacilityMeta meta) {
            var payorList = new List<string>();
            PhysicianCore physicianCore = new PhysicianCore();
            payorList = physicianCore.GetFacilityList(meta);
            return payorList;

        }
    }
}