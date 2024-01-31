        /*------------------------------------------------------------------------------------------------------/
        | Program: BATCH_REFLP_FACILITYINFO_CREATE
        |          Use Facility Contact to create "Food Facility" Ref LP
        |          and added to the record.
        |
        | Trigger: Batch    
        | Author: Accela
        | 
        | 
        /------------------------------------------------------------------------------------------------------*/


        /*-----------------------------------------------------------------------------------------------------/
        |
        | START : SET COMMON VALUES
        |
        /-----------------------------------------------------------------------------------------------------*/
        var showMessage = false;				// Set to true to see results in popup window
        var disableTokens = false;	
        var showDebug = true;					// Set to true to see debug messages in email confirmation
        var maxSeconds = 60 * 60 * 15;			// number of seconds allowed for batch processing. 60 sec * 60 min * num hrs
        var useAppSpecificGroupName = false;	// Use Group name when populating App Specific Info Values
        var currentUserID = "ADMIN";
        var publicUser = null;
        var systemUserObj = aa.person.getUser("ADMIN").getOutput();
        var GLOBAL_VERSION = 2.0;
        var cancel = false;
        
        var vScriptName = aa.env.getValue("ScriptCode");
        var vEventName = aa.env.getValue("EventName");
        var timeExpired = false;
        var startDate = new Date();
        var startTime = startDate.getTime();
        var message =	"";						// Message String
        var debug = "";							// Debug String
        var br = "<BR>";						// Break Tag
        
        var SCRIPT_VERSION = 3.0;
        var emailText = "";

        var sysDate = aa.date.getCurrentDate();
        var batchJobID = aa.batchJob.getJobID().getOutput();
        var batchJobName = "" + aa.env.getValue("batchJobName");
        /*-----------------------------------------------------------------------------------------------------/
        |
        | END : SET COMMON VALUES
        |
        /-----------------------------------------------------------------------------------------------------*/
        /*-----------------------------------------------------------------------------------------------------/
        |
        | START : INCLUDES SOURCE
        |
        /-----------------------------------------------------------------------------------------------------*/
        
        var useSA = false;
        var SA = null;
        var SAScript = null;
        var bzr = aa.bizDomain.getBizDomainByValue("MULTI_SERVICE_SETTINGS","SUPER_AGENCY_FOR_EMSE"); 
        if (bzr.getSuccess() && bzr.getOutput().getAuditStatus() != "I") { 
            useSA = true;   
            SA = bzr.getOutput().getDescription();
            bzr = aa.bizDomain.getBizDomainByValue("MULTI_SERVICE_SETTINGS","SUPER_AGENCY_INCLUDE_SCRIPT"); 
            if (bzr.getSuccess()) { SAScript = bzr.getOutput().getDescription(); }
        }
        
        if (SA) {
            eval(getMasterScriptText("INCLUDES_ACCELA_FUNCTIONS",SA));
            eval(getMasterScriptText(SAScript,SA));
        }
        else {
            eval(getMasterScriptText("INCLUDES_ACCELA_FUNCTIONS"));
        }
        
        function getMasterScriptText(vScriptName)
        {
            var servProvCode = aa.getServiceProviderCode();
            if (arguments.length > 1) servProvCode = arguments[1]; // use different serv prov code
            vScriptName = vScriptName.toUpperCase();    
            var emseBiz = aa.proxyInvoker.newInstance("com.accela.aa.emse.emse.EMSEBusiness").getOutput();
            try {
                var emseScript = emseBiz.getMasterScript(aa.getServiceProviderCode(),vScriptName);
                return emseScript.getScriptText() + ""; 
            } 
            catch(err)
            {
                return "";
            }
        }
        
        function getScriptText(vScriptName)
        {
            var servProvCode = aa.getServiceProviderCode();
            if (arguments.length > 1) servProvCode = arguments[1]; // use different serv prov code
            vScriptName = vScriptName.toUpperCase();    
            var emseBiz = aa.proxyInvoker.newInstance("com.accela.aa.emse.emse.EMSEBusiness").getOutput();
            try {
                var emseScript = emseBiz.getScriptByPK(servProvCode,vScriptName,"ADMIN");
                return emseScript.getScriptText() + ""; 
            } 
            catch(err)
            {
                return "";
            }
        }
        
        if (String(aa.env.getValue("showDebug")).length > 0) {
            showDebug = aa.env.getValue("showDebug").substring(0, 1).toUpperCase().equals("Y");
        }
        // override showdebug
        showDebug = true;
        showMessage = false;
        
        //override = "function logDebug(dstr){ if(showDebug) { aa.print(dstr + \"<br>\"); } }";
        override = "function logDebug(dstr){ if(showDebug) { aa.print(dstr ); } }";
        eval(override);
        /*-----------------------------------------------------------------------------------------------------/
        |
        | END : INCLUDES SOURCE
        |
        /-----------------------------------------------------------------------------------------------------*/

        /*------------------------------------------------------------------------------------------------------/
        |
        | START: USER CONFIGURABLE PARAMETERS
        |
        /------------------------------------------------------------------------------------------------------*/

        /*------------------------------------------------------------------------------------------------------/
        |
        | END: USER CONFIGURABLE PARAMETERS
        |
        /------------------------------------------------------------------------------------------------------*/
        
        /*----------------------------------------------------------------------------------------------------/
        |
        | Start: BATCH PARAMETERS
        |
        /------------------------------------------------------------------------------------------------------*/

        /*------------------------------------------------------------------------------------------------------/
        | <===========Main=Loop================>
        | 
        /-----------------------------------------------------------------------------------------------------*/
        try{
            logDebug("Start of Job");
            mainProcess();
            logDebug("End of Job: Elapsed Time : " + elapsed() + " Seconds");
        } catch (err) {
            logDebug("ERROR: " + err.message + " In " + batchJobName + " Line " + err.lineNumber);
            logDebug("Stack: " + err.stack);
        }

        /*------------------------------------------------------------------------------------------------------/
        | <===========END=Main=Loop================>
        /-----------------------------------------------------------------------------------------------------*/
        function mainProcess() {
            var wrkAr = getWork_records();
            var total = 0;
            if(!wrkAr || wrkAr.length<=0){
                logDebug("No Records matched query criterea.");
            }
            logDebug("Number of records returned from query: " + wrkAr.length);
            for(var iii in wrkAr){
                if (elapsed() > maxSeconds) { // only continue if time hasn't expired
                    logDebug("A script timeout has caused partial completion of this process.  Please re-run.  " + elapsed() + " seconds elapsed, " + maxSeconds + " allowed.") ;
                    timeExpired = true ;
                    break; 
                }
                var parts = wrkAr[iii].split("~");
                if(parts.length != 4){
                    logDebug("Returned work @ sequence " + iii + " has an error. Continuing");
                    continue;
                } 
                capId = getCapIdLOCAL(parts[1], parts[2], parts[3]);
                altId = capId.getCustomID();

                // For testing on one specific record
                //if (altId == 'LMP-22-0012102')
                {
                cap = aa.cap.getCap(capId).getOutput();
                appTypeResult = cap.getCapType();
                appTypeString = appTypeResult.toString();
                appTypeArray = appTypeString.split("/");
                var licNumber = altId;
                //var licType = wcExpDate = getAppSpecific("Required License Type", capId);
                var licType = "Facility Information";
                var existingLp = getRefLicenseProf(licNumber, licType);
                if (existingLp) {
                    logDebug("The Ref LP Exists - Skipping " + altId);
                    continue;
                }
                var capContResult = aa.people.getCapContactByCapID(capId);
                if (capContResult.getSuccess()) {
                    contactArr = capContResult.getOutput();
                    if (!contactArr || contactArr.length <= 0) {
                        logDebug ("No contact available for " + altId + ". Skip.");
                    }
                    for (yy in contactArr) {
                        if ("Facility Contact".equals(contactArr[yy].getCapContactModel().getPeople().getContactType())) {
                            var facContact = contactArr[yy];
                            var facPerson = facContact.getPeople();

                            var capAddrResult = aa.address.getAddressByCapId(capId);
                            var addressLine1;    
                            var addressCity; 
                            var addressState; 
                            var addressZip;
                            var dbaName = getAppSpecific("Facility Name", capId);	
                            logDebug("*** RECORD: " + capId.getCustomID() + ", Facility Name: " + dbaName);

                            if (capAddrResult.getSuccess())
                            {   
                                var addresses = capAddrResult.getOutput();
                                if (addresses)
                                {      
                                    addressToUse = addresses[0];

                                    if (addressToUse)
                                    {
                                        addressLine1 = addressToUse.getAddressLine1();     
                                        addressDescription = addressToUse.getAddressDescription();     
                                        fullAddress  = addressToUse.getFullAddress();           
                                        addressStreetName = addressToUse.getStreetName();      
                                        addressCity = addressToUse.getCity();    
                                        addressState = addressToUse.getState();             
                                        addressZip = addressToUse.getZip();           

                                        // Street Address box
                                        addressStreetAddress = addressToUse.getFullAddress();
                                        // street #
                                        addressHouseNumberStart = addressToUse.getHouseNumberStart();	
                                        
                                        logDebug("Found address for: " + capId.getCustomID());         

                                        logDebug("Address Line 1: " + addressLine1);
                                        logDebug("Address City: " +  addressCity + ", Address State: " +  addressState + ", Zip: " + addressZip);
                                        logDebug("Street Address: " + addressStreetName + ", Street #: " +  addressHouseNumberStart);
                                        logDebug("Location Description: " + addressDescription);
                                        logDebug("Full Address: " + fullAddress);
                                    }        

                                }
                            }
                            

                            var newLic = getRefLicenseProf(licNumber, licType);
                            if(newLic){
                                logDebug("Existing DBA License found: " + licNumber + ". Skip.");
                                break;
                            }
                            // IF we are here we will create the Ref LP
                            newLic = aa.licenseScript.createLicenseScriptModel();
                            newLic.setStateLicense(licNumber);                           
                            newLic.setBusinessName(facPerson.getBusinessName());                            
                            newLic.setLicenseType("Food Facility");       
                            newLic.setBusinessName(dbaName);
                            newLic.setAddress1(fullAddress);        
                            newLic.setCity(addressCity);
                            newLic.setState(addressState);
                            newLic.setZip(addressZip);      
                            newLic.setAgencyCode(aa.getServiceProviderCode());
                            newLic.setAuditDate(sysDate);
                            newLic.setAuditID(currentUserID);
                            newLic.setAuditStatus("A");
                            newLic.setLicState("NY");
                          
                            var myResult = aa.licenseScript.createRefLicenseProf(newLic);
                           
                            if (myResult.getSuccess())
                            {
                                logDebug("Successfully added/updated License No. " + capId.getCustomID() + ", LP Type: Food Facility" );
                                total++;
                            }
                            // Associate this new Ref LP to the matched license record
                            assocResult = aa.licenseScript.associateLpWithCap(capId, newLic);
                            logDebug("Successfully created LP " + licNumber);
                            
                        } 
                    }
                } else {
                    logDebug ("**ERROR: getting cap contact: " + altId + "  --  " + capAddResult.getErrorMessage());
               }
            }
            }
            logDebug("Total LP added: " + total);
        }

        function getWork_records(){
            var rtnArr = [];
            var rSet;
            var sStmt;
            var conn;
            try{
                //var selectString = "";
                //selectString += "SELECT  ";
                //selectString += "       B1P.B1_ALT_ID ";
                //selectString += "     , B1P.B1_PER_ID1 ";
                //selectString += "     , B1P.B1_PER_ID2 ";
                //selectString += "     , B1P.B1_PER_ID3 ";
                //selectString += "  FROM B1PERMIT B1P "
                //selectString += "     , GPROCESS GPROC "
                //selectString += " WHERE 1 = 1 ";
                //selectString += "   AND B1P.SERV_PROV_CODE = '" + aa.getServiceProviderCode() +"' ";
                //selectString += "   AND B1P.B1_PER_ID1 = GPROC.B1_PER_ID1 ";
                //selectString += "   AND B1P.B1_PER_ID2 = GPROC.B1_PER_ID2 ";
                //selectString += "   AND B1P.B1_PER_ID3 = GPROC.B1_PER_ID3 ";
                //selectString += "   AND B1P.REC_STATUS = 'A' ";
                //selectString += "   AND B1P.B1_PER_GROUP = 'ConsumerAffairs' ";
                //selectString += "   AND B1P.B1_PER_TYPE = 'Complaint' ";
                //////selectString += "   AND B1P.B1_APPL_STATUS = 'Closed' ";
                //selectString += "   AND SD_CHK_LV1 = 'N' "; // Current Task Completion Flag 'Y' OR 'N'
                //selectString += "   AND SD_CHK_LV2 = 'Y' "; // Current Task Status 'Y' or 'N'
                ////selectString += "   AND SD_PRO_DES = 'Case Disposition-Notification' "  ;
                //selectString += "   AND SD_PRO_DES = 'Intake' "  ;
                ////selectString += "   AND SD_APP_DES = 'Complete' "  ;
                //selectString += "   AND SD_APP_DES = 'Completed' "  ;
                //selectString += "   AND ROWNUM < 200 ";

                var selectString = "";
                selectString += "SELECT  ";
                selectString += "       B1P.B1_ALT_ID ";
                selectString += "     , B1P.B1_PER_ID1 ";
                selectString += "     , B1P.B1_PER_ID2 ";
                selectString += "     , B1P.B1_PER_ID3 ";
                selectString += "  FROM B1PERMIT B1P ";
                selectString += "  WHERE B1P.b1_alt_id NOT IN (SELECT RECORD_ID FROM V_PROFESSIONAL) "   
                selectString += "   AND B1P.SERV_PROV_CODE = '" + aa.getServiceProviderCode() +"' ";
                selectString += "   AND B1P.REC_STATUS = 'A' ";
                selectString += "   AND B1P.B1_PER_GROUP = 'EnvHealth' ";
                selectString += "   AND B1P.B1_PER_TYPE = 'Health Program' ";               
                selectString += "   AND B1P.B1_PER_SUB_TYPE in ('Food Protection', 'Mobile') ";
                selectString += "   AND B1P.B1_PER_CATEGORY = 'Permit' ";
                selectString += "   AND B1P.B1_APPL_STATUS not in ('Inactive, non-billable', 'Temp inactive, non-billable') ";
                // below is for testing specific record ID only
                //selectString += " AND B1P.B1_ALT_ID = 'LMP-22-0012102' ";
                //selectString += "   AND B1P.B1_APPL_STATUS IN ('Assigned','Awaiting Response','Contract Under Review','In Collections External','In Mediation','In Review','Ongoing Investigation','Open Case','Pending Contact','Pending Contract Review','Pending Disposition','Pending Field Investigation','Pending Mediation','Ready for Assignment','To Mediation') ";
                //selectString += "   AND ROWNUM < 200 ";

            
                logDebug(selectString);                
                var conn = aa.db.getConnection();
                sStmt = aa.db.prepareStatement(conn,selectString); /* NEW WAY */
                rSet = sStmt.executeQuery();
                var counter = 0;
                while (rSet.next()) {
                    rtnArr.push(""+rSet.getString('B1_ALT_ID')+"~"+rSet.getString('B1_PER_ID1')+"~"+rSet.getString('B1_PER_ID2')+"~"+rSet.getString('B1_PER_ID3'));
                }  
            } catch(e){
                logDebug("**ERROR : Issue getting work " + e);
                printObjProperties(e);
                return null;
            } finally{
                try{rSet.close();} catch(e){logDebug("err close rSet");}
                try{sStmt.close();} catch(e){logDebug("err close sStmt");}
                try{conn.close(); } catch(e){logDebug("err close conn");}
            }
            return rtnArr;
        }

        /**
        Title : getRefLicenseProf
        Purpose : Look up a Reference License Professional
        Functional Area : Licensing
        Description : Look up a Reference License Professional by the License Number and Optional License Type
        Script Type : EMSE, Pageflow, Batch
        Call Example: getRefLicenseProf("RN17-00058","Nurse Practitioner");

        @param refstlic {String}
        @param [licenseType] {String}
        @return {refLicObj}
        */
        function getRefLicenseProf(refstlic,licenseType) {
            var refLicObj = null;
            var refLicenseResult = aa.licenseScript.getRefLicensesProfByLicNbr(aa.getServiceProviderCode(),refstlic);
            if (!refLicenseResult.getSuccess())
                { logDebug("**ERROR retrieving Ref Lic Profs : " + refLicenseResult.getErrorMessage()); return false; }
            else
                {
                var newLicArray = refLicenseResult.getOutput();
                if (!newLicArray) return null;
                for (var thisLic in newLicArray)
                    if(!matches(licenseType,null,undefined,"")){
                        if (refstlic.toUpperCase().equals(newLicArray[thisLic].getStateLicense().toUpperCase()) && 
                            licenseType.toUpperCase().equals(newLicArray[thisLic].getLicenseType().toUpperCase()))
                            refLicObj = newLicArray[thisLic];
                    }
                    else if (refstlic && newLicArray[thisLic] && refstlic.toUpperCase().equals(newLicArray[thisLic].getStateLicense().toUpperCase()))
                        refLicObj = newLicArray[thisLic];
                }

            return refLicObj;
        }

        function getCapIdLOCAL(s_id1, s_id2, s_id3) {
            var s_capResult = aa.cap.getCapID(s_id1, s_id2, s_id3);
            if (s_capResult.getSuccess())
                return s_capResult.getOutput();
            return null;
        }
        
        function printObjProperties(obj){
            var idx;
            if(obj.getClass != null){
                logDebug("************* " + obj.getClass() + " *************");
            }
            for(idx in obj){
                if (typeof (obj[idx]) == "function") {
                    try {
                        logDebug(idx + "==>  " + obj[idx]());
                    } catch (ex) {logDebug("!!! " +  ex.message); }
                } else {
                    try{
                        logDebug(idx + ":  " + obj[idx]);
                    } catch (err){logDebug("~~~ " +  err.message); }
                }
            }
        }

        function getParam(pParamName) //gets parameter value and logs message showing param value
        {
            var ret = "" + aa.env.getValue(pParamName);
            logDebug("Parameter : " + pParamName + " = " + ret);
            return ret;
        }

        function isNull(pTestValue, pNewValue) {
            if (pTestValue == null || pTestValue == "")
                return pNewValue;
            else
                return pTestValue;
        }

        function elapsed() {
            var thisDate = new Date();
            var thisTime = thisDate.getTime();
            return ((thisTime - startTime) / 1000);
        }
        



