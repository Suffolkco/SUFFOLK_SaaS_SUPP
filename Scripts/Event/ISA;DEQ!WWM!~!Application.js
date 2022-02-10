//ISA;DEQ!WWM!~!Application
showDebug = true;
// Not used anymore
/*
inspId 566190   // is the new inspection
inspInspector =
InspectorFirstName = null
InspectorMiddleName = null
InspectorLastName = null
inspGroup = WWM_INSP
inspType = WWM_RES_System 1
inspSchedDate = 1/18/2022 */

var inspectionResult = aa.inspection.getInspections(capId);
if (inspectionResult.getSuccess()) {
    if (inspectionResult.getOutput().length >= 2) {
        lastInsp = inspectionResult.getOutput()[inspectionResult.getOutput().length - 2];
        lastInsp = lastInsp.getIdNumber();
    }
}



logDebug("this is the script that is running");
copyAllGuidesheets(lastInsp, inspId, capId, true);


function copyAllGuidesheets(inspId1, inspId2) { 
    /*
    Will copy all guidesheets (1:1) from inspId1 to inspId2 on same record
    Not using aa.inspection.getInspection() because the .getGuideSheets() always returns null
	Author CGray
	@param inspId1 {Number} Inspection sequence number of source
	@param inspId2 {Number} Inspection sequence number of target
    Optional {object} Source record
    Optional {boolean} to remove all existing guidesheets from target
    */
    var itemCap = capId;
    var rExisting = false;
    if (arguments.length >= 3) {
        itemCap = arguments[2];
    }
    if (arguments.length >= 4) {
        rExisting = arguments[3];
    }
    var inspResult = aa.inspection.getInspections(itemCap);
    if (inspResult.getSuccess()) {
        var itemList = aa.util.newArrayList();
        var inspArray = inspResult.getOutput();
        for (ins in inspArray) {
            if (inspArray[ins].getIdNumber() == inspId1) {
                var guides = inspArray[ins].getInspection().getGuideSheets();
                if (guides != null) {
                    var gArray = guides.toArray();
                    for (gs in gArray) {
                        itemList.add(gArray[gs]);
                    }
                }
            }
            else if (inspArray[ins].getIdNumber() == inspId2) {
                if (rExisting) {
                    var guides = inspArray[ins].getInspection().getGuideSheets();
                    if (guides != null) {
                        var gArray = guides.toArray();
                        for (gs in gArray) {
                            aa.print("Removing guidesheet: " + gArray[gs].getGuideType());
                            var guideBiz = aa.proxyInvoker.newInstance("com.accela.aa.inspection.guidesheet.GGuideSheetBusiness").getOutput();
                            guideBiz.removeGGuideSheet("SUFFOLKCO", gArray[gs].getGuidesheetSeqNbr(), "ADMIN");
                        }
                    }
                }
            }
        }
        if (!itemList.isEmpty()) {
            var copyItems = aa.guidesheet.copyGGuideSheetItems(itemList, itemCap, inspId2, currentUserID);
            if (copyItems.getSuccess()) {
                aa.print("Copied guidesheet successfully.");
            }
        }
    }
}