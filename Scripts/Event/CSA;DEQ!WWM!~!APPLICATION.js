//CSA;DEQ!WWM!~!APPLICATION
var showDebug = false;
try
{

 

logDebug("Hello World.");
var parentCapId = getApplication(AInfo["WWM Application Number"])
var inspectionID = getCompletedInspectionID("I/A", parentCapId);
copyContactsByType(parentCapId, capId, "Property Owner"); 
//getGuidesheetASIField(inspectionID, "WWM_IA", "I/A", "WWM_IA", "I/A", "Manufacturer") 
var Manufacturer = getGuidesheetASIField(inspectionID, "WWM_IA", "I/A", "WWM_IA", "I/A", "Manufacturer", parentCapId) ;
var modelNumber =  getGuidesheetASIField(inspectionID, "WWM_IA", "I/A", "WWM_IA", "I/A", "Model", parentCapId) ;
//push.
editAppSpecific4ACA("Manufacturer", Manufacturer);
editAppSpecific4ACA("Model Number", modelNumber);
}


catch (err) {
    var showDebug = false;
	logDebug("A JavaScript Error occured: " + err.message + " In Line " + err.lineNumber);
	}
function getCompletedInspectionID(insp2Check, capId)
	{
	// warning, returns only the first scheduled occurrence
	var inspResultObj = aa.inspection.getInspections(capId);
	if (inspResultObj.getSuccess())
		{
		var inspList = inspResultObj.getOutput();
    for (xx in inspList)
    logDebug("type: " + inspList[xx].getInspectionType() + " status: " + inspList[xx].getInspectionStatus().toUpperCase());
			if (String(insp2Check).equals(inspList[xx].getInspectionType()) && inspList[xx].getInspectionStatus().toUpperCase().equals("COMPLETE"))
				return inspList[xx].getIdNumber();
		}
	return false;
    }
    



    function copyContactsByType(pFromCapId, pToCapId, pContactType)
	{
	//Copies all contacts from pFromCapId to pToCapId
	//where type == pContactType
	if (pToCapId==null)
		var vToCapId = capId;
	else
		var vToCapId = pToCapId;
	
	var capContactResult = aa.people.getCapContactByCapID(pFromCapId);
	var copied = 0;
	if (capContactResult.getSuccess())
		{
		var Contacts = capContactResult.getOutput();
		for (yy in Contacts)
			{
			if(Contacts[yy].getCapContactModel().getContactType() == pContactType)
			    {
			    var newContact = Contacts[yy].getCapContactModel();
			    newContact.setCapID(vToCapId);
			    aa.people.createCapContact(newContact);
			    copied++;
			    logDebug("Copied contact from "+pFromCapId.getCustomID()+" to "+vToCapId.getCustomID());
			    }
		
			}
		}
	else
		{
		logMessage("**ERROR: Failed to get contacts: " + capContactResult.getErrorMessage()); 
		return false; 
		}
	return copied;
    } 
    

    function getGuidesheetASIField(inspId, gName, gItem, asiGroup, asiSubGroup, asiLabel, capId) 
{
	var asiValue = "";
	var itemCap = capId;
	var r = aa.inspection.getInspections(itemCap);
	if (r.getSuccess()) 
	{
		var inspArray = r.getOutput();
		for (i in inspArray) 
		{
			if (inspArray[i].getIdNumber() == inspId) 
			{
				var inspModel = inspArray[i].getInspection();
				var gs = inspModel.getGuideSheets();
				if (gs) 
				{
					for(var i=0; i< gs.size(); i++)
					{
						var guideSheetObj = gs.get(i);
						if (guideSheetObj && gName.toUpperCase() == guideSheetObj.getGuideType().toUpperCase()) 
						{
							var guidesheetItem = guideSheetObj.getItems();
							for(var j=0; j< guidesheetItem.size(); j++)
							{
								var item = guidesheetItem.get(j);
								if(item && gItem == item.getGuideItemText() && asiGroup == item.getGuideItemASIGroupName()) 
								{
									var ASISubGroups = item.getItemASISubgroupList();
									if(ASISubGroups) 
									{
										for(var k = 0; k < ASISubGroups.size(); k++) 
										{
											var ASISubGroup = ASISubGroups.get(k);
											if(ASISubGroup && ASISubGroup.getSubgroupCode() == asiSubGroup) 
											{
												var ASIModels =  ASISubGroup.getAsiList();
												if(ASIModels) 
												{
													for( var m = 0; m < ASIModels.size(); m++) 
													{
														var ASIModel = ASIModels.get(m);
														if(ASIModel && ASIModel.getAsiName() == asiLabel) 
														{
															aa.print("ASI value: " + ASIModel.getAttributeValue());
															asiValue = ASIModel.getAttributeValue();		
														}
													}
												}
											}
										}
									}
								}
							}							
						}
					}
				} 
				else 
				{
					aa.print("No guidesheets for this inspection");
					return asiValue;
				}
			}
		}
	} 
	else 
	{
		aa.print("No inspections on the record");
		return asiValue;
	}
	aa.print("No updates to the guidesheet made");
	return asiValue;
}
