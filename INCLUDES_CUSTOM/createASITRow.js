function createASITRow(recordList,resArray)
{
    var vRow = new Array();
    vRow["Time Accounting Group"] = new asiTableValObj("Time Accounting Group", recordList.get('TIME_GROUP_NAME')+"", "N");
    vRow["Time Accounting Type"] = new asiTableValObj("Time Accounting Type", recordList.get('TIME_TYPE_NAME')+"", "N");
    var logDate = recordList.get('LOG_DATE');
    logDate = aa.util.formatDate(logDate, "MM/dd/YYYY");
    vRow["Date Logged"] = new asiTableValObj("Date Logged", logDate+"", "N");

    var timeElapsedHHMMSS = recordList.get('TIME_ELAPSED');
    timeElapsedHHMMSS = aa.util.formatDate(timeElapsedHHMMSS, "hh:mm:ss");
    vRow["Time Elapsed"] = new asiTableValObj("Time Elapsed", timeElapsedHHMMSS+"", "N");

    var id1 = recordList.get('B1_PER_ID1');
    if(id1 == 'N/A')
    {
        vRow["Reference Record"] = new asiTableValObj("Reference Record", "N/A", "N");
    }
    else
    {
        var id2 = recordList.get('B1_PER_ID2');
        var id3 = recordList.get('B1_PER_ID3');
        var vCapID = aa.cap.getCapID(String(id1),String(id2),String(id3)).getOutput();
        vRow["Reference Record"] = new asiTableValObj("Reference Record", vCapID.getCustomID()+"", "N");
    }

    var bFlag = recordList.get('BILLABLE_FLAG');
    vRow["Billable"] = new asiTableValObj("Billable", bFlag, "N");
    vRow["Reject"] = new asiTableValObj("Reject", " ", "N");
    vRow["Reject Reason"] = new asiTableValObj("Reject Reason", " ", "N");
    vRow["Reject Date"] = new asiTableValObj("Reject Date", " ", "N");
    vRow["Time Accounting Entry ID"] = new asiTableValObj("Time Accounting Entry ID", recordList.get('TIME_LOG_SEQ')+"", "N");
    resArray.push(vRow);
}