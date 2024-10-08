	//aa.sendMail("noreplyehimslower@suffolkcountyny.gov", "ada.chan@suffolkcountyny.gov", "", "GUB", "Test");
//EHIMS-4172
	gGuideSheetModel = aa.env.getValue("GuidesheetModel");

	var guideSheetNumber = gGuideSheetModel.getGuidesheetSeqNbr();
	var gGuideSheetItemModels = gGuideSheetModel.getItems();
	var gGuideType = gGuideSheetModel.getGuideType(); // Marine Resources
	

	if (gGuideSheetItemModels) 
	{				
		for (var j = 0; j < gGuideSheetItemModels.size(); j++) 
		{			
			var gGuideSheetItemModel = gGuideSheetItemModels.get(j);
			var guideSheetItemNumber = gGuideSheetItemModel.getGuideItemSeqNbr();
			var gGuideASIGroupName = gGuideSheetItemModel.getGuideItemASIGroupName(); //DEQ_MR_CHECK
			var gGuideItemText = gGuideSheetItemModel.getGuideItemText();
			var gGuideItemStatus = gGuideSheetItemModel.getGuideItemStatus();
			
	
			var itemASISubGroupList = gGuideSheetItemModel.getItemASISubgroupList();
			//If there is no ASI subgroup, it will throw warning message.
			if (itemASISubGroupList != null) 
			{		

				for (var a = 0; a < itemASISubGroupList.size(); a++) 
				{		
					var asiSubGroup = itemASISubGroupList.get(a);				
					var asiItemList = asiSubGroup.getAsiList();
										
					if (asiItemList != null) 
					{	
						
						for( var m = 0; m< asiItemList.size();m++) 
						{
							var ASIModel = asiItemList.get(m);							
							var asiValue = ASIModel.getAttributeValue();							
							if(ASIModel && ASIModel.getAsiName() == "Field Inspection Time") 
							{
								if (asiValue != null && asiValue != "") 
								{
									if (!asiValue.contains(':'))
									{
										cancel = true;
										showMessage = true;
										comment("Field Inspection Time field must contain a colon :");
									}
								}
							}
						}
					}
				}

			}
				
		}
	}
