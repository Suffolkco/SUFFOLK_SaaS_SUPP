function refreshTimeSheet(recordList)
{
    var itemCap = capId;
    if (arguments.length > 1) {
        itemCap = arguments[1]
    }

    var resArray = new Array();
    for (var i = 0 ; i < recordList.length ; i++)
    {
        if(recordList[i].get('TIME_LOG_STATUS') == 'U')
        {
            logDebug("DEBUG : " + itemCap.getCustomID() + " : Creating row for TIMESHEET ENTRIES table");
            createASITRow(recordList[i], resArray);
            logDebug("DEBUG : " + itemCap.getCustomID() + " : Updating time accounting entry with status as Lock");
            var lockStatus = "L";
            var timeLogSeq = recordList[i].get('TIME_LOG_SEQ')+"";
            updateTimeAccountingLockStatus(timeLogSeq,lockStatus);
        }
    }
    removeASITable("TIMESHEET ENTRIES",itemCap);
    addASITable("TIMESHEET ENTRIES", resArray, itemCap);
}