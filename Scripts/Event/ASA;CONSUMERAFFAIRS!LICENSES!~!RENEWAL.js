// ASA;CONSUMERAFFAIRS!LICENSES!HOME IMPROVEMENT!RENEWAL

//showDebug = 1;
//logDebug("Entering Renew ASA");

aa.runScriptInNewTransaction("APPLICATIONSUBMITAFTER4RENEW");
aa.runScript("APPLICATIONSUBMITAFTER4RENEW");


var addChild = aa.cap.createRenewalCap(parentCapId, capId, true);

aa.cap.updateAccessByACA(capId, "Y");
if (publicUser)
{
    //copying the contacts from the parent to the renewal record when beginning the renewal for ACA records only
    var capContacts = aa.people.getCapContactByCapID(parentCapId);
    if (capContacts.getSuccess())
    {
        capContacts = capContacts.getOutput();
        logDebug("capContacts: " + capContacts);
        for (var yy in capContacts)
        {
            aa.people.removeCapContact(parentCapId, capContacts[yy].getPeople().getContactSeqNumber());
        }
    }
    local_loadASITables4ACA()

    if ((typeof RESTRICTIONS != 'LW - Wastewater Demo Project' || typeof RESTRICTIONS != 'LW12 - All Endorsements') && typeof RESTRICTIONS.length > 1)
    {
        updateFee ('SLS_22', 'CA_SALES', 'Final', 1, 'N' )
    }
}



copyContacts(parentCapId, capId); 
copyASIFields(parentCapId, capId);
copyASITables(parentCapId, capId);

function local_loadASITables4ACA() {
    // Loads App Specific tables into their own array of arrays.  Creates global array objects
    // Optional parameter, cap ID to load from.  If no CAP Id specified, use the capModel
    var itemCap = capId;
    if (1 == arguments.length) {
        itemCap = arguments[0];
        var gm = aa.appSpecificTableScript.getAppSpecificTableGroupModel(itemCap).getOutput()
    } else {
        var gm = cap.getAppSpecificTableGroupModel();   
    }
    for (var ta = gm.getTablesMap(), tai = ta.values().iterator(); tai.hasNext();) {
        var tsm = tai.next();
        if (!tsm.rowIndex.isEmpty()) {
            var tempObject = new Array,
            tempArray = new Array,
            tn = tsm.getTableName();
            tn = String(tn).replace(/[^a-zA-Z0-9]+/g, ""),
            isNaN(tn.substring(0, 1)) || (tn = "TBL" + tn);
            for (var tsmfldi = tsm.getTableField().iterator(), tsmcoli = tsm.getColumns().iterator(), numrows = 1; tsmfldi.hasNext();) {
                if (!tsmcoli.hasNext()) {
                    var tsmcoli = tsm.getColumns().iterator();
                    tempArray.push(tempObject);
                    var tempObject = new Array;
                    numrows++
                }
                var tcol = tsmcoli.next();
                var tobj = tsmfldi.next(); 
                var tval = ""; 
                try { 
                    if(!tobj || !tobj.getInputValue()){
                        tval = tobj;
                    } else {
                        tval = tobj.getInputValue(); 
                    }
                }  catch (ex) { 
                    tval = tobj; 
                }
                tempObject[tcol.getColumnName()] = tval;
            }
            tempArray.push(tempObject);
            var copyStr = "" + tn + " = tempArray";
            logDebug("ASI Table Array : " + tn + " (" + numrows + " Rows)"),
            eval(copyStr)
        }
    }
}