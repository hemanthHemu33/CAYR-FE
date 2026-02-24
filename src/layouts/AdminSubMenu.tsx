const AdminSubMenu = () => {
  return (
    <div id="theme-settings" className="settings-panel" style={{ top: '55px !important' }}>
      <div className="settings-heading" style={{ borderBottom: '1px solid #dee2e6' }}>
        Admin
        <i className="settings-close fas fa-times" data-ev="EV_CloseSubMenu"></i>
        <i className="fas fa-ellipsis-v menu-icon mx-4 settings-close d-none" id="dictEllipsisDropdown" data-bs-toggle="dropdown" aria-expanded="true" data-ev="EV_Show_EllipsisMenu"></i>
        <div className="dropdown-menu dropdown-menu-right navbar-dropdown preview-list pb-0" id="dictEllipsisMenu" aria-labelledby="dictEllipsisDropdown"></div>
      </div>
      <ul className="list-unstyled" id="subMenuList" style={{ cursor: 'pointer' }}>
        <li className="m-2 custom-dist-codes" value="Manage User Group" data-ev="EV_ManageUserGroup" style={{ display: 'none' }} id="lm_ManageGroupRole">Manage Group & Role</li>
        <li className="m-2 custom-dist-codes" value="Manage User" data-ev="EV_ManageUser" style={{ display: 'none' }} id="lm_ManageUser">Manage User</li>
      </ul>
    </div>
  )
}

export default AdminSubMenu
