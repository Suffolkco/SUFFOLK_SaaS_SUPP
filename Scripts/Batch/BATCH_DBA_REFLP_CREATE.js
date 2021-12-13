        /*------------------------------------------------------------------------------------------------------/
        | Program: BATCH_DBA_REFLP_CREATE
        |          Finds candidate Ref LPs. Using this collection, a 'DBA' version of the Ref LP is created
        |          and added to the same records as the candidate Ref LP.
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
        var maxSeconds = 60 * 60 * 8;			// number of seconds allowed for batch processing. 60 sec * 60 min * num hrs
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
        
        override = "function logDebug(dstr){ if(showDebug) { aa.print(dstr + \"<br>\"); } }";
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
            if(!wrkAr || wrkAr.length<=0){
                logDebug("No Ref LPs matched query criterea.");
            } else {
                logDebug("Rows Returned : " + wrkAr.length);
            }
            logDebug("ROWS RETURNED FROM GETWORK : " + wrkAr.length);
            for(var iii in wrkAr){

                if (elapsed() > maxSeconds) { // only continue if time hasn't expired
                    logDebug("A script timeout has caused partial completion of this process.  Please re-run.  " + elapsed() + " seconds elapsed, " + maxSeconds + " allowed.") ;
                    timeExpired = true ;
                    break; 
                }

                var resultParts = wrkAr[iii].split("~");
                if(resultParts.length != 2){
                    logDebug("**ERROR: There was a problem with row keys - Skipping " + wrkAr[iii]);
                    continue;
                } 

                var licNumber = resultParts[0];
                var licType = resultParts[1];

                var existingLp = getRefLicenseProf(licNumber, licType);
                if (!existingLp) {
                    logDebug("**ERROR: There was a problem getting Ref LP - Skipping " + wrkAr[iii]);
                    continue;
                }

                // Get the associated License record
                //printObjProperties(existingLp);
                var licenseRecord = null;
                var relatedRecords = aa.licenseScript.getCapIDsByLicenseModel(existingLp);
                if(relatedRecords.getSuccess()){
                    relatedRecords = relatedRecords.getOutput();
                    for(var idxa in relatedRecords){
                        capId = getCapIdLOCAL(relatedRecords[idxa].getID1(), relatedRecords[idxa].getID2(), relatedRecords[idxa].getID3());
                        altId = capId.getCustomID();
                        cap = aa.cap.getCap(capId).getOutput();
                        appTypeResult = cap.getCapType();
                        appTypeString = appTypeResult.toString();
                        appTypeArray = appTypeString.split("/");
                        // IN SUFFOLKCO THE ALT ID OF THE LICENSE RECORD IS WHAT IS USED FOR THE REF LP LICENSE NUMBER. 
                        // IF WE FIND A MATCH WE HAVE THE LICENSE RECORD
                        if(licNumber == altId){
                            //logDebug("MATCH ... " + altId + "   " + wrkAr[iii]);
                            // Get DBA Contact from the record and IF found, create a DBA Ref LP
                            var licExpDate = getAppSpecific("Expiration Date", capId);
                            var capContResult = aa.people.getCapContactByCapID(capId);
                            if (capContResult.getSuccess()) {
                                contactArr = capContResult.getOutput();
                                if (!contactArr || contactArr.length <= 0) {
                                    logDebug ("**WARNING: No contact available for " + altId);
                                }
                                for (yy in contactArr) {
                                    if ("DBA".equals(contactArr[yy].getCapContactModel().getPeople().getContactType())) {
                                        var dbaContact = contactArr[yy];
                                        var dbaPerson = dbaContact.getPeople();
                                        var dbaAddress = dbaPerson.getCompactAddress();
                                        dbaLicNum = "DBA_" + licNumber ;
                                        var newLic = getRefLicenseProf(dbaLicNum, licType);
                                        if(newLic){
                                            logDebug("Existing DBA License found " + dbaLicNum);
                                            break;
                                        }
                                        // IF we are here we will create the DBA Ref LP
                                        newLic = newLic = aa.licenseScript.createLicenseScriptModel();

                                        newLic.setStateLicense(dbaLicNum);
                                        newLic.setContactFirstName(dbaPerson.getFirstName());
                                        newLic.setContactLastName(dbaPerson.getLastName());
                                        newLic.setBusinessName(dbaPerson.getBusinessName());
                                        newLic.setAddress1(dbaAddress.getAddressLine1());
                                        newLic.setAddress2(dbaAddress.getAddressLine2());
                                        newLic.setAddress3(dbaAddress.getAddressLine3());
                                        newLic.setCity(dbaAddress.getCity());
                                        newLic.setState(dbaAddress.getState());
                                        newLic.setZip(dbaAddress.getZip());
                                        newLic.setPhone1(dbaPerson.getPhone1());
                                        newLic.setPhone2(dbaPerson.getPhone2());
                                        newLic.setPhone3(dbaPerson.getPhone3());
                                        newLic.setEMailAddress(dbaPerson.getEmail());
                                        newLic.setFax(dbaPerson.getFax());
                                        newLic.setAgencyCode(aa.getServiceProviderCode());
                                        newLic.setAuditDate(sysDate);
                                        newLic.setAuditID(currentUserID);
                                        newLic.setAuditStatus("A");
                                        if (licExpDate && licExpDate != ""){   
                                            newLic.setLicenseExpirationDate(aa.date.parseDate(licExpDate));
                                        }
                                        newLic.setLicenseType(licType);
                                        newLic.setLicState("NY");
                                        newLic.setMaskedSsn(dbaPerson.getSocialSecurityNumber());
                                        newLic.setSocialSecurityNumber(dbaPerson.getSocialSecurityNumber());
                                        bDate = dbaContact.getCapContactModel().getBirthDate();
                                        issueDate = getAppSpecific("Issued Date");
                                        if (issueDate && issueDate != ""){
                                            newLic.setLicenseIssueDate(aa.date.parseDate(issueDate));
                                        }
                                        insCo = getAppSpecific("Insurance Agent", capId)
                                        if (insCo && insCo != ""){
                                            newLic.setInsuranceCo(insCo);
                                        }
                                        insPolicy = getAppSpecific("Insurance Policy", capId);
                                        if (insPolicy && insPolicy != ""){
                                            newLic.setPolicy(insPolicy);
                                        } 
                                        insExpDate = getAppSpecific("Policy Expiration Date", capId);
                                        if (insExpDate && insExpDate != ""){
                                            newLic.setInsuranceExpDate(aa.date.parseDate(insExpDate));
                                        } 
                                        wcInsPolicy = getAppSpecific("Workers Comp #", capId);
                                        if (wcInsPolicy && wcInsPolicy != ""){
                                            newLic.setWcPolicyNo(wcInsPolicy);
                                        } 
                                        wcExpDate = getAppSpecific("Workers Comp Expiration Date", capId);
                                        if (wcExpDate && wcExpDate != ""){
                                            newLic.setWcExpDate(aa.date.parseDate(wcExpDate));
                                        }
                                        fein = getAppSpecific("Federal Tax ID #", capId);
                                        if (fein && fein != ""){
                                            newLic.setFein(fein);
                                        } 
                                        if (bDate) {
                                            var sdtBirthDate = dateFormatted(1+bDate.getMonth(), bDate.getDate(), 1900+bDate.getYear(), "");
                                        }

                                        var myResult = aa.licenseScript.createRefLicenseProf(newLic);
                                        if (myResult.getSuccess()) {
                                            var bWebSite = getAppSpecific("Business Website", capId);
                                            if (bWebSite && bWebSite != "")
                                                editRefLicProfAttribute(dbaLicNum,"BUSINESS WEBSITE",bWebSite);
                                            var cArrears = getAppSpecific("Child Support Arrears", capId);
                                            if (cArrears == "CHECKED")
                                                editRefLicProfAttribute(dbaLicNum, "CHILD SUPPORT ARREARS", "Yes");
                                            var nysID = getAppSpecific("NYS Sales Tax ID #", capId);
                                            if (nysID && nysID != "") 
                                                editRefLicProfAttribute(dbaLicNum, "NYS SALES TAX ID #", nysID);
                                            var dli = getAppSpecific("Driver License Info", capId);
                                            if (dli && dli != "")
                                                editRefLicProfAttribute(dbaLicNum, "DRIVER LICENSE INFO", dli);
                                            var coNum = getAppSpecific("Company Affiliation License Number", capId);
                                            if (coNum && coNum != "")
                                                editRefLicProfAttribute(dbaLicNum, "LICENSE NUMBER",coNum);	
                                            if (bDate) {
                                                var sdtBirthDate = dateFormatted(1+bDate.getMonth(), bDate.getDate(), 1900+bDate.getYear(), "");
                                                editRefLicProfAttribute(dbaLicNum, "BIRTH DATE", sdtBirthDate);	
                                            }
                                            
                                            // Associate this new Ref LP to the matched license record
                                            assocResult = aa.licenseScript.associateLpWithCap(capId, newLic);
                                            
                                            logDebug("Successfully created LP " + dbaLicNum);
                                        }
                                        
                                        break;
                                    }
                                }
                            } else {
                                logDebug ("**ERROR: getting cap contact: " + altId + "  --  " + capAddResult.getErrorMessage());
                            }
                            break;
                        } 
                    }
                }
            }
        }



        function getWork_records(){
            var rtnArr = [];
            var rSet;
            var sStmt;
            var conn;
            try{
                var selectString = "";
                selectString += "SELECT RSTATELIC.LIC_NBR ";
                selectString += "     , RSTATELIC.LIC_TYPE ";
                selectString += "  FROM RSTATE_LIC RSTATELIC   ";
                selectString += "     , B1PERMIT B1P "
                selectString += "     , B3CONTACT B3C ";
                selectString += " WHERE 1 = 1 ";
                selectString += "   AND RSTATELIC.SERV_PROV_CODE = '" + aa.getServiceProviderCode() +"'  ";

                selectString += "   AND B1P.SERV_PROV_CODE = '" + aa.getServiceProviderCode() +"' ";
                selectString += "   AND B1P.B1_ALT_ID = RSTATELIC.LIC_NBR  ";

                selectString += "   AND B3C.SERV_PROV_CODE = '" + aa.getServiceProviderCode() +"' ";
                selectString += "   AND B3C.B1_PER_ID1 = B1P.B1_PER_ID1 ";
                selectString += "   AND B3C.B1_PER_ID2 = B1P.B1_PER_ID2  ";
                selectString += "   AND B3C.B1_PER_ID3 = B1P.B1_PER_ID3 ";
                selectString += "   AND B3C.B1_CONTACT_TYPE = 'DBA' ";

                selectString += "   AND RSTATELIC.REC_STATUS = 'A' ";
                selectString += "   AND RSTATELIC.LIC_TYPE IN('Appliance Repair ID Card-Sales','Backflow Tester','Board Up-Sales','Home Improvement-Sales','Appliance Repair','Commercial Paint','Dry Cleaning','Electrical Inspector','Home Furnishing','Home Improvement','Liquid Waste','Master Electrician','Master Plumber','Pet Cemetary','Polygraph Examiner','Precious Metal','Restricted Electrical','Restricted Plumbing','Second Hand Dealer','Sign Hanger','Tax Grievance','Board Up','E-Cigarettes','Expeditor','Home Energy Auditor','Pet Grooming','Swimming Pool Maintenance') ";
                selectString += "   AND ROWNUM < 5000 ";
            
                logDebug(selectString);                
                var conn = aa.db.getConnection();
                sStmt = aa.db.prepareStatement(conn,selectString); /* NEW WAY */
                rSet = sStmt.executeQuery();
                var counter = 0;
                while (rSet.next()) {
                    rtnArr.push(""+rSet.getString('LIC_NBR')+"~"+rSet.getString('LIC_TYPE'));
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
        



