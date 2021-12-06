        /*------------------------------------------------------------------------------------------------------/
        | Program: BATCH_ADD_PIN
        |          Add PIN ID Number to records
        | Trigger: Batch    
        | Author: Accela
        | 
        | 
        /------------------------------------------------------------------------------------------------------*/
        /// TESTING ... REMOVE    
        //aa.env.setValue("emailAddress","jcrussell@accela.com");
        //aa.env.setValue("beginRecDt","2020-01-01");
        //aa.env.setValue("endRecDt","6/4/2021");
        //aa.env.setValue("pinCharLen","8");
        /// TESTING ... REMOVE    
        
        // Address limitation of Batch Parm default.
        // Setting this value explicit in code. 
        // Adjust as needed.

        var recTypesList = '';
        recTypesList += 'ConsumerAffairs/ID Cards/Appliance Repair ID Card-Sales/NA'
        recTypesList += ',ConsumerAffairs/ID Cards/Backflow Tester/NA'
        recTypesList += ',ConsumerAffairs/ID Cards/Board Up-Sales/NA'
        recTypesList += ',ConsumerAffairs/ID Cards/Home Improvement-Sales/NA'
        recTypesList += ',ConsumerAffairs/Licenses/Appliance Repair/NA'
        recTypesList += ',ConsumerAffairs/Licenses/Commercial Paint/NA'
        recTypesList += ',ConsumerAffairs/Licenses/Dry Cleaning/NA'
        recTypesList += ',ConsumerAffairs/Licenses/Electrical Inspector/NA'
        recTypesList += ',ConsumerAffairs/Licenses/Home Furnishing/NA'
        recTypesList += ',ConsumerAffairs/Licenses/Home Improvement/NA'
        recTypesList += ',ConsumerAffairs/Licenses/Liquid Waste/NA'
        recTypesList += ',ConsumerAffairs/Licenses/Master Electrician/NA'
        recTypesList += ',ConsumerAffairs/Licenses/Master Plumber/NA'
        recTypesList += ',ConsumerAffairs/Licenses/Pet Cemetary/NA'
        recTypesList += ',ConsumerAffairs/Licenses/Polygraph Examiner/NA'
        recTypesList += ',ConsumerAffairs/Licenses/Precious Metal/NA'
        recTypesList += ',ConsumerAffairs/Licenses/Restricted Electrical/NA'
        recTypesList += ',ConsumerAffairs/Licenses/Restricted Plumbing/NA'
        recTypesList += ',ConsumerAffairs/Licenses/Second Hand Dealer/NA'
        recTypesList += ',ConsumerAffairs/Licenses/Sign Hanger/NA'
        recTypesList += ',ConsumerAffairs/Licenses/Tax Grievance/NA'
        recTypesList += ',ConsumerAffairs/Registrations/Board Up/NA'
        recTypesList += ',ConsumerAffairs/Registrations/E-Cigarettes/NA'
        recTypesList += ',ConsumerAffairs/Registrations/Expeditor/NA'
        recTypesList += ',ConsumerAffairs/Registrations/Home Energy Auditor/NA'
        recTypesList += ',ConsumerAffairs/Registrations/Pet Grooming/Business'
        recTypesList += ',ConsumerAffairs/Registrations/Pet Grooming/Individual'
        recTypesList += ',ConsumerAffairs/Registrations/Swimming Pool Maintenance/NA'
        recTypesList += ',ConsumerAffairs/TLC/Complaints/NA'
        recTypesList += ',ConsumerAffairs/TLC/Drivers/New'
        recTypesList += ',ConsumerAffairs/TLC/Taxi/New'
        recTypesList += ',ConsumerAffairs/TLC/Vehicles/New'
        recTypesList += ',ConsumerAffairs/TLC/Violations/NA'
        aa.env.setValue("recordTypeList",recTypesList);


        

        /*-----------------------------------------------------------------------------------------------------/
        |
        | START : SET COMMON VALUES
        |
        /-----------------------------------------------------------------------------------------------------*/
        var showMessage = false;				// Set to true to see results in popup window
        var disableTokens = false;	
        var showDebug = true;					// Set to true to see debug messages in email confirmation
        var maxSeconds = 60 * 60 * 8;			// number of seconds allowed for batch processing. 60 sec * 60 min * num hrs
        var useAppSpecificGroupName = true;	// Use Group name when populating App Specific Info Values
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
        
        var pinFieldName = "PIN INFORMATION.PIN Number";
        /*----------------------------------------------------------------------------------------------------/
        |
        | Start: BATCH PARAMETERS
        |
        /------------------------------------------------------------------------------------------------------*/

        var emailAddress = getParam("emailAddress"); 
        var parmRecordTypeList = getParam("recordTypeList"); 
        var beginRecDt = getParam("beginRecDt");
        var endRecDt = getParam("endRecDt");
        var pinCharLen = getParam("pinCharLen");
        


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

            if(pinCharLen && pinCharLen != ""){
                pinCharLen = parseInt(pinCharLen);
                if(isNaN(pinCharLen)){
                    var e = new Error('Pin Char Len parm is not a number');
                    throw e;
                }
            }

            var wrkAr = getWork_records(parmRecordTypeList);
            if(!wrkAr || wrkAr.length<=0){
                logDebug("No Records matched query criterea.");
            }
            logDebug("RECORDS RETURNED  " + wrkAr.length);
            for(var iii in wrkAr){


                if (elapsed() > maxSeconds) { // only continue if time hasn't expired
                    logDebug("A script timeout has caused partial completion of this process.  Please re-run.  " + elapsed() + " seconds elapsed, " + maxSeconds + " allowed.") ;
                    timeExpired = true ;
                    break; 
                }


                var recIdPrts = wrkAr[iii];
                if(!recIdPrts || recIdPrts == null || recIdPrts == ""){
                    logDebug("A blank or null value was found in the list of Record Ids.");
                    continue;
                }
                recIdPrts = recIdPrts.split("-");
                //logDebug(recIdPrts[0] + "  " + recIdPrts[1] + "  " + recIdPrts[2]);
                capId = getCapIdLOCAL(recIdPrts[0],recIdPrts[1],recIdPrts[2]);
                if(!capId || capId == null){
                    logDebug("CAP could not be instantiated using " +recIdPrts[0]+"-"+recIdPrts[1]+"-"+recIdPrts[2]);
                    continue;
                }
                altId = capId.getCustomID();
                logDebug("#### Record Id: "+recIdPrts[0] + "-" + recIdPrts[1] + "-" + recIdPrts[2]+"   Alt Id: "+altId+"  ####");
                cap = aa.cap.getCap(capId).getOutput();
                if(!cap || cap == null){
                    logDebug("**ERROR: this is a Temp Record and will be skipped ... " + capId);
                    continue;
                }
                appTypeResult = cap.getCapType();
                appTypeString = appTypeResult.toString();
                appTypeArray = appTypeString.split("/");

                var isTemp =  altId.match(/^..TMP/) != null ;

                if(!isTemp){
                    var pinNumber = makePIN(pinCharLen);
                    if(editAppSpecificL('PIN INFORMATION.PIN Number',pinNumber,capId)){
                        logDebug("Success setting PIN value "  +  altId + "  " + pinNumber);
                    } else {
                        logDebug("DID NOT update PIN field. " +  altId);
                    }
                } else {
                    logDebug("We are skipping this Temp record " + altId);
                }

            }
        }



        function getWork_records(inRecTypesList){
            var rtnArr = [];
            var rSet;
            var sStmt;
            var conn;
            try{
                /* */
                var invalidParameter = false;
                var sqlFilterRecTy = "";
                var recListSplit = inRecTypesList.split(",");
                for(idxa in recListSplit){
                    var thisRecTyArr = (("" + recListSplit[idxa]).trim()).split("/");
                    for(idxb in thisRecTyArr){
                        if(idxb == 0){
                            if(thisRecTyArr[idxb].trim() == "" || thisRecTyArr[idxb].trim() == "*"){
                                logDebug("Record Type GROUP is either empty or is wild-card. This is not valid");
                                invalidParameter = true;
                                break;
                            } else {
                                if(idxa == 0){
                                    sqlFilterRecTy += " AND ( "
                                    sqlFilterRecTy += "( B1_PER_GROUP = '"+thisRecTyArr[idxb].trim()+"' ";
                                } else {
                                    sqlFilterRecTy += " OR ( B1_PER_GROUP = '"+thisRecTyArr[idxb].trim()+"' ";
                                }
                            }
                        }

                        if(idxb > 0){
                            if(thisRecTyArr[idxb].trim() == "" || thisRecTyArr[idxb].trim() == "*"){
                                // this is one of parts 2,3,4. It can be wild
                                // We will do no filtering if that is the case.
                                logDebug("Wild Card supplied for rect type part " + idxb+1);
                            } else {
                                if(idxb == 1){
                                    sqlFilterRecTy += " AND B1_PER_TYPE = '"+thisRecTyArr[idxb].trim()+"' ";
                                } else if(idxb == 2){
                                    sqlFilterRecTy += " AND B1_PER_SUB_TYPE = '"+thisRecTyArr[idxb].trim()+"' ";
                                } else if(idxb == 3){
                                    sqlFilterRecTy += " AND B1_PER_CATEGORY = '"+thisRecTyArr[idxb].trim()+"' ";
                                }
                            }
                        }
                    }

                    if(sqlFilterRecTy.trim() != "" && sqlFilterRecTy.trim().charAt(sqlFilterRecTy.trim().length -1) == "'"){
                        sqlFilterRecTy += ") ";
                    }
                }
                if(recListSplit.length > 0 && !invalidParameter){
                    sqlFilterRecTy += ") ";
                }
                
                /* */
                var bDt,eDt = null;
                if(beginRecDt != null && beginRecDt != ""){
                    bDt = getStrSqlDateFmt(beginRecDt,false);
                    if(!bDt){
                        invalidParameter = true;
                    }
                }
                if(endRecDt != null && endRecDt != ""){
                    eDt = getStrSqlDateFmt(endRecDt,true);
                    if(!eDt){
                        invalidParameter = true;
                    }
                }


                if(invalidParameter){
                    // Short Circuit
                    return rtnArr;
                }
                var selectString = "SELECT * ";
                selectString += "  FROM B1PERMIT    ";
                selectString += " WHERE SERV_PROV_CODE = '"+aa.getServiceProviderCode() +"'  "

                if(bDt){
                    selectString += "   AND REC_DATE >=  CONVERT(DATETIME, '"+bDt+"' , 120)";
                }
                

                if(eDt){
                    selectString += "   AND REC_DATE <= CONVERT(DATETIME, '"+eDt+"' , 120)";
                }
                
                selectString +=  sqlFilterRecTy ;
                
                selectString += "   AND REC_STATUS = 'A' ";
                
                //selectString += "   AND ROWNUM < 1000 ";
        



                logDebug(selectString);
                var conn = aa.db.getConnection();
                sStmt = aa.db.prepareStatement(conn,selectString); /* NEW WAY */
                rSet = sStmt.executeQuery();
                var counter = 0;
                while (rSet.next()) {
                    rtnArr.push(""+rSet.getString('B1_PER_ID1')+"-"+rSet.getString('B1_PER_ID2')+"-"+rSet.getString('B1_PER_ID3'));
                }  
            } catch(e){
                logDebug("**ERROR : Issue getting work " + e);
                return null;
            } finally{
                try{rSet.close();} catch(e){logDebug("err close rSet");}
                try{sStmt.close();} catch(e){logDebug("err close sStmt");}
                try{conn.close(); } catch(e){logDebug("err close conn");}
            }
            return rtnArr;
        }

        function getStrSqlDateFmt(sInDt,shouldAddDay){
            try{
                var ddt = aa.date.parseDate(sInDt);
                if(shouldAddDay){
                    ddt =  aa.date.parseDate(dateAdd(ddt,2));
                }
                return aa.util.formatDate(new Date(ddt.getEpochMilliseconds()),"yyyy-MM-dd") + " 00:00:00"
            } catch(ex){
                logDebug("**ERROR: Issue in function  'getStrSqlDateFmt' ... " + ex);
                return null;
            }

        }



        function editAppSpecificL(itemName,itemValue, itemCap){

            var itemGroup = null;

            if (useAppSpecificGroupName){
                if (itemName.indexOf(".") < 0){ logDebug("**WARNING: (editAppSpecific) requires group name prefix when useAppSpecificGroupName is true") ; return false }
                itemGroup = itemName.substr(0,itemName.indexOf("."));
                itemName = itemName.substr(itemName.indexOf(".")+1);
            }
            
            var asiFieldResult = aa.appSpecificInfo.getByList(itemCap, itemName);
            if(asiFieldResult.getSuccess()){
                var asiFieldArray = asiFieldResult.getOutput();
                if(asiFieldArray.length > 0){
                    var asiField = asiFieldArray[0];
                    if(asiField){
                        //printObjProperties(asiField);
                        var origAsiValue = asiField.getChecklistComment();
                        if(origAsiValue && origAsiValue != null && origAsiValue.trim() != ""){
                            logDebug("SKIPPING ... PIN Value alread set for record " + itemCap + " : " + origAsiValue);
                            return false;
                        }
                        asiField.setChecklistComment(itemValue);
                        asiField.setAuditStatus("A");
                        var updateFieldResult = aa.appSpecificInfo.editAppSpecInfoValue(asiField);
                        if(updateFieldResult.getSuccess()){
                            logDebug("Successfully updated custom field: " + itemName + " with value: " + itemValue);
                            return true;
                        } else { 
                            logDebug( "WARNING: (editAppSpecificL) " + itemName + " was not updated."); 
                            return false;
                        }	
                    } else { 
                        logDebug( "WARNING: (editAppSpecificL) " + itemName + " was not updated."); 
                        return false;
                    }
                }
            } else {
                logDebug("ERROR: (editAppSpecificL) " + asiFieldResult.getErrorMessage());
                return false;
            }
            return false;
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
        
        function makePIN(length) {
        var result = '';
        var characters = 'ABCDEFGHJKMNPQRTWXY2346789';
        var charactersLength = characters.length;
        for ( var i = 0; i < length; i++ ) {
            result += characters.charAt(Math.floor(Math.random() * charactersLength));
        }
        return result;
    }



