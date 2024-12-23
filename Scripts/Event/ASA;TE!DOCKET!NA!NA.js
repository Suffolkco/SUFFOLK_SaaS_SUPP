//ASA;TE!DOCKET!NA!NA
showDebug = true; 
cap = aa.cap.getCap(capId).getOutput();
if (cap)
{
    var capmodel = aa.cap.getCap(capId).getOutput().getCapModel();
    if (capmodel.isCompleteCap())
    {   
        var facID = getAppSpecific("Facility ID")
        logDebug("Facility ID: " + facID);
      
        var vioType = getAppSpecific("Type of Violation")
        logDebug("Type of Violation: " + vioType);

        // Update record ID
        if (vioType && vioType != "")
        {
            var altIdString = String(capId.getCustomID());
            var altIdLastFive = capId.getCustomID().slice(-5); //AT001
            var altIdLastThree = capId.getCustomID().slice(-3); // 001
            var oldAltId = capId.getCustomID(); //DHS $$YY$$ AT001
            var servProvCode = aa.getServiceProviderCode();

            logDebug("last five of alt id is " + altIdLastFive);
                        
            if (vioType == 'CIAA')
            {
                replaced = 'CI' + altIdLastThree;
                logDebug("replaced: " + replaced);
                //change last five digits of mask
                altIdString = altIdString.replace(altIdLastFive, replaced)
                logDebug("Updating Alt ID to: " + altIdString);
                updateAltID(altIdString, capId);
            }
        }
        if (facID && facID != "")
        {
            var vSQL0 = "SELECT B1.B1_ALT_ID as recordNumber FROM B1PERMIT B1 WHERE B1.B1_ALT_ID like '"+ facID + "' and B1.SERV_PROV_CODE = 'SUFFOLKCO' and  B1_PER_GROUP = 'TE' and B1.B1_PER_TYPE = 'Facility' and B1_PER_CATEGORY = 'NA'";

            var vExistingRecordIDs = doSQLSelect_local(vSQL0);  	
            logDebug("Pulling number of records with matching alt id:" +  vExistingRecordIDs.length);

            if (vExistingRecordIDs.length == 0)
            {
                logDebug("No Facility ID exists");              

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
                        logDebug("Add " + existingCapIDString + ' as parent to ' + capId.getCustomID());         
                        addParent(existingCapId);
                        copyContacts(existingCapId, capId);
                    }
                }
            }
        }
        
    }    
}

function updateAltID(newId) {
    var itemCap = capId;
    if (arguments.length > 1 && arguments[1])
        itemCap = arguments[1];

    var result = aa.cap.updateCapAltID(itemCap, newId);
    if (result.getSuccess())
        logDebug("Successfully updated alt Id to: " + newId);
    else
        logDebug("Problem updating alt Id: " + result.getErrorMessage());
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
