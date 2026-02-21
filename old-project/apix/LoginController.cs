using CAYR.core;
using CAYR.meta;
using modxCore.apix;
using modxCore.meta;
using System.Web.Http;

namespace CAYRWeb.apix {
    public class LoginController:ModxApixController {
        public LoginController() : base(true) { }

        [HttpPost]
        public AjaxOutput UserLogin(UserAuthMeta userAuthMeta) {
            AjaxOutput obj = new AjaxOutput();
            UserAuthCore userAuthCore = new UserAuthCore();
            obj = userAuthCore.UserLogin(userAuthMeta);

            return obj;
        }
    }
}