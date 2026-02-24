const LeftMenu = () => {
  return (
    <nav className="sidebar sidebar-offcanvas  d-flex flex-column justify-content-between" id="sidebar">
      <ul className="nav">
        <li className="nav-item" id="lm_dashboard" data-page="Dashboard">
          <a className="nav-link" href="../../web/app/dashboard.html">
            <i className="fa-solid fa-table-columns menu-icon"></i>
            <span className="menu-title ml-3">Dashboard</span>
          </a>
        </li>
        <li className="nav-item" id="lm_client" data-page="client" style={{ display: 'none' }}>
          <a className="nav-link" href="../../web/app/client.html">
            <i className="fa-solid fa-people-roof menu-icon"></i>
            <span className="menu-title ml-3">Manage Client & Facility</span>
          </a>
        </li>
        <li className="nav-item" id="lm_managePhysicians" data-page="ManagePhysicians" style={{ display: 'none' }}>
          <a className="nav-link" href="../../web/app/managePhysicians.html">
            <i className="fa-solid fa-user-doctor menu-icon"></i>
            <span className="menu-title ml-3">Manage Physicians</span>
          </a>
        </li>
        <li className="nav-item" id="lm_service" data-page="Service" style={{ display: 'none' }}>
          <a className="nav-link" href="../../web/app/cptService.html">
            <i className="fa-solid fa-hospital-user menu-icon"></i>
            <span className="menu-title ml-3">Services</span>
          </a>
        </li>
        <li className="nav-item" id="lm_patientDetails" data-page="PatientDetails" style={{ display: 'none' }}>
          <a className="nav-link" href="../../web/app/patientDetails.html">
            <i className="fa-solid fa-notes-medical menu-icon"></i>
            <span className="menu-title ml-3">Patient Details</span>
          </a>
        </li>
        <li className="nav-item" id="lm_orderEntry" data-page="OrderEntry" style={{ display: 'none' }}>
          <a className="nav-link" href="../../web/app/orderEntry.html">
            <i className="fa-solid fa-file-circle-plus menu-icon"></i>
            <span className="menu-title ml-3">Order Entry</span>
          </a>
        </li>
        <li className="nav-item" id="lm_orders" data-page="orders" style={{ display: 'none' }}>
          <a className="nav-link" href="../../web/app/orders.html">
            <i className="fa-solid fa-clipboard-list menu-icon"></i>
            <span className="menu-title ml-3">Orders</span>
          </a>
        </li>
        <li className="nav-item" id="lm_fulfillment" data-page="orderFulfilment" style={{ display: 'none' }}>
          <a className="nav-link" href="../../web/app/workQueue.html">
            <i className="fa-solid fa-layer-group menu-icon"></i>
            <span className="menu-title ml-3">Work Queue</span>
          </a>
        </li>
        <li className="nav-item" id="lm_reporting" data-page="reporting" style={{ display: 'none' }}>
          <a className="nav-link" href="../../web/app/reporting.html">
            <i className="fa-solid fa-chart-simple menu-icon"></i>
            <span className="menu-title ml-3">Reporting</span>
          </a>
        </li>
      </ul>

      <ul className="nav">
        <li style={{ border: '1px solid #c6c6c6' }}></li>
        <li className="nav-item" id="lm_admin" data-page="Admin" style={{ display: 'none' }}>
          <a className="nav-link" href="../../web/admin/admin.html">
            <i className="fa-solid fa-users menu-icon"></i>
            <span className="menu-title ml-3">Admin</span>
          </a>
        </li>
        <li className="nav-item mt-2">
          <a className="nav-link">
            <i className="fa-solid fa-user-large menu-icon"></i>
            <span className="menu-title ml-3 mt-1 font-weight-500 fs-6" style={{ fontSize: '12px !important' }} id="loggedInUserName">--</span>
          </a>
        </li>
        <li className="nav-item mt-2">
          <a className="nav-link">
            <i className="fa-solid fa fa-database menu-icon"></i>
            <span className="menu-title ml-3 mt-1 font-weight-500 fs-6" style={{ fontSize: '12px !important' }} id="currentDB" title="Curent Database"></span>
          </a>
        </li>
        <li className="nav-item cursor-pointer" id="">
          <a className="nav-link">
            <i className="fas fa-sign-out-alt menu-icon"></i>
            <span className="menu-title ml-3">Logout</span>
          </a>
        </li>
      </ul>
    </nav>
  )
}

export default LeftMenu
