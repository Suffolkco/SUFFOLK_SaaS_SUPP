function editAppSpecific(itemName, itemValue) {
    var itemCap = capId;
    var itemGroup = null;
    if (arguments.length == 3) {
        itemCap = arguments[2];
    }
    if (useAppSpecificGroupName) {
        if (itemName.indexOf(".") < 0) {
            logDebug("**WARNING: (editAppSpecific) requires group name prefix when useAppSpecificGroupName is true");
            return false;
        }
        itemGroup = itemName.substr(0, itemName.indexOf("."));
        itemName = itemName.substr(itemName.indexOf(".") + 1);
    }
    var asiFieldResult = aa.appSpecificInfo.getByList(itemCap, itemName);
    if (asiFieldResult.getSuccess()) {
        var asiFieldArray = asiFieldResult.getOutput();
        if (asiFieldArray.length > 0) {
            var asiField = asiFieldArray[0];
            if (asiField) {
                var origAsiValue = asiField.getChecklistComment();
                asiField.setChecklistComment(itemValue);
                var updateFieldResult = aa.appSpecificInfo.editAppSpecInfoValue(asiField);
                if (updateFieldResult.getSuccess()) {
                    logDebug("Successfully updated custom field: " + itemName + " with value: " + itemValue);
                    if (arguments.length < 3) {
                        AInfo[itemName] = itemValue;
                    }
                } else {
                    logDebug("WARNING: (editAppSpecific) " + itemName + " was not updated.");
                }
            } else {
                logDebug("WARNING: (editAppSpecific) " + itemName + " was not updated.");
            }
        }
    } else {
        logDebug("ERROR: (editAppSpecific) " + asiFieldResult.getErrorMessage());
    }
}