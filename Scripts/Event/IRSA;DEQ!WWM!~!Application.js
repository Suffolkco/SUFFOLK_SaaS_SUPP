//IRSA/DEQ/WWM/*/Application 
//IRSA;DEQ!WWM!~!Application
showDebug=true;
logDebug("inspection ID: " + inspId);
var sewageDisposal = getAppSpecific("Method of Sewage Disposal");
var emailText ="";
logDebug("Sewage disposal: " + sewageDisposal);
var contactType = "Property Owner";

var iObjResult = aa.inspection.getInspection(capId,inspId);
var iObj = iObjResult.getOutput();
var inspTypeResult = aa.inspection.getInspectionType(iObj.getInspection().getInspectionGroup(), iObj.getInspectionType())
var inspTypeArr = inspTypeResult.getOutput();
var inspType = inspTypeArr[0]; // assume first
var inspSeq = inspType.getSequenceNumber();
logDebug("Inspection Sequence number: " + inspSeq);
logDebug("inspType: " + iObj.getInspectionType() + "  inspResult: " + inspResult);
var inspModel = iObj.getInspection();
var inspectionType = iObj.getInspectionType();


if(sewageDisposal == "I/A System")
{
    logDebug("It is an I/A System. We are checking inspection type.");
    if(inspectionType == "I/A" && inspResult == "Complete")
    {
        var emailAddress = "";

        var params = aa.util.newHashtable();
        getRecordParams4Notification(params);
        addParameter(params,"$$inspection$$", inspSeq);
       var contactArray = getContactArray(capId);
        for (iCon in contactArray) {
            if(contactArray[iCon].contactType=="Property Owner")
            {
                emailAddress = contactArray[iCon].email;
                logDebug("Found email from " + contactArray[iCon].contactType + ": " + emailAddress);
            }
           
            }
        sendNotification("", emailAddress,"","IA_NOTIFICATION_FOR_PROPERTY_OWNER",params,null);
        logDebug("E-mail sent successfully!")
    }

    //push.
}

// EHIMS 4652
var itemCapType = aa.cap.getCap(capId).getOutput().getCapType().toString();
logDebug("itemCapType: " + itemCapType);

// If record type is WWM and it's a backoffice user, we do not want to update the status
if (itemCapType == "DEQ/WWM/Residence/Application" ||         
    itemCapType == "DEQ/WWM/Commercial/Application")
{
    if(inspectionType == "WWM_RES_System 1" && inspResult == "Incomplete")
    {    
        logDebug("inspType: " + inspectionType + "inspResult: " + inspResult);    
        if (inspModel != null) 
        {
            logDebug("capid: " + capId)

            // Create new inspection
            var inspComment = iObj.getInspectionComments();
            var inspDate = iObj.getInspectionDate()
            var inspector = iObj.getInspector();
            //logDebug("INspection comment for inspection  :" + inspId + ":" +  inspComment);            
            //logDebug("Inspector for inspection:" + inspId + ":" + inspector);
            //logDebug("Schedule New inspection");
            schedRes = aa.inspection.scheduleInspection(capId, inspector, inspDate, null, inspectionType, inspComment);
            var newInspId;
            if (schedRes.getSuccess())
            {
                logDebug("Successfully scheduled inspection : " + inspectionType);
                newInspId = findLatestInspection(inspId);
                logDebug("New inspection number found: " + newInspId);
            }
            else
                logDebug( "**ERROR: adding scheduling inspection (" + inspectionType + "): " + schedRes.getErrorMessage());

            // Delete checklist on new inspection
            var r = aa.inspection.getInspections(capId);  // have to use this method to get guidesheet data

            // Copy checklist guidsheet
            var r = aa.inspection.getInspections(capId);  // have to use this method to get guidesheet data

            if (r.getSuccess())
            {
                var inspArray = r.getOutput();    
                var gs0 = null // original guidesheetModelSources

                for (i in inspArray)
                {
                    // Find the existing checklist for original inspection
                    if (inspArray[i].getIdNumber() == inspId)
                    {
                        var inspModelOrgin = inspArray[i].getInspection();        
                        var gs0 = inspModel.getGuideSheets()               
                        var guideSheetObj0 = null;
                        logDebug( "gs0 :" + gs0);
                        if (gs0) 
                        {                      
                            logDebug( "gs0 size:" +  gs0.size());     
                            for (var j = 0; j < gs0.size(); j++) 
                            {
                                guideSheetObj0 = gs0.get(j);   
                                logDebug( "guideSheetObj0 is set.");
                            }
                        }
                    }
                    if (guideSheetObj0 != null && inspArray[i].getIdNumber() == newInspId)
                        {
                            var inspModel = inspArray[i].getInspection();                           
                            var gs = inspModel.getGuideSheets()
                            
                            logDebug( "gs:" + gs);
                            if (gs) 
                            {
                                logDebug( "gs:" + gs);
                                for (var j = 0; j < gs.size(); j++) 
                                {
                                    var guideSheetObj = gs.get(j);
                                    var guidesheetItem = guideSheetObj.getItems();
                                    var updateResult = aa.guidesheet.updateGGuidesheet(guideSheetObj0,guideSheetObj0.getAuditID());
                                    if (updateResult.getSuccess()) {
                                        logDebug("Successfully updated on inspection " + newInspId + ".");                                       
                                    } else {
                                        logDebug("Could not update guidesheet ID: " + updateResult.getErrorMessage());                                       
                                    }                

                                    // To copy guidesheet 
                                    /*
                                    logDebug( "copy guidesheet item to :" + newInspId);                 
                                    var updateResult = aa.guidesheet.copyGGuideSheetItems(gs, capId, newInspId, guideSheetObj.getAuditID())
                                 
                                    if (updateResult.getSuccess()) {
                                        logDebug("Successfully updated checklist on inspection " + newInspId + ".");
                                        
                                    } else {
                                        logDebug("Could not update guidesheet ID: " + updateResult.getErrorMessage());
                                    }*/
                                    // To update guidesheet         
                                    /*var updateResult = aa.guidesheet.updateGGuidesheet(guideSheetObj,guideSheetObj.getAuditID());
                                    if (updateResult.getSuccess()) {
                                        logDebug("Successfully updated " + gName + " on inspection " + inspId + ".");
                                        return true;
                                    } else {
                                        logDebug("Could not update guidesheet ID: " + updateResult.getErrorMessage());
                                        return false;
                                    } */               
                                }
                            }
                            
                        }
                    }
            }
                        
         
         

           /*
            if (iObj.getRequestDate() != null)
            {
                logDebug("Get Existing Requuest Date:" + iObj.getRequestDate());
                logDebug ("Request Date Year: " + iObj.getRequestDate().getYear());
                logDebug ("Request Date Month: " + iObj.getRequestDate().getMonth());              
                logDebug ("Request Date Hour: " + iObj.getRequestDate().getHourOfDay());
                logDebug ("Request Date getMinute: " + iObj.getRequestDate().getMinute());
                logDebug ("Request Date getSecond: " + iObj.getRequestDate().getSecond());
            }*/

            //iResult = aa.inspection.copyInspectionWithGuideSheet(capId, capId, inspModel);
                
            //if (iResult.getSuccess())
            {                     
                //logDebug("Copy successfully.");        
                //var capId = aa.cap.getCapID("22CAP","00000","0000G").getOutput();
                // logDebug"Inspection Status: " + inspObj.getInspectionStatus();
                logDebug("capId: " + capId); //22CAP-00000-0000G
              
                // 566073
              
                var newInsResult = aa.inspection.getInspection(capId,newInspId);              
                if (newInsResult.getSuccess()) {
                    var inspObj = newInsResult.getOutput();
                    if (inspObj) {
                        
                        //inspObj.setInspectionStatus("Scheduled");      
                        //var sysDate = aa.date.getCurrentDate();
                        //var sysDateMMDDYYYY = dateFormatted(sysDate.getMonth(), sysDate.getDayOfMonth(), sysDate.getYear(), "MM/DD/YYYY");
                        //logDebug("Current Date: " + sysDateMMDDYYYY);                       
                        //inspObj.setRequestDate(aa.date.parseDate(sysDateMMDDYYYY));
                     
                        //var reqDate = inspObj.getRequestDate().getYear() + "-" + inspObj.getRequestDate().getMonth() + "-" + inspObj.getRequestDate().getDayOfMonth();
                        //logDebug("Request Date:" + reqDate);

                        var fromInspEntityId = capId + "-" + inspId;
                        var newInspEntityId = capId + "-" + newInspId;
                        copyInspectionDocuments(fromInspEntityId, newInspEntityId);
                        logDebug("Copy inspection document completed for inspection ID:" + newInspId);
                        aa.inspection.editInspection(inspObj);
                    

                       /*
                        //"Insp Scheduled" == inspObj.getDocumentDescription()             
                      
logDebug("Document Description: " + inspObj.getDocumentDescription());
                        var capDocResult1 = aa.document.getDocumentListByEntity(entityId, "INSPECTION");

                        if (capDocResult1.getSuccess())
                        {       
                            logDebug("*** inspection count *** " + capDocResult1.getOutput().size());
                                             
                            for (docInx = 0; docInx < capDocResult1.getOutput().size(); docInx++)
                            {
                                var documentObject = capDocResult1.getOutput().get(docInx);        
                              

                                //if (documentObject.getDocName() == "*")
                                {
                                    debugObject("*******documentObject*****" +documentObject);
                                    logDebug("Entity:" +  documentObject.getEntity());
                                    logDebug("*** documentNo *****" + documentObject.getDocumentNo());
                                    logDebug("docName:" + documentObject.getDocName());
                                    logDebug("fileName:" + documentObject.getFileName());
                                    //docContent = documentObject.getDocumentContent();
                                    //documentObject.setDocName(documentObject.getFileName());
                                    
                                    //documentObject.setDocDescription("Test");
                                    //documentObject.setDocumentContent(docContent);
                                    
                                    //logDebug("Setting docName to filename:" + documentObject.getFileName());
                                    //documentObject.setCapId(capId);
                                    //logDebug("Setting docName to filename:" + documentObject.getFileName());
                                    //logDebug("Getting docName:" + documentObject.getDocumentNo() + ":" + documentObject.getDocName());
                                    //emailText = emailText + documentObject.getDocName();
                                }
                            }
                        } */

                        //inspObj.setScheduledDate(aa.date.parseDate("01/01/1900"));	
                        //inspObj.setRequestDate(aa.date.parseDate("01/01/1900"));	                 
                        //var systemUserObjResult = aa.person.getUser(currentUserID.toUpperCase());
                       // inspObj.SetInspector(systemUserObjResult)
                       
                        //scheduleInspectDate("Progress Invesgiation", nextWorkDay(new Date(), 10, true), "INSPECTORNAME");

                        }                    
                }
     
                        
                //logDebug("Sequence Number: " + iResult.getInspection().getSequenceNumber());
            
            }
        }
    }
      
        aa.sendMail("noreplyehims@suffolkcountyny.gov", "ada.chan@suffolkcountyny.gov", "", "IRSA - WWM", emailText);

    
}
function getDocumentList() {
	// Returns an array of documentmodels if any
	// returns an empty array if no documents

	var docListArray = new Array();

	docListResult = aa.document.getCapDocumentList(capId,currentUserID);

	if (docListResult.getSuccess()) {		
		docListArray = docListResult.getOutput();
	}
	return docListArray;
} 
 

function copyInspectionDocuments(pFromCapIdEntityId, pToCapIdEntityId)
{
    //Copies all attachments (documents) from pFromCapId to pToCapId
    var categoryArray = new Array();

    // third optional parameter is comma delimited list of categories to copy.
    if (arguments.length > 2)
    {
        categoryList = arguments[2];
        categoryArray = categoryList.split(",");
    }

    var capDocResult = aa.document.getDocumentListByEntity(pFromCapIdEntityId, "INSPECTION");
    if (capDocResult.getSuccess())
    {
        if (capDocResult.getOutput().size() > 0)
        {
            for (docInx = 0; docInx < capDocResult.getOutput().size(); docInx++)
            {
                var documentObject = capDocResult.getOutput().get(docInx);
                currDocCat = "" + documentObject.getDocCategory();
                if (categoryArray.length == 0 || exists(currDocCat, categoryArray))
                {
                    // download the document content
                    var useDefaultUserPassword = true;
                    //If useDefaultUserPassword = true, there is no need to set user name & password, but if useDefaultUserPassword = false, we need define EDMS user name & password.
                    var EMDSUsername = null;
                    var EMDSPassword = null;
                    var path = null;
                    var downloadResult = aa.document.downloadFile2Disk(documentObject, documentObject.getModuleName(), EMDSUsername, EMDSPassword, useDefaultUserPassword);
                    if (downloadResult.getSuccess())
                    {
                        path = downloadResult.getOutput();
                    }
                  
                    documentObject.setDocumentNo(null);
                    documentObject.setCapID(capId)
                    documentObject.setEntityID(pToCapIdEntityId);

                    // Open and process file
                    try
                    {
                        if (path != null && path != "")
                        {
                            // put together the document content - use java.io.FileInputStream
                            var newContentModel = aa.document.newDocumentContentModel().getOutput();
                            inputstream = new java.io.FileInputStream(path);
                            newContentModel.setDocInputStream(inputstream);
                            documentObject.setDocumentContent(newContentModel);
                            var newDocResult = aa.document.createDocument(documentObject);
                            if (newDocResult.getSuccess())
                            {
                                newDocResult.getOutput();
                                logDebug("Successfully copied document: " + documentObject.getFileName() + " From: " + pFromCapIdEntityId + " To: " + pToCapIdEntityId);
                            }
                            else
                            {
                                logDebug("Failed to copy document: " + documentObject.getFileName());
                                logDebug(newDocResult.getErrorMessage());
                            }
                        }
                    }
                    catch (err)
                    {
                        logDebug("Error copying document: " + err.message);
                        return false;
                    }
                }
            } // end for loop
        }
    }
}

function findLatestInspection(originalInspectionId)
{
    var inspResults = aa.inspection.getInspections(capId);
    var newInspId = originalInspectionId;
    var inspectionId;
    
	if (inspResults.getSuccess())
		{
		var inspAll = inspResults.getOutput();
		
		for (ii in inspAll)			
        {
            inspectionId = inspAll[ii].getIdNumber();		// Inspection identifier	
            if (inspectionId > originalInspectionId)
            {
                newInspId = inspectionId;
                // Set the bigger number to original so we always get the latest inspection
                originalInspectionId = inspectionId;
            }
				
		  }
		}
        return newInspId;

}
function debugObject(object) {
    var output = '';
    for (property in object) {
        output += "<font color=red>" + property + "</font>" + ': ' + "<bold>" + object[property] + "</bold>" + '; ' + "<BR>";
    }
    logDebug(output);
}
function logDebug(dstr) {
	if(showDebug) {
		aa.print(dstr)
		emailText += dstr + "<br>";
		aa.debug(aa.getServiceProviderCode() + " : " + aa.env.getValue("CurrentUserID"),dstr)
	}
}


