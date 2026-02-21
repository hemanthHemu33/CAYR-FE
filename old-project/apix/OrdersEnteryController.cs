using CAYR.core;
using CAYR.meta;
using CAYRCommonUtility;
using modxCore.apix;
using modxCore.core;
using modxCore.meta;
using modxDataConnect.model.QCGrid;
using Newtonsoft.Json;
using System;
using System.Collections.Generic;
using System.Configuration;
using System.IO;
using System.Linq;
using System.Net;
using System.Net.Http;
using System.Net.Http.Headers;
using System.Threading.Tasks;
using System.Web;
using System.Web.Hosting;
using System.Web.Http;
using static CAYR.meta.OrdersMeta;

namespace CAYRWeb.apix {
    public class OrdersEnteryController:ModxApixController {
        [HttpPost]
        public async Task<AjaxOutput> GetFacilityNpi(NPIMeta meta) {
            OrdersEnteryCore ordersCore = new OrdersEnteryCore();
            return await ordersCore.GetFacilityNpi(meta);
        }
        [HttpPost]

        public async Task<AjaxOutput> GetFacilityInformation(NPIMeta meta) {
            OrdersEnteryCore ordersCore = new OrdersEnteryCore();
            return await ordersCore.GetFacilityInformation(meta);
        }
 
 
        [HttpPost]
        public async Task<AjaxOutput> SaveUnVarifiedPhyscian(NPIMeta meta) {
            OrdersEnteryCore ordersCore = new OrdersEnteryCore();
            return await ordersCore.SaveUnVarifiedPhyscian(meta);
        }

        [HttpPost]
        public AjaxOutput GetPhysicianInfo(PhysicianInfoMeta meta) {
            AjaxOutput ajaxOutput = new AjaxOutput();
            OrdersEnteryCore ordersCore = new OrdersEnteryCore();
            ajaxOutput = ordersCore.GetPhysicianInfo(meta);
            return ajaxOutput;

        }
        [HttpPost]
        public async Task<List<CptCodeMeta>> GetLabCptCodes(CptCodeMeta meta) {
            OrdersEnteryCore ordersCore = new OrdersEnteryCore();
            return await ordersCore.GetLabCptCodes(meta);
        }

        #region PatientRelated
        [HttpPost]
        public async Task<AjaxOutput> GetPatientInformation(PatientFilterMeta meta) {
            AjaxOutput ajaxOutput = new AjaxOutput();
            OrdersEnteryCore ordersCore = new OrdersEnteryCore();
            ajaxOutput = await ordersCore.GetPatientInformation(meta);
            return ajaxOutput;

        }
        [HttpPost]
        public async Task<QCGridMeta> GetPatinentDetails(PatientFilterMeta meta) {
            OrdersEnteryCore ordersCore = new OrdersEnteryCore();
            return await ordersCore.GetPatinentDetails(meta);
        }
        #endregion

        #region OrderEntery
        [HttpPost]
        public async Task<AjaxOutput> GenrateOrderHeaderInformation(OrderHeaderMeta meta) {
            AjaxOutput ajaxOutput = new AjaxOutput();
            OrdersEnteryCore ordersCore = new OrdersEnteryCore();
            ajaxOutput = await ordersCore.GenrateOrderHeaderInformation(meta);
            return ajaxOutput;

        }
        [HttpPost]
        public async Task<AjaxOutput> SaveServiceLocationInformation(OrderHeaderMeta meta) {
            AjaxOutput ajaxOutput = new AjaxOutput();
            OrdersEnteryCore ordersCore = new OrdersEnteryCore();
            ajaxOutput = await ordersCore.SaveServiceLocationInformation(meta);
            return ajaxOutput;

        }

        [HttpPost]
        public async Task<AjaxOutput> SaveOrderItemLevelInformation(OrderItemMeta meta) {
            AjaxOutput ajaxOutput = new AjaxOutput();
            OrdersEnteryCore ordersCore = new OrdersEnteryCore();
            ajaxOutput = await ordersCore.SaveOrderItemLevelInformation(meta);
            return ajaxOutput;

        }
        [HttpPost]
        public async Task<AjaxOutput> GetOrderHeaderInformation(OrderHeaderInforMeta meta) {
            AjaxOutput ajaxOutput = new AjaxOutput();
            OrdersEnteryCore ordersCore = new OrdersEnteryCore();
            ajaxOutput = await ordersCore.GetOrderHeaderInformation(meta);
            return ajaxOutput;

        }
        [HttpPost]
        public async Task<AjaxOutput> GetOrderPreviewInforamtion(OrderHeaderInforMeta meta) {

            AjaxOutput ajaxOutput = new AjaxOutput();
            OrdersEnteryCore ordersCore = new OrdersEnteryCore();
            if (meta.RecurringFrequency != "" && meta.RecurringEndDate != "") {
                ajaxOutput = await ordersCore.UpdateOrderHeaderReccuring(meta);
            }
            ajaxOutput = await ordersCore.GetOrderPreviewInforamtion(meta.OrderId);
            return ajaxOutput;

        }

        [HttpPost]
        public async Task<AjaxOutput> IsReccuringOrderInfoPresent(OrderHeaderInforMeta meta) {
            AjaxOutput ajaxOutput = new AjaxOutput();
            OrdersEnteryCore ordersCore = new OrdersEnteryCore();
            ajaxOutput = await ordersCore.IsReccuringOrderInfoPresent(meta.OrderId);
            return ajaxOutput;

        }
        [HttpPost]
        public async Task<AjaxOutput> GetDraftOrderInforamtion(OrderHeaderInforMeta meta) {

            AjaxOutput ajaxOutput = new AjaxOutput();
            OrdersEnteryCore ordersCore = new OrdersEnteryCore();
            ajaxOutput = await ordersCore.GetDraftOrderInforamtion(meta);
            return ajaxOutput;

        }

        [HttpPost]
        public async Task<AjaxOutput> DeleteOrderItem(OrderItemMeta meta) {
            AjaxOutput ajaxOutput = new AjaxOutput();
            OrdersEnteryCore ordersCore = new OrdersEnteryCore();
            ajaxOutput = await ordersCore.DeleteOrderItem(meta);
            return ajaxOutput;
        }

        [HttpPost]
        public async Task<AjaxOutput> UpdateOrderStatus(OrderHeaderMeta meta) {
            AjaxOutput ajaxOutput = new AjaxOutput();
            OrdersEnteryCore ordersCore = new OrdersEnteryCore();
            ajaxOutput = await ordersCore.UpdateOrderStatus(meta);
            return ajaxOutput;

        }
        [HttpPost]
        public async Task<AjaxOutput> GetOrderDraftHeaderInfromation(OrderHeaderMeta meta) {
            AjaxOutput ajaxOutput = new AjaxOutput();
            OrdersEnteryCore ordersCore = new OrdersEnteryCore();
            ajaxOutput = await ordersCore.GetOrderDraftHeaderInfromation(meta);
            return ajaxOutput;
        }

        [HttpPost]
        public async Task<AjaxOutput> SaveOrderCancelStatus(OrderCancelStatusMeta meta) {
            AjaxOutput ajaxOutput = new AjaxOutput();
            OrdersEnteryCore ordersCore = new OrdersEnteryCore();
            ajaxOutput = await ordersCore.SaveOrderCancelStatus(meta);
            return ajaxOutput;

        }
        //This fucntion check is this order is elligible for cancellation or not
        [HttpPost]
        public async Task<AjaxOutput> CheckOrderCancelEligiblity(OrderCancelStatusMeta meta) {
            AjaxOutput ajaxOutput = new AjaxOutput();
            OrdersEnteryCore ordersCore = new OrdersEnteryCore();
            ajaxOutput = await ordersCore.CheckOrderCancelEligiblity(meta);
            return ajaxOutput;

        }
        #endregion

        #region OrderDocument
        public AjaxOutput UploadFile() {
            AjaxOutput ajaxOutput = new AjaxOutput();

            //check if user is in session
            ajaxOutput = CAYRGlobal.CheckUserSession();
            if (ajaxOutput.Success == false) {
                return ajaxOutput;
            }

            try {
                OrderDocumentMeta meta = new OrderDocumentMeta();

                var currentHttpContext = HttpContext.Current;

                string target = currentHttpContext.Request.Form["target"].ToString();
                ajaxOutput = RouteFile(target, currentHttpContext);


            }
            catch (Exception ex) {
                AppLog.WriteLog("Error", "FileUpload", ex, "");
                ajaxOutput.Success = false;
                ajaxOutput.Message = ex.Message.ToString();
                return ajaxOutput;

            }




            return ajaxOutput;
        }

        public AjaxOutput RouteFile(string target, HttpContext currentHttpContext) {
            AjaxOutput ajaxOutput = new AjaxOutput();
            ajaxOutput = uploadDocument(currentHttpContext);
            return ajaxOutput;
        }

        private AjaxOutput uploadDocument(HttpContext currentHttpContext) {
            AjaxOutput ajaxOutput = new AjaxOutput();

            try {

                OrdersEnteryCore ordersEnteryCore = new OrdersEnteryCore();
                OrderDocumentMeta docMeta = new OrderDocumentMeta();


                string allInfo = currentHttpContext.Request.Form["OrderDocument-metaData"].ToString();

                // Deserialize to a dynamic object or your model
                var dto = JsonConvert.DeserializeObject<OrderDocumentMeta>(allInfo);

                // Build a string array with just the values you want
                string[] info = new[]
                {
                    dto.OrderId.ToString(),
                    dto.DocumentName ?? string.Empty,
                    dto.DocumentTag ?? string.Empty,
                    dto.DocumentType ?? string.Empty,
                    dto.CurrentStep ?? string.Empty,
                };

                docMeta.OrderId = Convert.ToInt32(info[0]);
                docMeta.DocumentName = info[1];
                docMeta.DocumentTag = info[2];
                docMeta.DocumentType = info[3];
                docMeta.CurrentStep = info[4];

                //bool isExists = ordersEnteryCore.IsOrderDocumnetExists(docMeta);

                //if (isExists) {
                //    ajaxOutput.Success = false;
                //    ajaxOutput.Message = "Document title is already exists for this order.";
                //    return ajaxOutput;
                //}

                // Check for any uploaded file  
                if (currentHttpContext.Request.Files.Count > 0) {
                    HttpPostedFile httpPostedFile = currentHttpContext.Request.Files[0];
                    if (httpPostedFile != null) {
                        string providedFileName = httpPostedFile.FileName;


                        docMeta.OriginalDocumentName = providedFileName;


                        docMeta.FileType = Path.GetExtension(providedFileName).ToLower().TrimStart('.');

                        //validate file ext
                        if (IsValidateExtention(docMeta.FileType) == false) {
                            ajaxOutput.Success = false;
                            ajaxOutput.Message = "Allowed file types are PDF//Text and Image Files";
                            return ajaxOutput;
                        }

                        int size = httpPostedFile.ContentLength;

                        if (IsUnderTwentyMegabytes(size) == false) {
                            ajaxOutput.Success = false;

                            ajaxOutput.Message = "Maximum upload limit is 20MB. Please upload file less than 20MB";
                            return ajaxOutput;
                        }

                        byte[] fileData = new byte[size];
                        httpPostedFile.InputStream.Read(fileData, 0, size);
                        docMeta = ordersEnteryCore.SaveDocumnet(docMeta, fileData);
                        ajaxOutput = ordersEnteryCore.AjxOut;
                    }

                }
            }
            catch (Exception ex) {
                AppLog.WriteLog("Error", "DocumentUpload", ex, "");
            }
            return ajaxOutput;
        }

        private bool IsValidateExtention(string ext) {
            bool isValidExtention = true;

            //accepted file types
            var fil_Type = new[] {
                "pdf",
                "png",
                "jpg",
                "jpeg",

            };

            //if file ext is anything other than allowed file types do not allow uploads
            if (fil_Type.Contains(ext) == false) {
                isValidExtention = false;
            }

            return isValidExtention;
        }

        private bool IsUnderTwentyMegabytes(int size) {
            bool isUnderTwentyMegabytes = true;
            int twentyMegaBytes = 20 * 1024 * 1024;

            if (size > twentyMegaBytes) {
                isUnderTwentyMegabytes = false;
            }

            return isUnderTwentyMegabytes;
        }
        //----------------------------------------------------------------------------------------------------------------------------------------------------
        //DownLoadFile
        //-----------------------------------------------------------------------------------------------------------------------------------------------------
        [HttpGet]
        [Route("apix/OrdersEntery/GetDocumentFile/{docId}")]
        public HttpResponseMessage GetFile(int docId) {

            HttpResponseMessage responseMessage = null;
            try {
                OrdersEnteryCore ordersEnteryCore = new OrdersEnteryCore();
                OrderDocumentMeta docMeta = new OrderDocumentMeta();
                docMeta = ordersEnteryCore.GetDocumentFile(docId);
                Byte[] data = docMeta.FileBlob;
                string filename = docMeta.OriginalDocumentName;

                if (filename == null) {
                    responseMessage = Request.CreateResponse(HttpStatusCode.Gone);
                }
                else {
                    responseMessage = Request.CreateResponse(HttpStatusCode.OK);
                    responseMessage.Content = new ByteArrayContent(data);
                    responseMessage.Content.Headers.ContentDisposition = new System.Net.Http.Headers.ContentDispositionHeaderValue("attachment");
                    responseMessage.Content.Headers.ContentLength = data.LongLength;
                    responseMessage.Content.Headers.ContentDisposition.FileName = filename;
                    data = null;
                }

                return responseMessage;
            }
            catch (Exception ex) {
                return Request.CreateResponse(HttpStatusCode.Gone);
            }
        }

        [HttpPost]
        public async Task<AjaxOutput> DeleteOrderDocument(OrderDocumentMeta meta) {
            AjaxOutput ajaxOutput = new AjaxOutput();
            OrdersEnteryCore ordersCore = new OrdersEnteryCore();
            ajaxOutput = await ordersCore.DeleteOrderDocument(meta);
            return ajaxOutput;
        }
        #endregion
    }
}