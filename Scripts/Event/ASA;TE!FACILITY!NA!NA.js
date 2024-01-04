//ASA:TE/*/*/*/

showDebug = true; 
cap = aa.cap.getCap(capId).getOutput();
if (cap)
{
    var capmodel = aa.cap.getCap(capId).getOutput().getCapModel();
    if (capmodel.isCompleteCap())
    {   
        var facCode = getAppSpecific("Village")
        logDebug("ASI Village: " + facCode);
        villageCode = lookup("TE_FacilityCode", facCode);
        logDebug("villageCode: " + villageCode);

        // If it's in the shared drop down, reuse
        if (villageCode && villageCode != "")
        {
            var vSQL0 = "SELECT B1.B1_ALT_ID as recordNumber FROM B1PERMIT B1 WHERE B1.B1_ALT_ID like '"+ villageCode + "%' and B1.SERV_PROV_CODE = 'SUFFOLKCO' and B1_PER_GROUP = 'TE' and B1.B1_PER_TYPE = 'Facility' and B1_PER_CATEGORY = 'NA' order BY B1.B1_ALT_ID DESC";

            var vExistingRecordIDs = doSQLSelect_local(vSQL0);  	
            logDebug("Pulling number of records with matching alt id:" +  vExistingRecordIDs.length);

            if (vExistingRecordIDs.length == 0)
            {
                logDebug("No Facility code exists yet");

                var newFacCode = villageCode + " " + "001";
                logDebug("New Facility code to be created: " + newFacCode);    

                aa.cap.updateCapAltID(capId, newFacCode);
                logDebug("Updated record ID from: " + capId.getCustomID() + " to " + newFacCode);  


            }
            else if (vExistingRecordIDs.length > 0)
            {
                recordID = vExistingRecordIDs[0]["recordNumber"];              
                logDebug("Looking at record: " + recordID);     
                existingCapId = getApplication(recordID);
                existingCapIDString = existingCapId.getCustomID();
                logDebug("Existing CapIdString: " + existingCapIDString);       
                existingCap = aa.cap.getCap(existingCapId).getOutput();
                if (existingCap)
                {
                    var capmodel = aa.cap.getCap(existingCapId).getOutput().getCapModel();
                    if (capmodel.isCompleteCap())
                    {
                        // Include the space 2 (village) + space
                        var facNum = existingCapIDString.substr(3);
                        logDebug("facNum " + facNum);

                        var facSeq = parseInt(facNum);   
                        logDebug("facSeq " + facSeq);                 
                        var newFacSeq = facSeq + 1;
                        logDebug("newFacSeq " + newFacSeq);    
                        var padded = pad(newFacSeq, 3);
                        logDebug("padded " + padded);    
                       
                        var newFacCode = villageCode + " " + padded;
                        logDebug("newFacCode " + newFacCode);    

                        aa.cap.updateCapAltID(capId, newFacCode);
                        logDebug("Updated record ID from: " + recordID + " to " + newFacCode);  
                    }
                }
            }
        }
        
    }    
}

function pad(num, size) {
    num = num.toString();
    while (num.length < size) num = "0" + num;
    return num;
}

function doSQLSelect_local(sql)
{
    try
    {
        //logdebug("iNSIDE FUNCTION");
        var array = [];
        var conn = aa.db.getConnection();
        var sStmt = conn.prepareStatement(sql);
        if (sql.toUpperCase().indexOf("SELECT") == 0)
        {
            //logdebug("executing " + sql);
            var rSet = sStmt.executeQuery();
            while (rSet.next())
            {
                var obj = {};
                var md = rSet.getMetaData();
                var columns = md.getColumnCount();
                for (i = 1; i <= columns; i++)
                {
                    obj[md.getColumnName(i)] = String(rSet.getString(md.getColumnName(i)));
                    //logdebug(rSet.getString(md.getColumnName(i)));
                }
                obj.count = rSet.getRow();
                array.push(obj)
            }
            rSet.close();
            //logdebug("...returned " + array.length + " rows");
            //logdebug(JSON.stringify(array));
        }
        sStmt.close();
        conn.close();
        return array
    } catch (err)
    {
        //logdebug("ERROR: "+ err.message);
        return array
    }
}

