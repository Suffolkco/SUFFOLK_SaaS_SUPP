// This is to update renewal expiration date to match the custom field expiration date.
var showDebug = true;
try
{
	var itemCapType = aa.cap.getCap(capId).getOutput().getCapType().toString(); 

	cap = aa.cap.getCap(capId).getOutput();	
	if (cap) 
	{
		appTypeResult = cap.getCapType();
		appTypeString = appTypeResult.toString();
		appTypeArray = appTypeString.split("/");
		if((appTypeArray[0] == "CONSUMERAFFAIRS" && appTypeArray[1] == "Licenses" && appTypeArray[3] == "NA") ||
		(appTypeArray[0] == "CONSUMERAFFAIRS" && appTypeArray[1] == "ID Cards" && appTypeArray[3] == "NA") ||
		(appTypeArray[0] == "CONSUMERAFFAIRS" && appTypeArray[1] == "Registrations" && appTypeArray[3] == "NA")) 
		{
			logDebug("Record Type: " + appTypeArray);     
			var customFieldExpDate = getAppSpecific("Expiration Date")
			
			logDebug("customFieldExpDate: " + customFieldExpDate);     
			if (customFieldExpDate && customFieldExpDate != "")
			{
				var b1ExpResult = aa.expiration.getLicensesByCapID(capId);

				if (b1ExpResult.getSuccess())
				{
					b1Exp = b1ExpResult.getOutput();
				
					var curExp = b1Exp.getExpDate();
					if (curExp != null)
					{
						dateMMDDYYY = customFieldExpDate;						
						dateMMDDYYY = aa.date.parseDate(dateMMDDYYY);
						b1Exp.setExpDate(dateMMDDYYY);			
						aa.expiration.editB1Expiration(b1Exp.getB1Expiration());					
						logDebug(capId + ": updated Renewal expiration date to " + dateMMDDYYY);
					}
					
				}
			}
		}
	}
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
