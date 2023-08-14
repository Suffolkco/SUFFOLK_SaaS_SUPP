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