using System.Web;
using System.Web.Http;
using CAYR.core;
using CAYR.meta;
using modxCore.apix;
using modxCore.meta;

namespace CAYRWeb.apix {
    public class UserSessionController:ModxApixController {
        [HttpPost]
        public AjaxOutput LogOff() {
            AjaxOutput ajxOut = new AjaxOutput();
            HttpContext.Current.Session.Abandon();
            ajxOut.Success = true;
            ajxOut.Message = "User session killed";
            ajxOut.CommandArgs = "/web/app/login.html";
            return ajxOut;
        }

        [HttpPost]
        public AjaxOutput GetUserRolesByPage(PageMeta pageMeta) {
            AjaxOutput obj = new AjaxOutput();
            UserAuthCore userAuthCore = new UserAuthCore();
            obj = userAuthCore.GetUserRolesByPage(pageMeta);
            return obj;
        }

        [HttpPost]
        public AjaxOutput GetUserMenuItems() {
            AjaxOutput obj = new AjaxOutput();
            UserAuthCore userAuthCore = new UserAuthCore();
            obj = userAuthCore.GetUserMenuItems();
            return obj;
        }

        [HttpPost]
        public AjaxOutput UserSessionInfo() {
            AjaxOutput ajax = new AjaxOutput();
            UserAuthCore userAuthCore = new UserAuthCore();
            ajax = userAuthCore.UserSessionInfo();
            return ajax;

        }

        [HttpPost]
        public AjaxOutput GetUserDatabases() {
            AjaxOutput obj = new AjaxOutput();
            UserAuthCore userAuthCore = new UserAuthCore();
            obj = userAuthCore.GetUserDatabases();
            return obj;
        }

        [HttpPost]
        public AjaxOutput ConnectToDB(UserInfoMeta userInfoMeta) {
            AjaxOutput obj = new AjaxOutput();
            UserAuthCore userAuthCore = new UserAuthCore();
            obj = userAuthCore.ConnectToDB(userInfoMeta);
            return obj;
        }
    }
}