//WTUA:DEQ/WWM/RESIDENCE/APPLICATION
var showDebug = true;
var maxSeconds = 1;   // 1 seconds	
var emailText = "";
var sewMeth = AInfo["Method of Sewage Disposal"];


//SIP - 1 Pahse 2
if (wfTask == "Plans Coordination" && wfStatus == "Awaiting Grant Approval")
{
	sendGrantDoc();
	   
}

if (wfTask == "Inspections" && (wfStatus == "Inspection Failure" || wfStatus == "Inspection Failure- I/A Installed"))
{
	var resultComments = inspectionResultComments();

	if (resultComments)
	{
		workflowInspectionResultedWWM("Inspection Corrections Required", "RECORDID");
	}
}
if (wfStatus == "Partial Final Approval")
{
	workflowPartialReviewApproved();	
} 


if (wfTask == "Inspections" && wfStatus == "Complete")
{
	var completed = latestCompletedInspection();
	if (completed)
	{
		workflowInspectionResultedWWM("Inspection Completion Notice", "RECORD_ID");
	}
}
if (wfTask == "Application Review" && wfStatus == "Awaiting Client Reply")
{
	//wwmWorkflowAdditionalInfo("Notice of Incomplete Submission Script", "RecordID");
	var submissionNoticeTxt = AInfo["Submission Rejection Text"];
	if (!matches(submissionNoticeTxt, null, undefined, ""))				
	{
		wwmWorkflowAdditionalInfoWithPin("Notice of Incomplete Submission", "Notice of Incomplete Submission Script", "RecordID");
	}
}
if (wfTask == "Plans Coordination" && wfStatus == "Plan Revisions Needed")
{
	var notOK = isTaskStatus("WWM Review", "Not OK");
	logDebug("Is this okay? : " + notOK);
	if (notOK)
	{
		var prelimNoticeTxt = AInfo["Preliminary Notice Text"];
		if (!matches(prelimNoticeTxt, null, undefined, ""))				
		{
			//wwmWorkflowAdditionalInfo("Notice of Incomplete Script", "RECORD_ID");
			wwmWorkflowAdditionalInfoWithPin("Notice of Incomplete", "Notice of Incomplete Script", "RECORD_ID");
		}
	}
}
if (wfTask == "Plans Coordination" && wfStatus == "Approved")
{
	
	//workflowPrelimApproval("WWM Permit Conditions Script", "RECORDID");
	var prelimCondTxt = AInfo["Permit Conditions Text"];
	if (!matches(prelimCondTxt, null, undefined, ""))				
	{
		workflowPrelimApprovalWithPin("WWM Permit Conditions", "WWM Permit Conditions Script", "RECORDID");
	}

	// EHIMS-4763
	// Get workflow history to make sure only the very first time we are at this task, we proceed:
	var taskHistoryResult = aa.workflow.getWorkflowHistory(capId, wfTask, null);
	if (taskHistoryResult.getSuccess())
	{
		var taskArr = taskHistoryResult.getOutput();
		logDebug("Number of workflow history found for " + wfTask + " is " + taskArr.length);
		var count = 0;

		for (obj in taskArr)
		{
			var taskObj = taskArr[obj];
			if (taskObj.getDisposition() == "Approved")
			{
				count++;
				logDebug("Found history step: Count " + count + ": " + taskObj.getStepNumber() + ", " + taskObj.getProcessID() + ", " +
					taskObj.getTaskDescription() + ", " + taskObj.getDisposition());
			}

		}
		// Only if it's the very first time, Create new inspection
		if (count == 1)
		{
			// Set expiration date 
			b1ExpResult = aa.expiration.getLicensesByCapID(capId)
			if (b1ExpResult.getSuccess())
			{
				b1Exp = b1ExpResult.getOutput();
				var todaysDate = new Date();
				var todDateCon = (todaysDate.getMonth() + 1) + "/" + todaysDate.getDate() + "/" + (todaysDate.getFullYear());
				//logDebug("This is the current month: " + todaysDate.getMonth());
				//logDebug("This is the current day: " + todaysDate.getDate());
				//logDebug("This is the current year: " + todaysDate.getFullYear());
				b1Exp = b1ExpResult.getOutput();
				var dateAdd = addDays(todDateCon, 1095);
				var dateMMDDYYY = jsDateToMMDDYYYY(dateAdd);

				dateMMDDYYY = aa.date.parseDate(dateMMDDYYY);
				b1Exp.setExpDate(dateMMDDYYY);
				b1Exp.setExpStatus("Pending");
				aa.expiration.editB1Expiration(b1Exp.getB1Expiration());
				logDebug("Setting new expiration date to: " + dateMMDDYYY + " and Pending renewal status.");
			}

			scheduleInspection("Pre-Inspection Review", 0);
			var inspectionResult = aa.inspection.getInspections(capId);
			if (inspectionResult.getSuccess())
			{
				var insObj = inspectionResult.getOutput();

				for (i in insObj)
				{
					var inspModel = insObj[i].getInspection();

					logDebug("**** Inspection Type; " + inspModel.getInspectionType() + ", Inspection Status: " + inspModel.getInspectionStatus());
					//debugObject(inspModel);
					if (inspModel.getInspectionType() == "Pre-Inspection Review" &&
						inspModel.getRequestComment() == "Scheduled via Script" &&
						inspModel.getInspectionStatus() == "Scheduled")					
					{
						logDebug("IsScheduled? " + inspModel.getRequestComment());
						logDebug("IsScheduled? " + inspModel.isScheduled());
						logDebug("IsCompleted? " + inspModel.isCompleted());
						logDebug("Get Scheduled Date: " + inspModel.getScheduledDate());
						logDebug("Inspection Seq Number: " + inspModel.getInspSequenceNumber());

						logDebug("ID Number: " + insObj[i].getIdNumber());
						logDebug("Inspection Status: " + inspModel.getInspectionStatus());
						//InspectionId
						inspId = insObj[i].getIdNumber();

						// Retrieve Custom List table of "System Details". For each line, add a checklist.					
						sysDetailsASITable = loadASITable("SYSTEM DETAILS");

						for (rowIndex in sysDetailsASITable) 
						{
							logDebug("****** Custom List row index: " + rowIndex);
							thisRow = sysDetailsASITable[rowIndex];
							//recNum = thisRow["Record Number"].fieldValue;
							tSysLocation = thisRow["System Location"];
							tSubMap = thisRow["SubMap"];
							tBedroomCnt = thisRow["Bedroom Count"];
							tComments = thisRow["Comments"];
							tIAMan = thisRow["I/A Manufacturer"];
							tIAModel = thisRow["I/A Model"];
							tSepticTank = thisRow["Septic Tank"];
							tLeachType = thisRow["Leaching Type"];
							tLeachDim = thisRow["Leaching Dimensions"];
							tLeachProd = thisRow["Leaching Product/Material"];
							tLeachModel = thisRow["Leaching Model"];
							tEffPump = thisRow["Effluent Pump"];
							tPumpModel = thisRow["Pump Model"];

							tExcavation = thisRow["Excavation"];
							tPublicWater = thisRow["Public Water"];
							tPrivateWell = thisRow["Private Well"];
							tIaTreatmentUnit = thisRow["IA Treatment Unit"];
							tSepticTankInsp = thisRow["Septic Tank Inspection"];
							tDistrBox = thisRow["DB_PB"];
							tLeachingPool = thisRow["LP_LG"];
							tOtherLeaching = thisRow["Other Leaching"];

							logDebug("Adding checklist: " + inspId);

							var gsSequence = addGuideSheet(capId, inspId, "Sewage Disposal & Water Supply");

							logDebug("Guidesheet Sequence: " + gsSequence);
							vInspectionActivity = inspModel.getActivity();

							var guideBiz = aa.proxyInvoker.newInstance("com.accela.aa.inspection.guidesheet.GGuideSheetBusiness").getOutput();
							var vGuideSheetArray = guideBiz.getGGuideSheetWithItemsByInspections("", [vInspectionActivity]).toArray();

							logDebug("vGuideSheetArray.length: " + vGuideSheetArray.length);

							if (vGuideSheetArray.length != 0)
								var x = 0;
							for (x in vGuideSheetArray)
							{
								var vGuideSheet = vGuideSheetArray[x];
								var gsSeqNumber = vGuideSheet.getGuidesheetSeqNbr();

								logDebug("Current gsSeqNumber: " + gsSeqNumber);
								logDebug("The newly added checklist sequence number is: " + gsSequence);
								logDebug("Checklist ID is: " + vGuideSheet.setIdentifier(tSysLocation));
								//logDebug("vGuideSheet debug item object");
								//debugObject(vGuideSheet);
								if (gsSeqNumber == gsSequence)
								{
									logDebug("Checklist matches!");

									if ("Sewage Disposal & Water Supply".toUpperCase() == vGuideSheet.getGuideType().toUpperCase() && vGuideSheet.getItems() != null)
									{
										var vGuideSheetItemsArray = vGuideSheet.getItems().toArray();
										var z = 0;

										// Checklist ID									
										//debugObject(vGuideSheet);
										logDebug("Update checklist ID:" + tSysLocation);
										vGuideSheet.setIdentifier(tSysLocation);
										aa.guidesheet.updateGGuidesheet(vGuideSheet, vGuideSheet.getAuditID());

										for (z in vGuideSheetItemsArray)
										{
											var vGuideSheetItem = vGuideSheetItemsArray[z];
											//logDebug("vGuideSheetItem debug object");
											//debugObject(vGuideSheetItem);
											//logDebug("GuideItemTest:" + vGuideSheetItem.getGuideItemText());


											if (vGuideSheetItem.getGuideItemText() == "Excavation Inspection")
											{
												logDebug("Setting checklist item status:" + vGuideSheetItem.getGuideItemText() + " to " + tExcavation);
												vGuideSheetItem.setGuideItemStatus(tExcavation);
											}
											else if (vGuideSheetItem.getGuideItemText() == "Public Water")
											{
												logDebug("Setting checklist item status:" + vGuideSheetItem.getGuideItemText() + " to " + tPublicWater);
												vGuideSheetItem.setGuideItemStatus(tPublicWater);
											}
											else if (vGuideSheetItem.getGuideItemText() == "Private Well")
											{
												logDebug("Setting checklist item status:" + vGuideSheetItem.getGuideItemText() + " to " + tPrivateWell);
												vGuideSheetItem.setGuideItemStatus(tPrivateWell);
											}
											else if (vGuideSheetItem.getGuideItemText() == "IA Treatment Unit")
											{
												logDebug("Setting checklist item status:" + vGuideSheetItem.getGuideItemText() + " to " + tIaTreatmentUnit);
												vGuideSheetItem.setGuideItemStatus(tIaTreatmentUnit);
											}
											else if (vGuideSheetItem.getGuideItemText() == "Septic Tank")
											{
												logDebug("Setting checklist item status:" + vGuideSheetItem.getGuideItemText() + " to " + tSepticTankInsp);
												vGuideSheetItem.setGuideItemStatus(tSepticTankInsp);
											}
											else if (vGuideSheetItem.getGuideItemText() == "Distribution Box/Pump Basin")
											{
												logDebug("Setting checklist item status:" + vGuideSheetItem.getGuideItemText() + " to " + tDistrBox);
												vGuideSheetItem.setGuideItemStatus(tDistrBox);
											}
											else if (vGuideSheetItem.getGuideItemText() == "Leaching Pool(s)/Galley(s)")
											{
												logDebug("Setting checklist item status:" + vGuideSheetItem.getGuideItemText() + " to " + tLeachingPool);
												vGuideSheetItem.setGuideItemStatus(tLeachingPool);
											}
											else if (vGuideSheetItem.getGuideItemText() == "Other Leaching Structures")
											{
												logDebug("Setting checklist item status:" + vGuideSheetItem.getGuideItemText() + " to " + tOtherLeaching);
												vGuideSheetItem.setGuideItemStatus(tOtherLeaching);
											}


											var ASISubGroups = vGuideSheetItem.getItemASISubgroupList();
											if (ASISubGroups)
											{
												for (var k = 0; k < ASISubGroups.size(); k++)
												{
													var ASISubGroup = ASISubGroups.get(k);
													var ASIModels = ASISubGroup.getAsiList();
													if (ASIModels)
													{
														for (var m = 0; m < ASIModels.size(); m++)
														{
															var ASIModel = ASIModels.get(m);
															if (ASIModel)
															{
																if (vGuideSheetItem.getGuideItemText() == "Plan Review & Contractor Information")
																{
																	//debugObject(ASIModel);
																	logDebug("ASI value: " + ASIModel.getAsiName());
																	logDebug("vGuideSheetItem value: " + vGuideSheetItem.getGuideItemText());
																	if (ASIModel.getAsiName() == "System Location")
																	{
																		ASIModel.setAttributeValue(tSysLocation);
																		logDebug("Set System Location to: " + tSysLocation);
																	}
																	if (ASIModel.getAsiName() == "SubMap")
																	{
																		ASIModel.setAttributeValue(tSubMap);
																		logDebug("Set SubMap to: " + tSubMap);
																	}
																	if (ASIModel.getAsiName() == "Bedroom Count")
																	{
																		ASIModel.setAttributeValue(tBedroomCnt);
																		logDebug("Set tBedroomCnt to: " + tBedroomCnt);
																	}
																	// Revisit here														
																	logDebug("ASI Comment: " + tComments);
																	//	comment = // from CL comment
																	vGuideSheetItem.setGuideItemComment(tComments);

																}
																if (vGuideSheetItem.getGuideItemText() == "IA Treatment Unit")
																{
																	if (ASIModel.getAsiName() == "Proposed")
																	{
																		//iaProposed = ASIModel.getAttributeValue();
																		var combined = tIAMan + " " + tIAModel;
																		ASIModel.setAttributeValue(combined);
																		logDebug("Set Proposed to: " + combined);
																	}
																}
																if (vGuideSheetItem.getGuideItemText() == "Septic Tank")
																{
																	if (ASIModel.getAsiName() == "Proposed")
																	{
																		//septicProposed = ASIModel.getAttributeValue();
																		ASIModel.setAttributeValue(tSepticTank);
																		logDebug("Set Septic Tank Proposed to: " + tSepticTank);
																	}
																}
																if (vGuideSheetItem.getGuideItemText() == "Leaching Pool(s)/Galley(s)")
																{
																	if (ASIModel.getAsiName() == "Proposed")
																	{
																		//	iaLeachPoolType = ASIModel.getAttributeValue();
																		var combined1 = tLeachType + " " + tLeachDim;
																		ASIModel.setAttributeValue(combined1);
																		logDebug("Set Leaching Pool Proposed to: " + combined1);
																	}
																}

															}
															if (vGuideSheetItem.getGuideItemText() == "Other Leaching Structures")
															{
																if (ASIModel.getAsiName() == "Proposed")
																{
																	var combined2 = tLeachType + " " + tLeachDim + " " + tLeachProd + " " + tLeachModel + " " + tEffPump + " " + tPumpModel;
																	ASIModel.setAttributeValue(combined2);
																	logDebug("Set Other Leaching Structures Proposed to: " + combined2);
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

							var updateResult = aa.guidesheet.updateGGuidesheet(vGuideSheet, vGuideSheet.getAuditID());
							if (updateResult.getSuccess())
							{
								logDebug("Successfully updated guidesheet on inspection " + inspId + ".");
							}
							else
							{
								logDebug("Could not update guidesheet ID: " + updateResult.getErrorMessage());
							}
						}


						logDebug("Current inspection status: " + inspModel.getInspectionStatus() + ". Inpsection ID: " + inspId);
						//insObj[i].setInspectionStatus("Complete");
						//aa.inspection.editInspection(insObj[i]);

						var sysDateYYYYMMDD = dateFormatted(sysDate.getMonth(), sysDate.getDayOfMonth(), sysDate.getYear(), "YYYY-MM-DD");
						logDebug("Date: " + sysDateYYYYMMDD);
						resultInspection(inspModel.getInspectionType(), "Complete", sysDateYYYYMMDD, null)
						logDebug("Created and updated inspection. Break loop.");
						break;
					}

				}

			}
		}
		else		
		{
			logDebug("This is not the very first Plans Coordination and Approved task. Skip creating new inspection and setting expiration date.")

		}


	}
	else
	{
		logDebug("No task history.")
	}
}

if ((wfTask == "Final Review" && wfStatus == "Awaiting Client Reply") ||
	(wfTask == "Inspections" && wfStatus == "Awaiting Client Reply"))
{
	//wwmWorkflowAdditionalInfo("Notice of Incomplete Final Script", "RecordID");
	var finalNoticeTxt = AInfo["Final Notice Text"];
	if (!matches(finalNoticeTxt, null, undefined, ""))				
	{
		/*do 
		{
			// nothing
		}
		while (elapsed() < maxSeconds);
		
		logDebug("Elapsed: " + elapsed());*/

		//EHIMS-4661: Name Shown in Salutation (Notice of Incomplete Final) 
		var itemCap = aa.cap.getCap(capId).getOutput();
		var alternateID = capId.getCustomID();

		var reportParams = aa.util.newHashtable();
		reportParams.put("RecordID", alternateID.toString());

		var wfUser = aa.person.getUser(currentUserID).getOutput();
		var wfFirst = wfUser.getFirstName();
		var wfLast = wfUser.getLastName();
		var userTitle = wfUser.getTitle();

		reportParams.put("FirstName", wfFirst);
		reportParams.put("LastName", wfLast);
		reportParams.put("Title", userTitle);

		logDebugLocal("First, Last, Title: " + wfFirst + "," + wfLast + "," + userTitle);

		wwmWorkflowNOIwithPin("Notice of Incomplete Final", "Notice of Incomplete Final Script", reportParams);

	}
}
if (wfTask == "Final Review" && wfStatus == "Approved")
{
	//workflowFinalReviewApprovedWWM();
	workflowFinalReviewApprovedWWMWithPin();
}

if (wfTask == "Final Review" && wfStatus == "Awaiting O&M Contract")
{
	var contactResult = aa.people.getCapContactByCapID(capId);
	var capContacts = contactResult.getOutput();
	var allEmail = "";
	//getting all contact emails
	for (c in capContacts)
	{
		if (!matches(capContacts[c].email, null, undefined, ""))
		{
			allEmail += capContacts[c].email + ";";
		}
	}
	var lpResult = aa.licenseScript.getLicenseProf(capId);
	if (lpResult.getSuccess())
	{
		var lpArr = lpResult.getOutput();

		//getting all LP emails
		for (var lp in lpArr)
		{
			if (!matches(lpArr[lp].getEmail(), null, undefined, ""))
			{
				allEmail += lpArr[lp].email + ";";
			}
		}
	}
	else 
	{
		logDebug("**ERROR: getting lic profs from Cap: " + lpResult.getErrorMessage());
	}
	var capParcelResult = aa.parcel.getParcelandAttribute(capId, null);
	if (capParcelResult.getSuccess())
	{
		logDebug("capparcelresult is successful");
		var Parcels = capParcelResult.getOutput().toArray();
		for (zz in Parcels)
		{
			var parcelNumber = Parcels[zz].getParcelNumber();
		}
		logDebug("parcelnumber is " + parcelNumber);

	}
	var vEParams = aa.util.newHashtable();
	var addrResult = getAddressInALineCustom(capId);
	var altId = capId.getCustomID();
	addParameter(vEParams, "$$altID$$", getAppSpecific("IA Number"));
	addParameter(vEParams, "$$address$$", addrResult);
	var iaNumberToCheck = getAppSpecific("IA Number", capId);
	logDebug("ianumbertocheck is: " + iaNumberToCheck);
	if (!matches(iaNumberToCheck, null, "", undefined))
	{
	var iaNumberToFind = aa.cap.getCapID(iaNumberToCheck).getOutput();
	logDebug("ianumbertofind is: " + iaNumberToFind);
	}
	if (!matches(iaNumberToFind, null, "", undefined))
	{
	var pin = getAppSpecific("IA PIN Number", iaNumberToFind);
	logDebug("pin is: " + pin);
	}
	addParameter(vEParams, "$$pin$$", pin);
	addParameter(vEParams, "$$wwmAltID$$", altId);
	addParameter(vEParams, "$$Parcel$$", parcelNumber);
	sendNotification("", allEmail, "", "DEQ_IA_APPLICATION_NOTIFICATION", vEParams, null);
}

function logDebugLocal(dstr) {
	if (showDebug)
	{
		aa.print(dstr)
		emailText += dstr + "<br>";
		aa.debug(aa.getServiceProviderCode() + " : " + aa.env.getValue("CurrentUserID"), dstr)
	}
}

function getAddressInALineCustom() {

	var capAddrResult = aa.address.getAddressByCapId(capId);
	var addressToUse = null;
	var strAddress = "";

	if (capAddrResult.getSuccess())
	{
		var addresses = capAddrResult.getOutput();
		if (addresses)
		{
			for (zz in addresses)
			{
				capAddress = addresses[zz];
				if (capAddress.getPrimaryFlag() && capAddress.getPrimaryFlag().equals("Y"))
					addressToUse = capAddress;
			}
			if (addressToUse == null)
				addressToUse = addresses[0];

			if (addressToUse)
			{
				strAddress = "";
				var addPart = addressToUse.getHouseNumberStart();
				if (addPart && addPart != "" && addPart != null)
					strAddress += addPart;
				var addPart = addressToUse.getStreetDirection();
				if (addPart && addPart != "" && addPart != null)
					strAddress += " " + addPart;
				var addPart = addressToUse.getStreetName();
				if (addPart && addPart != "" && addPart != null)
					strAddress += " " + addPart;
				if (matches(addressToUse.getStreetSuffix(), null, ""))
				{
					strAddress += ",";
				}
				var addPart = addressToUse.getStreetSuffix();
				if (addPart && addPart != "" && addPart != null)
					strAddress += " " + addPart + ",";
				var addPart = addressToUse.getCity();
				if (addPart && addPart != "" && addPart != null)
					strAddress += " " + addPart + ",";
				var addPart = addressToUse.getState();
				if (addPart && addPart != "" && addPart != null)
					strAddress += " " + addPart;
				var addPart = addressToUse.getZip();
				if (addPart && addPart != "" && addPart != null)
					strAddress += " " + addPart;
				return strAddress
			}
		}
	}
	return null;
}
function latestInspectionResultWithComments() {
	var insps;
	var inspResultComments = false;
	var inspections = aa.inspection.getInspections(capId);
	var shortestdays = null;
	var inspIdToUse;
	var inspStatus;

	logDebugLocal("Has Inspections: " + inspections.getSuccess());
	if (inspections.getSuccess()) 
	{
		insps = inspections.getOutput();

		// Get the latest inspection
		for (i in insps) 
		{
			logDebugLocal("inspection comment: " + insps[i].getInspectionComments());
			logDebugLocal("Inspection Date:" + insps[i].getInspectionDate());
			logDebugLocal("getInspectionStatus: " + insps[i].getInspectionStatus());
			logDebugLocal("comment?: " + insps[i].inspection.getResultComment());

			if (insps[i].getInspectionDate() != null && insps[i].inspection.getResultComment() != null)
			{
				var inspDate = new Date(insps[i].getInspectionDate().getMonth() + "/" + insps[i].getInspectionDate().getDayOfMonth() + "/" + insps[i].getInspectionDate().getYear());
				logDebugLocal("inspDate: " + inspDate);

				var year = insps[i].getInspectionDate().getYear();
				var month = insps[i].getInspectionDate().getMonth() - 1;
				var day = insps[i].getInspectionDate().getDayOfMonth();
				var hr = insps[i].getInspectionDate().getHourOfDay();
				var min = insps[i].getInspectionDate().getMinute();
				var sec = insps[i].getInspectionDate().getSecond();
				var todaysDate = new Date();
				var todDateCon = (todaysDate.getMonth() + 1) + "/" + todaysDate.getDate() + "/" + (todaysDate.getFullYear());

				var inspectionDateCon = month + "/" + day + "/" + year;

				logDebug("Today Date is: " + todDateCon + ". Inspection Date is: " + inspectionDateCon);
				var dateDiff = parseFloat(dateDifference(inspectionDateCon, todDateCon));
				logDebug("Day difference is: " + dateDiff);


				if (shortestdays == null || (dateDiff < shortestdays))
				{
					inspIdToUse = insps[i].getIdNumber();
					logDebug("getIDNumber: " + inspIdToUse);
					logDebug("Date difference is: " + dateDiff + " which is shorter than: " + shortestdays);
					shortestdays = dateDiff;
				}


			}
			if (shortestdays != null)
			{
				logDebugLocal("Latest inspection ID is: " + inspIdToUse + ", Inspection date: " + shortestdays + " with status: " + insps[i].getInspectionStatus());
			}
		}

		// Only look at the most recent inspection with status "Incomplete"
		var inspResultObj = aa.inspection.getInspection(capId, inspIdToUse);
		logDebugLocal("Inspection ID:" + inspIdToUse);

		if (inspResultObj.getSuccess()) 
		{
			var inspObj = inspResultObj.getOutput();
			logDebugLocal("Inspection Status:" + inspObj.getInspectionStatus());
			if (inspObj && inspObj.getInspectionStatus() == "Incomplete")
			{
				inspResultComments = true;
				logDebugLocal("Inspection ID is used:" + inspIdToUse);
			}
		}
	}
	return inspResultComments;
}

function scheduleInspection(iType, DaysAhead) // optional inspector ID.  This function requires dateAdd function
{
	var inspectorObj = null;
	if (arguments.length == 3)
	{
		var inspRes = aa.person.getUser(arguments[2])
		if (inspRes.getSuccess())
			var inspectorObj = inspRes.getOutput();
	}

	var startDate = new Date();
	var todayDate = (startDate.getMonth() + 1) + "/" + startDate.getDate() + "/" + startDate.getFullYear();

	var schedRes = aa.inspection.scheduleInspection(capId, inspectorObj, aa.date.parseDate(todayDate), null, iType, "Scheduled via Script")

	if (schedRes.getSuccess())
	{
		logDebug("Successfully scheduled inspection : " + iType);

		var insObj = schedRes.getOutput();
		//debugObject(insObj)		
	}
	else
		logDebug("**ERROR: adding scheduling inspection (" + iType + "): " + schedRes.getErrorMessage());
}
function dateAdd(td, amt) {
	// perform date arithmetic on a string
	// td can be "mm/dd/yyyy" (or any string that will convert to JS date)
	// amt can be positive or negative (5, -3) days
	if (!td) 
	{
		dDate = new Date();
	}
	else 
	{
		dDate = convertDate(td);
	}
	//var i = 0;
	//while (i < Math.abs(amt)) 
	//{
	//	dDate = new Date(aa.calendar.getNextWorkDay(aa.date.parseDate(dDate.getMonth()+1 + "/" + dDate.getDate() + "/" + dDate.getFullYear())).getOutput().getTime());
	//	i++;
	//}
	dDate.setTime(dDate.getTime() + (1000 * 60 * 60 * 24 * amt));
	return (dDate.getMonth() + 1) + "/" + dDate.getDate() + "/" + dDate.getFullYear();
}

function dateDifference(date1, date2) {
	return (convertDate(date2).getTime() - convertDate(date1).getTime()) / (1000 * 60 * 60 * 24);
}

function inspectionResultComments() {
	var insps;
	var inspResultComments = false;
	var inspections = aa.inspection.getInspections(capId);
	var latestInspDate = null;
	var inspIdToUse;

	logDebug("Has Inspections: " + inspections.getSuccess());
	if (inspections.getSuccess()) 
	{
		insps = inspections.getOutput();

		// Get the latest inspection
		for (i in insps) 
		{
			logDebug("inspection comment: " + insps[i].getInspectionComments());
			logDebug("Inspection Date:" + insps[i].getInspectionDate());
			logDebug("getInspectionStatus: " + insps[i].getInspectionStatus());
			logDebug("comment?: " + insps[i].inspection.getResultComment());

			if (insps[i].getInspectionDate() != null && insps[i].inspection.getResultComment() != null &
				insps[i].getInspectionStatus() == "Incomplete")
			{
				var inspDate = new Date(insps[i].getInspectionDate().getMonth() + "/" + insps[i].getInspectionDate().getDayOfMonth() + "/" + insps[i].getInspectionDate().getYear());
				logDebug("inspDate: " + inspDate);

				var year = insps[i].getInspectionDate().getYear();
				var month = insps[i].getInspectionDate().getMonth();
				var day = insps[i].getInspectionDate().getDayOfMonth();
				var hr = insps[i].getInspectionDate().getHourOfDay();
				var min = insps[i].getInspectionDate().getMinute();
				var sec = insps[i].getInspectionDate().getSecond();
				logDebug("year, month, day, hr, min, sec:" + year + "," + month + "," + day + "," + hr + "," + min + "," + sec);
				var newDate = new Date(year, month, day, hr, min, sec);
				logDebug("newDate:" + newDate);

				if (latestInspDate == null || (latestInspDate > newDate))
				{
					inspIdToUse = insps[i].getIdNumber();
					logDebug("getIDNumber: " + inspIdToUse);
					logDebug("latestInspDate: " + latestInspDate);
					logDebug("newDate: " + newDate);
					latestInspDate = newDate;
					logDebug("latestInspDate is greater than newDate");
					inspResultComments = true;
				}
			}
		}
	}

	return inspResultComments;
}

function latestCompletedInspection() {
	var insps;
	var inspCompleted = false;
	var inspections = aa.inspection.getInspections(capId);
	var shortestdays = null;
	var inspIdToUse;

	logDebugLocal("Has Inspections: " + inspections.getSuccess());
	if (inspections.getSuccess()) 
	{
		insps = inspections.getOutput();

		// Get the latest inspection
		for (i in insps) 
		{
			logDebugLocal("inspection comment: " + insps[i].getInspectionComments());
			logDebugLocal("Inspection Date:" + insps[i].getInspectionDate());
			logDebugLocal("getInspectionStatus: " + insps[i].getInspectionStatus());
			logDebugLocal("comment?: " + insps[i].inspection.getResultComment());

			if (insps[i].getInspectionDate() != null)
			{
				var inspDate = new Date(insps[i].getInspectionDate().getMonth() + "/" + insps[i].getInspectionDate().getDayOfMonth() + "/" + insps[i].getInspectionDate().getYear());
				logDebugLocal("inspDate: " + inspDate);

				var year = insps[i].getInspectionDate().getYear();
				var month = insps[i].getInspectionDate().getMonth();
				var day = insps[i].getInspectionDate().getDayOfMonth();
				var hr = insps[i].getInspectionDate().getHourOfDay();
				var min = insps[i].getInspectionDate().getMinute();
				var sec = insps[i].getInspectionDate().getSecond();
				var todaysDate = new Date();
				var todDateCon = (todaysDate.getMonth() + 1) + "/" + todaysDate.getDate() + "/" + (todaysDate.getFullYear());

				var inspectionDateCon = month + "/" + day + "/" + year;

				logDebug("Today Date is: " + todDateCon + ". Inspection Date is: " + inspectionDateCon);
				var dateDiff = parseFloat(dateDifference(inspectionDateCon, todDateCon));
				logDebug("Day difference is: " + dateDiff);


				if (shortestdays == null || (dateDiff < shortestdays))
				{
					inspIdToUse = insps[i].getIdNumber();
					logDebug("getIDNumber: " + inspIdToUse);
					logDebug("Date difference is: " + dateDiff + " which is shorter than: " + shortestdays);
					shortestdays = dateDiff;
				}

			}
			if (shortestdays != null)
			{
				logDebugLocal("Latest inspection ID is: " + inspIdToUse + ", Inspection date: " + shortestdays + " with status: " + insps[i].getInspectionStatus());
			}
		}

		// Only look at the most recent inspection with status "Complete"
		if (inspIdToUse != null)
		{
			var inspResultObj = aa.inspection.getInspection(capId, inspIdToUse);
			logDebugLocal("Inspection ID:" + inspIdToUse);

			if (inspResultObj.getSuccess()) 
			{
				var inspObj = inspResultObj.getOutput();
				logDebugLocal("Inspection Status:" + inspObj.getInspectionStatus());
				if (inspObj && inspObj.getInspectionStatus() == "Complete")
				{
					inspCompleted = true;
					logDebugLocal("Inspection ID is used:" + inspIdToUse);
				}
			}
		}
	}
	return inspCompleted;
}

function inspectionCompleted() {
	var insps;
	var inspCompleted = false;
	var inspections = aa.inspection.getInspections(capId);
	logDebug("Has Inspections: " + inspections.getSuccess());
	if (inspections.getSuccess()) 
	{
		insps = inspections.getOutput();
		for (i in insps) 
		{
			logDebug("getInspectionDate: " + insps[i].getInspectionDate());
			logDebug("getInspectionStatus: " + insps[i].getInspectionStatus());
			if (insps[i].getInspectionDate() != null && insps[i].getInspectionStatus() == "Complete")
			{
				logDebug("Inspection Date:" + insps[i].getInspectionDate());
				inspCompleted = true;
			}
			else
			{
				inspCompleted = false;
				break;
			}

		}

	}
	else
	{
		inspCompleted = false;
	}
	return inspCompleted;
}

function elapsed() {
	var thisDate = new Date();
	var thisTime = thisDate.getTime();
	return ((thisTime - startTime) / 1000)
}

function matches(eVal, argList) {
	for (var i = 1; i < arguments.length; i++)
	{
		if (arguments[i] == eVal)
		{
			return true;
		}
	}
	return false;
}
function addDays(date, days) {
	var result = new Date(date);
	result.setDate(result.getDate() + days);
	return result;
}
function jsDateToMMDDYYYY(pJavaScriptDate) {
	//converts javascript date to string in MM/DD/YYYY format
	if (pJavaScriptDate != null)
	{
		if (Date.prototype.isPrototypeOf(pJavaScriptDate))
		{
			return (pJavaScriptDate.getMonth() + 1).toString() + "/" + pJavaScriptDate.getDate() + "/" + pJavaScriptDate.getFullYear();
		} else
		{
			logDebug("Parameter is not a javascript date");
			return ("INVALID JAVASCRIPT DATE");
		}
	} else
	{
		logDebug("Parameter is null");
		return ("NULL PARAMETER VALUE");
	}
}
function dateAddMonths(pDate, pMonths) {
	// Adds specified # of months (pMonths) to pDate and returns new date as string in format MM/DD/YYYY
	// If pDate is null, uses current date
	// pMonths can be positive (to add) or negative (to subtract) integer
	// If pDate is on the last day of the month, the new date will also be end of month.
	// If pDate is not the last day of the month, the new date will have the same day of month, unless such a day doesn't exist in the month, 
	// in which case the new date will be on the last day of the month
	if (!pDate)
	{
		baseDate = new Date();
	} else
	{
		baseDate = convertDate(pDate);
	}
	var day = baseDate.getDate();
	baseDate.setMonth(baseDate.getMonth() + pMonths);
	if (baseDate.getDate() < day)
	{
		baseDate.setDate(1);
		baseDate.setDate(baseDate.getDate() - 1);
	}
	return ((baseDate.getMonth() + 1) + "/" + baseDate.getDate() + "/" + baseDate.getFullYear());
}

function convertDate(thisDate) {
	//converts date to javascript date
	if (typeof (thisDate) == "string")
	{
		var retVal = new Date(String(thisDate));
		if (!retVal.toString().equals("Invalid Date"))
			return retVal;
	}
	if (typeof (thisDate) == "object")
	{
		if (!thisDate.getClass)
		{// object without getClass, assume that this is a javascript date already 
			return thisDate;
		}
		if (thisDate.getClass().toString().equals("class com.accela.aa.emse.dom."))
		{
			return new Date(thisDate.getMonth() + "/" + thisDate.getDayOfMonth() + "/" + thisDate.getYear());
		}
		if (thisDate.getClass().toString().equals("class java.util.Date"))
		{
			return new Date(thisDate.getTime());
		}
		if (thisDate.getClass().toString().equals("class java.lang.String"))
		{
			return new Date(String(thisDate));
		}
	}
	if (typeof (thisDate) == "number")
	{
		return new Date(thisDate);  // assume milliseconds
	}
	logDebug("**WARNING** convertDate cannot parse date : " + thisDate);
	return null;
}
//push
function sendGrantDoc()
{
var emailParams = aa.util.newHashtable();
	var reportParams = aa.util.newHashtable();
	var reportFile = new Array();
	var conArray = getContactArray();
	var conEmail = "";
    var fromEmail = ""; 
	
	var wwmRecord = getAppSpecific("SIP Ref #",capId);
if(wwmRecord)
{	

		var getCapResult = aa.cap.getCapID(wwmRecord);
if (getCapResult.getSuccess())
{
    var GRecord = getCapResult.getOutput();				
   
	 var rowToUpdate = ""
     var vgrantTable = loadASITable("DEQ_SIP_GRANT_ELIGIBILITY", GRecord)
                        
                        if (vgrantTable && vgrantTable.length > 0) {
                            for (var i in vgrantTable) {
                                
  if(vgrantTable[i]["Document Type"] == "Approvable Plans")
  {
                                   
                                         
                                            rowToUpdate = i;
                                            break;
                                        
                                    }
                                
                            }
                        }
						
		var todaysDate = new Date();
		var todDateCon = (todaysDate.getMonth() + 1) + "/" + todaysDate.getDate() + "/" + (todaysDate.getFullYear());				
updateASITableRow("DEQ_SIP_GRANT_ELIGIBILITY", "Current Status", "Complete", rowToUpdate, GRecord, "Admin", "N");
updateASITableRow("DEQ_SIP_GRANT_ELIGIBILITY", "Status Date", todDateCon, rowToUpdate, GRecord, "Admin", "N");
	
         copyDocuments(capId, GRecord, "Grant Proposal Plan");
        var wwmcapContactArray = new Array();
	var wwmcapContResult = aa.people.getCapContactByCapID(GRecord);
	if (wwmcapContResult.getSuccess()) {
		wwmcapContactArray = wwmcapContResult.getOutput();
	}
	
	for (con in wwmcapContactArray)
	{
		if (!matches(wwmcapContactArray[con].email, null, undefined, ""))
		{
			conEmail += wwmcapContactArray[con].email + "; ";
		}
	}	
	


	
    var capContactArray = new Array();
	var capContResult = aa.people.getCapContactByCapID(capId);
var capContactArray = new Array();
	var capContResult = aa.people.getCapContactByCapID(capId);
	if (capContResult.getSuccess()) {
		capContactArray  = capContResult.getOutput();
	}
	
	for (con in capContactArray)
	{
		if (!matches(capContactArray[con].email, null, undefined, ""))
		{
			conEmail += capContactArray[con].email + "; ";
		}
	}

	// EHIMS-5117
	var docList = getDocumentList();
	var docDates = [];
	var maxDate;

	for (doc in docList)
	{
		if (matches(docList[doc].getDocCategory(), "Grant Proposal Plan"))
		{
			logDebug("document type is: " + docList[doc].getDocCategory() + " and upload datetime of document is: " + docList[doc].getFileUpLoadDate().getTime());
			docDates.push(docList[doc].getFileUpLoadDate().getTime());
			maxDate = Math.max.apply(null, docDates);
			logDebug("maxdate is: " + maxDate);

			if (docList[doc].getFileUpLoadDate().getTime() == maxDate)
			{
				var docType = docList[doc].getDocCategory();
				var docFileName = docList[doc].getFileName();
			}
		}
	}

	//preparing most recent sketch document for email attachment
	var docToSend = prepareDocumentForEmailAttachment(capId, "Grant Proposal Plan", docFileName);
	logDebug("docToSend" + docToSend);
	docToSend = docToSend === null ? [] : [docToSend];
	if (!matches(docToSend, null, undefined, ""))
	{
		reportFile.push(docToSend);
	}

	//EHIMS-5041: No LP
	/*var lpResult = aa.licenseScript.getLicenseProf(capId);
	if (lpResult.getSuccess())
	{ 
		var lpArr = lpResult.getOutput();  
	} 
	else 
	{ 
		logDebug("**ERROR: getting lic profs from Cap: " + lpResult.getErrorMessage()); 
	}
	for (var lp in lpArr)
	{
		if (!matches(lpArr[lp].getEmail(), null, undefined, ""))
		{
			conEmail += lpArr[lp].getEmail() + "; ";
		}
	} */
	getRecordParams4Notification(emailParams);
    getWorkflowParams4Notification(emailParams);    
    //addParameter(emailParams, "$$applicationName$$", capId.getCapModel().getAppTypeAlias());
	
	var addrResult = getAddressInALineCustom(capId);
	addParameter(emailParams, "$$addressInALine$$", addrResult);
	addParameter(emailParams, "$$WWMRecord$$",GRecord.getCustomID());
    addParameter(emailParams, "$$altID$$", capId.getCustomID());
	var shortNotes = getShortNotes(capId);
	addParameter(emailParams, "$$shortNotes$$", shortNotes);	
	addACAUrlsVarToEmail(emailParams);

	if (conEmail != null)
	{
		sendNotification("", conEmail, "", "DEQ_SIP_PENDING_GRANT_APPROVAL", emailParams, reportFile);
	}
}
}
}


function getAddressInALine() {

    var capAddrResult = aa.address.getAddressByCapId(capId);
    var addressToUse = null;
    var strAddress = "";

    if (capAddrResult.getSuccess())
    {
        var addresses = capAddrResult.getOutput();
        if (addresses)
        {
            for (zz in addresses)
            {
                capAddress = addresses[zz];
                if (capAddress.getPrimaryFlag() && capAddress.getPrimaryFlag().equals("Y"))
                    addressToUse = capAddress;
            }
            if (addressToUse == null)
                addressToUse = addresses[0];

            if (addressToUse)
            {
                strAddress = addressToUse.getHouseNumberStart();
                var addPart = addressToUse.getStreetDirection();
                if (addPart && addPart != "")
                    strAddress += " " + addPart;
                var addPart = addressToUse.getStreetName();
                if (addPart && addPart != "")
                    strAddress += " " + addPart;
                var addPart = addressToUse.getStreetSuffix();
                if (addPart && addPart != "")
                    strAddress += " " + addPart;
                var addPart = addressToUse.getCity();
                if (addPart && addPart != "")
                    strAddress += " " + addPart + ",";
                var addPart = addressToUse.getState();
                if (addPart && addPart != "")
                    strAddress += " " + addPart;
                var addPart = addressToUse.getZip();
                if (addPart && addPart != "")
                    strAddress += " " + addPart;
                return strAddress
            }
        }
    }
    return null;
}