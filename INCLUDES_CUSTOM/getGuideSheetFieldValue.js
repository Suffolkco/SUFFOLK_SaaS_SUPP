function getGuideSheetFieldValue(gsCustomFieldItem,itemCap,inspIDNumArg,gsItemSeqNo) {
	itemCap = aa.cap.getCapID(itemCap.getID1(), itemCap.getID2(), itemCap.getID3()).getOutput();
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