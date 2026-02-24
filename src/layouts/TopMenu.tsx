const TopMenu = () => {
  return (
    <nav className="navbar default-layout col-lg-12 col-12 p-0 fixed-top d-flex align-items-top flex-row">
      <div className="text-center navbar-brand-wrapper d-flex align-items-center justify-content-start">
        <div className="me-3">
          <button className="navbar-toggler navbar-toggler align-self-center" type="button" data-bs-toggle="minimize" id="sidebarToggle">
            <i className="fa-solid fa-bars" style={{ fontSize: '21px' }}></i>
          </button>
        </div>
        <div>
          <a className="mt-2 fw-bold navbar-brand brand-logo">CAYR</a>
          <div className="cr cr-top cr-left cr-sticky cr-green" id="devBanner" style={{ zIndex: 10002, display: 'block' }}></div>
        </div>
      </div>
      <div className="navbar-menu-wrapper d-flex justify-content-between">
        <ul className="navbar-nav" id="rptHeaderSecion">
          <li className="nav-item font-weight-semibold d-none d-lg-block ms-0">
            <h6 className="welcome-text" style={{ lineHeight: 'normal' }}>
              <span className="text-black fw-bold" id="pageHeader"></span>
            </h6>
          </li>
          <li className="mx-2" style={{ color: 'red' }} id="ErrorMsgHeader"></li>
        </ul>
        <ul className="navbar-nav ms-auto" id="ulSearch" style={{ display: 'flex' }}>
          <li className="nav-item" id="ClaimQuickSearch">
            <div className="search-container">
              <input type="text" placeholder="Enter Search Value..." id="searchClaim" />
              <i className="fa-solid fa-search menu-icon" id="searchIcon" data-ev="EV_Claim_Search"></i>
            </div>
          </li>
        </ul>
      </div>
    </nav>
  )
}

export default TopMenu
