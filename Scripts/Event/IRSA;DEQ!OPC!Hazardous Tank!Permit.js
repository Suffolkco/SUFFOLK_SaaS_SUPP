//IRSA:DEQ/OPC/HAZARDOUS TANK/PERMIT

showDebug = true;

var today = new Date();

var parentCap = getParent(capId);
logDebug("Identified: " + parentCap.getCustomID() + " as the parent.");

var tankNumber = getAppSpecific("SCDHS Tank #", capId);
logDebug("This is the tank we are looking for: " + tankNumber);
var inspectionUpdate = '';
var todaysDate = today.getMonth() + "/" + today.getDate() + "/" + today.getYear()
var inspectionUpdate = todaysDate + " " + inspType;
editASITableRowViaRowIdentifer(parentCap, "TANK INFORMATION", "Last Inspection", inspectionUpdate, tankNumber, "Tank #");


//EHIMS-4805
if (inspResult == "Completed" || inspResult == "Fail")
{
    if (inspType == "Non-PBS Tank OP Inspection" ||
    inspType == "Non-PBS Tank Other Inspection" ||
    inspType == "Non-PBS Tank Re-Inspection" ||
    inspType == "PBS Tank GSR Inspection" ||
    inspType == "PBS Tank OP Inspection" ||
    inspType == "PBS Tank Other Inspection" ||
    inspType == "PBS Tank Re-Inspection")
    {

        /*inspId 566672
        inspResult = Fail
        inspComment = null
        inspResultDate = 2/24/2022
        inspGroup = DEQ_TANKMON
        inspType = Non-PBS Tank OP Inspection
        inspSchedDate = 2/24/2022*/

        var emailParams = aa.util.newHashtable();
        var reportParams = aa.util.newHashtable();
        var reportFile = new Array();
        var alternateID = capId.getCustomID();
      
        //insps[i].getInspectionDate()
        inspModel = inspObj.getInspection();            
        //reportParams.put("InspectionDate",  inspObj.getInspectionDate());
        inspDate = inspObj.getInspectionDate();
        logDebug("inspResultDate: " + inspResultDate);       
        logDebug("inspection object date: " + inspObj.getInspectionDate());       
        logDebug("inspection object date: " + inspObj.getInspectionDate());       
        logDebug("alternateID: " + alternateID.toString());        
        logDebug("inspSchedDate: " + inspSchedDate);       
debugObject(inspObj);

        var year = inspObj.getInspectionDate().getYear();
        var month = inspObj.getInspectionDate().getMonth() - 1;
        var day = inspObj.getInspectionDate().getDayOfMonth();
        var hr = inspObj.getInspectionDate().getHourOfDay();
        var min = inspObj.getInspectionDate().getMinute();
        var sec = inspObj.getInspectionDate().getSecond();
        logDebug("Inspection teim: " + hr + "," + min + "," + sec);
                
        var inspectionDateCon = month + "/" + day + "/" + year;
        logDebug("Inspection Date: " + month + "/" + day + "/" + year);

      
        var retVal = new Date(String(inspectionDateCon));
        logDebug("retVal Date: " + retVal);

        reportParams.put("TankRecordID", alternateID.toString());
        reportParams.put("InspectionDate",  inspObj.getInspectionDate());
            
		rFile = generateReport1("Inspection result Tank Operator", reportParams, 'DEQ')
        logDebug("This is the rFile: " + rFile);           
        
        if (rFile) {
        reportFile.push(rFile);
        }

        getRecordParams4Notification(emailParams);                 

        addParameter(emailParams, "$$altID$$", capId.getCustomID());
        insId = inspObj.getIdNumber();
        addParameter(emailParams, "$$inspId$$", insId);
        
        sendNotification("", "ada.chan@suffolkcountyny.gov", "DEQ_OPC_HAZARDOUS_TANK_INSPECTION", "", emailParams, reportFile);    
              

    }

} 

function generateReport1(aaReportName,parameters,rModule) {
	var reportName = aaReportName;
      
    report = aa.reportManager.getReportInfoModelByName(reportName);
    report = report.getOutput();
    logDebug("This is the report: " + report);           
    report.setModule(rModule);
    report.setCapId(capId);

    report.setReportParameters(parameters);

    var permit = aa.reportManager.hasPermission(reportName,currentUserID);
    logDebug("This is the permit: " + permit);   
    if(permit.getOutput().booleanValue()) {
       var reportResult = aa.reportManager.getReportResult(report);
     
       if(reportResult) {
	       reportResult = reportResult.getOutput();
           logDebug("This is the reportResult: " + reportResult);   

	       var reportFile = aa.reportManager.storeReportToDisk(reportResult);
			logMessage("Report Result: "+ reportResult);
	       reportFile = reportFile.getOutput();
	       return reportFile
       } else {
       		logMessage("Unable to run report: "+ reportName + " for Admin" + systemUserObj);
       		return false;
       }
    } else {
         logMessage("No permission to report: "+ reportName + " for Admin" + systemUserObj);
         return false;
    }
}

	



