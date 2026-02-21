using CAYR.core;
using CAYR.dal;
using CAYR.meta;
using modxCore.apix;
using modxCore.core;
using modxCore.meta;
using modxDataConnect.model.QCGrid;
using System.Collections.Generic;
using System.Web.Http;

namespace CAYRWeb.apix {
    public class AdminController:ModxApixController {
        #region Client APIs
        [HttpPost]
        public QCGridMeta GetClients(CleintsMeta meta) {
            QCGridMeta qcGrid = new QCGridMeta();
            ClientsCore clientsCore = new ClientsCore();
            qcGrid = clientsCore.GetClients(meta);
            return qcGrid;
        }

        [HttpPost]
        public AjaxOutput SaveClient(CleintsMeta meta) {
            AjaxOutput ajaxOutput = new AjaxOutput();
            ClientsCore clientsCore = new ClientsCore();
            clientsCore.SaveClient(meta);
            ajaxOutput = clientsCore.AjxOut;
            return ajaxOutput;
        }
        
        #endregion

        #region Facilite APIs
        [HttpPost]
        public List<CleintsMeta> GetAllClients() {
            List<CleintsMeta> cleintsMetaList = new List<CleintsMeta>();
            ClientsCore clientsCore = new ClientsCore();
            cleintsMetaList = clientsCore.GetAllClients();
            return cleintsMetaList;
        }

        [HttpPost]
        public QCGridMeta GetFacilites(FacilitesMeta meta) {
            QCGridMeta qcGrid = new QCGridMeta();
            FacilitesCore facilitesCore = new FacilitesCore();
            qcGrid = facilitesCore.GetFacilites(meta);
            return qcGrid;
        }

        [HttpPost]
        public AjaxOutput SaveFacility(FacilitesMeta meta) {
            AjaxOutput ajaxOutput = new AjaxOutput();
            FacilitesCore facilitesCore = new FacilitesCore();
            facilitesCore.SaveFacility(meta);
            ajaxOutput = facilitesCore.AjxOut;
            return ajaxOutput;
        }

        #endregion

        #region UserGroups APIs
        [HttpPost]
        public QCGridMeta GetUserGroups(UserGroupMeta meta) {
            QCGridMeta qcGrid = new QCGridMeta();
            UserGroupCore userGroupCore = new UserGroupCore();
            qcGrid = userGroupCore.GetUserGroups(meta);
            return qcGrid;
        }

        [HttpPost]
        public AjaxOutput SaveUserGroup(UserGroupMeta meta) {
            AjaxOutput ajaxOutput = new AjaxOutput();
            UserGroupCore userGroupCore = new UserGroupCore();
            userGroupCore.SaveUserGroup(meta);
            ajaxOutput = userGroupCore.AjxOut;
            return ajaxOutput;
        }

        [HttpPost]
        public AjaxOutput GetRoleGroupMap(AppRoleGroupMapMeta meta) {
            AjaxOutput ajaxOutput = new AjaxOutput();
            UserGroupCore userGroupCore = new UserGroupCore();
            userGroupCore.GetRoleGroupMap(meta);
            ajaxOutput = userGroupCore.AjxOut;
            return ajaxOutput;
        }

        [HttpPost]
        public AjaxOutput DeleteGroup(AppRoleGroupMapMeta meta) {
            AjaxOutput ajaxOutput = new AjaxOutput();
            UserGroupCore userGroupCore = new UserGroupCore();
            userGroupCore.DeleteGroup(meta);
            ajaxOutput = userGroupCore.AjxOut;
            return ajaxOutput;
        }
        #endregion

        #region UserRole APIs
        [HttpPost]
        public QCGridMeta GetUserRoles(UserRoleMeta meta) {
            QCGridMeta qcGrid = new QCGridMeta();
            UserRoleCore userRoleCore = new UserRoleCore();
            qcGrid = userRoleCore.GetUserRoles(meta);
            return qcGrid;
        }

        [HttpPost]
        public AjaxOutput SaveRole(UserRoleMeta meta) {
            AjaxOutput ajaxOutput = new AjaxOutput();
            UserRoleCore userRoleCore = new UserRoleCore();
            userRoleCore.SaveRole(meta);
            ajaxOutput = userRoleCore.AjxOut;
            return ajaxOutput;
        }
        #endregion

        #region UserDetails APIs
        [HttpPost]
        public QCGridMeta GetUserDetails(UserDetailsMeta meta) {
            QCGridMeta qcGrid = new QCGridMeta();
            UserDetailsCore userDetailsCore = new UserDetailsCore();
            qcGrid = userDetailsCore.GetUserDetails(meta);
            return qcGrid;
        }

        [HttpPost]
        public AjaxOutput SaveUserDetails(UserDetailsMeta meta) {
            AjaxOutput ajaxOutput = new AjaxOutput();
            UserDetailsCore userDetailsCore = new UserDetailsCore();
            ajaxOutput = userDetailsCore.SaveUser(meta);            
            return ajaxOutput;
        }

        [HttpPost]
        public AjaxOutput SaveUsersGroups(UserDetailsMeta meta) {
            AjaxOutput ajaxOutput = new AjaxOutput();
            UserDetailsCore userDetailsCore = new UserDetailsCore();
            userDetailsCore.SaveUsersGroups(meta);
            ajaxOutput = userDetailsCore.AjxOut;
            return ajaxOutput;
        }

        [HttpPost]
        public AjaxOutput ResetPassword(UserDetailsMeta meta) {
            AjaxOutput ajaxOutput = new AjaxOutput();
            UserDetailsCore userDetailsCore = new UserDetailsCore();
            ajaxOutput = userDetailsCore.ResetPasswordInAD(meta);
            return ajaxOutput;
        }

        [HttpPost]
        public AjaxOutput GetUserGroupMap(UserGroupMapMeta meta) {
            AjaxOutput ajaxOutput = new AjaxOutput();
            UserGroupCore userGroupCore = new UserGroupCore();
            userGroupCore.GetUserGroupMap(meta);
            ajaxOutput = userGroupCore.AjxOut;
            return ajaxOutput;
        }
        #endregion
    }
}