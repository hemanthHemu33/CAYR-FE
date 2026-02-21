using System;
using System.Collections.Generic;
using System.Configuration;
using System.IO;
using System.Linq;
using System.Web;
using System.Web.UI;
using System.Web.UI.WebControls;
using modxCore.core;

namespace CAYRWeb.web.app {
    public partial class DownloadFile:System.Web.UI.Page {
        protected void Page_Load(object sender, EventArgs e) {
            if (CurrentUser.isUserInSession()) {
                string fileName = Request.QueryString["fileName"];
                FileDownload(fileName);
            }
            else {
                Page page = HttpContext.Current.CurrentHandler as Page;
                page.ClientScript.RegisterClientScriptBlock(page.GetType(), "alert", "alert('Session ended. Please reconnect to the application.')", true);
            }
        }

        private void FileDownload(string fileName) {
            try {
                string filePath = ConfigurationManager.AppSettings["ExportFolderPath"] + "\\" + fileName;
                FileInfo fileToDownload = new FileInfo(filePath);

                if (fileToDownload.Exists) {
                    // set the http content type to "APPLICATION/OCTET-STREAM
                    Response.ContentType = "APPLICATION/OCTET-STREAM";

                    System.String disHeader = "Attachment; Filename=\"" + fileName + "\"";
                    Response.AppendHeader("Content-Disposition", disHeader);
                    Response.Flush();
                    Response.TransmitFile(fileToDownload.FullName);
                    Response.Flush();
                    Response.End();
                }
                else {
                    Page page = HttpContext.Current.CurrentHandler as Page;
                    page.ClientScript.RegisterClientScriptBlock(page.GetType(), "alert", "alert('The selected file could not be found.')", true);
                }
            } catch (Exception ex) {

            }
        }
    }
}