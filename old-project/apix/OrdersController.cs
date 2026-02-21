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
    public class OrdersController:ModxApixController {
        [HttpPost]
        public async Task<QCGridMeta> GetOrdersList(OrderHeaderInforMeta meta) {
            OrdersCore ordersCore = new OrdersCore();   
            return await ordersCore.GetOrdersList(meta);
        }
        [HttpPost]
         public async Task<AjaxOutput> SaveScheduleInformation(OrderScheduleMeta meta) {
            AjaxOutput ajaxOutput = new AjaxOutput();
            OrdersCore ordersCore = new OrdersCore();
            ajaxOutput = await ordersCore.SaveScheduleInformation(meta);
            return ajaxOutput;

        }

        [HttpPost]
        public async Task<AjaxOutput> GetOrderCancelStatus(OrderCancelStatusMeta meta) {
            AjaxOutput ajaxOutput = new AjaxOutput();
            OrdersCore ordersCore = new OrdersCore();
            ajaxOutput = await ordersCore.GetOrderCancelStatus(meta);
            return ajaxOutput;

        }

    }
}