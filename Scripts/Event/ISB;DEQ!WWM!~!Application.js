//ISB;DEQ!WWM!~!Application
showDebug = true;
var emailText ="";

logDebug("Inspection number: " + inspId);

var iObjResult = aa.inspection.getInspection(capId,inspId);
var iObj = iObjResult.getOutput();
var inspTypeResult = aa.inspection.getInspectionType(iObj.getInspection().getInspectionGroup(), iObj.getInspectionType())
var inspTypeArr = inspTypeResult.getOutput();
var inspType = inspTypeArr[0]; // assume first
var inspSeq = inspType.getSequenceNumber();
logDebug("Inspection Sequence number: " + inspSeq);
logDebug("inspType: " + iObj.getInspectionType())
var inspModel = iObj.getInspection();
var inspectionType = iObj.getInspectionType();

var itemCapType = aa.cap.getCap(capId).getOutput().getCapType().toString();
logDebug("itemCapType: " + itemCapType);

// If record type is WWM and it's a backoffice user, we do not want to update the status
if (itemCapType == "DEQ/WWM/Residence/Application" ||         
    itemCapType == "DEQ/WWM/Commercial/Application")
{
	if(inspectionType == "WWM_RES_System 1")
    {    
        logDebug("inspType: " + inspectionType);

        /*
        if (inspModel != null) 
        {
            logDebug("capid: " + capId)

            // Create new inspection
            var inspComment = iObj.getInspectionComments();
            var inspDate = iObj.getInspectionDate()
            var inspector = iObj.getInspector();

			var r = aa.inspection.getInspections(capId);  // have to use this method to get guidesheet data

            if (r.getSuccess())
            {
                var inspArray = r.getOutput();    
             
                for (i in inspArray)
                {
                   
                    if (inspArray[i].getIdNumber() == inspId)
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
                                   
                                    // To copy guidesheet 
                                    
                                    logDebug( "copy guidesheet item to :" + newInspId);                 
                                    var updateResult = aa.guidesheet.copyGGuideSheetItems(gs, capId, newInspId, guideSheetObj.getAuditID())
                                 
                                    if (updateResult.getSuccess()) {
                                        logDebug("Successfully updated checklist on inspection " + newInspId + ".");
                                        
                                    } else {
                                        logDebug("Could not update guidesheet ID: " + updateResult.getErrorMessage());
                                    }
                                    
                                }
                            }
                            
                        }
                    }
				}
            }		
		

		}*/
	}
}

function addToGASIT(gsi, pTableName, pArrayToAdd) {
	var gsb = aa.proxyInvoker.newInstance("com.accela.aa.inspection.guidesheet.GGuideSheetBusiness").getOutput();
	logDebug("**GUIDESHEET ITEM: " + gsi.getGuideItemText());
	var gsAsitGrpList = gsi.getItemASITableSubgroupList();
	if (gsAsitGrpList != null) {
		for (var z = 0; z < gsAsitGrpList.size(); z++) {
			var guideItemASIT = gsAsitGrpList.get(z);
			if (guideItemASIT.getTableName() == pTableName) {
				var newColumnList = guideItemASIT.getColumnList();
				for (var k = 0; k < newColumnList.size(); k++) {
					if (!updateComplete) // right column but row not found create a new row.
					{

						logDebug("Creating new entry in column");
						var column = newColumnList.get(k);
						logDebug("Column " + column.getColumnName());
						for (l = 0; l < pArrayToAdd.length; l++) {
							if (typeof(pArrayToAdd[l][column.getColumnName()]) == "object") // we are passed an asiTablVal Obj
							{
								var cValueMap = column.getValueMap();
								var newColumn = new com.accela.aa.inspection.guidesheet.asi.GGSItemASITableValueModel;
								var pReadOnly = "F";
								logDebug(pArrayToAdd[l][column.getColumnName()]);
								newColumn.setColumnIndex(z);
								newColumn.setRowIndex(l);
								newColumn.setAttributeValue(pArrayToAdd[l][column.getColumnName()]);
								newColumn.setAuditDate(new java.util.Date());
								newColumn.setAuditID("ADMIN");
								if (pReadOnly == "Y")
									newColumn.setValueReadonly("Y");
								l
								cValueMap.put(l, newColumn);

							}
						}

					}
				}

				var updateComplete = true;

			}
		}
	}

	if (updateComplete) {
		logDebug("updating");
		gsb.updateGuideSheetItem(gsi, "ADMIN");
	}

}

function getOutput(result, object) {
	if (result.getSuccess()) {
		return result.getOutput();
	} else {
		logError("ERROR: Failed to get " + object + ": " + result.getErrorMessage());
		return null;
	}
}

function logDebug(dstr) {
	if(showDebug) {
		aa.print(dstr)
		emailText += dstr + "<br>";
		aa.debug(aa.getServiceProviderCode() + " : " + aa.env.getValue("CurrentUserID"),dstr)
	}
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

