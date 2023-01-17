// This Script creates an Enforcement Case Record with data from the Permit
// The Enforcement Case will become a child of the Facility, not the Permit
// Any Row in the Violations table that has the checkbox "Create Enforcement Actions" selected will be copied to this new record
// ANy row where "Create Enforcement Actions" is not checked will but there is a value in "Enf Case #" will get updated on that Enf Case"

var myTable = new Array;
var fieldValsArray = new Array;
var myTable = loadASITable("VIOLATIONS",capId);
var violationsAryNew = new Array();
var parentFacilityID =  getFacilityId(capId);

if(!parentFacilityID){
    showMessage = true;
    comment("<B><Font Color='RED'>WARNING: No Parent Facility Record can be identified. Please ensure a Parent Facility Record is identified.</Font></B>")
}
if (myTable != null && parentFacilityID) {
    for (x in myTable) {
        var current_row = myTable[x];
        var asitRow = new Array();
        if(current_row["Create/Assign Enforcement"] == "CHECKED" && matches(current_row["Enf Case #"],null,undefined,"")){
            //No Enf Case entered on table so attempt to create new case initiated
            //Create Enforcement Record unless previously created
            //Check Child records for the Existing Checklist Item Seq No
            var cldEnfAry = new Array;
            var flagFoundGS = false;
            cldEnfAry = getChildren("EnvHealth/Enforcement/Violation/NA",parentFacilityID);
            for(x in cldEnfAry){
                var childEnfCapId = cldEnfAry[x];
                if(valueExistInASIT2Col("VIOLATIONS","Checklist Item ID",current_row["Checklist Item ID"],"Inspection ID",current_row["Inspection ID"],childEnfCapId)){
                    flagFoundGS = true;
                }
            }
            if(flagFoundGS){
                showMessage = true;
                comment("<B><Font Color='RED'>WARNING: This Violation " + current_row["Violation Name"] + " ia already being used on Enforcement record " + childEnfCapId.getCustomID() + ", skipping</Font></B>")
            }else{
                asitRow["Permit #"] = new asiTableValObj("Permit #", "", "Y");
                if(!matches(current_row["Violation Name"],null,undefined,"null")){
                    asitRow["Violation Name"] = new asiTableValObj("Violation Name", current_row["Violation Name"].toString(), "Y");
                }
                if(!matches(current_row["Status"],null,undefined,"null")){
                    asitRow["Status"] = new asiTableValObj("Status", current_row["Status"].toString(), "Y");
                }
                if(!matches(current_row["Degree"],null,undefined,"null")){
                    asitRow["Degree"] = new asiTableValObj("Degree", current_row["Degree"].toString(), "Y");
                }
                if(!matches(current_row["Observed Date"],null,undefined,"null")){
                    asitRow["Observed Date"] = new asiTableValObj("Observed Date",  current_row["Observed Date"].toString(), "Y");
                }
                if(!matches(current_row["Comply By"],null,undefined,"null")){
                    asitRow["Comply By"] = new asiTableValObj("Comply By",current_row["Comply By"].toString(),"N");
                }
                if(!matches(current_row["Complied On"],null,undefined,"null")){
                    asitRow["Complied On"] = new asiTableValObj("Complied On",current_row["Complied On"].toString(),"N");
                }
                if(!matches(current_row["Compliance Type"],null,undefined,"null")){
                    asitRow["Compliance Type"] = new asiTableValObj("Compliance Type",current_row["Compliance Type"].toString(),"N");
                }
                if(!matches(current_row["Checklist Comment"],null,undefined,"null")){
                    asitRow["Checklist Comment"] = new asiTableValObj("Checklist Comment",current_row["Checklist Comment"].toString(),"Y");
                }
                asitRow["Checklist Item ID"] = new asiTableValObj("Checklist Item ID", current_row["Checklist Item ID"].toString(), "Y");
                asitRow["Inspection ID"] = new asiTableValObj("Inspection ID", current_row["Inspection ID"].toString(), "Y");
                asitRow["Permit #"] = new asiTableValObj("Permit #", capId.getCustomID(), "Y");
                violationsAryNew.push(asitRow);
            }
            //Set Create Enforcement Actions back to unchecked
			editSpecificASITableRow2Column(capId, "VIOLATIONS", "Checklist Item ID", parseInt(current_row["Checklist Item ID"]),"Inspection ID", parseInt(current_row["Inspection ID"]),"Create/Assign Enforcement","UNCHECKED");
			
        }else if (current_row["Create/Assign Enforcement"] == "CHECKED" && !matches(current_row["Enf Case #"],null,undefined,"")){
            //If there is already a value in the Enf Case# then assume the user wants to add this Violation to an existing Case
            //Check Child records for the Existing Checklist Item Seq No
            //If not found then attempt to Add a ROw to the Violation table in an existing Record
            //Enf Record ASlt Id must match what was specified in the nf Case # field
            var flagFoundGSExisting = false;
            var flagCouldNotFindEnfCase = true;
            cldEnfAry = getChildren("EnvHealth/Enforcement/Violation/NA",parentFacilityID);
            for(x in cldEnfAry){
                var violationsAryExisting = new Array;
                var childEnfCapId = cldEnfAry[x];
                if(childEnfCapId.getCustomID() == current_row["Enf Case #"].toString()){
                    if(valueExistInASIT2Col("VIOLATIONS","Checklist Item ID",current_row["Checklist Item ID"].fieldValue,"Inspection ID",current_row["Inspection ID"].fieldValue,childEnfCapId)){
                        flagFoundGSExisting = true;
                    }
                    flagCouldNotFindEnfCase = false;
                    if(!flagFoundGSExisting){
                        //Add a row to the ASIT on target case
                        var existingEnfCaseID = getApplication(current_row["Enf Case #"].toString());
                        if(!matches(existingEnfCaseID,null,undefined,"")){
                            asitRow["Permit #"] = new asiTableValObj("Permit #", "", "Y");
                            if(!matches(current_row["Violation Name"],null,undefined,"null")){
                                asitRow["Violation Name"] = new asiTableValObj("Violation Name", current_row["Violation Name"].toString(), "Y");
                            }
                            if(!matches(current_row["Status"],null,undefined,"null")){
                                asitRow["Status"] = new asiTableValObj("Status", current_row["Status"].toString(), "Y");
                            }
                            if(!matches(current_row["Degree"],null,undefined,"null")){
                                asitRow["Degree"] = new asiTableValObj("Degree", current_row["Degree"].toString(), "Y");
                            }
                            if(!matches(current_row["Observed Date"],null,undefined,"null")){
                                asitRow["Observed Date"] = new asiTableValObj("Observed Date",  current_row["Observed Date"].toString(), "Y");
                            }
                            if(!matches(current_row["Comply By"],null,undefined,"null")){
                                asitRow["Comply By"] = new asiTableValObj("Comply By",current_row["Comply By"].toString(),"N");
                            }
                            if(!matches(current_row["Complied On"],null,undefined,"null")){
                                asitRow["Complied On"] = new asiTableValObj("Complied On",current_row["Complied On"].toString(),"N");
                            }
                            if(!matches(current_row["Compliance Type"],null,undefined,"null")){
                                asitRow["Compliance Type"] = new asiTableValObj("Compliance Type",current_row["Compliance Type"].toString(),"N");
                            }
                            if(!matches(current_row["Checklist Comment"],null,undefined,"null")){
                                asitRow["Checklist Comment"] = new asiTableValObj("Checklist Comment",current_row["Checklist Comment"].toString(),"Y");
                            }
                            asitRow["Checklist Item ID"] = new asiTableValObj("Checklist Item ID", current_row["Checklist Item ID"].toString(), "Y");
                            asitRow["Inspection ID"] = new asiTableValObj("Inspection ID", current_row["Inspection ID"].toString(), "Y");
                            asitRow["Permit #"] = new asiTableValObj("Permit #", capId.getCustomID(), "Y");
                            
                            violationsAryExisting.push(asitRow);
                            if(violationsAryExisting.length > 0){
                                addASITable("VIOLATIONS", violationsAryExisting, existingEnfCaseID);
                            }

                        }
                    }
                }
            }
            // If the Specified Case cant be found update the Enf Case # field in the table to "NOT FOUND"
           // if(flagCouldNotFindEnfCase){
			//	editSpecificASITableRow2Column(capId, "VIOLATIONS", "Checklist Item ID", parseInt(current_row["Checklist Item ID"].fieldValue),"Inspection ID", parseInt(current_row["Inspection ID"].fieldValue), "Enf Case #","NOT FOUND");
            //}
            //Set Create Enforcement Actions back to unchecked
			editSpecificASITableRow2Column(capId, "VIOLATIONS", "Checklist Item ID", parseInt(current_row["Checklist Item ID"].fieldValue),"Inspection ID", parseInt(current_row["Inspection ID"].fieldValue),"Create/Assign Enforcement","UNCHECKED");
        }else if (current_row["Create/Assign Enforcement"] != "CHECKED" && !matches(current_row["Enf Case #"],null,undefined,"")){
            enfCapId = getApplication(current_row["Enf Case #"].toString());
            var GSInspId = current_row["Inspection ID"].fieldValue;
            if(!matches(current_row["Checklist Item ID"],undefined,null)){
                var GSSeqNo = current_row["Checklist Item ID"].fieldValue;
                var tblStatus = current_row["Status"].fieldValue;
                var degree = current_row["Degree"].fieldValue;
                var obsDate = current_row["Observed Date"].fieldValue;
                var complyBy = current_row["Comply By"].fieldValue;
                var complyOn = current_row["Complied On"].fieldValue;
                var complyType = current_row["Compliance Type"].fieldValue;
                var checklistCom = current_row["Checklist Comment"].fieldValue;
                editSpecificASITableRowforInteger2Column(enfCapId, "VIOLATIONS", "Checklist Item ID", GSSeqNo,"Inspection ID", GSInspId,"Status", tblStatus);
                editSpecificASITableRowforInteger2Column(enfCapId, "VIOLATIONS", "Checklist Item ID", GSSeqNo,"Inspection ID", GSInspId,"Degree", degree);
                editSpecificASITableRowforInteger2Column(enfCapId, "VIOLATIONS", "Checklist Item ID", GSSeqNo,"Inspection ID", GSInspId,"Observed Date", obsDate);
                editSpecificASITableRowforInteger2Column(enfCapId, "VIOLATIONS", "Checklist Item ID", GSSeqNo,"Inspection ID", GSInspId,"Comply By", complyBy);
                editSpecificASITableRowforInteger2Column(enfCapId, "VIOLATIONS", "Checklist Item ID", GSSeqNo,"Inspection ID", GSInspId,"Complied On", complyOn);
                editSpecificASITableRowforInteger2Column(enfCapId, "VIOLATIONS", "Checklist Item ID", GSSeqNo,"Inspection ID", GSInspId,"Compliance Type", complyType);
                editSpecificASITableRowforInteger2Column(enfCapId, "VIOLATIONS", "Checklist Item ID", GSSeqNo,"Inspection ID", GSInspId,"Checklist Comment", checklistCom);
            }
        }
    }
}

if(violationsAryNew.length > 0 ){
    //Create the Enforcement Case
    var newEnfCapId = createChild("EnvHealth", "Enforcement", "Violation", "NA", "",parentFacilityID);
    var sourceCap = aa.cap.getCap(capId).getOutput();
    var newEnfCapAlias = sourceCap.getCapType().getAlias();
    editAppSpecific("Case Initiated Date",dateAdd(null,0),newEnfCapId);
    if(!matches(newEnfCapAlias,null,undefined)){
        editAppSpecific("Parent Record Type",newEnfCapAlias,newEnfCapId);
    }
    addASITable("VIOLATIONS", violationsAryNew, newEnfCapId);
    //Final step is to update the Enf Case and Permit Number fields
    for (x in violationsAryNew){
		editSpecificASITableRow2Column(capId, "VIOLATIONS", "Checklist Item ID", parseInt(violationsAryNew[x]["Checklist Item ID"]),"Inspection ID", parseInt(violationsAryNew[x]["Inspection ID"]),"Enf Case #",newEnfCapId.getCustomID());
    }
    for (x in violationsAryNew){
		editSpecificASITableRow2Column(capId, "VIOLATIONS", "Checklist Item ID", parseInt(violationsAryNew[x]["Checklist Item ID"]),"Inspection ID", parseInt(violationsAryNew[x]["Inspection ID"]),"Permit #",capId.getCustomID());
    }
}


function editRecordStatus(targetCapId, strStatus){
    var capModel = aa.cap.getCap(targetCapId).getOutput();
    capModel.setCapStatus(strStatus);
    aa.cap.editCapByPK(capModel.getCapModel());
  }
  function copyASIBySubGroup(sourceCapId, targetCapId, vSubGroupName) {
    useAppSpecificGroupName = true;
    var sAInfo = new Array;
    loadAppSpecific(sAInfo, sourceCapId);
    for (var asi in sAInfo) {
      if( asi.substr(0,asi.indexOf(".")) == vSubGroupName){
        editAppSpecific(asi, sAInfo[asi], targetCapId);
      }
    }
    useAppSpecificGroupName = false;
  }
  function getAppName(capId){    
    capResult = aa.cap.getCap(capId);
    capModel = capResult.getOutput().getCapModel()
    var appName = capModel.getSpecialText();
    if(appName){
      return appName;
    }else{
          return false;
    }
  }
  function updateFacilityInfo(targetCapId,vFacilityId){
      var capResult = aa.cap.getCap(vFacilityId);
      if(capResult != null){
          var capModel = capResult.getOutput().getCapModel()
          var appName = capModel.getSpecialText();
          var itemName = "Facility ID";
          var itemGroup = null;
          if (useAppSpecificGroupName){
              if (itemName.indexOf(".") < 0)
                  { logDebug("**WARNING: editAppSpecific requires group name prefix when useAppSpecificGroupName is true") ; return false }
              itemGroup = itemName.substr(0,itemName.indexOf("."));
              itemName = itemName.substr(itemName.indexOf(".")+1);
          }
          var appSpecInfoResult = aa.appSpecificInfo.editSingleAppSpecific(targetCapId,itemName,vFacilityId.getCustomID(),itemGroup);
          if (appSpecInfoResult.getSuccess()){
              logDebug( "INFO: " + itemName + " was updated."); 
          } 	
          else{
              logDebug( "WARNING: " + itemName + " was not updated."); 
          }
          var itemName = "Facility Name";
          var itemGroup = null;
          if (useAppSpecificGroupName){
              if (itemName.indexOf(".") < 0)
                  { logDebug("**WARNING: editAppSpecific requires group name prefix when useAppSpecificGroupName is true") ; return false }
              itemGroup = itemName.substr(0,itemName.indexOf("."));
              itemName = itemName.substr(itemName.indexOf(".")+1);
          }
          var appSpecInfoResult = aa.appSpecificInfo.editSingleAppSpecific(targetCapId,itemName,appName,itemGroup);
          if (appSpecInfoResult.getSuccess()){
              logDebug( "INFO: " + itemName + " was updated."); 
          } 	
          else{
              logDebug( "WARNING: " + itemName + " was not updated."); 
          }
          var itemName = "Facility DBA";
          var itemGroup = null;
          if (useAppSpecificGroupName){
              if (itemName.indexOf(".") < 0)
                  { logDebug("**WARNING: editAppSpecific requires group name prefix when useAppSpecificGroupName is true") ; return false }
              itemGroup = itemName.substr(0,itemName.indexOf("."));
              itemName = itemName.substr(itemName.indexOf(".")+1);
          }
          var appSpecInfoResult = aa.appSpecificInfo.editSingleAppSpecific(targetCapId,itemName,getAppSpecific("Facility DBA",vFacilityId),itemGroup);
          if (appSpecInfoResult.getSuccess()){
              logDebug( "INFO: " + itemName + " was updated."); 
          } 	
          else{
              logDebug( "WARNING: " + itemName + " was not updated."); 
          }
          var itemName = "Business Code";
          var itemGroup = null;
          if (useAppSpecificGroupName){
              if (itemName.indexOf(".") < 0)
                  { logDebug("**WARNING: editAppSpecific requires group name prefix when useAppSpecificGroupName is true") ; return false }
              itemGroup = itemName.substr(0,itemName.indexOf("."));
              itemName = itemName.substr(itemName.indexOf(".")+1);
          }
          var appSpecInfoResult = aa.appSpecificInfo.editSingleAppSpecific(targetCapId,itemName,getAppSpecific("Business Code",vFacilityId),itemGroup);
          if (appSpecInfoResult.getSuccess()){
              logDebug( "INFO: " + itemName + " was updated."); 
          } 	
          else{
              logDebug( "WARNING: " + itemName + " was not updated."); 
          }
          var itemName = "Billing Anniversary";
          var itemGroup = null;
          if (useAppSpecificGroupName){
              if (itemName.indexOf(".") < 0)
                  { logDebug("**WARNING: editAppSpecific requires group name prefix when useAppSpecificGroupName is true") ; return false }
              itemGroup = itemName.substr(0,itemName.indexOf("."));
              itemName = itemName.substr(itemName.indexOf(".")+1);
          }
          var appSpecInfoResult = aa.appSpecificInfo.editSingleAppSpecific(targetCapId,itemName,getAppSpecific("Billing Anniversary",vFacilityId),itemGroup);
          if (appSpecInfoResult.getSuccess()){
              logDebug( "INFO: " + itemName + " was updated."); 
          } 	
          else{
              logDebug( "WARNING: " + itemName + " was not updated."); 
          }
      }
  }
  //Import these into the INCLUDES_CUSTOM
function addBStructure(vCapId,structNo,structType,structName,structDesc){
    var added = aa.bStructure.addStructure(vCapId, structNo, structType, structName, structDesc, "", aa.date.getCurrentDate());
    if (added.getSuccess()) {
        logDebug("BStructure Added Successfully");
        return true;
    } else {
        logDebug("BStructure Added ERROR: " + added.getErrorMessage());
        return false;
    }
}
function updateBStructure(vCapId,structNo,structType,structName,structDesc){
    var updated = aa.bStructure.updateStructure(vCapId, structNo, structType, structName, structDesc, "", aa.date.getCurrentDate());
    if (updated.getSuccess()) {
        logDebug("BStructure Updated Successfully");
        return true;
    } else {
        logDebug("BStructure Updated ERROR: " + updated.getErrorMessage());
        return false;
    }
}
function updateGuidesheetFieldValueByArrayMultiPermtAct(updateArr) {
	for (var Permit in updateArr){
		var ArrayCapId = updateArr[Permit][4];
		var r = aa.inspection.getInspections(ArrayCapId);
		if (r.getSuccess()) {
			var inspArray = r.getOutput();
			for (i in inspArray) {
				var inspModel = inspArray[i].getInspection();
				var gs = inspModel.getGuideSheets();
				if (gs) {
					gsArray = gs.toArray();
					for(gsIdx in gsArray){
						var guideSheetObj = gsArray[gsIdx];
						var guidesheetItem = guideSheetObj.getItems();
						for(var j=0;j< guidesheetItem.size();j++) {
							var item = guidesheetItem.get(j);
							for (var gItem in updateArr){
								var ArraySeqNo = updateArr[gItem][0];
								var ArrayRowViolName = updateArr[gItem][1];
								var ArrayASIName1 = updateArr[gItem][2];
								var ArrayASIValue1 = updateArr[gItem][3];
								var ArrayCapId = updateArr[gItem][4];
								if(parseInt(ArraySeqNo) == item.guideItemSeqNbr){
									//1. Filter Guide Sheet items by Guide sheet item name && ASI group code
									if(item.getGuideItemText() == ArrayRowViolName) {
										var ASISubGroups = item.getItemASISubgroupList();
										if(ASISubGroups) {
											//2. Filter ASI sub group by ASI Sub Group name
											for(var k=0;k< ASISubGroups.size();k++) {
												var ASISubGroup = ASISubGroups.get(k);
                                    var ASIModels =  ASISubGroup.getAsiList();
                                    if(ASIModels) {
                                          //3. Filter ASI by ASI name
                                          for( var m = 0; m< ASIModels.size();m++) {
                                             var ASIModel = ASIModels.get(m);
                                             if(ASIModel && ASIModel.getAsiName() == ArrayASIName1) {
                                                logDebug(ArrayRowViolName + " Change ASI value " + ASIModel.getAsiName() + " from:"+ ASIModel.getAttributeValue() +" to " + ArrayASIValue1);
                                                //4. Reset ASI value
                                                ASIModel.setAttributeValue(ArrayASIValue1);
                                             }
                                          }
                                    }
											}
										}
									}
								}
							}
						}				
						//Update the guidesheet
						var updateResult = aa.guidesheet.updateGGuidesheet(guideSheetObj,guideSheetObj.getAuditID());
						if (updateResult.getSuccess()) {
							logDebug("Successfully updated GS Data on inspection " + inspArray[i].getIdNumber() + ".");
						} else {
							logDebug("Could not update guidesheet ID: " + updateResult.getErrorMessage());
							return false;
						}
					}
				} else {
					// if there are guidesheets
					logDebug("No guidesheets for this inspection");
					return false;
				}
			}
		} else {
			logDebug("No inspections on the record");
			return false;
		}
		logDebug("No updates to the guidesheet made");
		return false;
	}

}
function editSpecificASITableRow(tableCapId, tableName, keyName, keyValue, editName, editValue) {
	// keyName and keyValue is the column name and column value you want to use to filter for records you want to update
	// editName and editValue are the new values
   var tableArr = loadASITable(tableName, tableCapId);
   var tssmResult = aa.appSpecificTableScript.removeAppSpecificTableInfos(tableName,tableCapId,"ADMIN");
   if (tableArr) {
      for (var r in tableArr) {
         if (tableArr[r][keyName] != keyValue) {
            var rowArr=new Array();
            var tempArr=new Array();
            for (var col in tableArr[r]) {
               var tVal = new asiTableValObj(tableArr[r][col].columnName, tableArr[r][col].fieldValue, tableArr[r][col].readOnly);
               var tVal = tableArr[r][col];
               //bizarre string conversion - just go with it
               var colName = new String(tableArr[r][col].columnName.toString());
               colName=colName.toString();
               tempArr[colName] = tVal;
            }
            rowArr.push(tempArr); 
            //for (var val in rowArr) for (var c in rowArr[val]) aa.print("Value " + c + ": " + rowArr[val][c]);
            addASITable(tableName,rowArr,tableCapId);
         }
         else {
            logDebug(" Editing row " + r);
            var rowArr=new Array();
            var tempArr=new Array();
            for (var col in tableArr[r]) {
               if (tableArr[r][col].columnName.toString() == editName) {
                  var tVal = tableArr[r][col];
                  tVal.fieldValue = editValue;
               }
               else {
                  var tVal = tableArr[r][col];
               }
               //bizarre string conversion - just go with it
               var colName = new String(tableArr[r][col].columnName.toString());
               colName=colName.toString();
               tempArr[colName] = tVal;
            }
            rowArr.push(tempArr); 
            //for (var val in rowArr) for (var c in rowArr[val]) aa.print("Value " + c + ": " + rowArr[val][c]);
            addASITable(tableName,rowArr,tableCapId);
         }
      }
   }//end loop
}
function editSpecificASITableRow2Column(tableCapId, tableName, keyName1, keyValue1,keyName2, keyValue2, editName, editValue) {
	// keyName and keyValue is the column name and column value you want to use to filter for records you want to update
	// editName and editValue are the new values
   var tableArr = loadASITable(tableName, tableCapId);
   var tssmResult = aa.appSpecificTableScript.removeAppSpecificTableInfos(tableName,tableCapId,"ADMIN");
   if (tableArr) {
      for (var r in tableArr) {
         if (tableArr[r][keyName1] == keyValue1 && tableArr[r][keyName2] == keyValue2) {
            logDebug(" Editing row " + r);
            var rowArr=new Array();
            var tempArr=new Array();
            for (var col in tableArr[r]) {
               if (tableArr[r][col].columnName.toString() == editName) {
                  var tVal = tableArr[r][col];
                  tVal.fieldValue = editValue;
               }
               else {
                  var tVal = tableArr[r][col];
               }
               //bizarre string conversion - just go with it
               var colName = new String(tableArr[r][col].columnName.toString());
               colName=colName.toString();
               tempArr[colName] = tVal;
            }
            rowArr.push(tempArr); 
            //for (var val in rowArr) for (var c in rowArr[val]) aa.print("Value " + c + ": " + rowArr[val][c]);
            addASITable(tableName,rowArr,tableCapId);
         }else{
            var rowArr=new Array();
            var tempArr=new Array();
            for (var col in tableArr[r]) {
               var tVal = new asiTableValObj(tableArr[r][col].columnName, tableArr[r][col].fieldValue, tableArr[r][col].readOnly);
               var tVal = tableArr[r][col];
               //bizarre string conversion - just go with it
               var colName = new String(tableArr[r][col].columnName.toString());
               colName=colName.toString();
               tempArr[colName] = tVal;
            }
            rowArr.push(tempArr); 
            //for (var val in rowArr) for (var c in rowArr[val]) aa.print("Value " + c + ": " + rowArr[val][c]);
            addASITable(tableName,rowArr,tableCapId);
         }
      }
   }//end loop
}
function editSpecificASITableRowforInteger(tableCapId, tableName, keyName, keyValue, editName, editValue) {
	// keyName and keyValue is the column name and column value you want to use to filter for records you want to update
	// editName and editValue are the new values
   var tableArr = loadASITable(tableName, tableCapId);
   var tssmResult = aa.appSpecificTableScript.removeAppSpecificTableInfos(tableName,tableCapId,"ADMIN");
   if (tableArr) {
      for (var r in tableArr) {
         if (parseInt(tableArr[r][keyName]) != parseInt(keyValue)) {
            var rowArr=new Array();
            var tempArr=new Array();
            for (var col in tableArr[r]) {
               var tVal = new asiTableValObj(tableArr[r][col].columnName, tableArr[r][col].fieldValue, tableArr[r][col].readOnly);
               var tVal = tableArr[r][col];
               //bizarre string conversion - just go with it
               var colName = new String(tableArr[r][col].columnName.toString());
               colName=colName.toString();
               tempArr[colName] = tVal;
            }
            rowArr.push(tempArr); 
            //for (var val in rowArr) for (var c in rowArr[val]) aa.print("Value " + c + ": " + rowArr[val][c]);
            addASITable(tableName,rowArr,tableCapId);
         }
         else {
            logDebug(" Editing row " + r);
            var rowArr=new Array();
            var tempArr=new Array();
            for (var col in tableArr[r]) {
               if (tableArr[r][col].columnName.toString() == editName) {
                  var tVal = tableArr[r][col];
                  tVal.fieldValue = editValue;
               }
               else {
                  var tVal = tableArr[r][col];
               }
               //bizarre string conversion - just go with it
               var colName = new String(tableArr[r][col].columnName.toString());
               colName=colName.toString();
               tempArr[colName] = tVal;
            }
            rowArr.push(tempArr); 
            //for (var val in rowArr) for (var c in rowArr[val]) aa.print("Value " + c + ": " + rowArr[val][c]);
            addASITable(tableName,rowArr,tableCapId);
         }
      }
   }//end loop
}
function editSpecificASITableRowforInteger2Column(tableCapId, tableName, keyName1, keyValue1,keyName2, keyValue2, editName, editValue) {
	// keyName and keyValue is the column name and column value you want to use to filter for records you want to update
	// editName and editValue are the new values
   var tableArr = loadASITable(tableName, tableCapId);
   var tssmResult = aa.appSpecificTableScript.removeAppSpecificTableInfos(tableName,tableCapId,"ADMIN");
   if (tableArr) {
      for (var r in tableArr) {
        if (parseInt(tableArr[r][keyName1]) == parseInt(keyValue1) && parseInt(tableArr[r][keyName2]) == parseInt(keyValue2)) {
            var rowArr=new Array();
            var tempArr=new Array();
            for (var col in tableArr[r]) {
               if (tableArr[r][col].columnName.toString() == editName) {
                  logDebug(" Editing row " + r + " updating " + tableArr[r][col].columnName.toString() + " to " + editValue);
                  var tVal = tableArr[r][col];
                  tVal.fieldValue = editValue;
               }
               else {
                  var tVal = tableArr[r][col];
               }
               //bizarre string conversion - just go with it
               var colName = new String(tableArr[r][col].columnName.toString());
               colName=colName.toString();
               tempArr[colName] = tVal;
            }
            rowArr.push(tempArr); 
            //for (var val in rowArr) for (var c in rowArr[val]) aa.print("Value " + c + ": " + rowArr[val][c]);
            addASITable(tableName,rowArr,tableCapId);
         
         }else {
            var rowArr=new Array();
            var tempArr=new Array();
            for (var col in tableArr[r]) {
               var tVal = new asiTableValObj(tableArr[r][col].columnName, tableArr[r][col].fieldValue, tableArr[r][col].readOnly);
               var tVal = tableArr[r][col];
               //bizarre string conversion - just go with it
               var colName = new String(tableArr[r][col].columnName.toString());
               colName=colName.toString();
               tempArr[colName] = tVal;
            }
            rowArr.push(tempArr); 
            //for (var val in rowArr) for (var c in rowArr[val]) aa.print("Value " + c + ": " + rowArr[val][c]);
            addASITable(tableName,rowArr,tableCapId);
         }
      }
   }//end loop
}
function getActivityCustomFieldValue(capId,activityCustomFieldName,curActivityNumber){
	var activityBusiness = aa.proxyInvoker.newInstance("com.accela.aa.aamain.servicerequest.ActivityBusiness").getOutput();
	var ActivitySpecInfoBusiness = aa.proxyInvoker.newInstance("com.accela.aa.aamain.activityspecinfo.ActivitySpecInfoBusiness").getOutput();
	if(activityBusiness != null){
		var activityList = activityBusiness.getActivityListBySR(capId);
		if(!activityList) {
			logDebug("No activities on target record.");
			return false;
		}
		var lIt = activityList.iterator();
		while(lIt.hasNext()){
			var thisActivity = lIt.next();
			if(thisActivity.getActivityNumber() == parseInt(curActivityNumber)){
				var fieldsList = ActivitySpecInfoBusiness.getRefASIsByRefAcitivity(aa.getServiceProviderCode(),'RECORD',thisActivity.getActivityNumber());
				var fIt = fieldsList.iterator();
				while(fIt.hasNext()){
					var thisField = fIt.next();
					if(thisField.ASIName == activityCustomFieldName){
						return thisField.dispASIValue;
					}
				}
			}
		}
	}
}
function getFacilityId(vCapId){
    var facilityId = null;
    facilityId = getParentByCapId(vCapId);
    if(!matches(facilityId,null,undefined,"")){
        if(appMatch("EnvHealth/Facility/NA/NA",facilityId)){
            return facilityId;
        }else{
            // If Parent isnt a Facility, try the Gradparent
            facilityId = getParentByCapId(facilityId);
            if(!matches(facilityId,null,undefined,"")){
                if(appMatch("EnvHealth/Facility/NA/NA",facilityId)){
                    return facilityId;
                }
            }
        }
    }
    return false;
}
function getGuideSheetFieldValue(gsCustomFieldItem,itemCap,inspIDNumArg,gsItemSeqNo) {
	var r = aa.inspection.getInspections(itemCap);
	if (r.getSuccess()) {
		var inspArray = r.getOutput();
		for (i in inspArray) {
			var inspModel = inspArray[i].getInspection();
			if(inspModel.getIdNumber() == inspIDNumArg){
				var gs = inspModel.getGuideSheets();
				if (gs) {
					for (var i = 0; i < gs.size(); i++) {
						var guideSheetObj = gs.get(i);
						var guidesheetItem = guideSheetObj.getItems();
						for (var j = 0; j < guidesheetItem.size(); j++) {
							var item = guidesheetItem.get(j);
							if(item.guideItemSeqNbr == parseInt(gsItemSeqNo)){
								if (item.getItemASISubgroupList() != null) {
									var subGroupList = item.getItemASISubgroupList();
									if (subGroupList != null) {
										for (var index = 0; index < subGroupList.size(); index++) {
											var subGroupItem = subGroupList.get(index);
											if (subGroupItem != null) {
												var asiList = subGroupItem.getAsiList();
												for (var asiIndex = 0; asiIndex < asiList.size(); asiIndex++) {
													var asiItem = asiList.get(asiIndex);
													if (asiItem.getAsiName() == gsCustomFieldItem) {
														if (asiItem.getAttributeValue() != null && asiItem.getAttributeValue() != "") {
															return asiItem.getAttributeValue();
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
			}
		}
	}
	return "";

}
function updateGuidesheetFieldValueByArray(updateArr, vCapId) {
	var r = aa.inspection.getInspections(vCapId);
	if (r.getSuccess()) {
		var inspArray = r.getOutput();
		for (i in inspArray) {
            var vInspId = inspArray[i].getIdNumber();
            var inspModel = inspArray[i].getInspection();
            var gs = inspModel.getGuideSheets();
            if (gs) {
                gsArray = gs.toArray();
                for(gsIdx in gsArray){
                    var guideSheetObj = gsArray[gsIdx];
                    var guidesheetItem = guideSheetObj.getItems();
                    for(var j=0;j< guidesheetItem.size();j++) {
                        var item = guidesheetItem.get(j);
                        for (var gItem in updateArr){
                            var ArraySeqNo = updateArr[gItem][0];
                            var ArrayRowViolName = updateArr[gItem][1];
                            var ArrayASIName1 = updateArr[gItem][2];
                            var ArrayASIValue1 = updateArr[gItem][3];
                            var ArrayASIName2 = updateArr[gItem][4];
                            var ArrayASIValue2 = updateArr[gItem][5];
                            var ArrayASIName3 = updateArr[gItem][6];
                            var ArrayASIValue3 = updateArr[gItem][7];
                            var ArrayCapId = updateArr[gItem][8];
                            var ArrayInspd = updateArr[gItem][9];
                            if(parseInt(ArraySeqNo) == item.guideItemSeqNbr && parseInt(ArrayInspd) == vInspId){
								//1. Filter Guide Sheet items by Guide sheet item name && ASI group code
								if(item.getGuideItemText() == ArrayRowViolName) {
									var ASISubGroups = item.getItemASISubgroupList();
									if(ASISubGroups) {
										//2. Filter ASI sub group by ASI Sub Group name
										for(var k=0;k< ASISubGroups.size();k++) {
											var ASISubGroup = ASISubGroups.get(k);
                                            var ASIModels =  ASISubGroup.getAsiList();
                                            if(ASIModels) {
                                                //3. Filter ASI by ASI name
                                                for( var m = 0; m< ASIModels.size();m++) {
                                                    var ASIModel = ASIModels.get(m);
                                                    if(ASIModel && ASIModel.getAsiName() == ArrayASIName1) {
                                                        logDebug(ArrayRowViolName + " Change ASI value " + ASIModel.getAsiName() + " from:"+ ASIModel.getAttributeValue() +" to " + ArrayASIValue1);
                                                        //4. Reset ASI value
                                                        ASIModel.setAttributeValue(ArrayASIValue1);
                                                    }
                                                    if(ASIModel && ASIModel.getAsiName() == ArrayASIName2) {
                                                        logDebug(ArrayRowViolName + " Change ASI value " + ASIModel.getAsiName() + " from:"+ ASIModel.getAttributeValue() +" to " + ArrayASIValue2);
                                                        //4. Reset ASI value
                                                        ASIModel.setAttributeValue(ArrayASIValue2);
                                                    }
                                                    if(ASIModel && ASIModel.getAsiName() == ArrayASIName3) {
                                                        logDebug(ArrayRowViolName + " Change ASI value " + ASIModel.getAsiName() + " from:"+ ASIModel.getAttributeValue() +" to " + ArrayASIValue3);
                                                        //4. Reset ASI value
                                                        ASIModel.setAttributeValue(ArrayASIValue3);
                                                    }
                                                }
                                            }
										}
									}
								}
							}
                        }
                    }				
                    //Update the guidesheet
                    var updateResult = aa.guidesheet.updateGGuidesheet(guideSheetObj,guideSheetObj.getAuditID());
                    if (updateResult.getSuccess()) {
                        logDebug("Successfully updated GS Data on inspection " + inspArray[i].getIdNumber() + ".");
                    } else {
                        logDebug("Could not update guidesheet ID: " + updateResult.getErrorMessage());
                        return false;
                    }
                }
            } else {
                // if there are guidesheets
                logDebug("No guidesheets for this inspection");
                return false;
            }
		}
	} else {
		logDebug("No inspections on the record");
		return false;
	}
	logDebug("No updates to the guidesheet made");
	return false;
} 
function updateGuidesheetFieldValueByArrayMultiPermt(updateArr) {
	for (var Permit in updateArr){
		var ArrayCapId = updateArr[Permit][8];
		var r = aa.inspection.getInspections(ArrayCapId);
		if (r.getSuccess()) {
			var inspArray = r.getOutput();
			for (i in inspArray) {
				var vInspId = inspArray[i].getIdNumber();
				var inspModel = inspArray[i].getInspection();
				var gs = inspModel.getGuideSheets();
				if (gs) {
					gsArray = gs.toArray();
					for(gsIdx in gsArray){
						var guideSheetObj = gsArray[gsIdx];
						var guidesheetItem = guideSheetObj.getItems();
						for(var j=0;j< guidesheetItem.size();j++) {
							var item = guidesheetItem.get(j);
							for (var gItem in updateArr){
								var ArraySeqNo = updateArr[gItem][0];
								var ArrayRowViolName = updateArr[gItem][1];
								var ArrayASIName1 = updateArr[gItem][2];
								var ArrayASIValue1 = updateArr[gItem][3];
								var ArrayASIName2 = updateArr[gItem][4];
								var ArrayASIValue2 = updateArr[gItem][5];
								var ArrayASIName3 = updateArr[gItem][6];
								var ArrayASIValue3 = updateArr[gItem][7];
								var ArrayCapId = updateArr[gItem][8];
								var ArrayInspId = updateArr[gItem][9];
								if(parseInt(ArraySeqNo) == item.guideItemSeqNbr && parseInt(ArrayInspId) == vInspId){
									logDebug("DB1.1 " + vInspId)
									//1. Filter Guide Sheet items by Guide sheet item name && ASI group code
									if(item.getGuideItemText() == ArrayRowViolName) {
										var ASISubGroups = item.getItemASISubgroupList();
										if(ASISubGroups) {
											//2. Filter ASI sub group by ASI Sub Group name
											for(var k=0;k< ASISubGroups.size();k++) {
												var ASISubGroup = ASISubGroups.get(k);
                                                var ASIModels =  ASISubGroup.getAsiList();
                                                if(ASIModels) {
                                                    //3. Filter ASI by ASI name
                                                    for( var m = 0; m< ASIModels.size();m++) {
                                                        var ASIModel = ASIModels.get(m);
                                                        if(ASIModel && ASIModel.getAsiName() == ArrayASIName1) {
                                                            logDebug(ArrayRowViolName + " Change ASI value " + ASIModel.getAsiName() + " from:"+ ASIModel.getAttributeValue() +" to " + ArrayASIValue1);
                                                            //4. Reset ASI value
                                                            ASIModel.setAttributeValue(ArrayASIValue1);
                                                        }
                                                        if(ASIModel && ASIModel.getAsiName() == ArrayASIName2) {
                                                            logDebug(ArrayRowViolName + " Change ASI value " + ASIModel.getAsiName() + " from:"+ ASIModel.getAttributeValue() +" to " + ArrayASIValue2);
                                                            //4. Reset ASI value
                                                            ASIModel.setAttributeValue(ArrayASIValue2);
                                                        }
                                                        if(ASIModel && ASIModel.getAsiName() == ArrayASIName3) {
                                                            logDebug(ArrayRowViolName + " Change ASI value " + ASIModel.getAsiName() + " from:"+ ASIModel.getAttributeValue() +" to " + ArrayASIValue3);
                                                            //4. Reset ASI value
                                                            ASIModel.setAttributeValue(ArrayASIValue3);
                                                        }
                                                    }
                                                }
											}
										}
									}
								}
							}
						}				
						//Update the guidesheet
						var updateResult = aa.guidesheet.updateGGuidesheet(guideSheetObj,guideSheetObj.getAuditID());
						if (updateResult.getSuccess()) {
							logDebug("Successfully updated GS Data on inspection " + inspArray[i].getIdNumber() + ".");
						} else {
							logDebug("Could not update guidesheet ID: " + updateResult.getErrorMessage());
							return false;
						}
					}
				} else {
					// if there are guidesheets
					logDebug("No guidesheets for this inspection");
					return false;
				}
			}
		} else {
			logDebug("No inspections on the record");
			return false;
		}
		logDebug("No updates to the guidesheet made");
		return false;
	}

}
function updateGuidesheetItemStatus(inspId, gItem, gItemStatus, itemCap) {
   var r = aa.inspection.getInspections(itemCap);
   if (r.getSuccess()) {
       var inspArray = r.getOutput();
       for (i in inspArray) {
           if (inspArray[i].getIdNumber() == inspId) {
               var inspModel = inspArray[i].getInspection();
               var gs = inspModel.getGuideSheets();
               if (gs) {
                   for (var i = 0; i < gs.size(); i++) {
                       var guideSheetObj = gs.get(i);
                       if (guideSheetObj) {
                           var guidesheetItem = guideSheetObj.getItems();
                           for (var j = 0; j < guidesheetItem.size(); j++) {
                               var item = guidesheetItem.get(j);
                               //1. Filter Guide Sheet items by Guide sheet item name && ASI group code
                               if (item && gItem == item.getGuideItemText()) {
                                   logDebug("Found the item: " + item.getGuideItemText() + " with Status: " + item.getGuideItemStatus());
                                   item.setGuideItemStatus(gItemStatus);
                                   var updateResult = aa.guidesheet.updateGGuidesheet(guideSheetObj, currentUserID).getOutput();
                                   return item.getGuideItemStatus();
                               }
                           }
                           //if we got here then there were no guide sheet items matching the item requested
                           logDebug("No matching guidesheet items found for: " + item);
                           return false;
                       }
                   }
               }
               else {
                   // if there are guidesheets
                   logDebug("No guidesheets for this inspection");
                   return false;
               }
           }
       }
   }
   else {
       logDebug("No inspections on the record");
       return false;
   }
}
function valueExistInASIT2Col(vTableName,keyName1,keyValue1,keyName2,keyValue2,vCapId){
	var tableArr = loadASITable(vTableName, vCapId);
	var matchResult = false;
	if (tableArr) {
		for (var r in tableArr) {
			if (parseInt(tableArr[r][keyName1]) == parseInt(keyValue1) && tableArr[r][keyName2].toString() == keyValue2.toString()) {
				
				matchResult = true;
			}
		}
	}
	return matchResult;
}
function valueExistInASITCol(vTableName,keyName,keyValue,vCapId){
	var tableArr = loadASITable(vTableName, vCapId);
	var matchResult = false;
	if (tableArr) {
		for (var r in tableArr) {
			if (parseInt(tableArr[r][keyName]) == parseInt(keyValue)) {
				matchResult = true;
			}
		}
	}
	return matchResult;
}
function updateFacilityInfo(targetCapId,vFacilityId){
	var capResult = aa.cap.getCap(vFacilityId);
	if(capResult != null){
		var capModel = capResult.getOutput().getCapModel()
		var appName = capModel.getSpecialText();
		var itemName = "Facility ID";
		var itemGroup = null;
		if (useAppSpecificGroupName){
			if (itemName.indexOf(".") < 0)
				{ logDebug("**WARNING: editAppSpecific requires group name prefix when useAppSpecificGroupName is true") ; return false }
			itemGroup = itemName.substr(0,itemName.indexOf("."));
			itemName = itemName.substr(itemName.indexOf(".")+1);
		}
		var appSpecInfoResult = aa.appSpecificInfo.editSingleAppSpecific(targetCapId,itemName,vFacilityId.getCustomID(),itemGroup);
		if (appSpecInfoResult.getSuccess()){
			logDebug( "INFO: " + itemName + " was updated."); 
		} 	
		else{
			logDebug( "WARNING: " + itemName + " was not updated."); 
		}
		var itemName = "Facility Name";
		var itemGroup = null;
		if (useAppSpecificGroupName){
			if (itemName.indexOf(".") < 0)
				{ logDebug("**WARNING: editAppSpecific requires group name prefix when useAppSpecificGroupName is true") ; return false }
			itemGroup = itemName.substr(0,itemName.indexOf("."));
			itemName = itemName.substr(itemName.indexOf(".")+1);
		}
		var appSpecInfoResult = aa.appSpecificInfo.editSingleAppSpecific(targetCapId,itemName,appName,itemGroup);
		if (appSpecInfoResult.getSuccess()){
			logDebug( "INFO: " + itemName + " was updated."); 
		} 	
		else{
			logDebug( "WARNING: " + itemName + " was not updated."); 
		}
		var itemName = "Facility DBA";
		var itemGroup = null;
		if (useAppSpecificGroupName){
			if (itemName.indexOf(".") < 0)
				{ logDebug("**WARNING: editAppSpecific requires group name prefix when useAppSpecificGroupName is true") ; return false }
			itemGroup = itemName.substr(0,itemName.indexOf("."));
			itemName = itemName.substr(itemName.indexOf(".")+1);
		}
		var appSpecInfoResult = aa.appSpecificInfo.editSingleAppSpecific(targetCapId,itemName,getAppSpecific("Facility DBA",vFacilityId),itemGroup);
		if (appSpecInfoResult.getSuccess()){
			logDebug( "INFO: " + itemName + " was updated."); 
		} 	
		else{
			logDebug( "WARNING: " + itemName + " was not updated."); 
		}
		var itemName = "Business Code";
		var itemGroup = null;
		if (useAppSpecificGroupName){
			if (itemName.indexOf(".") < 0)
				{ logDebug("**WARNING: editAppSpecific requires group name prefix when useAppSpecificGroupName is true") ; return false }
			itemGroup = itemName.substr(0,itemName.indexOf("."));
			itemName = itemName.substr(itemName.indexOf(".")+1);
		}
		var appSpecInfoResult = aa.appSpecificInfo.editSingleAppSpecific(targetCapId,itemName,getAppSpecific("Business Code",vFacilityId),itemGroup);
		if (appSpecInfoResult.getSuccess()){
			logDebug( "INFO: " + itemName + " was updated."); 
		} 	
		else{
			logDebug( "WARNING: " + itemName + " was not updated."); 
		}
		var itemName = "Billing Anniversary";
		var itemGroup = null;
		if (useAppSpecificGroupName){
			if (itemName.indexOf(".") < 0)
				{ logDebug("**WARNING: editAppSpecific requires group name prefix when useAppSpecificGroupName is true") ; return false }
			itemGroup = itemName.substr(0,itemName.indexOf("."));
			itemName = itemName.substr(itemName.indexOf(".")+1);
		}
		var appSpecInfoResult = aa.appSpecificInfo.editSingleAppSpecific(targetCapId,itemName,getAppSpecific("Billing Anniversary",vFacilityId),itemGroup);
		if (appSpecInfoResult.getSuccess()){
			logDebug( "INFO: " + itemName + " was updated."); 
		} 	
		else{
			logDebug( "WARNING: " + itemName + " was not updated."); 
		}
	}
}
