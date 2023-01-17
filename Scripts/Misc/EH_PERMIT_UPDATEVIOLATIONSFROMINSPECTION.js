// This Script looks at the guidesheet items and if there are violations it will create rows in the Violations Data Table
var GSNonComStatusLkp = lookup("EH_VIOL_TYPE_STATUSES","NonCompliance");
var vTableName = "VIOLATIONS"
//logDebug("Inspection ID " + inspId);
var guideSheetsAry = getGuideSheetObjects(inspId);
if (!guideSheetsAry || guideSheetsAry.length == 0) {
    logDebug("**WARN getGuideSheetObjects failed");
}else{
    for (g in guideSheetsAry) {
        var guideSheetItem = guideSheetsAry[g];
        var guideSheetItemStatus = guideSheetItem.status
        var flagSkipGS = false;
        if(guideSheetItemStatus == GSNonComStatusLkp){
            var ggsheetitem = guideSheetItem.item;
            var guideSheetItemType = guideSheetItem.gsType;
            var guideSheetItemName = guideSheetItem.text;
            logDebug("guideSheetItemName " + guideSheetItemName + " " + guideSheetItemStatus);
            var guideSheetSeqNo = ggsheetitem.guideItemSeqNbr.toString();
            var guideSheetItemObsDate = getGuideSheetFieldValue("Observation Date",capId,inspId,ggsheetitem.guideItemSeqNbr);
            var guideSheetItemDegree = getGuideSheetFieldValue("Degree of Violation",capId,inspId,ggsheetitem.guideItemSeqNbr); 
            var guideSheetItemComplyBy = getGuideSheetFieldValue("Comply By",capId,inspId,ggsheetitem.guideItemSeqNbr);
            var guideSheetItemReturntoComplianceDate = getGuideSheetFieldValue("Return to Compliance Date",capId,inspId,ggsheetitem.guideItemSeqNbr);
            var guideSheetItemReturntoComplianceQualifier = getGuideSheetFieldValue("Return to Compliance Qualifier",capId,inspId,ggsheetitem.guideItemSeqNbr);
            if(ggsheetitem.guideItemComment != null){
                var guideSheetItemComment = ggsheetitem.guideItemComment.toString();
            }else{
                var guideSheetItemComment = "";
            }
            if(valueExistInASIT2Col(vTableName,"Checklist Item ID",guideSheetSeqNo,"Inspection ID",inspId,capId)){
                flagSkipGS = true;
                //This code used to update existing rows in the ASIT instead of adding new ones if a match is found
                logDebug("Updating existing Violation Rows on the table " + vTableName);
                editSpecificASITableRow2Column(capId, "VIOLATIONS", "Checklist Item ID", parseInt(guideSheetSeqNo),"Complied On","","Status",guideSheetItemStatus);
                editSpecificASITableRow2Column(capId, "VIOLATIONS", "Checklist Item ID", parseInt(guideSheetSeqNo),"Complied On","","Degree",guideSheetItemDegree);
                editSpecificASITableRow2Column(capId, "VIOLATIONS", "Checklist Item ID", parseInt(guideSheetSeqNo),"Complied On","","Comply By",guideSheetItemComplyBy);
                editSpecificASITableRow2Column(capId, "VIOLATIONS", "Checklist Item ID", parseInt(guideSheetSeqNo),"Complied On","","Compliance Type", guideSheetItemReturntoComplianceQualifier);
                editSpecificASITableRow2Column(capId, "VIOLATIONS", "Checklist Item ID", parseInt(guideSheetSeqNo),"Complied On","","Complied On", guideSheetItemReturntoComplianceDate);
                editSpecificASITableRow2Column(capId, "VIOLATIONS", "Checklist Item ID", parseInt(guideSheetSeqNo),"Complied On","","Checklist Comment", guideSheetItemComment);
            }
    
            if(!flagSkipGS && guideSheetItemStatus == GSNonComStatusLkp){
                logDebug("Adding New Violation Rows to the table " + vTableName);
                var violationsAry = new Array();
                var asitRow = new Array();
                asitRow["Create/Assign Enforcement"] = new asiTableValObj("Create/Assign Enforcement",null,"N");
                asitRow["Enf Case #"] = new asiTableValObj("Enf Case #", "", "N");
                asitRow["Violation Name"] = new asiTableValObj("Violation Name", guideSheetItemName, "Y");
                asitRow["Status"] = new asiTableValObj("Status", guideSheetItemStatus, "Y");
                asitRow["Degree"] = new asiTableValObj("Degree", guideSheetItemDegree, "Y");
                asitRow["Observed Date"] = new asiTableValObj("Observed Date", guideSheetItemObsDate, "Y");
                asitRow["Comply By"] = new asiTableValObj("Comply By",guideSheetItemComplyBy,"N");
                asitRow["Complied On"] = new asiTableValObj("Complied On",guideSheetItemReturntoComplianceDate,"N");
                asitRow["Compliance Type"] = new asiTableValObj("Compliance Type",guideSheetItemReturntoComplianceQualifier,"N");
                asitRow["Checklist Comment"] = new asiTableValObj("Checklist Comment", guideSheetItemComment, "Y");
                asitRow["Checklist Item ID"] = new asiTableValObj("Checklist Item ID", guideSheetSeqNo, "Y");
                asitRow["Inspection ID"] = new asiTableValObj("Inspection ID", inspId.toString(), "Y");
                violationsAry.push(asitRow);
                addASITable(vTableName, violationsAry, capId);
            }
        }
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
