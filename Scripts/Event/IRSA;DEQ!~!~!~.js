//IRSA:DEQ/~/~/~

var insYear = inspObj.getInspectionStatusDate().getYear().toString();
var insMonth = inspObj.getInspectionStatusDate().getMonth().toString();
var insDay = inspObj.getInspectionStatusDate().getDayOfMonth().toString();

if (insMonth.length == 1)
{
    insMonth = "0" + insMonth;
}
if (insDay.length == 1)
{
    insDay = "0" + insDay;
}

var insCon = insMonth + "/" + insDay + "/" + insYear;

if (inspType == "Sampling Event" && inspResult == "Sent to Lab")
{
    insId = inspObj.getIdNumber();
    var rParams = aa.util.newHashMap();
    var rFile = new Array();
    rParams.put("INSP_SEQ_NO", insId.toString());
    rParams.put("BLANK", insCon);
    //logDebug("Params are: " + rParams);//
    // Old report
    //rFile = reportRunSave("Analysis_Request_Form_by_Insp_Seq_No", true, false, true, "General", rParams);
    // New report
    rFile = reportRunSave("603_Sample_Submission_Form_New", true, false, true, "General", rParams);

}

//IA Record Creation from WWM Record 

var iaManufacturer = getGuidesheetASIField(inspId, "Sewage Disposal & Water Supply", "IA Treatment Unit", "WWM_IATREATM", " IA TREATMENT UNIT", "Manufacturer");

if (appTypeArray[1] == "WWM" && iaManufacturer != null);
{
    var iaModel = getGuidesheetASIField(inspId, "Sewage Disposal & Water Supply", "IA Treatment Unit", "WWM_IATREATM", " IA TREATMENT UNIT", "Model");
    var iaLeachPoolType = getGuidesheetASIField(inspId, "Sewage Disposal & Water Supply", "Leaching Pool(s)/Galley(s)", "WWMLEACHPOOL", "LEACHING POOL(S)/GALLEY(S)", "Type");
    var iaLeachOtherType = getGuidesheetASIField(inspId, "Sewage Disposal & Water Supply", "Other Leaching Structures", "WWM_OTHLEACH", "OTHER LEACHING STRUCTURES", "Leaching Type");
    var iaLeachProduct = getGuidesheetASIField(inspId, "Sewage Disposal & Water Supply", "Other Leaching Structures", "WWM_OTHLEACH", "OTHER LEACHING STRUCTURES", "Leaching Product");
    // JG - Need to add this once field is added to Custom Field Group var iaEffluentPumpLeachPool = getGuidesheetASIField(inspId, "Sewage Disposal & Water Supply", "Leaching Pool(s)/Galley(s)", "WWMLEACHPOOL", "LEACHING POOL(S)/GALLEY(S)", "EffluentPump");

    // JG - Need to add this once field is added to Custom Field Group var iaEffluentPumpLeachOther = getGuidesheetASIField(inspId, "Sewage Disposal & Water Supply", "Other Leaching Structures", "WWM_OTHLEACH", "OTHER LEACHING STRUCTURES", "EffluentPump");

    // JG - Need to add this once field is added to Custom Field Group var iaPolishingUnit = getGuidesheetASIField(inspId, "Sewage Disposal & Water Supply", "IA Treatment Unit", "WWM_IATREATM", " IA TREATMENT UNIT", "Model");


    if (inspType == "WWM_RES_System 1" && inspResult != null)
    
    {
        var desc = "Automated via:" + capIDString;
        var wwmIA = createChild('DEQ', 'Ecology', 'IA', 'Application', desc);
        logDebug("Manufact")
        copyLicenseProfessional(capId, wwmIA);
        copyAddress(capId, wwmIA);
        copyParcel(capId, wwmIA);
        copyDocumentsToCapID(capId, wwmIA); 
        editAppSpecific("Installation Date", insCon, wwmIA);
        editAppSpecific("Manufacturer", iaManufacturer, wwmIA);
        editAppSpecific("Model", iaModel, wwmIA);
        editAppSpecific("WWM Application Number", capIDString);
    }
}

function copyLicenseProfessional(srcCapId, targetCapId)
{
    //1. Get license professionals with source CAPID.
    var capLicenses = getLicenseProfessional(srcCapId);
    if (capLicenses == null || capLicenses.length == 0)
    {
        return;
    }
    //2. Get license professionals with target CAPID.
    var targetLicenses = getLicenseProfessional(targetCapId);
    //3. Check to see which licProf is matched in both source and target.
    for (loopk in capLicenses)
    {
        sourcelicProfModel = capLicenses[loopk];
        //3.1 Set target CAPID to source lic prof.
        sourcelicProfModel.setCapID(targetCapId);
        targetLicProfModel = null;
        //3.2 Check to see if sourceLicProf exist.
        if (targetLicenses != null && targetLicenses.length > 0)
        {
            for (loop2 in targetLicenses)
            {
                if (isMatchLicenseProfessional(sourcelicProfModel, targetLicenses[loop2]))
                {
                    targetLicProfModel = targetLicenses[loop2];
                    break;
                }
            }
        }
        //3.3 It is a matched licProf model.
        if (targetLicProfModel != null)
        {
            //3.3.1 Copy information from source to target.
            aa.licenseProfessional.copyLicenseProfessionalScriptModel(sourcelicProfModel, targetLicProfModel);
            //3.3.2 Edit licProf with source licProf information. 
            aa.licenseProfessional.editLicensedProfessional(targetLicProfModel);
        }
        //3.4 It is new licProf model.
        else
        {
            //3.4.1 Create new license professional.
            aa.licenseProfessional.createLicensedProfessional(sourcelicProfModel);
        }
    }
}

function copyDocumentsToCapID(fromCapID, toCapID)
{
    var opDocArray = aa.document.getDocumentListByEntity(fromCapID.toString(),"CAP").getOutput();
    var vDocArray = opDocArray.toArray();
    for (var vCounter in vDocArray)
    {
    var vDoc = vDocArray[vCounter];
    aa.document.createDocumentAssociation(vDoc, toCapID.toString(), "CAP");
    }
}

function getGuidesheetASIField(pInspId, gName, gItem, asiGroup, asiSubGroup, asiLabel) {
	var vInspId = parseFloat(pInspId);
	var vInspectionActivity;
	var asiValue = "";
	var guideBiz;
	var vGuideSheetArray = [];
	var vGuideSheet;
	var vGuideSheetItemsArray = [];
	var vGuideSheetItem;
	var vInspection;

	// Get the specific inspection model
	vInspection = aa.inspection.getInspection(capId, vInspId);
	if (vInspection.getSuccess()) {
		vInspection = vInspection.getOutput();
		vInspectionActivity = vInspection.getInspection().getActivity();

		// Get the guidesheets and their items from the activity model
		guideBiz = aa.proxyInvoker.newInstance("com.accela.aa.inspection.guidesheet.GGuideSheetBusiness").getOutput();
		vGuideSheetArray = guideBiz.getGGuideSheetWithItemsByInspections("", [vInspectionActivity]).toArray();
		if (vGuideSheetArray.length != 0) {
			var x = 0;
			for (x in vGuideSheetArray) {
				vGuideSheet = vGuideSheetArray[x];
				if (gName.toUpperCase() == vGuideSheet.getGuideType().toUpperCase() && vGuideSheet.getItems() != null) {
					vGuideSheetItemsArray = vGuideSheet.getItems().toArray();
					var z = 0;
					for (z in vGuideSheetItemsArray) {
						vGuideSheetItem = vGuideSheetItemsArray[z];
						if (vGuideSheetItem && gItem == vGuideSheetItem.getGuideItemText() && asiGroup == vGuideSheetItem.getGuideItemASIGroupName()) {
							var ASISubGroups = vGuideSheetItem.getItemASISubgroupList();
							if (ASISubGroups) {
								for (var k = 0; k < ASISubGroups.size(); k++) {
									var ASISubGroup = ASISubGroups.get(k);
									if (ASISubGroup && ASISubGroup.getSubgroupCode() == asiSubGroup) {
										var ASIModels = ASISubGroup.getAsiList();
										if (ASIModels) {
											for (var m = 0; m < ASIModels.size(); m++) {
												var ASIModel = ASIModels.get(m);
												if (ASIModel && ASIModel.getAsiName() == asiLabel) {
													logDebug("ASI value: " + ASIModel.getAttributeValue());
													asiValue = ASIModel.getAttributeValue();
												}
											}
										}
									}
								}
							}
						}
					}
				} else {
					logDebug("Failed to get guide sheet item");
				}
			}
		} else {
			logDebug("Failed to get guidesheets");
		}
	} else {
		logDebug("Failed to get inpection");
	}
	return asiValue;
}

