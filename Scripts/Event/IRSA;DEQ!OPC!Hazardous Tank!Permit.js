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
        var emailParams = aa.util.newHashtable();
        var reportParams = aa.util.newHashtable();
        var reportFile = new Array();
        var alternateID = capId.getCustomID();
        var itemCap = aa.cap.getCap(capId).getOutput();
        appTypeResult = itemCap.getCapType();
        appTypeString = appTypeResult.toString(); 
        appTypeArray = appTypeString.split("/");
        //insps[i].getInspectionDate()
        inspModel = inspObj.getInspection();            
        //reportParams.put("InspectionDate",  inspObj.getInspectionDate());
        var insYear = inspObj.getInspectionStatusDate().getYear().toString();
        var insMonth = inspObj.getInspectionStatusDate().getMonth().toString();
        var insDay = inspObj.getInspectionStatusDate().getDate().toString();

        var insCon = insMonth + "/" + insDay + "/" + insYear;

    
        reportParams.put("TankRecordID", alternateID.toString());
        reportParams.put("InspectionDate",  insCon);

		rFile = generateReport("Inspection result Summary Report",reportParams, appTypeArray[0])
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

	



