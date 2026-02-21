using CAYR.core;
using CAYR.meta;
using modxCore.apix;
using modxCore.meta;
using System.Web.Http;
 
namespace CAYRWeb.apix {
    public class CAYRGridConfigurationController:ModxApixController {
        [HttpPost]
        public AjaxOutput GetGridColModel(CAYRGridConfigurationInfoMeta gridConfigurationInfoMeta) {
            AjaxOutput ajaxOut = new AjaxOutput();
            CAYRGridConfigurationCore cAYRGridConfigurationCore = new CAYRGridConfigurationCore();  
            ajaxOut = cAYRGridConfigurationCore.GetGridColModel(gridConfigurationInfoMeta);

            return ajaxOut;
        }

        [HttpPost]
        public AjaxOutput SaveGridColModal(CAYRGridConfigurationInfoMeta gridConfigurationInfoMeta) {
            AjaxOutput ajaxOut = new AjaxOutput();
            CAYRGridConfigurationCore cAYRGridConfigurationCore = new CAYRGridConfigurationCore();
            ajaxOut = cAYRGridConfigurationCore.SaveGridColModal(gridConfigurationInfoMeta);

            return ajaxOut;
        }

        [HttpPost]
        public AjaxOutput ResetGridColModal(CAYRGridConfigurationInfoMeta gridConfigurationInfoMeta) {
            AjaxOutput ajaxOut = new AjaxOutput();
            CAYRGridConfigurationCore cAYRGridConfigurationCore = new CAYRGridConfigurationCore();
            ajaxOut = cAYRGridConfigurationCore.ResetGridColModal(gridConfigurationInfoMeta);

            return ajaxOut;
        }
    }
}