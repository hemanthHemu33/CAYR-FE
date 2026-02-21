using CAYR.core;
using CAYR.meta;
using modxCore.apix;
using modxCore.core;
using modxCore.meta;
using System;
using System.Threading.Tasks;
using System.Web.Http;
using static CAYR.meta.OrdersMeta;

namespace CAYRWeb.apix {
    public class DownloadController:ModxApixController {
        [HttpPost]
        public async Task<AjaxOutput> DownloadOrders(OrderHeaderInforMeta meta) {
            DownloadCore downloadCore = new DownloadCore();
            return await downloadCore.DownloadOrders(meta);

        }
        [HttpPost]
        public AjaxOutput GetDownloadStatus() {
            DownloadCore dc = new DownloadCore();
            AjaxOutput ajaxOutput = new AjaxOutput();
            ajaxOutput = dc.GetDownloadStatus();
            return ajaxOutput;
        }
        [HttpPost]
        public AjaxOutput KillThread(DownLoadMeta meta) {
            string thID = meta.ThreadID;
            DownloadCore dc = new DownloadCore();
            AjaxOutput ajaxOutput = new AjaxOutput();
            ajaxOutput = dc.KillThread(meta);
            return ajaxOutput;
        }
    }
}