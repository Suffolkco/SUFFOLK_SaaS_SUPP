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
        logDebug("inspeciton object date: " + inspObj.getInspectionDate());        
        reportParams.put("TankRecordID", alternateID.toString());
        reportParams.put("InspectionDate",  inspResultDate);
       
		rFile = generateReport("Inspection result Tank Operator",reportParams, 'DEQ')
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

	



