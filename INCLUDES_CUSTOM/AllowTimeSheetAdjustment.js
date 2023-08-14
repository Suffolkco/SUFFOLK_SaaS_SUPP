function AllowTimeSheetAdjustment(vDateLogged,vLoggedBy){
    var flagPreventSubmittal = false;
    //figure out what week today is in
    var weekday = ["Sunday","Monday","Tuesday","Wednesday","Thursday","Friday","Saturday"];
    var currentTSDate = new Date(vDateLogged)
    var day = weekday[currentTSDate.getDay()];

    if(day == "Sunday"){
        TSSTartDate = currentTSDate
    }else if(day == "Monday"){
        TSSTartDate = dateAdd(currentTSDate,-1)
    }else if(day == "Tuesday"){
        TSSTartDate = dateAdd(currentTSDate,-2)
    }else if(day == "Wednesday"){
        TSSTartDate = dateAdd(currentTSDate,-3)
    }else if(day == "Thursday"){
        TSSTartDate = dateAdd(currentTSDate,-4)
    }else if(day == "Friday"){
        TSSTartDate = dateAdd(currentTSDate,-5)
    }else if(day == "Saturday"){
        TSSTartDate = dateAdd(currentTSDate,-6)
    }
    logDebug("Looking for Timesheet Start Date of " + TSSTartDate);

    //Find Time sheet record associated to this USER and Timeframe
    var fromDate = aa.date.parseDate(TSSTartDate);
    var toDate = aa.date.parseDate(dateAdd(TSSTartDate,7));
    logDebug("**INFO checking For Date = " + aa.util.formatDate(convertDate(fromDate), "MM/dd/YYYY") + " to date "  + aa.util.formatDate(convertDate(toDate), "MM/dd/YYYY"));
    var searchResult = aa.cap.getCapIDsByAppSpecificInfoDateRange("TIMESHEET INFORMATION", "Time Period Start Date", fromDate, toDate);
    if (searchResult.getSuccess()) {
        searchResultArray = searchResult.getOutput();
    }
    for ( var s in searchResultArray) {
        var timesheetCapId = searchResultArray[s];
        timesheetCapId = timesheetCapId.getCapID();
        var thisCap = aa.cap.getCap(timesheetCapId).getOutput();
        if(getAppSpecific("Employee Name",timesheetCapId) == vLoggedBy){
            //Found Timesheet
            logDebug("Record " + timesheetCapId.getCustomID() + " found for " + vLoggedBy + " for Date Range " + aa.util.formatDate(convertDate(fromDate), "MM/dd/YYYY") + " to date "  + aa.util.formatDate(convertDate(toDate), "MM/dd/YYYY"))
            var timesheetCap = aa.cap.getCap(timesheetCapId).getOutput();
            timesheetCapStatus = timesheetCap.getCapStatus();
            if(!matches(timesheetCapStatus,"Timesheet Rejected",null)){
                flagPreventSubmittal = true;
                showMessage = true;
                var timeStart = getAppSpecific("Time Period Start Date",timesheetCapId)
                var timeEnd = getAppSpecific("Time Period End Date",timesheetCapId)
                comment("<B><Font Color='RED'>WARNING: A timesheet " + timesheetCapId.getCustomID() + " with a status of " + timesheetCapStatus + " has been found for the time period " + timeStart + " to " + timeEnd + " and cannot be altered</Font></B>")
            }
        }
    }
    return flagPreventSubmittal;
}