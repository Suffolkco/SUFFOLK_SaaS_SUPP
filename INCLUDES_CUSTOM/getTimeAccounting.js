function getTimeAccounting(userId, fromDate, toDate)
{
    var query = "";
    query += "SELECT * FROM T1_TIME_LOG T "
    query += "INNER JOIN R1_TIME_GROUP G ON "
    query += "T.TIME_GROUP_SEQ = G.TIME_GROUP_SEQ "
    query += "INNER JOIN R1_TIME_TYPES TYPE ON "
    query += "T.TIME_TYPE_SEQ = TYPE.TIME_TYPE_SEQ "
    query += "WHERE "
    query += "T.USER_NAME = '$$USERNAME$$' AND "
    query += "T.LOG_DATE >= TO_DATE('$$FROMDATE$$', 'MM/DD/YYYY') AND "
    query += "T.LOG_DATE <= TO_DATE('$$TODATE$$', 'MM/DD/YYYY') AND "
    query += "T.REC_STATUS = 'A' AND "
    query += "T.SERV_PROV_CODE = '$$SERVPROVCODE$$'"
    query = query.replace("$$USERNAME$$", userId).replace("$$FROMDATE$$", fromDate).replace("$$TODATE$$", toDate).replace("$$SERVPROVCODE$$", aa.getServiceProviderCode());

    var recordsResult = aa.db.select(query, new Array());
    var records = null;
    if (!recordsResult.getSuccess())
    {
        logDebug("Problem in getTimeAccounting(): " + recordsResult.getErrorMessage());
        return false;
    }
    records = recordsResult.getOutput() || new Array();
    if (records.size() > 0)
        return records.toArray();
    return records;
}
