function updateTimeAccountingLockStatus(timeLogSeq, lockStatus)
{
    var query = "UPDATE T1_TIME_LOG T SET TIME_LOG_STATUS = '$$status$$' WHERE TIME_LOG_SEQ = '$$timeLogSeq$$' AND SERV_PROV_CODE = '$$SERVPROVCODE$$'";
    query = query.replace("$$timeLogSeq$$",timeLogSeq).replace("$$status$$",lockStatus).replace("$$SERVPROVCODE$$",aa.getServiceProviderCode());

    var recordsResult = aa.db.update(query, new Array());
    var records = null;
    if (!recordsResult.getSuccess())
    {
        logDebug("Problem in updateTimeAccounting(): " + recordsResult.getErrorMessage());
        return false;
    }
    logDebug("Updated Successfully...");
}