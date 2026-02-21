
using CAYR.core;
using CAYR.dal;
using CAYR.meta;
using modxCore.apix;
using modxCore.meta;
using modxDataConnect.model.QCGrid;
using System.Threading.Tasks;
using System.Web.Http;
using static CAYR.meta.OrdersMeta;


namespace CAYRWeb.apix {
    public class WorkQueueController:ModxApixController {
        [HttpPost]
        public async Task<AjaxOutput> GetWorkQueueList(WorkQueueMeta meta) {
            WorkQueueCore workQueueCore = new WorkQueueCore();
            return await workQueueCore.GetWorkQueueList(meta);
        }

        [HttpPost]
        public async Task<AjaxOutput>SaveWrokQueue(WorkQueueMeta meta) {
            WorkQueueCore workQueueCore = new WorkQueueCore();
            return await workQueueCore.SaveWorkQueue(meta);
        }
        
      [HttpPost]
         public async Task<AjaxOutput> GetWorkQueueDetail(WorkQueueMeta meta) {
            WorkQueueCore workQueueCore = new WorkQueueCore();
            return await workQueueCore.GetWorkQueueDetail(meta.WorkQueueID);
        }
        [HttpPost]
        public async Task<AjaxOutput> GetWorkFlowStatusList() {
            WorkQueueCore workQueueCore = new WorkQueueCore();
            return await workQueueCore.GetWorkflowStateList();
        }
        [HttpPost] 
         public async Task<AjaxOutput> GetWorkFlowDetails(WorkflowStateMeta meta) {
            WorkQueueCore workQueueCore = new WorkQueueCore();
            return await workQueueCore.GetWorkFlowDetails(meta.WorkflowStateID);
        }
        [HttpPost]
        public async Task<AjaxOutput> SaveWorkflowState(WorkflowStateMeta meta) {
            WorkQueueCore workQueueCore = new WorkQueueCore();
            return await workQueueCore.SaveWorkflowState(meta);
  
        }

        [HttpPost]
        public async Task<AjaxOutput> GetActivityList(StatusActivityMeta meta) {
            WorkQueueCore core = new WorkQueueCore();
            return await core.GetActivityList(meta);
        }

        [HttpPost]
        public async Task<AjaxOutput> GetStatusActivityDetail(StatusActivityMeta meta) {
            WorkQueueCore core = new WorkQueueCore();
            return await core.GetStatusActivityDetailAsync(meta);
        }

        [HttpPost]
        public async Task<AjaxOutput> SaveStatusActivity(StatusActivityMeta meta) {
            WorkQueueCore core = new WorkQueueCore();
            return await core.SaveStatusActivityAsync(meta);
        }

        [HttpPost]
        public async Task<QCGridMeta> GetWorkQuesOrdersList(OrderHeaderInforMeta meta) {
            WorkQueueCore core = new WorkQueueCore();
            return await core.GetOrdersList(meta);
        }

        [HttpPost]
        public async Task<AjaxOutput> SaveOrderWorkFlow(OrderWorkFlowMeta meta) {
            WorkQueueCore core = new WorkQueueCore();
            return await core.SaveOrderWorkFlow(meta);
        }

        [HttpPost]
        public async Task<AjaxOutput> SaveActivityNote(OrderStatusActivityNoteMeta meta) {
            WorkQueueCore core = new WorkQueueCore();
            return await core.SaveActivityNoteAsync(meta);
        }
        [HttpPost]
        public async Task<AjaxOutput> GetActivityNotes(OrderStatusActivityNoteMeta meta) {
            WorkQueueCore core = new WorkQueueCore();
            return await core.GetActivityNotes(meta);
        }
        [HttpPost]
        public async Task<AjaxOutput> saveActivityStatus(OrderActivityStatusMeta meta) {
            WorkQueueCore core = new WorkQueueCore();
            return await core.SaveActivityStatus(meta);
        }
        [HttpPost]
        public async Task<AjaxOutput> DeleteStatusActivity(StatusActivityMeta meta) {
            WorkQueueCore core = new WorkQueueCore();
            return await core.DeleteStatusActivity(meta);
        }
    }
}