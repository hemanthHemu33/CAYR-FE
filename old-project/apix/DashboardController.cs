using System.Threading.Tasks;
using System.Web.Http;
using CAYR.core;
using CAYR.meta;
using modxCore.apix;
using modxCore.core;
using modxCore.meta;
 
namespace CAYRWeb.apix {
    public class DashboardController:ModxApixController {
        [HttpPost]
        public async Task<AjaxOutput> GetOrderStatusByVolume(DashboardGraphMeta meta) {
            DashboardCore dashboardCore = new DashboardCore();            
            return await dashboardCore.GetOrderStatusByVolume(meta);
        }
        [HttpPost]
        public async Task<AjaxOutput> GetHighestVolumeByProviderAndPatient(DashboardGraphMeta meta) {
            DashboardCore dashboardCore = new DashboardCore();
            return await dashboardCore.GetHighestVolumeByProviderAndPatient(meta);
        }
        [HttpPost]
        public async Task<AjaxOutput> GetScheduleInfo(DashboardAppoinmentMeta meta) {
            DashboardCore dashboardCore = new DashboardCore();
            return await dashboardCore.GetScheduleInfo(meta);
        }
        #region Admin
        [HttpPost]
        public async Task<AjaxOutput> GetProviderByStatusAndVolume(DashboardGraphMeta meta) {
            DashboardCore dashboardCore = new DashboardCore();
            return await dashboardCore.GetProviderByStatusAndVolume(meta);
        }
        [HttpPost]
        public async Task<AjaxOutput> GetPatientByStatusAndVolume(DashboardGraphMeta meta) {
            DashboardCore dashboardCore = new DashboardCore();
            return await dashboardCore.GetPatientByStatusAndVolume(meta);
        }
        [HttpPost]
        public async Task<AjaxOutput> GetOrderVolumeTrend(DashboardTrendMeta meta) {
            DashboardCore dashboardCore = new DashboardCore();
            return await dashboardCore.GetOrderVolumeTrend(meta);
        }
        [HttpPost]
        public async Task<AjaxOutput> GetOrderVolumeTrendByStatus(DashboardGraphMeta meta) {
            DashboardCore dashboardCore = new DashboardCore();
            return await dashboardCore.GetOrderVolumeTrendByStatus(meta);
        }
        
        [HttpPost]
        public async Task<AjaxOutput> GetOrderStatusByTurnaroundTime(DashboardTurnaroundTrendMeta meta) {
            DashboardCore dashboardCore = new DashboardCore();
            return await dashboardCore.GetOrderStatusByTurnaroundTime(meta);
        }
        #endregion
    }
}