//IRSA:DEQ/GENERAL/SITE/NA

// EHIMS-4948:
showDebug = true;
if (inspResult == "Completed" || inspResult == "Incomplete")
{
    var primEmailAddress = "";
    var secEmailAddress = "";
    var lastEmailAddress = "";
    var emailAddress = "";
    var params = aa.util.newHashtable();
    getRecordParams4Notification(params);
    //addParameter(params, "$$inspection$$", inspSeq);
    var contactArray = getContactArray(capId);
        
    // For SPDES: SPDES contact first, if not then Property Owner, If not then Operator.
    if (inspType == "OPC SPDES Inspection")
    {                   
        for (iCon in contactArray)
        {
            if (contactArray[iCon].contactType == "SPDES Site Contact")
            {                
                primEmailAddress = contactArray[iCon].email;
            }
            else if (contactArray[iCon].contactType == "Property Owner")
            {                
                secEmailAddress = contactArray[iCon].email;
            }
            else if (contactArray[iCon].contactType == "Operator")
            {               
                lastEmailAddress  = contactArray[iCon].email;            
            } 
        }            
       
        logDebug("Found email from SPDES Site Contact, Property Owner, Operator " + primEmailAddress + ": " + secEmailAddress + ": " + lastEmailAddress);
        
    }
    else if (inspType == "OPC Dry Cleaner Inspection")
    {    
        // Dry Cleaner: Dry Cleaner contact first, if not then Operator, if not then Property owner,            
        for (iCon in contactArray)
        {
            if (contactArray[iCon].contactType == "Dry Cleaner Business Owner")
            {                
                primEmailAddress = contactArray[iCon].email;
            }
            else if (contactArray[iCon].contactType == "Operator")
            {                
                secEmailAddress = contactArray[iCon].email;
            }
            else if (contactArray[iCon].contactType ==  "Property Owner")
            {               
                lastEmailAddress  = contactArray[iCon].email;            
            } 
        }
        logDebug("Found email from Dry Cleaner Business Owner, Operator, Property Owner" + primEmailAddress + ": " + secEmailAddress + ": " + lastEmailAddress);
    }   
    // Find the correct email
    if (primEmailAddress != "")
    {
        emailAddress = primEmailAddress;
        logDebug("Primary contact email is being used: " + emailAddress);
    }
    else if (primEmailAddress == "" && secEmailAddress != "")
    {
        emailAddress = secEmailAddress;
        logDebug("Secondary email is being used: " + emailAddress);
    }
    else if (primEmailAddress == "" && secEmailAddress == "" && lastEmailAddress != "")
    {
        emailAddress = primEmailAddress
        logDebug("Third email is being used: " + emailAddress);
    }
    else
    {
        logDebug("No contact or email is found to send email.");
    }

    // Prepare to attach report and send email to contact
    if (emailAddress != "")
    {
        var emailParams = aa.util.newHashtable();
        var reportParams = aa.util.newHashtable();
        var reportFile = new Array();
        var rFiles = new Array();
        var alternateID = capId.getCustomID();

        var year = inspObj.getInspectionDate().getYear();
        var month = inspObj.getInspectionDate().getMonth();
        var day = inspObj.getInspectionDate().getDayOfMonth();
        var hr = inspObj.getInspectionDate().getHourOfDay() - 1;
        var min = inspObj.getInspectionDate().getMinute();
        var sec = inspObj.getInspectionDate().getSecond();
       
        logDebug("Inspection DateTime: " + year + "-" + month + "-" + day + " " + hr + ':' + min + ":" + sec + ".0");
       
        var inspectionDateCon = year + "-" + month + "-" + day + " " + hr + ':' + min + ":" + sec + ".0";
        logDebug("capId: " + capId);
        logDebug("inspectionDateCon: " + inspectionDateCon);       
        addParameter(reportParams, "RecordID", alternateID.toString());
        addParameter(reportParams, "InspDate", inspectionDateCon);
        addParameter(reportParams, "InspType", inspType);

        rFile = generateReportBatch(capId, "OPC Inspection Summary Script", 'DEQ', reportParams)
        logDebug("This is the rFile: " + rFile);

        if (rFile)
        {            
            rFiles.push(rFile);
            getRecordParams4Notification(emailParams);
            addParameter(emailParams, "$$altID$$", capId.getCustomID());           
           
        }
        // Send email 
        var s_result = aa.address.getAddressByCapId(capId);
        if (s_result.getSuccess())
        {
            capAddresses = s_result.getOutput();
        }

        addParameter(emailParams, "$$CAPAlias$$", cap.getCapType().getAlias());
        addParameter(emailParams, "$$altID$$", capId.getCustomID());
        //var fileRefNo = getAppSpecific("File Reference Number", capId);
        addParameter(emailParams, "$$fileRefNum$$", capId.getCustomID());
        var appName = cap.getSpecialText();
        addParameter(emailParams, "$$FacName$$", appName);
        

        //gathering inspectors name from this current Site inspection
        var inspInspObj = inspObj.getInspector();
        if (inspInspObj)
        {
            var inspInspector = inspInspObj.getUserID();
            if (inspInspector)
            {
                inspInspectorObj = aa.person.getUser(inspInspector).getOutput();
                if (inspInspectorObj != null)
                {
                    var vInspectorName = inspInspectorObj.getFirstName() + " " + inspInspectorObj.getLastName();
                    logDebug("vinspectorname is: " + vInspectorName);
                    addParameter(emailParams, "$$AssignInspector$$", vInspectorName);                 
                    var vInspectorPhone = inspInspectorObj.getPhoneNumber();
                    logDebug("vInspectorPhone is: " + vInspectorPhone);
                    addParameter(emailParams, "$$phone$$", vInspectorPhone);         
                    var vInspectorEmail = inspInspectorObj.getEmail();

                    if (emailAddress == "" || emailAddress == null)
                    {
                        emailAddress = vInspectorEmail;
                        logDebug("No contact email is found. Use inspector email: " + vInspectorEmail);
                    }
                    
                    logDebug("vInspectorEmail is: " + vInspectorEmail);
                    addParameter(emailParams, "$$email$$", vInspectorEmail);       
                }
            }
        }

        if (capAddresses != null)
        {
            addParameter(emailParams, "$$address$$", capAddresses[0]);
        }
         // Send email to the corresponding contact
         // enable to rfiles when the report is fixed by WIll
         //sendNotification("", "ada.chan@suffolkcountyny.gov", "", "DEQ_OPC_INSPECTION_REPORT", emailParams, rFiles);
         sendNotification("", emailAddress, "", "DEQ_OPC_INSPECTION_REPORT", emailParams, rFiles);

    }
}

// EHIMS-4805:
if (inspResult == "Completed" || inspResult == "Fail")
{
    if (inspType == "OPC Non-PBS Site OP Inspection" ||
        inspType == "OPC Non-PBS Site Other Inspection" ||
        inspType == "OPC Non-PBS Site Re-Inspection" ||
        inspType == "OPC PBS Site GSR Inspection" ||
        inspType == "OPC PBS Site OP Inspection" ||
        inspType == "OPC PBS Site Other Inspection" ||
        inspType == "OPC PBS Site Re-Inspection")
    {

        /*inspId 566672
        inspResult = Fail
        inspComment = null
        inspResultDate = 2/24/2022
        inspGroup = DEQ_TANKMON
        inspType = Non-PBS Tank OP Inspection
        inspSchedDate = 2/24/2022*/

        var emailParams = aa.util.newHashtable();
        var reportParams = aa.util.newHashtable();
        var reportFile = new Array();
        var alternateID = capId.getCustomID();

        //insps[i].getInspectionDate()
        inspModel = inspObj.getInspection();

        //reportParams.put("InspectionDate",  inspObj.getInspectionDate());
        //inspDate = inspObj.getInspectionDate();

        logDebug("inspResultDate: " + inspResultDate);
        logDebug("inspection object date: " + inspObj.getInspectionDate());
        logDebug("inspection object date: " + inspObj.getInspectionDate());
        logDebug("alternateID: " + alternateID.toString());
        logDebug("inspSchedDate: " + inspSchedDate);
        var year = inspObj.getInspectionDate().getYear();
        var month = inspObj.getInspectionDate().getMonth();
        var day = inspObj.getInspectionDate().getDayOfMonth();
        var hr = inspObj.getInspectionDate().getHourOfDay() - 1;
        var min = inspObj.getInspectionDate().getMinute();
        var sec = inspObj.getInspectionDate().getSecond();

        //logDebug("Inspection DateTime: " + month + "/" + day + "/" + year + "Hr: " +  hr + ',' + min + "," + sec);
        logDebug("Inspection DateTime: " + year + "-" + month + "-" + day + " " + hr + ':' + min + ":" + sec + ".0");

        var inspectionDateCon = year + "-" + month + "-" + day + " " + hr + ':' + min + ":" + sec + ".0";

        logDebug("capId: " + capId);
        logDebug("inspectionDateCon: " + inspectionDateCon);
        //var retVal = new Date(String(inspectionDateCon));
        //logDebug("retVal Date: " + retVal);
        addParameter(reportParams, "SiteRecordID", alternateID.toString());
        addParameter(reportParams, "InspectionDate", inspectionDateCon);
        addParameter(reportParams, "InspectionType", inspType);

        rFile = generateReportBatch(capId, "Facility Inspection Summary Report", 'DEQ', reportParams)
        logDebug("This is the rFile: " + rFile);

        if (rFile)
        {
            var rFiles = new Array();
            rFiles.push(rFile);

            getRecordParams4Notification(emailParams);
            addParameter(emailParams, "$$altID$$", capId.getCustomID());
            // Per OPC request, do you send email to Mike since daily batch script already does
            //sendNotification("", "Michael.Seaman@suffolkcountyny.gov", "", "DEQ_OPC_HAZARDOUS_TANK_INSPECTION", emailParams, rFiles);
        }
    }
}

//EHIMS2-77
//Code Enforcement Scripting
inspTypeCap = inspType.toUpperCase()
logDebug("Insp Type Cap: " + inspTypeCap);

if (matches(inspTypeCap, 
    "OPC NON-PBS SITE GSR INSPECTION", "OPC PBS SITE GSR INSPECTION",
    "OPC PBS SITE OP INSPECTION", "OPC NON-PBS SITE OP INSPECTION", 
    "OPC PBS SITE OTHER INSPECTION", "OPC NON-PBS SITE OTHER INSPECTION",
    "OPC PBS SITE RE-INSPECTION", "OPC NON-PBS SITE RE-INSPECTION", 
    "OPC PBS TANK ENF-REQ INSPECTION",  "OPC NON-PBS TANK ENF-REQ INSPECTION",
    "OPC PBS SITE ENF-REQ INSPECTION", "OPC NON-PBS SITE ENF-REQ INSPECTION"))
{
    if (inspResult == "Violations Found")
    {
        //looking for Child records of the Site that match the Code Enforcement structure
        var childEnfRecordArray = getChildrenLocal("DEQ/OPC/Enforcement/NA", capId);
        logDebug("childenfrecordarray is: " + childEnfRecordArray);

        if (matches(childEnfRecordArray, null, undefined, ""))
        {
            //if there are none, then we create a new one
            var enfChild = createChildLocal("DEQ", "OPC", "Enforcement", "NA");
            logDebug("Enforcement record created: " + enfChild.getCustomID());
            //copying parcel, address, ASIs, appname, projdesc
            copyParcel(capId, enfChild);
            copyAddress(capId, enfChild);
            var siteAltId = capId.getCustomID();
            editAppSpecific("Site/Pool (Parent) Record ID", siteAltId, enfChild);
            var fileRefNumber = getAppSpecific("File Reference Number", capId);
            editAppSpecific("File Reference Number/Facility ID", fileRefNumber, enfChild);
            var appName = getAppName();
            var projDesc = workDescGet(capId);
            editAppName(appName, enfChild);
            updateWorkDesc(projDesc, enfChild);
            var reportParams = aa.util.newHashtable();
            var alternateID = capId.getCustomID();
            var year = inspObj.getInspectionDate().getYear();
            var month = inspObj.getInspectionDate().getMonth();
            var day = inspObj.getInspectionDate().getDayOfMonth();
            var hr = inspObj.getInspectionDate().getHourOfDay();
            var min = inspObj.getInspectionDate().getMinute();
            var sec = inspObj.getInspectionDate().getSecond();
            var inspectionDateForm = (month) + "/" + day + "/" + (year);
            logDebug("inspectionDateForm 1 is: " + inspectionDateForm);
            assignTaskCustom("Violation Review", "MSEAMAN", enfChild);
           
            //gathering inspectors name from this current Site inspection
            var inspInspectorObj = inspObj.getInspector();
            if (inspInspectorObj)
            {
                var inspInspector = inspInspectorObj.getUserID();
                if (inspInspector)
                {
                    inspInspectorObj = aa.person.getUser(inspInspector).getOutput();
                    if (inspInspectorObj != null)
                    {
                        var vInspectorName = inspInspectorObj.getFirstName() + " " + inspInspectorObj.getLastName();
                        logDebug("vinspectorname is: " + vInspectorName);
                    }
                }
            }

            var insp = aa.inspection.getInspection(capId, inspId).getOutput();
            var vInspectionActivity = insp.getInspection().getActivity();

            var guideBiz = aa.proxyInvoker.newInstance("com.accela.aa.inspection.guidesheet.GGuideSheetBusiness").getOutput();
            var vGuideSheetArray = guideBiz.getGGuideSheetWithItemsByInspections("", [vInspectionActivity]).toArray();
            if (vGuideSheetArray.length != 0)
            {
                var x = 0;
                for (x in vGuideSheetArray)
                {
                    var vGuideSheet = vGuideSheetArray[x];
                    vGuideSheetItemsArray = vGuideSheet.getItems().toArray();
                    var z = 0;
                    for (z in vGuideSheetItemsArray)
                    {
                        var vGuideSheetItem = vGuideSheetItemsArray[z];
                        //checking some checklist items to see which have comments (these have violations on them)
                        if (vGuideSheetItem && !matches(vGuideSheetItem.getGuideItemComment(), null, undefined, "", " "))
                        {
                            var guideVioArray = new Array();
                            var guideItemDetails = new Array();
                            //gathering those checklist item numbers and comment text from those checklist items

                            var checklistItemWhole = vGuideSheetItem.getGuideItemText();
                            checklistItemWhole = String(checklistItemWhole).split(".");
                            var checklistItemNo = checklistItemWhole[0];
                            logDebug("preferred checklist item text is: " + checklistItemNo);

                            var checklistItemComment = vGuideSheetItem.getGuideItemComment();
                            logDebug("checklist item comment is: " + checklistItemComment);
                            //pushing all of the checklist, inspection, and 
                            var newRow = new Array();
                            newRow["Inspection Type"] = inspType;
                            newRow["SITE Record ID"] = alternateID;
                            newRow["SCDHS Tank Number"] = "N/A";
                            newRow["Product Store Label"] = "N/A";
                            newRow["Capacity"] = "N/A";
                            newRow["Tank Location Label"] = "N/A";
                            newRow["Item Number"] = checklistItemNo;
                            newRow["Inspector Finding"] = checklistItemComment;
                            newRow["Inspection Date"] = inspectionDateForm;
                            newRow["Inspector"] = vInspectorName;
                            newRow["Appendix A"] = "CHECKED";
                            logDebug("newRow appendix a is: " + newRow["Appendix A"]);
                            addRowToASITable("ARTICLE 12 TANK VIOLATIONS", newRow, enfChild);
                        }
                    }
                }
            }

            //logDebug("Inspection DateTime: " + month + "/" + day + "/" + year + "Hr: " +  hr + ',' + min + "," + sec);
            logDebug("Inspection DateTime: " + year + "-" + month + "-" + day + " " + hr + ':' + min + ":" + sec + ".0");

            var inspectionDateCon = year + "-" + month + "-" + day + " " + hr + ':' + min + ":" + sec + ".0";

            addParameter(reportParams, "SiteRecordID", alternateID.toString());
            addParameter(reportParams, "InspectionDate", inspectionDateCon);
            addParameter(reportParams, "InspectionType", inspType);
            generateReportBatch(enfChild, "Facility Inspection Summary Report Script", 'DEQ', reportParams);
        }
        else
        {
            var reportParams = aa.util.newHashtable();
            var childrenToUpdate = new Array();
            
            for (cr in childEnfRecordArray)
            {
                //get file date of each and take a diff to see if it's been opened in the last 7 days
                var childEnfRecord = childEnfRecordArray[cr];
                logDebug("child enf record ID is: " + childEnfRecord.getCustomID());
                var childDate = aa.cap.getCap(childEnfRecord).getOutput().getFileDate();

                if (childDate != null)
                {
                    var childDateToPrint = childDate.getMonth() + "/" + childDate.getDayOfMonth() + "/" + childDate.getYear();
                    logDebug("childDateToPrint is: " + childDateToPrint);
                    var startDate = new Date();
                    var startTime = startDate.getTime();
                    var todayDate = (startDate.getMonth() + 1) + "/" + startDate.getDate() + "/" + startDate.getFullYear();
                    var dateDif = parseFloat(dateDiff(todayDate, childDate));
                    var dateDifRound = Math.floor(dateDif);
                    logDebug("date diff is: " + dateDifRound);
                    logDebug("Record was created less than 7 days ago");
                    var childRecCapType = aa.cap.getCap(childEnfRecordArray[cr]).getOutput().getCapType();
                    logDebug("childreccaptype is: " + childRecCapType);
                    var presentChildEnfType = getAppSpecific("Enforcement Type", childEnfRecordArray[cr]);

                    if (dateDifRound >= -7 && childRecCapType == "DEQ/OPC/Enforcement/NA" && matches(presentChildEnfType, "", null, undefined, "EE", "T8"))
                    {
                        childrenToUpdate.push(childEnfRecordArray[cr]);
                    }
                }
            }

            if (!matches(childrenToUpdate, undefined, null, ""))
            {
                var maxDate;
                var updateChildFileDates = new Array();

                for (child in childrenToUpdate)
                {
                    var childFile = aa.cap.getCap(childrenToUpdate[child]).getOutput().getFileDate().getEpochMilliseconds();
                    updateChildFileDates.push(childFile);
                    logDebug("childfile is: " + childFile);
                    logDebug("updatechildfiledates is: " + updateChildFileDates);
                    maxDate = Math.max.apply(null, updateChildFileDates);
                    logDebug("maxdate is: " + maxDate);

                    if (childFile == maxDate)
                    {
                        var childCapToUse = childrenToUpdate[child];
                        logDebug("we found this altid to use: " + childCapToUse.getCustomID());
                    }
                }

                var alternateID = capId.getCustomID();
                var year = inspObj.getInspectionDate().getYear();
                var month = inspObj.getInspectionDate().getMonth();
                var day = inspObj.getInspectionDate().getDayOfMonth();
                var hr = inspObj.getInspectionDate().getHourOfDay();
                var min = inspObj.getInspectionDate().getMinute();
                var sec = inspObj.getInspectionDate().getSecond();
                var inspectionDateForm = (month) + "/" + day + "/" + (year);
            logDebug("inspectionDateForm 1 is: " + inspectionDateForm);
                var inspInspectorObj = inspObj.getInspector();
                if (inspInspectorObj)
                {
                    var inspInspector = inspInspectorObj.getUserID();
                    if (inspInspector)
                    {
                        inspInspectorObj = aa.person.getUser(inspInspector).getOutput();
                        if (inspInspectorObj != null)
                        {
                            var vInspectorName = inspInspectorObj.getFirstName() + " " + inspInspectorObj.getLastName();
                            logDebug("vinspectorname is: " + vInspectorName);
                        }
                    }
                }

                var insp = aa.inspection.getInspection(capId, inspId).getOutput();
                var vInspectionActivity = insp.getInspection().getActivity();

                var guideBiz = aa.proxyInvoker.newInstance("com.accela.aa.inspection.guidesheet.GGuideSheetBusiness").getOutput();
                var vGuideSheetArray = guideBiz.getGGuideSheetWithItemsByInspections("", [vInspectionActivity]).toArray();
                if (vGuideSheetArray.length != 0)
                {
                    var x = 0;
                    for (x in vGuideSheetArray)
                    {
                        var vGuideSheet = vGuideSheetArray[x];
                        vGuideSheetItemsArray = vGuideSheet.getItems().toArray();
                        var z = 0;
                        for (z in vGuideSheetItemsArray)
                        {
                            var vGuideSheetItem = vGuideSheetItemsArray[z];
                            if (vGuideSheetItem && !matches(vGuideSheetItem.getGuideItemComment(), null, undefined, "", " "))
                            {
                                var guideVioArray = new Array();
                                var guideItemDetails = new Array();

                                var checklistItemWhole = vGuideSheetItem.getGuideItemText();
                                checklistItemWhole = String(checklistItemWhole).split(".");
                                var checklistItemNo = checklistItemWhole[0];
                                logDebug("preferred checklist item text is: " + checklistItemNo);

                                var checklistItemComment = vGuideSheetItem.getGuideItemComment();
                                logDebug("checklist item comment is: " + checklistItemComment);

                                var newRow = new Array();
                                newRow["Inspection Type"] = inspType;
                                newRow["SITE Record ID"] = alternateID;
                                newRow["SCDHS Tank Number"] = "N/A";
                                newRow["Product Store Label"] = "N/A";
                                newRow["Capacity"] = "N/A";
                                newRow["Tank Location Label"] = "N/A";
                                newRow["Item Number"] = checklistItemNo;
                                newRow["Inspector Finding"] = checklistItemComment;
                                newRow["Inspection Date"] = inspectionDateForm;
                                newRow["Inspector"] = vInspectorName;
                                newRow["Appendix A"] = "CHECKED";
                                logDebug("newRow appendix a is: " + newRow["Appendix A"]);

                                addRowToASITable("ARTICLE 12 TANK VIOLATIONS", newRow, childCapToUse);
                            }
                        }
                    }
                }
                var inspectionDateCon = year + "-" + month + "-" + day + " " + hr + ':' + min + ":" + sec + ".0";
                addParameter(reportParams, "SiteRecordID", alternateID.toString());
                addParameter(reportParams, "InspectionDate", inspectionDateCon);
                addParameter(reportParams, "InspectionType", inspType);
                logDebug("report params are: " + reportParams);
                generateReportBatch(childCapToUse, "Facility Inspection Summary Report Script", 'DEQ', reportParams);

            }

            else
            //this means that there is an existing Enforcement child record but it does not meet the criteria to be updated, so we're making another one. we should do all the normal copy routines here
            {
                var enfChild = createChildLocal("DEQ", "OPC", "Enforcement", "NA");
                copyParcel(capId, enfChild);
                copyAddress(capId, enfChild);
                var siteAltId = capId.getCustomID();
                editAppSpecific("Site/Pool (Parent) Record ID", siteAltId, enfChild);
                var fileRefNumber = getAppSpecific("File Reference Number", capId);
                editAppSpecific("File Reference Number/Facility ID", fileRefNumber, enfChild);
                var appName = getAppName();
                var projDesc = workDescGet(capId);
                editAppName(appName, enfChild);
                updateWorkDesc(projDesc, enfChild);
                var reportParams = aa.util.newHashtable();
                var alternateID = capId.getCustomID();
                var year = inspObj.getInspectionDate().getYear();
                var month = inspObj.getInspectionDate().getMonth();
                var day = inspObj.getInspectionDate().getDayOfMonth();
                var hr = inspObj.getInspectionDate().getHourOfDay();
                var min = inspObj.getInspectionDate().getMinute();
                var sec = inspObj.getInspectionDate().getSecond();
                var inspectionDateForm = (month) + "/" + day + "/" + (year);
            logDebug("inspectionDateForm 1 is: " + inspectionDateForm);
                assignTaskCustom("Violation Review", "MSEAMAN", enfChild);

                var inspInspectorObj = inspObj.getInspector();
                if (inspInspectorObj)
                {
                    var inspInspector = inspInspectorObj.getUserID();
                    if (inspInspector)
                    {
                        inspInspectorObj = aa.person.getUser(inspInspector).getOutput();
                        if (inspInspectorObj != null)
                        {
                            var vInspectorName = inspInspectorObj.getFirstName() + " " + inspInspectorObj.getLastName();
                            logDebug("vinspectorname is: " + vInspectorName);
                        }
                    }
                }

                var insp = aa.inspection.getInspection(capId, inspId).getOutput();
                var vInspectionActivity = insp.getInspection().getActivity();

                var guideBiz = aa.proxyInvoker.newInstance("com.accela.aa.inspection.guidesheet.GGuideSheetBusiness").getOutput();
                var vGuideSheetArray = guideBiz.getGGuideSheetWithItemsByInspections("", [vInspectionActivity]).toArray();
                if (vGuideSheetArray.length != 0)
                {
                    var x = 0;
                    for (x in vGuideSheetArray)
                    {
                        var vGuideSheet = vGuideSheetArray[x];
                        vGuideSheetItemsArray = vGuideSheet.getItems().toArray();
                        var z = 0;
                        for (z in vGuideSheetItemsArray)
                        {
                            var vGuideSheetItem = vGuideSheetItemsArray[z];
                            if (vGuideSheetItem && !matches(vGuideSheetItem.getGuideItemComment(), null, undefined, "", " "))
                            {
                                var guideVioArray = new Array();
                                var guideItemDetails = new Array();

                                var checklistItemWhole = vGuideSheetItem.getGuideItemText();
                                checklistItemWhole = String(checklistItemWhole).split(".");
                                var checklistItemNo = checklistItemWhole[0];
                                logDebug("preferred checklist item text is: " + checklistItemNo);

                                var checklistItemComment = vGuideSheetItem.getGuideItemComment();
                                logDebug("checklist item comment is: " + checklistItemComment);

                                var newRow = new Array();
                                newRow["Inspection Type"] = inspType;
                                newRow["SITE Record ID"] = alternateID;
                                newRow["SCDHS Tank Number"] = "N/A";
                                newRow["Product Store Label"] = "N/A";
                                newRow["Capacity"] = "N/A";
                                newRow["Tank Location Label"] = "N/A";
                                newRow["Item Number"] = checklistItemNo;
                                newRow["Inspector Finding"] = checklistItemComment;
                                newRow["Inspection Date"] = inspectionDateForm;
                                newRow["Inspector"] = vInspectorName;
                                newRow["Appendix A"] = "CHECKED";
                                logDebug("newRow appendix a is: " + newRow["Appendix A"]);
                                addRowToASITable("ARTICLE 12 TANK VIOLATIONS", newRow, enfChild);
                            }
                        }
                    }
                }


                //logDebug("Inspection DateTime: " + month + "/" + day + "/" + year + "Hr: " +  hr + ',' + min + "," + sec);
                logDebug("Inspection DateTime: " + year + "-" + month + "-" + day + " " + hr + ':' + min + ":" + sec + ".0");

                var inspectionDateCon = year + "-" + month + "-" + day + " " + hr + ':' + min + ":" + sec + ".0";

                addParameter(reportParams, "SiteRecordID", alternateID.toString());
                addParameter(reportParams, "InspectionDate", inspectionDateCon);
                addParameter(reportParams, "InspectionType", inspType);
                logDebug("report params are: " + alternateID.toString() + ", " + inspectionDateCon + ", " + inspType);
                generateReportBatch(enfChild, "Facility Inspection Summary Report Script", 'DEQ', reportParams);
            }
        }
    }
}

function sendNotification(emailFrom, emailTo, emailCC, templateName, params, reportFile) {
    var itemCap = capId;
    if (arguments.length == 7) itemCap = arguments[6]; // use cap ID specified in args
    var id1 = itemCap.ID1;
    var id2 = itemCap.ID2;
    var id3 = itemCap.ID3;
    var capIDScriptModel = aa.cap.createCapIDScriptModel(id1, id2, id3);
    var result = null;
    result = aa.document.sendEmailAndSaveAsDocument(emailFrom, emailTo, emailCC, templateName, params, capIDScriptModel, reportFile);
    if (result.getSuccess())
    {
        logDebug("Sent email successfully!");
        return true;
    }
    else
    {
        logDebug("Failed to send mail. - " + result.getErrorType());
        return false;
    }
}

function debugObject(object) {
    var output = '';
    for (property in object)
    {
        output += "<font color=red>" + property + "</font>" + ': ' + "<bold>" + object[property] + "</bold>" + '; ' + "<BR>";
    }
    logDebug(output);
}
function generateReportBatch(itemCap, reportName, module, parameters) {
    //returns the report file which can be attached to an email.
    var user = currentUserID; // Setting the User Name
    logDebug("user: " + user);
    logDebug("Resport Name: " + reportName);
    var report = aa.reportManager.getReportInfoModelByName(reportName);
    if (!report.getSuccess() || report.getOutput() == null)
    {
        logDebug("**WARN report generation failed, missing report or incorrect name: " + reportName);
        return false;
    }
    report = report.getOutput();
    report.setModule(module);
    report.setCapId(itemCap); //CSG Updated from itemCap.getCustomID() to just itemCap so the file would save to Record
    report.setReportParameters(parameters);

    var permit = aa.reportManager.hasPermission(reportName, user);

    if (permit.getOutput().booleanValue())
    {
        var reportResult = aa.reportManager.getReportResult(report);
        if (reportResult.getSuccess())
        {
            reportOutput = reportResult.getOutput();
            var reportFile = aa.reportManager.storeReportToDisk(reportOutput);
            reportFile = reportFile.getOutput();
            return reportFile;
        } else
        {
            logDebug("**WARN System failed get report: " + reportResult.getErrorType() + ":" + reportResult.getErrorMessage());
            return false;
        }
    } else
    {
        logDebug("You have no permission.");
        return false;
    }
}

function getAppName() {
    var itemCap = capId;
    if (arguments.length == 1) itemCap = arguments[0]; // use cap ID specified in args

    capResult = aa.cap.getCap(itemCap)

    if (!capResult.getSuccess())
    {logDebug("**WARNING: error getting cap : " + capResult.getErrorMessage()); return false}

    capModel = capResult.getOutput().getCapModel()

    return capModel.getSpecialText()
}

function createChildLocal(grp, typ, stype, cat, desc) // optional parent capId
{
    //
    // creates the new application and returns the capID object
    //

    var itemCap = capId
    if (arguments.length > 5) itemCap = arguments[5]; // use cap ID specified in args

    var appCreateResult = aa.cap.createApp(grp, typ, stype, cat, desc);
    logDebug("creating cap " + grp + "/" + typ + "/" + stype + "/" + cat);
    if (appCreateResult.getSuccess())
    {
        var newId = appCreateResult.getOutput();
        logDebug("cap " + grp + "/" + typ + "/" + stype + "/" + cat + " created successfully ");

        // create Detail Record
        capModel = aa.cap.newCapScriptModel().getOutput();
        capDetailModel = capModel.getCapModel().getCapDetailModel();
        capDetailModel.setCapID(newId);
        aa.cap.createCapDetail(capDetailModel);

        var newObj = aa.cap.getCap(newId).getOutput();	//Cap object
        var result = aa.cap.createAppHierarchy(itemCap, newId);
        if (result.getSuccess())
            logDebug("Child application successfully linked");
        else
            logDebug("Could not link applications");

        // Copy Parcels

        var capParcelResult = aa.parcel.getParcelandAttribute(itemCap, null);
        if (capParcelResult.getSuccess())
        {
            var Parcels = capParcelResult.getOutput().toArray();
            for (zz in Parcels)
            {
                logDebug("adding parcel #" + zz + " = " + Parcels[zz].getParcelNumber());
                var newCapParcel = aa.parcel.getCapParcelModel().getOutput();
                newCapParcel.setParcelModel(Parcels[zz]);
                newCapParcel.setCapIDModel(newId);
                newCapParcel.setL1ParcelNo(Parcels[zz].getParcelNumber());
                newCapParcel.setParcelNo(Parcels[zz].getParcelNumber());
                aa.parcel.createCapParcel(newCapParcel);
            }
        }

        // Copy Addresses
        capAddressResult = aa.address.getAddressByCapId(itemCap);
        if (capAddressResult.getSuccess())
        {
            Address = capAddressResult.getOutput();
            for (yy in Address)
            {
                newAddress = Address[yy];
                newAddress.setCapID(newId);
                aa.address.createAddress(newAddress);
                logDebug("added address");
            }
        }

        return newId;
    }
    else
    {
        logDebug("**ERROR: adding child App: " + appCreateResult.getErrorMessage());
    }
}
function getChildrenLocal(pCapType, pParentCapId) {
    // Returns an array of children capId objects whose cap type matches pCapType parameter
    // Wildcard * may be used in pCapType, e.g. "Building/Commercial/*/*"
    // Optional 3rd parameter pChildCapIdSkip: capId of child to skip

    var retArray = new Array();
    if (pParentCapId != null) //use cap in parameter 
        var vCapId = pParentCapId;
    else // use current cap
        var vCapId = capId;

    if (arguments.length > 2)
        var childCapIdSkip = arguments[2];
    else
        var childCapIdSkip = null;

    var typeArray = pCapType.split("/");
    if (typeArray.length != 4)
        logDebug("**ERROR in childGetByCapType function parameter.  The following cap type parameter is incorrectly formatted: " + pCapType);

    var getCapResult = aa.cap.getChildByMasterID(vCapId);
    if (!getCapResult.getSuccess())
    {logDebug("**WARNING: getChildren returned an error: " + getCapResult.getErrorMessage());}

    var childArray = getCapResult.getOutput();
    if (!matches(childArray, null, undefined, ""))
    {
        if (!childArray.length)
        {logDebug("**WARNING: getChildren function found no children"); return null;}
    }

    var childCapId;
    var capTypeStr = "";
    var childTypeArray;
    var isMatch;
    for (xx in childArray)
    {
        childCapId = childArray[xx].getCapID();
        if (childCapIdSkip != null && childCapIdSkip.getCustomID().equals(childCapId.getCustomID())) //skip over this child
            continue;

        capTypeStr = aa.cap.getCap(childCapId).getOutput().getCapType().toString();	// Convert cap type to string ("Building/A/B/C")
        childTypeArray = capTypeStr.split("/");
        isMatch = true;
        for (yy in childTypeArray) //looking for matching cap type
        {
            if (!typeArray[yy].equals(childTypeArray[yy]) && !typeArray[yy].equals("*"))
            {
                isMatch = false;
                continue;
            }
        }
        if (isMatch)
            retArray.push(childCapId);
    }

    logDebug("getChildren returned " + retArray.length + " capIds");
    return retArray;

}
function addRowToASITable(tableName, tableValues) //optional capId
{
    //tableName is the name of the ASI table
    //tableValues is an associative array of values.  All elements must be either a string or asiTableVal object
    itemCap = capId
    if (arguments.length > 2)
    {
        itemCap = arguments[2]; //use capId specified in args
    }
    var tssmResult = aa.appSpecificTableScript.getAppSpecificTableModel(itemCap, tableName);
    if (!tssmResult.getSuccess())
    {
        logDebug("**WARNING: error retrieving app specific table " + tableName + " " + tssmResult.getErrorMessage());
        return false;
    }
    var tssm = tssmResult.getOutput();
    var tsm = tssm.getAppSpecificTableModel();
    var fld = tsm.getTableField();
    var col = tsm.getColumns();
    var fld_readonly = tsm.getReadonlyField(); //get ReadOnly property
    var coli = col.iterator();
    while (coli.hasNext())
    {
        colname = coli.next();
        if (!tableValues[colname.getColumnName()]) 
        {
            logDebug("Value in " + colname.getColumnName() + " - " + tableValues[colname.getColumnName()]);
            logDebug("addToASITable: null or undefined value supplied for column " + colname.getColumnName() + ", setting to empty string");
            tableValues[colname.getColumnName()] = "";
        }
        if (typeof (tableValues[colname.getColumnName()].fieldValue) != "undefined")
        {
            fld.add(tableValues[colname.getColumnName()].fieldValue);
            fld_readonly.add(tableValues[colname.getColumnName()].readOnly);
        }
        else // we are passed a string
        {
            fld.add(tableValues[colname.getColumnName()]);
            fld_readonly.add(null);
        }
    }
    tsm.setTableField(fld);
    tsm.setReadonlyField(fld_readonly); // set readonly field
    addResult = aa.appSpecificTableScript.editAppSpecificTableInfos(tsm, itemCap, currentUserID);
    if (!addResult.getSuccess())
    {
        logDebug("**WARNING: error adding record to ASI Table:  " + tableName + " " + addResult.getErrorMessage());
        return false;
    }
    else
    {
        logDebug("Successfully added record to ASI Table: " + tableName);
    }
}
function assignTaskCustom(wfstr, username, ChildCap) // optional process name
{
    // Assigns the task to a user.  No audit.
    //
    aa.print("Inside the assign method")
    var useProcess = false;
    var processName = "";
    var taskUserResult = aa.person.getUser(username);
    if (taskUserResult.getSuccess())
    {
        taskUserObj = taskUserResult.getOutput();  //  User Object
        aa.print("We got the user");
    }
    else
    {logMessage("**ERROR: Failed to get user object: " + taskUserResult.getErrorMessage()); return false;}

    var workflowResult = aa.workflow.getTaskItems(ChildCap, wfstr, processName, null, null, null);
    if (workflowResult.getSuccess())
    {
        var wfObj = workflowResult.getOutput();
        aa.print("We got the workflow object");
    }
    else
    {
        aa.print("We failed to get the workflow")
        logMessage("**ERROR: Failed to get workflow object: " + s_capResult.getErrorMessage());
        return false;
    }

    for (i in wfObj)
    {
        var fTask = wfObj[i];
        if (fTask.getTaskDescription().toUpperCase().equals(wfstr.toUpperCase()) && (!useProcess || fTask.getProcessCode().equals(processName)))
        {
            fTask.setAssignedUser(taskUserObj);
            var taskItem = fTask.getTaskItem();
            var adjustResult = aa.workflow.assignTask(taskItem);
            aa.print(adjustResult);
            aa.print("Assigned Workflow Task: " + wfstr + " to " + username);
            logMessage("Assigned Workflow Task: " + wfstr + " to " + username);
            logDebug("Assigned Workflow Task: " + wfstr + " to " + username);
        }
    }
}