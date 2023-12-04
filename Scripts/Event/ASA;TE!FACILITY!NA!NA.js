//ASA:DEQ/*/*/*/

showDebug = true; 
capId = getApplication(recordID);
capIDString = capId.getCustomID();

cap = aa.cap.getCap(capId).getOutput();
if (cap)
{
    var capmodel = aa.cap.getCap(capId).getOutput().getCapModel();
    if (capmodel.isCompleteCap())
    {
        //aa.cap.updateCapAltID(capId, "SITE-SH23");
        //aa.cap.updateCapAltID(capId, "SITE-BR99");
        // Update to the new AltID: 
        var facCode = getAppSpecific("Village")
     
        var vSQL0 = "SELECT B1.B1_ALT_ID as recordNumber FROM B1PERMIT B1 WHERE B1.B1_ALT_ID like '"+ facCode + "%' and B1.SERV_PROV_CODE = 'SUFFOLKCO' and B1_PER_GROUP = 'TE' and B1.B1_PER_TYPE = 'Facility' and B1_PER_CATEGORY = 'NA' order BY B1.B1_ALT_ID DESC";

        var vExistingRecordIDs = doSQLSelect_local(vSQL0);  	
		logDebug("Pulling number of records with matching alt id:" +  vExistingRecordIDs.length);

        if (vExistingRecordIDs.length > 0)
        {
            recordID = vExistingRecordIDs[0]        
            logDebugLocal("Looking at record: " + recordID);         
            capId = getApplication(recordID);
            capIDString = capId.getCustomID();
            logDebugLocal("CapIdString: " + capIDString);       
            cap = aa.cap.getCap(capId).getOutput();
            if (cap)
            {
                var capmodel = aa.cap.getCap(capId).getOutput().getCapModel();
                if (capmodel.isCompleteCap())
                {
		            var facNum = capIDString.substr(2);
                    logDebug("facNum " + facNum);
                    var facSeq = parseInt(facNum);   
                    logDebug("facSeq " + facSeq);                 
                    var newFacSeq = facSeq++;
                    logDebug("newFacSeq " + newFacSeq);    
                    var newFacCode = facCode + newFacSeq;
                    logDebug("newFacCode " + newFacCode);    

                    aa.cap.updateCapAltID(capId, newFacCode);
                    logDebug("Updated record ID from: " + recordID + " to " + newFacCode);  
                }
            }
        }
    
    }    
}

	

