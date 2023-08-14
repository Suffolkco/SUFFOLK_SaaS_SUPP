function updateGuidesheetItemStatus(inspId, gItem, gItemStatus, itemCap) {
    var r = aa.inspection.getInspections(itemCap);
    if (r.getSuccess()) {
        var inspArray = r.getOutput();
        for (i in inspArray) {
            if (inspArray[i].getIdNumber() == inspId) {
                var inspModel = inspArray[i].getInspection();
                var gs = inspModel.getGuideSheets();
                if (gs) {
                    for (var i = 0; i < gs.size(); i++) {
                        var guideSheetObj = gs.get(i);
                        if (guideSheetObj) {
                            var guidesheetItem = guideSheetObj.getItems();
                            for (var j = 0; j < guidesheetItem.size(); j++) {
                                var item = guidesheetItem.get(j);
                                //1. Filter Guide Sheet items by Guide sheet item name && ASI group code
                                if (item && gItem == item.getGuideItemText()) {
                                    logDebug("Found the item: " + item.getGuideItemText() + " with Status: " + item.getGuideItemStatus());
                                    item.setGuideItemStatus(gItemStatus);
                                    var updateResult = aa.guidesheet.updateGGuidesheet(guideSheetObj, currentUserID).getOutput();
                                    return item.getGuideItemStatus();
                                }
                            }
                            //if we got here then there were no guide sheet items matching the item requested
                            logDebug("No matching guidesheet items found for: " + item);
                            return false;
                        }
                    }
                }
                else {
                    // if there are guidesheets
                    logDebug("No guidesheets for this inspection");
                    return false;
                }
            }
        }
    }
    else {
        logDebug("No inspections on the record");
        return false;
    }
 }