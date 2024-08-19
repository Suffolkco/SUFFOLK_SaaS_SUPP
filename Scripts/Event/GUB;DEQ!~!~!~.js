var showDebug = true;
logDebugLocal("GUB");

var inspType = aa.env.getValue("InspectionType")
var inspResult = aa.env.getValue("InspectionResult")
var inspResultComment = aa.env.getValue("InspectionResultComment");
var inspComment = inspResultComment; // consistency with events
var inspId = aa.env.getValue("InspectionId");
var inspResultDate = null;
var inspSchedDate = null;

logDebugLocal(inspId);

try
{
	
					
	var gsObjs = getGuideSheetObjects(inspId);
    //Identifying if the inspector wants to schedule a follow-up inspection automatically
    var vInspection = aa.inspection.getInspection(capId, inspId);
    if (vInspection.getSuccess())
    {
        var vInspection = vInspection.getOutput();
        var vInspectionActivity = vInspection.getInspection().getActivity();
        // Get the guidesheets and their items from the activity model
        var guideBiz = aa.proxyInvoker.newInstance("com.accela.aa.inspection.guidesheet.GGuideSheetBusiness").getOutput();
        var vGuideSheetArray = guideBiz.getGGuideSheetWithItemsByInspections("", [vInspectionActivity]).toArray();
        if (vGuideSheetArray.length != 0)
        {
            for (x in vGuideSheetArray)
            {
                vGuideSheet = vGuideSheetArray[x];
                if (vGuideSheet.getItems() != null)
                {
                    vGuideSheetItemsArray = vGuideSheet.getItems().toArray();
                    logDebug("guidesheet name is: " + vGuideSheetArray[x].getGuideType());
                    if (vGuideSheetArray[x].getGuideType() == "Marine Resources")
                    {
                        vGuideSheet = vGuideSheetArray[x];
                        //logDebug("vguidesheet is: " + vGuideSheet)
                        if (vGuideSheet.getItems() != null)
                        {
                            vGuideSheetItemsArray = vGuideSheet.getItems().toArray();
                            for (z in vGuideSheetItemsArray)
                            {
                                //logDebug("we're in the guidesheetitemsarray");
                                vGuideSheetItem = vGuideSheetItemsArray[z];
                                logDebug("vguidesheetitem is: " + vGuideSheetItem.getGuideItemText());
                                if (vGuideSheetItem.getGuideItemText() == "Field Inspection Time")
                                {
                                   
									logDebug("vguidesheet is: " + vGuideSheet + " and vguidesheetitem is: " + vGuideSheetItem);
									if (!matches(fieldInspTime, "", null, undefined))
									{
										if(!fieldInspTime.contains(':'))
										{
											cancel = true;
											showMessage = true;
											comment("Missing Colon in the field of Field Inspection Time.");
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
            logDebug("Failed to get guidesheets");
        }
    }
    else
    {
        logDebug("Failed to get inpection");
    }
    
}		
catch (err) {
    var showDebug = false;
	logDebug("A JavaScript Error occured: " + err.message + " In Line " + err.lineNumber);
	}


	function logDebugLocal(dstr)
	{
		if (showDebug)
		{
			aa.print(dstr)
			emailText += dstr + "<br>";
			aa.debug(aa.getServiceProviderCode() + " : " + aa.env.getValue("CurrentUserID"), dstr)
		}
	}



	function guideSheetObjectLOCAL(gguidesheetModel, gguidesheetItemModel) {
		this.gsType = gguidesheetModel.getGuideType();
		this.gsSequence = gguidesheetModel.getGuidesheetSeqNbr();
		this.gsDescription = gguidesheetModel.getGuideDesc();
		this.gsIdentifier = gguidesheetModel.getIdentifier();
		this.item = gguidesheetItemModel;
		this.text = gguidesheetItemModel.getGuideItemText()
		this.status = gguidesheetItemModel.getGuideItemStatus();
		this.comment = gguidesheetItemModel.getGuideItemComment();
		this.score = gguidesheetItemModel.getGuideItemScore();
	
		this.info = new Array();
		this.infoTables = new Array();
		this.validTables = false;				//true if has ASIT info
		this.validInfo = false;				//true if has ASI info
	
	
		this.loadInfo = function () {
			var itemASISubGroupList = this.item.getItemASISubgroupList();
			//If there is no ASI subgroup, it will throw warning message.
			if (itemASISubGroupList != null)
			{
				this.validInfo = true;
				var asiSubGroupIt = itemASISubGroupList.iterator();
				while (asiSubGroupIt.hasNext())
				{
					var asiSubGroup = asiSubGroupIt.next();
					var asiItemList = asiSubGroup.getAsiList();
					if (asiItemList != null)
					{
						var asiItemListIt = asiItemList.iterator();
						while (asiItemListIt.hasNext())
						{
							var asiItemModel = asiItemListIt.next();
							this.info[asiItemModel.getAsiName()] = asiItemModel.getAttributeValue();
	
						}
					}
				}
			}
		}
	
		this.loadInfoTables = function () {
			var guideItemASITs = this.item.getItemASITableSubgroupList();
			if (guideItemASITs != null)
			{
				logDebug(guideItemASITs.size());
				for (var j = 0; j < guideItemASITs.size(); j++)
				{
					var guideItemASIT = guideItemASITs.get(j);
					var tableArr = new Array();
					var columnList = guideItemASIT.getColumnList();
					for (var k = 0; k < columnList.size(); k++)
					{
						var column = columnList.get(k);
						var values = column.getValueMap().values();
						var iteValues = values.iterator();
						while (iteValues.hasNext())
						{
							var i = iteValues.next();
							var zeroBasedRowIndex = i.getRowIndex() - 1;
							if (tableArr[zeroBasedRowIndex] == null) tableArr[zeroBasedRowIndex] = new Array();
							tableArr[zeroBasedRowIndex][column.getColumnName()] = i.getAttributeValue();
						}
					}
					this.infoTables["" + guideItemASIT.getTableName()] = tableArr;
					this.validTables = true;
				}
			}
		}
	}
	
	