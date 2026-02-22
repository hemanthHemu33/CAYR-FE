var _GlobalRoles = {}
var Core = {
    downloadWindow: null,
    gridDefault: {
        currentPage: 1,
        totalPages: '',
        totalRecords: 0,
        recordsPerPage: 50,
        sortname: '',
        sortOrder: 'desc',
        query: '',
        queryType: ''
    },

    populateInstructions: function (data) {
        Object.values(data).forEach(section => {
            const ul = document.getElementById(section.ulId);
            if (!ul) return;
            section.steps.forEach(step => {
                const li = document.createElement("li");
                li.className = "d-flex mb-2";
                if (step.icon) {
                    const icon = document.createElement("i");
                    icon.className = `fa-solid ${step.icon} me-2 mt-1`;
                    li.appendChild(icon);
                }
                const text = document.createElement("span");
                text.textContent = step.instruction;
                li.appendChild(text);
                ul.appendChild(li);
            });
        });
    },
    SetLeftMenu: function () {
        var page = _$modxAppUtils.getCurrentPageName().replace('.html', '');

        // Map specific pages to their corresponding menu item classes
        var pageMap = {
            'applyFilters': 'filters',
            'payorClassificationReport': 'report',
            'carcClassificationReport': 'report',
            'PopulationMeasure': 'report',
            'dataIntegrityReport': 'report'
        };

        // Determine the class to add based on the mapping
        var menuClass = pageMap[page] || page;


        $('#lm_' + menuClass).addClass("active");

        this.GetloginDetial();
    },
    formatSSN: function (input) {
        // Remove any non-digit characters
        let value = input.value.replace(/\D/g, '');

        // Apply formatting: XXX-XX-XXXX
        if (value.length > 3 && value.length <= 5) {
            value = value.slice(0, 3) + '-' + value.slice(3);
        } else if (value.length > 5) {
            value = value.slice(0, 3) + '-' + value.slice(3, 5) + '-' + value.slice(5, 9);
        }

        input.value = value;
    },
    showFacilityDefaultMessage: function (id) {
        const html = `
             <div class="mngFaclit-empty-state text-center p-5">
                <i class="fa-solid fa-clipboard-list text-muted mb-4 mngFaclit-empty-icon"></i>
                <p class="lead">
               There are no records to display in this section.
                </p>
            </div>
    `;

        $('#' + id).html(html).removeClass('d-none');

    },
    formatTaxID: function (input) {
        // Remove any non-digit characters
        let value = input.value.replace(/\D/g, '');

        // Limit to 9 digits only
        if (value.length > 9) {
            value = value.slice(0, 9);
        }

        input.value = value;
    },
    formatZipCode: function (input) {
        // Remove all non-digits first
        let digits = input.value.replace(/\D/g, '');

        // Auto-insert hyphen if user typed more than 5 digits
        if (digits.length > 5) {
            input.value = digits.slice(0, 5) + '-' + digits.slice(5, 9);
        } else {
            input.value = digits;
        }

        // Full regex: 5 mandatory digits, optional dash + 4 digits
        const zipPattern = /^\d{5}(-\d{4})?$/;

        // Add a data attribute or custom class for validation feedback if needed
        if (!zipPattern.test(input.value)) {
            input.setCustomValidity(
                'Zip Code must be 5 digits or 5 digits followed by a dash and 4 digits (e.g. 12345 or 12345-6789).'
            );
        } else {
            input.setCustomValidity('');
        }
    },
    //inline delete alert message 
    showinlineAlert: function (rootID, parentID, message, type, successHandler, failureHandler) {
        const alertPlaceholder = document.getElementById(rootID);
        const wrapper = document.createElement('div');
        wrapper.className = 'pb-0';
        $(`#${parentID}`).remove();
        wrapper.id = parentID;
        wrapper.innerHTML = [`
        <div class="alert alert-${type} d-flex justify-content-between p-0  " role="alert"> 
            <strong class="mt-2 font-weight-bold text-bold d-flex">
            <div class = " mx-2"> <i class="fa-solid fa-circle-exclamation p-0"></i> </div> 
            <span>${message}</span></strong>
        <div class="d-flex justify-content-around mt-2">
            <button class="btn btn-sm btn-primary ml-2 mx-2 alertbtn" data-ev="${successHandler}">Confirm</button>
            <button class="btn btn-sm btn-outline-danger alertbtn" data-ev="${failureHandler}"> Cancel </button>
             </div>
        </div>`
        ].join('')

        alertPlaceholder.append(wrapper);
    },

    hideinlineAlert: function (parentID) {
        $(`#${parentID}`).remove();
        $('.alert').alert('close');
    },


    formatPhone: function (input) {
        // Remove any non-digit characters
        let value = input.value.replace(/\D/g, '');

        // Ensure it doesn't start with 0
        if (value.startsWith('0')) {
            value = value.substring(1);
        }

        // Limit to 10 digits
        value = value.slice(0, 10);

        // Apply formatting: XXX-XXX-XXXX
        if (value.length > 3 && value.length <= 6) {
            value = value.slice(0, 3) + '-' + value.slice(3);
        } else if (value.length > 6) {
            value = value.slice(0, 3) + '-' + value.slice(3, 6) + '-' + value.slice(6);
        }

        input.value = value;
    },

    GetAllClients: async function (source) {
        var meta = {}
        var url = "../../../apix/Admin/GetAllClients";
        var data = await __PromisAsyncPostBack(meta, url);

        Core.bindSelctizeList('inpOrderClient', data, 'ClientID', 'Name', 'Select', source);
    },
    ConvertToKM: function (amount) {
        var sign = amount < 0 ? "-" : "";
        amount = Math.abs(amount);
        if (amount >= 1000000) {
            return sign + (amount / 1000000) + 'M';
        } else if (amount >= 1000) {
            return sign + (amount / 1000) + 'K';
        } else {
            return sign + amount;
        }
    },

    ConvertYearMonth: function (yearMonth) {
        const year = yearMonth.substring(0, 4);
        const month = yearMonth.substring(4, 6);
        const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
        const monthIndex = parseInt(month, 10) - 1;

        if (monthIndex >= 0 && monthIndex < 12) {
            return `${monthNames[monthIndex]}-${year}`;
        } else {
            return "Invalid month";
        }
    },

    //Function checks user session for such page where no api is called and retrive logged in userName
    GetloginDetial: async function () {
        var functionName = "UserSessionInfo";
        var postbackUrl = '../../../apix/UserSession/' + functionName;
        var ajaxOutput = await __PromisAsyncPostBack({}, postbackUrl);
        if (ajaxOutput.Success == false) {
            location.href = "/web/app/dashboard.html";
            return;
        } else {
            $('#loggedInUserName').html(ajaxOutput.ResultData.UserName);
            $('#currentDB').html(ajaxOutput.ResultData.DB);
            $('#devBanner').text(ajaxOutput.ResultData.AppMode.toUpperCase());
        }
        if (ajaxOutput.ResultData.AppMode == "Prod") {
            $('#devBanner').css('display', 'none');
        } else {
            $('#devBanner').css('display', 'block');
        }

    },


    //Function validate special cahr
    hasSpecialChar: function (input) {
        const specialChars = /[!@$%^&*+\=\[\]{};~'"\|,<>\/?`+]/;
        return specialChars.test(input);
    },

    //Function to fetch shared Report List in Report section
    GetSharedReportList: async function () {
        _$modxAppProgressBar.show();
        let url = '../../../apix/Reports/GetSharedReportList'
        var sharedReportList = await __PromisAsyncPostBack({}, url);
        if (sharedReportList.length != 0) {
            //Clear the ul
            $('#sharedReportList li').remove();

            //Bind report into Section
            sharedReportList.forEach(function (report) {
                var listItem = $('<li></li>')
                    .text(report.Name)
                    .attr('data-id', report.ID)
                    .attr('data-ev', 'Ev_OpenCustomiseReport')
                    .attr('title', report.Name)
                    .addClass('custom-dist-codes truncate');
                $('#sharedReportList').append(listItem);
            });
        }
        // _$modxAppProgressBar.hide();
    },

    // Date range control 
    InitDateRange: function () {
        // Default start and end as null
        var start = null;
        var end = null;

        function cb(start, end) {
            if (start && end) {
                $('#dateRangeInput').val(start.format('MM-DD-YYYY') + ' - ' + end.format('MM-DD-YYYY'));
            } else {
                // Display an empty string when no date range is selected
                $('#dateRangeInput').val('');
            }
        }

        // Initialize the date range picker
        $('#divDateRange').daterangepicker({
            autoUpdateInput: false, // Prevent auto-selection of the date range
            ranges: {
                'Today': [moment(), moment()],
                'This Week': [moment().startOf('week'), moment().endOf('week')],
                'This Month': [moment().startOf('month'), moment().endOf('month')],
                'Last Month': [moment().subtract(1, 'month').startOf('month'), moment().subtract(1, 'month').endOf('month')]
            }
        }, cb);

        // Handle date range apply event
        $('#divDateRange').on('apply.daterangepicker', function (ev, picker) {
            cb(picker.startDate, picker.endDate);
        });

        // Allow manual input in the date range input field
        $('#dateRangeInput').on('change', function () {
            var inputVal = $(this).val();
            var dates = inputVal.split(' - ');

            if (dates.length === 2) {
                var startDate = moment(dates[0], 'MM-DD-YYYY');
                var endDate = moment(dates[1], 'MM-DD-YYYY');

                if (startDate.isValid() && endDate.isValid()) {
                    // Update the picker with manually entered dates
                    $('#divDateRange').data('daterangepicker').setStartDate(startDate);
                    $('#divDateRange').data('daterangepicker').setEndDate(endDate);
                    cb(startDate, endDate);
                } else {
                    // Invalid date format, reset to empty
                    cb(null, null);
                }
            } else {
                // Reset if the input format is incorrect
                cb(null, null);
            }
        });

        // Initially set the date range input to an empty string
        $('#dateRangeInput').val('');
    },

    SetTopMenuHeading: function () {
        var page = _$modxAppUtils.getCurrentPageName();
        page = page.replace('.html', '');
        var txt = $('#lm_' + page).attr('data-page');

        switch (page) {
            case 'orderFulfilment':
            case 'reporting':
            case 'dashboard':
                $('#pageHeader').html('');
                $('#ulSearch').attr('style', 'display: none !important;');
                break;
            case 'client':
                $('#pageHeader').html('CAYR |Manage Client & Facility');
                $('#ulSearch').attr('style', 'display: none !important;');
                break;

            case 'orders':
                $('#pageHeader').html('ORDERS');
                $('#ulSearch').attr('style', 'display: none !important;');
                break;

            case 'manageUserGroup':
                $('#pageHeader').html('CAYR | Admin - Group & Role');
                $('#ulSearch').attr('style', 'display: none !important;');
                break;

            case 'admin':
                $('#pageHeader').html('CAYR | Admin');
                $('#ulSearch').attr('style', 'display: none !important;');
                break;

            case 'manageUser':
                $('#pageHeader').html('CAYR | Admin - Manage User');
                $('#ulSearch').attr('style', 'display: none !important;');
                break;

            case 'managePhysicians':
                $('#pageHeader').html('CAYR | Manage Physicians');
                $('#ulSearch').attr('style', 'display: none !important;');
                break;

            case 'manageFacilityPhysician':
                $('#pageHeader').html('CAYR | Manage Physician Facility');
                $('#ulSearch').attr('style', 'display: none !important;');
                break;

            case 'service':
                $('#pageHeader').html('CAYR | Manage Service');
                $('#ulSearch').attr('style', 'display: none !important;');
                break;

            case 'patientDetails':
                $('#pageHeader').html('CAYR | Manage Patient Details');
                $('#ulSearch').attr('style', 'display: none !important;');
                break;
            case 'orderEntry':
                $('#pageHeader').html('CAYR | Manage Order Entry');
                $('#ulSearch').attr('style', 'display: none !important;');
                break;
            case 'facilityService':
                $('#pageHeader').html('CAYR | Manage Facility Service');
                $('#ulSearch').attr('style', 'display: none !important;');
                break;
            case 'cptService':
                $('#pageHeader').html('CAYR |Service');
                $('#ulSearch').attr('style', 'display: none !important;');
                break;
            case 'workQueue':
                $('#pageHeader').html('CAYR |Manage WorkQueue');
                $('#ulSearch').attr('style', 'display: none !important;');
                break;
            default:
                //$('#pageHeader').html(txt);
                $('#ulSearch>li').css('display', '');

                break;
        }
    },


    ConfirmLogout: function () {
        _$modxAppCore.confirm("Are you sure you want to log off?", "Confirm Logoff").then(function (op) {
            if (op) {
                Core.Logoff();
            }
        });
    },

    Logoff: async function () {
        var obj = {}
        var url = "../../../apix/UserSession/LogOff";
        var ajxIn = await __PromisAsyncPostBack(obj, url);

        if (ajxIn.Success) {
            window.location.href = ajxIn.CommandArgs;
            return;
        }
    },

    GetRandomNo: function () {
        var today = new Date();
        var date = today.getFullYear() + '' + (today.getMonth() + 1) + '' + today.getDate();
        var time = today.getHours() + '' + today.getMinutes() + '' + today.getSeconds();
        var no = (date + '' + time);

        return no;
    },

    OpenPage: function (page) {
        location.href = page;
    },

    getCurrentPageName: function () {
        return (location.pathname.split('/').slice(-1)[0]);
    },

    setHeaderTitle: function (menuName, ev) {
        let parentNode = ev.target.parentNode.id;
        // Remove already selected CSS
        $(`#${parentNode} li`).css({
            "background-color": "",
            "color": ""
        });

        $(ev.target).css("background-color", "lightgray");

        // Set header text 
        $('#pageHeader').text("|" + menuName);

        let textContent = $(ev.target).attr('value');
        var prefixedText = " - " + textContent;

        // Remove any existing <span> element with id 'popuHeading'
        $('#popuHeading').remove();
        var spanElement = $('<span id="popuHeading" class = "truncate"></span>');
        spanElement.text(prefixedText);
        $('#pageHeader').append(spanElement);

        //$('.navbar-nav').css('margin-left', '200px');
    },

    setHeaderTitleByID: function (menuName, id) {
        // Set header text 
        $('#pageHeader').text("|" + menuName);

        var textContent = $('#' + id).attr('value');
        var prefixedText = " - " + textContent;

        // Remove any existing <span> element with id 'popuHeading'
        $('#popuHeading').remove();
        var spanElement = $('<span id="popuHeading" class = "truncate"></span>');
        spanElement.text(prefixedText);
        $('#pageHeader').append(spanElement);

        //$('.navbar-nav').css('margin-left', '200px');
    },

    toggleMenuDisplay: function () {
        $('#defaultMsg').css('display', 'none');
        $('#menuDiv').css('display', 'none');
    },

    showDefaultMessage: function () {
        Core.showNoGridDataMessage('defaultMsg', "Please choose a menu item.")
    },

    ShowSkeletonLoader: function (divId) {
        const root = $("#" + divId);
        const skeletonId = divId + "_skeleton";

        var skeletonLoader = `<div class="row" id="${skeletonId}">
                                  <div class="col-12 mb-0">
                                  <p class="card-text placeholder-glow">
                                      <span class="placeholder col-7"></span>
                                      <span class="placeholder col-4"></span>
                                      <span class="placeholder col-4"></span>
                                      <span class="placeholder col-6"></span>
                                      <span class="placeholder col-8"></span>
                                      <span class="placeholder col-8"></span>
                                  </p>
                                  </div>
                               </div>`;

        root.append(skeletonLoader);

    },

    HideSkeletonLoader: function (divId) {
        const skeletonId = divId + "_skeleton";
        $('#' + skeletonId).remove();
    },

    //Create dynamic quick search Ui
    createSearchUI: function (searchOptions, searchEv) {
        $('#ErrorMsgDictionaryReports').html('')
        const optionsHtml = searchOptions.map(option =>
            `<option value="${option.value}">${option.label}</option>`
        ).join('');

        return `
        <li class="search-item">
            <div class="input-group" id="selSearchFor">
                <select id="selSearchItem" class="form-control" style="height: 30px; line-height: inherit;">
                    <option value="none">- Search Field -</option>
                    ${optionsHtml}
                </select>
            </div>
        </li>
        <li class="search-item" style="margin: 0px 10px;">
            <div class="input-group input-group-outline my-2 inpGrp" id="selSearchInput">
                <input type="text" id="searchInput" class="form-control" placeholder="Enter search value..." autocomplete="off">
            </div>
        </li>
        <li class="search-item">
            <button class="btn btn-sm btn-primary btn-fw" id="btnSaveCode" data-ev="${searchEv}" style="height:30px;">Search</button>
        </li>
    `;
    },

    showNoGridDataMessage: function (id, message) {
        // Construct the HTML string with the provided message
        var htmlString = `
        <div class="starter-template text-center p-5 mt-5" id=msgDiv${id}>
            <i style="font-size:120px" class="fa-regular fa-file-lines text-muted mb-4"></i>
            <p class="lead">${message}</p>
        </div>`;

        // Select the element with the provided id
        var element = document.getElementById(id);

        // Check if the element exists
        if (element) {
            // Bind the HTML string inside the element
            element.innerHTML = htmlString;
        } else {

        }

        if (message == '') {
            $('#msgDiv' + id).hide();
        }
    },

    BindDropDownList: function (payorList, id) {
        var htm = payorList;
        $("#" + id).html(htm);
        $("#" + id).multiselect({
            maxHeight: 200,
            width: 150,
            nonSelectedText: '-Select PayerClass-',
            buttonContainer: '<div class="form-control payorMutiSelect"/>',
            buttonClass: 'btn-btn-primary',
            enableFiltering: true,
            enableCaseInsensitiveFiltering: true,
        })
    },

    //Function return encoded param
    encodeParam: function (param) {
        return btoa(param);
    },
    //Function return decoded param
    decodeParam: function (encodedParam) {
        return atob(encodedParam);
    },

    // Adjusting horizontal scroll bar for the div
    setPayerClassificationRptDivHeight: function (adjustheight, id) {
        // Function to set the height based on the viewport size
        function adjustHeight() {
            var viewportHeight = $(window).height() - adjustheight;

            $('#' + id).css({
                'height': viewportHeight + 'px',
            });
        }

        // Adjust height on document ready
        $(document).ready(function () {
            adjustHeight();
        });

        // Adjust height whenever the window is resized
        $(window).resize(function () {
            adjustHeight();
        });
    },

    createDownLoadWindow: function (url) {
        if (Core.downloadWindow && Core.downloadWindow.closed == false) {
            Core.downloadWindow.location.href = url; // Update the URL
        } else {
            Core.downloadWindow = window.open(url, 'Download', 'scrollbars=yes, resizable=yes, height=800,width=900, top=0, left=1500');
        }
        Core.downloadWindow.focus();
    },

    closeSubMenu: function () {
        $('.table-bordered.cursor-pointer.mb-3').removeClass('custom-margin-dictionary');
        $('#theme-settings').css('display', 'none')
        //$('.navbar-nav').css('margin-left', '');
        var icon = '<i class="fa fa-chevron-right menu-icon accordion-icon px-2 pt-2" id="submenuIcon" title="Show sub menu" data-ev="EV_ShowSubMenu" style="Cursor: pointer; color: white !important;"></i>';
        $('#pageHeader').prepend(icon);
    },

    validateInputs: function (requiredFields, obj) {
        // Iterate through the required fields
        for (let field of requiredFields) {
            // Check if the field is present and not empty
            if (!obj.hasOwnProperty(field) || !obj[field]) {
                return {
                    isValid: false,
                    missingField: field,
                    error: `${field} is missing or empty`
                };
            }
        }

        return { isValid: true };
    },

    checkSpecialCharacters: function (val) {
        var specialChars = /[^a-zA-Z0-9_.\-| ]/;

        // Check for special characters 
        if (specialChars.test(val)) {
            return {
                isValid: false,
                error: "Invalid value. Allowed characters: A-Z, 0-9, : , - , _ ,. Please remove special characters"
            };
        }

        return { isValid: true };
    },

    getBase64: function (file) {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.readAsDataURL(file);
            reader.onload = () => resolve(reader.result);
            reader.onerror = error => reject(error);
        });
    },

    bindSelectList: function (elm, data, key, value, defaultVal) {
        var items = "";
        if (defaultVal != '') {
            items += "<option value='' disabled selected>" + defaultVal + "</option>";
        }

        $.each(data, function (i, item) {
            items += "<option value='" + item[key] + "'>" + (item[value]) + "</option>";
        });
        $('#' + elm).html(items);
    },

    bindSelctizeList: function (selectId, data, valueField, labelField, placeholder, source) {
        var $select = $('#' + selectId);

        // Destroy existing Selectize if already initialized
        if ($select.hasClass('selectized')) {
            var existing = $select[0].selectize;
            existing.destroy();
            $select = $('#' + selectId);
        }

        // Clear and add placeholder
        $select.empty();
        $select.append($('<option>').val('').text(placeholder));

        // Populate options
        $.each(data, function (i, item) {
            var optionText = item[labelField];
            $select.append($('<option>').val(item[valueField]).text(optionText));
        });

        // Initialize Selectize
        var selectizeInstance = $select.selectize({
            allowEmptyOption: true,
            placeholder: placeholder,
            onChange: function (value) {
                switch (source) {
                    case 'FacilityService':
                        FacilityService.GetFacilites(Core.gridDefault);     
                        break;
                    case "OrderEntery":
                    case "PatientDetails":
                        Core.clearFacilitySearch();
                        break;
                }
            }
        });

        var selectize = selectizeInstance[0].selectize;

        if (data.length > 0) {
            selectize.setValue(data[0][valueField]);
        }

        $select.next('.selectize-control').css('width', '200px');
    },
    clearFacilitySearch: function () {
        dropdownEl = document.getElementById("facilityDropdown");
        innerSearchEl = document.getElementById("facilityInnerSearch");
        // Clear inner search input
        innerSearchEl.value = "";

        // Clear rendered options but keep inner search + loader rows
        const dropdown = document.getElementById("facilityDropdown");
        dropdown.querySelectorAll(
            "li:not(#facilityLoader):not(.facility-inner-search)"
        ).forEach(li => li.remove());

        // Hide loader if it was visible
        if (facilityDropdown) {
            facilityDropdown.hideLoader();
        }

        // Optional: clear selected facility state
        const mainInput = document.getElementById("facilitySearch");
        mainInput.value = "";
        mainInput.removeAttribute("data-selected-id");
 
    },

    getStateList: function (ctl) {
        var state = [
            { "name": "Alabama", "abbreviation": "AL" },
            { "name": "Alaska", "abbreviation": "AK" },
            { "name": "Arizona", "abbreviation": "AZ" },
            { "name": "Arkansas", "abbreviation": "AR" },
            { "name": "California", "abbreviation": "CA" },
            { "name": "Colorado", "abbreviation": "CO" },
            { "name": "Connecticut", "abbreviation": "CT" },
            { "name": "Delaware", "abbreviation": "DE" },
            { "name": "Florida", "abbreviation": "FL" },
            { "name": "Georgia", "abbreviation": "GA" },
            { "name": "Hawaii", "abbreviation": "HI" },
            { "name": "Idaho", "abbreviation": "ID" },
            { "name": "Illinois", "abbreviation": "IL" },
            { "name": "Indiana", "abbreviation": "IN" },
            { "name": "Iowa", "abbreviation": "IA" },
            { "name": "Kansas", "abbreviation": "KS" },
            { "name": "Kentucky", "abbreviation": "KY" },
            { "name": "Louisiana", "abbreviation": "LA" },
            { "name": "Maine", "abbreviation": "ME" },
            { "name": "Maryland", "abbreviation": "MD" },
            { "name": "Massachusetts", "abbreviation": "MA" },
            { "name": "Michigan", "abbreviation": "MI" },
            { "name": "Minnesota", "abbreviation": "MN" },
            { "name": "Mississippi", "abbreviation": "MS" },
            { "name": "Missouri", "abbreviation": "MO" },
            { "name": "Montana", "abbreviation": "MT" },
            { "name": "Nebraska", "abbreviation": "NE" },
            { "name": "Nevada", "abbreviation": "NV" },
            { "name": "New Hampshire", "abbreviation": "NH" },
            { "name": "New Jersey", "abbreviation": "NJ" },
            { "name": "New Mexico", "abbreviation": "NM" },
            { "name": "New York", "abbreviation": "NY" },
            { "name": "North Carolina", "abbreviation": "NC" },
            { "name": "North Dakota", "abbreviation": "ND" },
            { "name": "Ohio", "abbreviation": "OH" },
            { "name": "Oklahoma", "abbreviation": "OK" },
            { "name": "Oregon", "abbreviation": "OR" },
            { "name": "Pennsylvania", "abbreviation": "PA" },
            { "name": "Rhode Island", "abbreviation": "RI" },
            { "name": "South Carolina", "abbreviation": "SC" },
            { "name": "South Dakota", "abbreviation": "SD" },
            { "name": "Tennessee", "abbreviation": "TN" },
            { "name": "Texas", "abbreviation": "TX" },
            { "name": "Utah", "abbreviation": "UT" },
            { "name": "Vermont", "abbreviation": "VT" },
            { "name": "Virginia", "abbreviation": "VA" },
            { "name": "Washington", "abbreviation": "WA" },
            { "name": "West Virginia", "abbreviation": "WV" },
            { "name": "Wisconsin", "abbreviation": "WI" },
            { "name": "Wyoming", "abbreviation": "WY" }
        ]

        Core.bindSelectList(ctl, state, 'abbreviation', 'abbreviation', '-Select State-');
    },

    expandQCGrid: function (containerID) {
        $('#' + containerID + '_QCGridPager').attr('style', 'display:none !important');
    },

    OpenChangeDatabase: function () {
        location.href = '../app/userDBList.html'
        //var page = _$modxAppUtils.getCurrentPageName();        
        //var pageInd = Core.reportPages.indexOf(page);
        //if (pageInd > -1) {
        //    location.href = '../app/userDBList.html'
        //}
        //else {
        //    location.href = '../app/userDBList.html'
        //}
    },

    getFacilityTypeList: function (ctl) {
        var facilityType = [
            { "name": "Clinic", "abbreviation": "Clinic" },
            { "name": "Correctional Facility", "abbreviation": "Correctional Facility" },
            { "name": "Hospice", "abbreviation": "Hospice" },
            { "name": "Hospital", "abbreviation": "Hospital" },
            { "name": "Nursing Home/SNF", "abbreviation": "Nursing Home/SNF" },
            { "name": "Residence", "abbreviation": "Residence" },
            { "name": "Other", "abbreviation": "Other" }
        ]

        Core.bindSelectList(ctl, facilityType, 'abbreviation', 'abbreviation', '');
    },

    /* Client Facility */
    GetFacilityBySearch: async function (searchText, page = 1) {
        if (!searchText || searchText.length < 3) return [];
        var meta = {};
        meta.Name = searchText
        meta.ClientID = $('#inpOrderClient').val();
        var url = '../../../apix/ManagePhysician/GetAllFacility';
        try {
            var data = await __PromisAsyncPostBack(meta, url);
            console.log(data)
            return data || [];
        } catch (e) {
            console.error(e);
            return [];
        }
    },

    checkInputValues: function (value, len) {         
        if (value == '') {
            return 1;
        }

        if (value.length == len) {
            return 1;
        }

        return 0;
    },

    BindFacilitySelectize: function (source) {

        // Destroy existing Selectize instance if already initialized
        if ($('#inpOrderFacility')[0].selectize) {
            $('#inpOrderFacility')[0].selectize.destroy();
        }
        if ($('#inpOrderClient').val() == '') {
            return;
        }
        // Initialize Selectize
        $('#inpOrderFacility').selectize({
            valueField: 'FacilityID',
            labelField: 'Name',
            searchField: 'Name',
            placeholder: 'Type at least 4 letters to search...',
            preload: false,
            loadThrottle: 400,
            persist: true,
            selectOnTab: false,

            load: function (query, callback) {
                var self = this;

                if (!query || query.length < 4) {
                    return callback();
                }

                // Show loader  
                self.$control.parent().css('position', 'relative');
                let $loader = self.$control.parent().find('.selectize-loader');
                if (!$loader.length) {
                    $loader = $('<span class="selectize-loader"></span>').css({
                        position: 'absolute',
                        right: '85px',
                        top: '44%',
                        transform: 'translateY(-50%)',
                        fontSize: '12px',
                        color: '#888'
                    });
                    self.$control.parent().append($loader);
                }
                $loader.show();

                Core.GetFacilityBySearch(query, 1)
                    .then(function (facilities) {
                        self.clearOptions(); // Always clear previous options

                        if (facilities && facilities.length > 0) {
                            callback(facilities);  // Bind new data
                        } else {
                            callback([]);  // No results, Selectize will handle "No data available"
                        }
                    })
                    .catch(function () {
                        self.clearOptions();
                        callback([]); // On error, show no results
                    })
                    .finally(function () {
                        if ($loader) $loader.hide();
                    });
            },

            render: {
                option: function (item, escape) {
                    return "<div>" + escape(item.Name) + "</div>";
                },
                no_results: function () {
                    return '<div class="selectize-no-data">No data available</div>';
                }
            },

            onType: function () {
                this.clearOptions();
            },

            onBlur: function () {
                var self = this;
                setTimeout(function () {
                    if (!self.getValue()) {
                        self.$control_input.val(self.lastQuery || '');
                    }
                }, 0);
            },

            onFocus: function () {
                if (this.lastQuery) {
                    this.$control_input.val(this.lastQuery);
                }
            },

            onChange: function (value) {
                if (!value) return;

                var selectedOption = this.options[value];
                var selectedText = selectedOption && selectedOption.FacilityID ? selectedOption.FacilityID : '';
                this.$control.attr('title', selectedText);

                switch (source) {
                    case 'OrderEntery':
                        Orders.GetFacilityNpi(selectedText);
                        break;
                    case 'FacilityService':
                        Core.gridDefault.query = selectedText;
                        FacilityService.GetFacilityService(Core.gridDefault);
                        break;
                    case 'FacilityPhysician':
                        PhysicianFacility.resetFacilityUI();
                        Core.gridDefault.query = selectedText;
                        PhysicianFacility.GetAllPhysicianFacility(Core.gridDefault);
                        break;
                    //case 'PatientDetails':
                    //    Core.gridDefault.query = selectedText;
                    //    PatientDetails.GetAllPatientDetails(Core.gridDefault);
                    //    break;
                }
            }
        });
    },

    GetUserMenuItems: function () {
        _$modxAppProgressBar.show();
        var postbackUrl = "../../../apix/UserSession/GetUserMenuItems";

        __DoAsyncPostBack({}, postbackUrl, function (ajxOut) {
            _$modxAppProgressBar.hide();
            if (ajxOut.Success == false) {
                return;
            }

            if (ajxOut.Success == true) {
                var roleData = ajxOut.ResultData;
                for (var i = 0; i < roleData.length; i++) {
                    $(`#${roleData[i].MenuName}`).show();

                    if (roleData[i].MenuName == 'lm_ManageGroupRole' || roleData[i].MenuName == 'lm_ManageUser') {
                        $('#lm_admin').show();
                    }

                    if (roleData[i].MenuName == 'lm_serviceSubMenu' || roleData[i].MenuName == 'lm_facilityServicesSubMenu' || roleData[i].MenuName == 'lm_cptServicesSubMenu') {
                        $('#lm_service').show();
                        $('#lm_cptServicesSubMenu').show();
                    }

                    if (roleData[i].MenuName == 'lm_Dashboard') {
                        $('#divDashboard').show();
                    }
                }
            }
        });
    },
    //=======================================
    //Order Summary Populate
    //=======================================
    applyOrderPreview: (data) => {
        $('#OrderNumber').html(data.ResultData.OrderNumber);
        $('#OrderDate').html(data.ResultData.SubmitDate);
        $('#OrderDate_submit').html(data.ResultData.SubmitDate);
        $('#Location').html(data.ResultData.Location);
        $('#SubmittedBy').html(data.ResultData.SubmittedBy);
        $('#PatientName').html(data.ResultData.PatientName);
        $('#DOB').html(data.ResultData.PatientDOB);
        $('#MRN').html(data.ResultData.MRN);
        $('#ProviderName').html(data.ResultData.Provider);
        $('#NPI').html(data.ResultData.ProviderInfo);

        // --- Recurring details ---
        const isRecurring = data.ResultData.IsRecurring || '';
        const recurringFreq = data.ResultData.RecurringFrequency || '';
        const recurringEndDate = data.ResultData.RecurringEndDate || '';

        $('#IsRecurring').html(isRecurring);
        $('#RecurringFrequency').html(recurringFreq);
        $('#RecurringEndDate').html(recurringEndDate);

        if (recurringFreq !== '' && recurringEndDate !== '') {
            $('#headerReccuring').removeClass('d-none');
        }

        // Existing order items preview

        // Documents list  
        const docs =
            data?.ResultData?.orderDocumentMetas ??
            data?.ResultData?.orderDocumentMetas ??
            [];

        Core.buildOrderDocumentsList(docs, '#orderDocsHost', 'Ev_open_document');
        Core.buildOrderItemsPreview(data.CommandArgs, '#orderItemsHost');
    },
    buildOrderDocumentsList: function (docs, hostSel, evName = 'Ev_open_document') {
        const $host = $(hostSel);
        if (!$host.length) return;

        $host.empty();

        const items = Array.isArray(docs) ? docs : [];
        if (!items.length) {
            $('#orderDocsEmpty').removeClass('d-none');
            return;
        }
        $('#orderDocsEmpty').addClass('d-none');

        items.forEach(d => {
            const docId = d?.OrderDocumentsId ?? d?.OrderDocumentsID ?? d?.id ?? '';
            const docName = (d?.OriginalDocumentName ?? d?.DocumentName ?? '--') + '';
            const docType = d?.DocumentType ? ` (${d.DocumentType})` : '';

            const $li = $('<li/>');
            const $a = $('<a/>', {
                href: '#',
                text: docName + docType,
                'data-id': docId,
                'data-ev': evName
            });
            $li.append($a);
            $host.append($li);
        });
    },
    buildOrderItemsPreview: function (items, host) {
        const $host = $(host);
        if (!$host.length) return;

        $host.empty();

        // ---- Group items by ServiceType ----
        const groups = {};
        (items || []).forEach(it => {
            const key = ((it.ServiceType ?? '') + '').trim() || 'Other';
            if (!groups[key]) groups[key] = [];
            groups[key].push(it);
        });

        // ---- Render each group ----
        Object.keys(groups).forEach(serviceType => {
            const orders = groups[serviceType];
            const $groupWrap = $('<div/>', { class: 'ordPrv-group mb-2' });

            // Optional: group heading
            $groupWrap.append(
                $('<div/>', { class: 'ordPrv-groupTitle fw-bold mb-2', text: serviceType })
            );

            orders.forEach((it, idx) => {
                //const orderNo = idx + 1;
                const orderNumber = `#${it.OrderNumber}` || '';
                // Item values
                const service = ((it.Service ?? '') + '').trim() || '--';
                const cpt = ((it.CPT ?? '') + '').trim() || '--';
                const priority = ((it.Priority ?? '') + '').trim() || '--';
                const reqDate = ((it.RequestedServiceDate ?? '') + '').trim();
                const schdDate = ((it.ScheduledDate ?? '') + '').trim();

                // Recurring fields (render only if ALL present)
                const rawIsRec = it.IsRecurring;
                const freqStr = ((it.RecurringFrequency ?? '') + '').trim();
                const endDateStr = ((it.RecurringEndDate ?? '') + '').trim();
                const hasAllRecurring = Boolean(rawIsRec && freqStr && endDateStr);

                // Order card
                const $card = $('<div/>', { class: 'ordPrv-card mb-1 p-2' });

                $card.append(
                    $('<div/>', {
                        class: 'ordPrv-orderTitle fw-bold mb-2',
                        text: `Order Item ${orderNumber} `
                    })
                );

                $card.append(`<div class="ordPrv-row"><strong>Service:</strong> ${service}</div>`);
                $card.append(`<div class="ordPrv-row"><strong>CPT:</strong> ${cpt}</div>`);

                $card.append(`<div class="ordPrv-row"><strong>Priority:</strong> ${priority}</div>`);
                if (reqDate) $card.append(`<div class="ordPrv-row"><strong>Requested Date:</strong> ${reqDate}</div>`);
                if (schdDate) $card.append(`<div class="ordPrv-row"><strong>Schedule Date:</strong> ${schdDate}</div>`);
                if (serviceType == "Diagnostic Imaging") {
                    let note = ((it.Note ?? '') + '').trim() || '--';
                    $card.append(`<div class="ordPrv-row"><strong>Note:</strong> ${note}</div>`);
                }
                // Recurring Details (only if all 3 exist)
                if (hasAllRecurring) {
                    const $recWrap = $('<div/>')
                    $recWrap.append(`<div class="ordPrv-row"><strong>Is Recurring:</strong> ${rawIsRec}</div>`);
                    $recWrap.append(`<div class="ordPrv-row"><strong>Frequency:</strong> ${freqStr}</div>`);
                    $recWrap.append(`<div class="ordPrv-row"><strong>End Date:</strong> ${endDateStr}</div>`);
                    $card.append($recWrap);
                }

                $groupWrap.append($card);
            });

            $host.append($groupWrap);
        });

    },
    downloadDocument: function (ev) {
        _$modxAppProgressBar.show();
        var docId = ev.target.getAttribute('data-id');
        var url = '../../../apix/OrdersEntery/GetDocumentFile/' + docId;
        window.open(url, '_blank', 'noreferrer');
        _$modxAppProgressBar.hide();
        return;
    },
}



const Accordion = {
    state: {
        singleOpen: true,
        hostSel: null
    },

    qs(sel, root = document) {
        return root.querySelector(sel);
    },

    init(host) {
        const hostEl = typeof host === 'string' ? document.querySelector(host) : host;
        if (!hostEl) return;

        const single = hostEl.getAttribute('data-single-open');
        this.state.singleOpen = single === null ? true : String(single).toLowerCase() === 'true';
        this.state.hostSel = host;

        hostEl.addEventListener('click', (ev) => {
            const header = ev.target.closest('.ord-acc-header');
            if (!header || !hostEl.contains(header)) return;
            const itemEl = header.closest('.ord-acc-item');
            this.toggleItem(itemEl);
        });

        hostEl.querySelectorAll('.ord-acc-item').forEach(item => {
            const header = item.querySelector('.ord-acc-header');
            const panel = item.querySelector('.ord-acc-panel');
            if (!header || !panel) return;
            panel.style.maxHeight = header.getAttribute('aria-expanded') === 'true' ? 'none' : '0px';
        });
    },

    toggleItem(itemEl, forceOpen) {
        if (!itemEl) return;

        const header = itemEl.querySelector('.ord-acc-header');
        const panel = itemEl.querySelector('.ord-acc-panel');
        if (!header || !panel) return;

        const expand = forceOpen === true ? true : header.getAttribute('aria-expanded') !== 'true';

        if (this.state.singleOpen && expand) {
            const host = this.qs?.(this.state.hostSel) || itemEl.parentElement;
            if (host) {
                host.querySelectorAll('.ord-acc-item').forEach(el => {
                    if (el === itemEl) return;
                    const h = el.querySelector('.ord-acc-header');
                    const p = el.querySelector('.ord-acc-panel');
                    if (h && p && h.getAttribute('aria-expanded') === 'true') {
                        h.setAttribute('aria-expanded', 'false');
                        this.closePanel(p);
                    }
                });
            }
        }

        header.setAttribute('aria-expanded', expand ? 'true' : 'false');
        expand ? this.openPanel(panel) : this.closePanel(panel);
    },

    openPanel(panel) {
        panel.style.transition = panel.style.transition || 'max-height 250ms ease';
        panel.style.overflow = 'hidden';
        panel.style.maxHeight = 'none';
        const target = panel.scrollHeight;
        panel.style.maxHeight = '0px';
        requestAnimationFrame(() => {
            panel.style.maxHeight = target + 'px';
        });

        const onEnd = (e) => {
            if (e.propertyName === 'max-height') {
                panel.style.maxHeight = 'none';
                panel.removeEventListener('transitionend', onEnd);
            }
        };
        panel.addEventListener('transitionend', onEnd);
    },

    closePanel(panel) {
        panel.style.transition = panel.style.transition || 'max-height 250ms ease';
        panel.style.overflow = 'hidden';
        if (getComputedStyle(panel).maxHeight === 'none') {
            panel.style.maxHeight = panel.scrollHeight + 'px';
        }
        requestAnimationFrame(() => {
            panel.style.maxHeight = '0px';
        });
    },

    reflow(scopeEl) {
        if (!scopeEl) return;
        const panel = scopeEl.closest('.ord-acc-panel');
        if (!panel) return;
        const header = panel.previousElementSibling;
        if (header && header.getAttribute('aria-expanded') === 'true') {
            panel.style.maxHeight = 'none';
            const h = panel.scrollHeight;
            panel.style.maxHeight = h + 'px';
        }
    },

    openById(itemId) {
        const item = document.getElementById(itemId);
        if (item) this.toggleItem(item, true);
    },

    closeById(itemId) {
        const item = document.getElementById(itemId);
        if (!item) return;
        const header = item.querySelector('.ord-acc-header');
        if (header?.getAttribute('aria-expanded') === 'true') this.toggleItem(item, false);
    }
};


//override modals methods for modx
//bootstrap 5 compatibilty 
//modX modals does not work with boostrap 5

var OverrideModxModals = {

    init: function () {

        if (jQuery.isEmptyObject(_$modxAppCore) || _$modxAppCore == null) {
            console.log("Error ModxAppCore not loaded");
            return;
        }

        //override methods of for modals of modx

        _$modxAppCore._alertConstruct = this._alertConstruct;
        _$modxAppCore.alertHTML = this.alertHTML;
        _$modxAppCore.create = this.create;
        _$modxAppCore.setMessage = this.setMessage;
        _$modxAppCore.show = this.show;
        _$modxAppCore.alert = this.alert;
        _$modxAppCore.confirm = this.confirm;

    },

    _alertConstruct: {
        id: '',
        idTitleELM: '',
        idMessageELM: '',
        isConfirm: false,
        setIds: function () {
            // since id is a hardcoded and it important
            this.id = (this.isConfirm == true) ? 'appcore_Confirm' : 'appcore_Alert';
            this.idTitleELM = this.id + '_Title';
            this.idMessageELM = this.id + '_Message';
        },

        alertHTML: function () {
            var alertHTML = '';
            alertHTML = '' +
                '    <div class="modal-dialog">' +
                '        <!-- Modal content-->' +
                '    <div class="modal-content">' +
                '            <div class="modal-header alert-Header">' +
                '                <h4 class="modal-title alert-Header-Title" id="' + this.idTitleELM + '"></h4>' +
                '                <button type="button" class="btn-close" data-bs-dismiss="modal" style=""></button>' +
                '            </div>' +
                '            <div class="modal-body">' +
                '                <div id="' + this.idMessageELM + '"></div>' +
                '            </div>' +
                '            <div class="modal-footer">';
            if (this.isConfirm == true) {
                alertHTML = alertHTML + '<button type="button" class="btn btn-sm btn-success" data-bs-dismiss="modal" data-appcoreAlert="OK">OK</button>';
                alertHTML = alertHTML + '<button type="button" class="btn btn-outline-danger btn-rounded btn-sm" data-bs-dismiss="modal" data-appcoreAlert="Cancel">Cancel</button>';
            } else {
                alertHTML = alertHTML + '<button type="button" class="btn btn-outline-danger btn-rounded btn-sm" data-bs-dismiss="modal" data-appcoreAlert="Close">Close</button>';
            }

            alertHTML = alertHTML + '            </div>' +
                '        </div>' +
                '    </div>' +
                '';
            return alertHTML;
        },
        create: function (message, title) {
            var elem;

            this.setIds();//set ids ---

            if (title == undefined) {
                title = '';
            }
            if (message == undefined) {
                message = '';
            }

            elem = document.getElementById(this.id);
            if (!(elem == undefined || elem == null)) {
                this.setMessage(message, title);
                return true;// dom already exists  
            }
            elem = document.createElement('div');
            elem.id = this.id;
            elem.setAttribute("class", "modal fade");
            elem.setAttribute("role", "dialog");
            var alertHTML = this.alertHTML();
            elem.innerHTML = alertHTML
            document.body.appendChild(elem);
            this.setMessage(message, title); // reset the message for 

        },
        setMessage: function (message, title) {
            $('#' + this.idTitleELM).html(title);
            $('#' + this.idMessageELM).html(message);
        },
        show: function () {
            var that = this;
            $('#' + that.id).off('click');
            var promise = new Promise(function (resolve, reject) {
                $('#' + that.id).modal('show');
                // dont bind the event if already bind 
                $('#' + that.id).on('click', function (e) {
                    var etarget = e.target.getAttribute('data-appcoreAlert');
                    var op = false;

                    if (etarget == "OK") {
                        op = true;
                    }
                    else if (etarget == "Cancel" || etarget == "Close") {
                        op = false;
                    }
                    else {
                        return;
                    }
                    resolve(op);
                    //reject(Error(false));
                })
            });
            return promise;
        },

    },

    alert: function (message, title) {
        this._alertConstruct.isConfirm = false;
        this._alertConstruct.create(message, title);// this function ;ready checks if dom is already created 
        this._alertConstruct.show().then(function (op) {
            return false; //since this is an alert eat the event
        });

    },
    confirm: function (message, title) {
        this._alertConstruct.isConfirm = true;
        this._alertConstruct.create(message, title);// this function ;ready checks if dom is already created 
        var promise = this._alertConstruct.show();
        return promise;

    },
}

OverrideModxModals.init();

function scrollTop() {
    if (document.body.scrollTop > 20 || document.documentElement.scrollTop > 20) {
        $('#FloatTop').show();
    } else {
        $('#FloatTop').hide();
    }
}

//if (window.location.protocol != "https:") {
//    window.location.protocol = "https";
//}