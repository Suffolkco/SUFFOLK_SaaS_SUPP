// Event Script to update the "Comply By" date in the Food INSPECTION Checklist
showDebug = true;

// Declare the today variable as scheduled date instead
var today = new Date(inspSchedDate);

var inspDate = new Date(inspSchedDate);
logDebug("**inspSchedDate: " + inspSchedDate);
logDebug("**inspDate: " + inspDate);

setInspectionTimeAndStartTime(inspId, inspDate, capId) 
/*
var inspDate = new Date(inspSchedDate);
logDebug("**inspSchedDate: " + inspSchedDate);
logDebug("**inspDate: " + inspDate);

//   Set the inspection time and the start time on the inspection to match the scheduled time.

var iObjResult = aa.inspection.getInspection(capId, inspId);
var inspAct = iObjResult.getInspection().getActivity();
var inspTime = inspAct.getTime2();
var inspAmPm = inspAct.getTime1();

debugObject(inspAct);

var iObj = iObjResult.getOutput();
scheduledDate = iObj.getScheduledDate();


iObj.setInspectionStatusDate(scheduledDate);
aa.inspection.editInspection(iObj); */


if (inspType == "010 Field/Periodic Inspection" || inspType == "012 Premise/Facility Inspection")
{
	var gName = "Food INSPECTION Checklist";

	var guideItems = [
	  {
		gItem: "01 - PERSON IN CHARGE PRESENT, EMPLOYEES TRAINED, DEMONSTRATES KNOWLEDGE",
		asiGroup: "EH_INS_CK_1",
		asiSubGroup: "ADDITIONAL INFORMATION",
		asiLabel: "Comply By",
	  },
	  {
		gItem: "02 - MANAGEMENT, RESPONSIBILITY, REPORTING",
		asiGroup: "EH_INS_CK_2",
		asiSubGroup: "ADDITIONAL INFORMATION",
		asiLabel: "Comply By",
	  },
	  {
		gItem: "03 - PROPER USE OF EXCLUSION AND RESTRICTION OF ILL FOOD WORKERS",
		asiGroup: "EH_INS_CK_3",
		asiSubGroup: "ADDITIONAL INFORMATION",
		asiLabel: "Comply By",
	  },
	  {
		gItem: "04 - PROPER EATING, DRINKING, TASTING, TOBACCO USE",
		asiGroup: "EH_INS_CK_4",
		asiSubGroup: "ADDITIONAL INFORMATION",
		asiLabel: "Comply By",
	  },
	  {
		gItem: "05 - NO BARE HAND CONTACT WITH READY-TO-EAT FOODS",
		asiGroup: "EH_INS_CK_5",
		asiSubGroup: "ADDITIONAL INFORMATION",
		asiLabel: "Comply By",
	  },
	  {
		gItem: "06 - PROPER HANDWASHING",
		asiGroup: "EH_INS_CK_6",
		asiSubGroup: "ADDITIONAL INFORMATION",
		asiLabel: "Comply By",
	  },
	  {
		gItem: "07 - FOOD OBTAINED FROM APPROVED SOURCE",
		asiGroup: "EH_INS_CK_7",
		asiSubGroup: "ADDITIONAL INFORMATION",
		asiLabel: "Comply By",
	  },
	  {
		gItem: "08 - FOOD RECEIVED AT PROPER TEMPERATURES",
		asiGroup: "EH_INS_CK_8",
		asiSubGroup: "ADDITIONAL INFORMATION",
		asiLabel: "Comply By",
	  },
	  {
		gItem: "09 - FOOD IN GOOD CONDITION, SAFE, UNADULTERATED",
		asiGroup: "EH_INS_CK_9",
		asiSubGroup: "ADDITIONAL INFORMATION",
		asiLabel: "Comply By",
	  },
	  {
		gItem: "10 - REQUIRED RECORDS AVAILABLE - SHELLFISH TAGS, PARASITE DESTRUCTION",
		asiGroup: "EH_INS_CK_10",
		asiSubGroup: "ADDITIONAL INFORMATION",
		asiLabel: "Comply By",
	  },
	  {
		gItem: "11 - FOOD SEPARATED AND PROTECTED",
		asiGroup: "EH_INS_CK_11",
		asiSubGroup: "ADDITIONAL INFORMATION",
		asiLabel: "Comply By",
	  },
	  {
		gItem: "12 - FOOD CONTACT SURFACES - CLEANED AND SANITIZED",
		asiGroup: "EH_INS_CK_12",
		asiSubGroup: "ADDITIONAL INFORMATION",
		asiLabel: "Comply By",
	  },
	  {
		gItem: "13 - PROPER DISPOSITION OF RETURNED, PREVIOUSLY SERVED AND UNSAFE FOOD",
		asiGroup: "EH_INS_CK_13",
		asiSubGroup: "ADDITIONAL INFORMATION",
		asiLabel: "Comply By",
	  },
	  {
		gItem: "14 - PROPER COOKING TIME AND TEMPERATURES, STEM THERMOMETER AVAILABLE AND USED",
		asiGroup: "EH_INS_CK_14",
		asiSubGroup: "ADDITIONAL INFORMATION",
		asiLabel: "Comply By",
	  },
	  {
		gItem: "15 - PROPER REHEATING PROCEDURES FOR HOT HOLDING",
		asiGroup: "EH_INS_CK_15",
		asiSubGroup: "ADDITIONAL INFORMATION",
		asiLabel: "Comply By",
	  },
	  {
		gItem: "16 - PROPER COOLING TIME AND TEMPERATURES",
		asiGroup: "EH_INS_CK_16",
		asiSubGroup: "ADDITIONAL INFORMATION",
		asiLabel: "Comply By",
	  },
	  {
		gItem: "17 - PROPER HOT AND COLD HOLDING TEMPERATURES",
		asiGroup: "EH_INS_CK_17",
		asiSubGroup: "ADDITIONAL INFORMATION",
		asiLabel: "Comply By",
	  },
	  {
		gItem: "18 - PROPER DATE MARKING PROCEDURES USED",
		asiGroup: "EH_INS_CK_18",
		asiSubGroup: "ADDITIONAL INFORMATION",
		asiLabel: "Comply By",
	  },
	  {
		gItem: "19 - TIME AS A PUBLIC HEALTH CONTROL - PROCEDURES AND RECORDS",
		asiGroup: "EH_INS_CK_19",
		asiSubGroup: "ADDITIONAL INFORMATION",
		asiLabel: "Comply By",
	  },
	  {
		gItem: "20 - CONSUMER ADVISORY PROVIDED FOR RAW AND UNDERCOOKED FOODS",
		asiGroup: "EH_INS_CK_20",
		asiSubGroup: "ADDITIONAL INFORMATION",
		asiLabel: "Comply By",
	  },
	   {
		gItem: "21 - PASTEURIZED FOODS USED, PROHIBITED FOODS NOT OFFERED",
		asiGroup: "EH_INS_CK_21",
		asiSubGroup: "ADDITIONAL INFORMATION",
		asiLabel: "Comply By",
	  },
	  {
		gItem: "22 - FOOD ADDITIVES - APPROVED AND PROPERLY USED",
		asiGroup: "EH_INS_CK_22",
		asiSubGroup: "ADDITIONAL INFORMATION",
		asiLabel: "Comply By",
	  },
	  {
		gItem: "23 - CHEMICALS AND TOXIC MATERIALS STORED AND USED PROPERLY",
		asiGroup: "EH_INS_CK_23",
		asiSubGroup: "ADDITIONAL INFORMATION",
		asiLabel: "Comply By",
	  },
	  {
		gItem: "24 - PERSONAL MEDICATIONS PROPERLY STORED",
		asiGroup: "EH_INS_CK_24",
		asiSubGroup: "ADDITIONAL INFORMATION",
		asiLabel: "Comply By",
	  },
	  {
		gItem: "25 - COMPLIANCE WITH VARIANCE PROCEDURES",
		asiGroup: "EH_INS_CK_25",
		asiSubGroup: "ADDITIONAL INFORMATION",
		asiLabel: "Comply By",
	  },
	  {
		gItem: "26 - RUNNING WATER PROVIDED WHERE REQUIRED",
		asiGroup: "EH_INS_CK_26",
		asiSubGroup: "ADDITIONAL INFORMATION",
		asiLabel: "Comply By",
	  },
	  {
		gItem: "27 - SEWAGE AND WASTEWATER PROPERLY DISPOSED",
		asiGroup: "EH_INS_CK_27",
		asiSubGroup: "ADDITIONAL INFORMATION",
		asiLabel: "Comply By",
	  },
	  {
		gItem: "28 - WATER AND ICE FROM APPROVED SOURCES, PROTECTED",
		asiGroup: "EH_INS_CK_28",
		asiSubGroup: "ADDITIONAL INFORMATION",
		asiLabel: "Comply By",
	  },
	  {
		gItem: "29 - VARIANCE OBTAINED FOR SPECIALIZED FOOD PROCESSING METHODS",
		asiGroup: "EH_INS_CK_29",
		asiSubGroup: "ADDITIONAL INFORMATION",
		asiLabel: "Comply By",
	  },
	  {
		gItem: "30 - ADEQUATE EQUIPMENT AVAILABLE FOR TEMPERATURE CONTROL",
		asiGroup: "EH_INS_CK_30",
		asiSubGroup: "ADDITIONAL INFORMATION",
		asiLabel: "Comply By",
	  },
	  {
		gItem: "31 - PLANT FOOD PROPERLY COOKED FOR HOT HOLDING",
		asiGroup: "EH_INS_CK_31",
		asiSubGroup: "ADDITIONAL INFORMATION",
		asiLabel: "Comply By",
	  },
	  {
		gItem: "32 - FROZEN FOODS, APPROVED THAWING METHODS USED",
		asiGroup: "EH_INS_CK_32",
		asiSubGroup: "ADDITIONAL INFORMATION",
		asiLabel: "Comply By",
	  },
	  {
		gItem: "33 - THERMOMETERS PROVIDED, ACCURATE, PROPERLY LOCATED",
		asiGroup: "EH_INS_CK_33",
		asiSubGroup: "ADDITIONAL INFORMATION",
		asiLabel: "Comply By",
	  },
	  {
		gItem: "34 - FOOD PROPERLY LABELED, NO ARTIFICIAL TRANS-FATS USED, ALLERGEN NOTICE",
		asiGroup: "EH_INS_CK_34",
		asiSubGroup: "ADDITIONAL INFORMATION",
		asiLabel: "Comply By",
	  },
	  {
		gItem: "35 - INSECTS, RODENTS, ANIMALS NOT PRESENT",
		asiGroup: "EH_INS_CK_35",
		asiSubGroup: "ADDITIONAL INFORMATION",
		asiLabel: "Comply By",
	  },
	  {
		gItem: "36 - CONTAMINATION PREVENTED",
		asiGroup: "EH_INS_CK_36",
		asiSubGroup: "ADDITIONAL INFORMATION",
		asiLabel: "Comply By",
	  },
	  {
		gItem: "37 - FOOD WORKERS - PERSONAL CLEANLINESS",
		asiGroup: "EH_INS_CK_37",
		asiSubGroup: "ADDITIONAL INFORMATION",
		asiLabel: "Comply By",
	  },
	  {
		gItem: "38 - WIPING CLOTHS PROPERLY USED AND STORED",
		asiGroup: "EH_INS_CK_38",
		asiSubGroup: "ADDITIONAL INFORMATION",
		asiLabel: "Comply By",
	  },
	  {
		gItem: "39 - WASHING FRUITS AND VEGETABLES",
		asiGroup: "EH_INS_CK_39",
		asiSubGroup: "ADDITIONAL INFORMATION",
		asiLabel: "Comply By",
	  },
	  {
		gItem: "40 - IN-USE UTENSILS PROPERLY STORED",
		asiGroup: "EH_INS_CK_40",
		asiSubGroup: "ADDITIONAL INFORMATION",
		asiLabel: "Comply By",
	  },
	  {
		gItem: "41 - UTENSILS, EQUIPMENT AND LINENS",
		asiGroup: "EH_INS_CK_41",
		asiSubGroup: "ADDITIONAL INFORMATION",
		asiLabel: "Comply By",
	  },
	  {
		gItem: "42 - SINGLE USE, SINGLE SERVICE ARTICLES",
		asiGroup: "EH_INS_CK_42",
		asiSubGroup: "ADDITIONAL INFORMATION",
		asiLabel: "Comply By",
		},
		{
		gItem: "43 - NON-FOOD CONTACT SURFACES CLEAN, MAINTAINED, IN GOOD REPAIR",
		asiGroup: "EH_INS_CK_43",
		asiSubGroup: "ADDITIONAL INFORMATION",
		asiLabel: "Comply By",
		},
		{
		gItem: "44 - WAREWASHING FACILITIES - MAINTAINED, PROPERLY USED, TEST STRIPS",
		asiGroup: "EH_INS_CK_44",
		asiSubGroup: "ADDITIONAL INFORMATION",
		asiLabel: "Comply By",
		},
		{
		gItem: "45 - HOT AND COLD WATER AVAILABLE, ADEQUATE PRESSURE",
		asiGroup: "EH_INS_CK_45",
		asiSubGroup: "ADDITIONAL INFORMATION",
		asiLabel: "Comply By",
		},
		{
		gItem: "46 - PLUMBING MAINTAINED, PROPER BACKFLOW DEVICES",
		asiGroup: "EH_INS_CK_46",
		asiSubGroup: "ADDITIONAL INFORMATION",
		asiLabel: "Comply By",
		},
		{
		gItem: "47 - TOILET FACILITIES - PROPERLY CONSTRUCTED, SUPPLIED AND MAINTAINED",
		asiGroup: "EH_INS_CK_47",
		asiSubGroup: "ADDITIONAL INFORMATION",
		asiLabel: "Comply By",
		},
		{
		gItem: "48 - GARBAGE AND REFUSE PROPERLY DISPOSED, FACILITIES MAINTAINED",
		asiGroup: "EH_INS_CK_48",
		asiSubGroup: "ADDITIONAL INFORMATION",
		asiLabel: "Comply By",
		},
		{
		gItem: "49 - LIGHTING AND VENTILATION ADEQUATE AND PROPERLY MAINTAINED",
		asiGroup: "EH_INS_CK_49",
		asiSubGroup: "ADDITIONAL INFORMATION",
		asiLabel: "Comply By",
		},
		{
		gItem: "50 - PHYSICAL FACILITIES CONSTRUCTED AND PROPERLY MAINTAINED, CLEANING METHODS/STORAGE",
		asiGroup: "EH_INS_CK_50",
		asiSubGroup: "ADDITIONAL INFORMATION",
		asiLabel: "Comply By",
		},
		{
		gItem: "51 - CLEANING METHODS, EMPLOYEE ITEM STORAGE",
		asiGroup: "EH_INS_CK_51",
		asiSubGroup: "ADDITIONAL INFORMATION",
		asiLabel: "Comply By",
		},
		{
		gItem: "52 - UNNECESSARY ARTICLES EXCLUDED, EXTERIOR AREAS MAINTAINED, LIVING QUARTERS SEPARATION",
		asiGroup: "EH_INS_CK_52",
		asiSubGroup: "ADDITIONAL INFORMATION",
		asiLabel: "Comply By",
		},
		{
		gItem: "53 - COMPLIANCE WITH OPERATING PERMIT CONDITIONS",
		asiGroup: "EH_INS_CK_53",
		asiSubGroup: "ADDITIONAL INFORMATION",
		asiLabel: "Comply By",
		},
		{
		gItem: "54 - POSTINGS AND NOTIFICATIONS ADEQUATE",
		asiGroup: "EH_INS_CK_54",
		asiSubGroup: "ADDITIONAL INFORMATION",
		asiLabel: "Comply By",
		},
		{
		gItem: "55 - PERMIT OBTAINED, PLANS APPROVED",
		asiGroup: "EH_INS_CK_55",
		asiSubGroup: "ADDITIONAL INFORMATION",
		asiLabel: "Comply By",
		},
		{
		gItem: "56 - CONDITIONS NOT ADDRESSED",
		asiGroup: "EH_INS_CK_56",
		asiSubGroup: "ADDITIONAL INFORMATION",
		asiLabel: "Comply By",
		},
		{
		gItem: "57 - COMPLIANCE WITH CLEAN INDOOR AIR ACT, PUBLIC HEALTH LAWS",
		asiGroup: "EH_INS_CK_57",
		asiSubGroup: "ADDITIONAL INFORMATION",
		asiLabel: "Comply By",
		},
		{
		gItem: "58 - LIMITED/MOBILE FOOD ESTABLISHMENTS",
		asiGroup: "EH_INS_CK_58",
		asiSubGroup: "ADDITIONAL INFORMATION",
		asiLabel: "Comply By",
		},
		{
		gItem: "59 - LIMITED/MOBILE FOOD ESTABLISHMENT COMMISSARY",
		asiGroup: "EH_INS_CK_59",
		asiSubGroup: "ADDITIONAL INFORMATION",
		asiLabel: "Comply By",
		},
		{
		gItem: "60 - TEMPORARY FOOD ESTABLISHMENTS",
		asiGroup: "EH_INS_CK_60",
		asiSubGroup: "ADDITIONAL INFORMATION",
		asiLabel: "Comply By",
		},
		{
		gItem: "61 - VENDING MACHINES",
		asiGroup: "EH_INS_CK_61",
		asiSubGroup: "ADDITIONAL INFORMATION",
		asiLabel: "Comply By",
	}
	];
	// Call the function with the session variable inspection ID from the InspectionScheduleAfter event
	updateGuidesheetASIFields(inspId, gName, guideItems, today);
}

if (inspType == "011 Reinspection/Follow-up" || inspType == "030 Emergency Investigation" || inspType == "038 Preliminary Inspection" || inspType == "012 Obs Premise/Facility Inspection")
{
	var gName = "Food OBSERVATION Checklist";

	var guideItems = [
	  {
		gItem: "01 - PERSON IN CHARGE PRESENT, EMPLOYEES TRAINED, DEMONSTRATES KNOWLEDGE",
		asiGroup: "EH_INS_CK_1",
		asiSubGroup: "ADDITIONAL INFORMATION",
		asiLabel: "Comply By",
	  },
	  {
		gItem: "02 - MANAGEMENT, RESPONSIBILITY, REPORTING",
		asiGroup: "EH_INS_CK_2",
		asiSubGroup: "ADDITIONAL INFORMATION",
		asiLabel: "Comply By",
	  },
	  {
		gItem: "03 - PROPER USE OF EXCLUSION AND RESTRICTION OF ILL FOOD WORKERS",
		asiGroup: "EH_INS_CK_3",
		asiSubGroup: "ADDITIONAL INFORMATION",
		asiLabel: "Comply By",
	  },
	  {
		gItem: "04 - PROPER EATING, DRINKING, TASTING, TOBACCO USE",
		asiGroup: "EH_INS_CK_4",
		asiSubGroup: "ADDITIONAL INFORMATION",
		asiLabel: "Comply By",
	  },
	  {
		gItem: "05 - NO BARE HAND CONTACT WITH READY-TO-EAT FOODS",
		asiGroup: "EH_INS_CK_5",
		asiSubGroup: "ADDITIONAL INFORMATION",
		asiLabel: "Comply By",
	  },
	  {
		gItem: "06 - PROPER HANDWASHING",
		asiGroup: "EH_INS_CK_6",
		asiSubGroup: "ADDITIONAL INFORMATION",
		asiLabel: "Comply By",
	  },
	  {
		gItem: "07 - FOOD OBTAINED FROM APPROVED SOURCE",
		asiGroup: "EH_INS_CK_7",
		asiSubGroup: "ADDITIONAL INFORMATION",
		asiLabel: "Comply By",
	  },
	  {
		gItem: "08 - FOOD RECEIVED AT PROPER TEMPERATURES",
		asiGroup: "EH_INS_CK_8",
		asiSubGroup: "ADDITIONAL INFORMATION",
		asiLabel: "Comply By",
	  },
	  {
		gItem: "09 - FOOD IN GOOD CONDITION, SAFE, UNADULTERATED",
		asiGroup: "EH_INS_CK_9",
		asiSubGroup: "ADDITIONAL INFORMATION",
		asiLabel: "Comply By",
	  },
	  {
		gItem: "10 - REQUIRED RECORDS AVAILABLE - SHELLFISH TAGS, PARASITE DESTRUCTION",
		asiGroup: "EH_INS_CK_10",
		asiSubGroup: "ADDITIONAL INFORMATION",
		asiLabel: "Comply By",
	  },
	  {
		gItem: "11 - FOOD SEPARATED AND PROTECTED",
		asiGroup: "EH_INS_CK_11",
		asiSubGroup: "ADDITIONAL INFORMATION",
		asiLabel: "Comply By",
	  },
	  {
		gItem: "12 - FOOD CONTACT SURFACES - CLEANED AND SANITIZED",
		asiGroup: "EH_INS_CK_12",
		asiSubGroup: "ADDITIONAL INFORMATION",
		asiLabel: "Comply By",
	  },
	  {
		gItem: "13 - PROPER DISPOSITION OF RETURNED, PREVIOUSLY SERVED AND UNSAFE FOOD",
		asiGroup: "EH_INS_CK_13",
		asiSubGroup: "ADDITIONAL INFORMATION",
		asiLabel: "Comply By",
	  },
	  {
		gItem: "14 - PROPER COOKING TIME AND TEMPERATURES, STEM THERMOMETER AVAILABLE AND USED",
		asiGroup: "EH_INS_CK_14",
		asiSubGroup: "ADDITIONAL INFORMATION",
		asiLabel: "Comply By",
	  },
	  {
		gItem: "15 - PROPER REHEATING PROCEDURES FOR HOT HOLDING",
		asiGroup: "EH_INS_CK_15",
		asiSubGroup: "ADDITIONAL INFORMATION",
		asiLabel: "Comply By",
	  },
	  {
		gItem: "16 - PROPER COOLING TIME AND TEMPERATURES",
		asiGroup: "EH_INS_CK_16",
		asiSubGroup: "ADDITIONAL INFORMATION",
		asiLabel: "Comply By",
	  },
	  {
		gItem: "17 - PROPER HOT AND COLD HOLDING TEMPERATURES",
		asiGroup: "EH_INS_CK_17",
		asiSubGroup: "ADDITIONAL INFORMATION",
		asiLabel: "Comply By",
	  },
	  {
		gItem: "18 - PROPER DATE MARKING PROCEDURES USED",
		asiGroup: "EH_INS_CK_18",
		asiSubGroup: "ADDITIONAL INFORMATION",
		asiLabel: "Comply By",
	  },
	  {
		gItem: "19 - TIME AS A PUBLIC HEALTH CONTROL - PROCEDURES AND RECORDS",
		asiGroup: "EH_INS_CK_19",
		asiSubGroup: "ADDITIONAL INFORMATION",
		asiLabel: "Comply By",
	  },
	  {
		gItem: "20 - CONSUMER ADVISORY PROVIDED FOR RAW AND UNDERCOOKED FOODS",
		asiGroup: "EH_INS_CK_20",
		asiSubGroup: "ADDITIONAL INFORMATION",
		asiLabel: "Comply By",
	  },
	   {
		gItem: "21 - PASTEURIZED FOODS USED, PROHIBITED FOODS NOT OFFERED",
		asiGroup: "EH_INS_CK_21",
		asiSubGroup: "ADDITIONAL INFORMATION",
		asiLabel: "Comply By",
	  },
	  {
		gItem: "22 - FOOD ADDITIVES - APPROVED AND PROPERLY USED",
		asiGroup: "EH_INS_CK_22",
		asiSubGroup: "ADDITIONAL INFORMATION",
		asiLabel: "Comply By",
	  },
	  {
		gItem: "23 - CHEMICALS AND TOXIC MATERIALS STORED AND USED PROPERLY",
		asiGroup: "EH_INS_CK_23",
		asiSubGroup: "ADDITIONAL INFORMATION",
		asiLabel: "Comply By",
	  },
	  {
		gItem: "24 - PERSONAL MEDICATIONS PROPERLY STORED",
		asiGroup: "EH_INS_CK_24",
		asiSubGroup: "ADDITIONAL INFORMATION",
		asiLabel: "Comply By",
	  },
	  {
		gItem: "25 - COMPLIANCE WITH VARIANCE PROCEDURES",
		asiGroup: "EH_INS_CK_25",
		asiSubGroup: "ADDITIONAL INFORMATION",
		asiLabel: "Comply By",
	  },
	  {
		gItem: "26 - RUNNING WATER PROVIDED WHERE REQUIRED",
		asiGroup: "EH_INS_CK_26",
		asiSubGroup: "ADDITIONAL INFORMATION",
		asiLabel: "Comply By",
	  },
	  {
		gItem: "27 - SEWAGE AND WASTEWATER PROPERLY DISPOSED",
		asiGroup: "EH_INS_CK_27",
		asiSubGroup: "ADDITIONAL INFORMATION",
		asiLabel: "Comply By",
	  },
	  {
		gItem: "28 - WATER AND ICE FROM APPROVED SOURCES, PROTECTED",
		asiGroup: "EH_INS_CK_28",
		asiSubGroup: "ADDITIONAL INFORMATION",
		asiLabel: "Comply By",
	  },
	  {
		gItem: "29 - VARIANCE OBTAINED FOR SPECIALIZED FOOD PROCESSING METHODS",
		asiGroup: "EH_INS_CK_29",
		asiSubGroup: "ADDITIONAL INFORMATION",
		asiLabel: "Comply By",
	  },
	  {
		gItem: "30 - ADEQUATE EQUIPMENT AVAILABLE FOR TEMPERATURE CONTROL",
		asiGroup: "EH_INS_CK_30",
		asiSubGroup: "ADDITIONAL INFORMATION",
		asiLabel: "Comply By",
	  },
	  {
		gItem: "31 - PLANT FOOD PROPERLY COOKED FOR HOT HOLDING",
		asiGroup: "EH_INS_CK_31",
		asiSubGroup: "ADDITIONAL INFORMATION",
		asiLabel: "Comply By",
	  },
	  {
		gItem: "32 - FROZEN FOODS, APPROVED THAWING METHODS USED",
		asiGroup: "EH_INS_CK_32",
		asiSubGroup: "ADDITIONAL INFORMATION",
		asiLabel: "Comply By",
	  },
	  {
		gItem: "33 - THERMOMETERS PROVIDED, ACCURATE, PROPERLY LOCATED",
		asiGroup: "EH_INS_CK_33",
		asiSubGroup: "ADDITIONAL INFORMATION",
		asiLabel: "Comply By",
	  },
	  {
		gItem: "34 - FOOD PROPERLY LABELED, NO ARTIFICIAL TRANS-FATS USED, ALLERGEN NOTICE",
		asiGroup: "EH_INS_CK_34",
		asiSubGroup: "ADDITIONAL INFORMATION",
		asiLabel: "Comply By",
	  },
	  {
		gItem: "35 - INSECTS, RODENTS, ANIMALS NOT PRESENT",
		asiGroup: "EH_INS_CK_35",
		asiSubGroup: "ADDITIONAL INFORMATION",
		asiLabel: "Comply By",
	  },
	  {
		gItem: "36 - CONTAMINATION PREVENTED",
		asiGroup: "EH_INS_CK_36",
		asiSubGroup: "ADDITIONAL INFORMATION",
		asiLabel: "Comply By",
	  },
	  {
		gItem: "37 - FOOD WORKERS - PERSONAL CLEANLINESS",
		asiGroup: "EH_INS_CK_37",
		asiSubGroup: "ADDITIONAL INFORMATION",
		asiLabel: "Comply By",
	  },
	  {
		gItem: "38 - WIPING CLOTHS PROPERLY USED AND STORED",
		asiGroup: "EH_INS_CK_38",
		asiSubGroup: "ADDITIONAL INFORMATION",
		asiLabel: "Comply By",
	  },
	  {
		gItem: "39 - WASHING FRUITS AND VEGETABLES",
		asiGroup: "EH_INS_CK_39",
		asiSubGroup: "ADDITIONAL INFORMATION",
		asiLabel: "Comply By",
	  },
	  {
		gItem: "40 - IN-USE UTENSILS PROPERLY STORED",
		asiGroup: "EH_INS_CK_40",
		asiSubGroup: "ADDITIONAL INFORMATION",
		asiLabel: "Comply By",
	  },
	  {
		gItem: "41 - UTENSILS, EQUIPMENT AND LINENS",
		asiGroup: "EH_INS_CK_41",
		asiSubGroup: "ADDITIONAL INFORMATION",
		asiLabel: "Comply By",
	  },
	  {
		gItem: "42 - SINGLE USE, SINGLE SERVICE ARTICLES",
		asiGroup: "EH_INS_CK_42",
		asiSubGroup: "ADDITIONAL INFORMATION",
		asiLabel: "Comply By",
		},
		{
		gItem: "43 - NON-FOOD CONTACT SURFACES CLEAN, MAINTAINED, IN GOOD REPAIR",
		asiGroup: "EH_INS_CK_43",
		asiSubGroup: "ADDITIONAL INFORMATION",
		asiLabel: "Comply By",
		},
		{
		gItem: "44 - WAREWASHING FACILITIES - MAINTAINED, PROPERLY USED, TEST STRIPS",
		asiGroup: "EH_INS_CK_44",
		asiSubGroup: "ADDITIONAL INFORMATION",
		asiLabel: "Comply By",
		},
		{
		gItem: "45 - HOT AND COLD WATER AVAILABLE, ADEQUATE PRESSURE",
		asiGroup: "EH_INS_CK_45",
		asiSubGroup: "ADDITIONAL INFORMATION",
		asiLabel: "Comply By",
		},
		{
		gItem: "46 - PLUMBING MAINTAINED, PROPER BACKFLOW DEVICES",
		asiGroup: "EH_INS_CK_46",
		asiSubGroup: "ADDITIONAL INFORMATION",
		asiLabel: "Comply By",
		},
		{
		gItem: "47 - TOILET FACILITIES - PROPERLY CONSTRUCTED, SUPPLIED AND MAINTAINED",
		asiGroup: "EH_INS_CK_47",
		asiSubGroup: "ADDITIONAL INFORMATION",
		asiLabel: "Comply By",
		},
		{
		gItem: "48 - GARBAGE AND REFUSE PROPERLY DISPOSED, FACILITIES MAINTAINED",
		asiGroup: "EH_INS_CK_48",
		asiSubGroup: "ADDITIONAL INFORMATION",
		asiLabel: "Comply By",
		},
		{
		gItem: "49 - LIGHTING AND VENTILATION ADEQUATE AND PROPERLY MAINTAINED",
		asiGroup: "EH_INS_CK_49",
		asiSubGroup: "ADDITIONAL INFORMATION",
		asiLabel: "Comply By",
		},
		{
		gItem: "50 - PHYSICAL FACILITIES CONSTRUCTED AND PROPERLY MAINTAINED, CLEANING METHODS/STORAGE",
		asiGroup: "EH_INS_CK_50",
		asiSubGroup: "ADDITIONAL INFORMATION",
		asiLabel: "Comply By",
		},
		{
		gItem: "51 - CLEANING METHODS, EMPLOYEE ITEM STORAGE",
		asiGroup: "EH_INS_CK_51",
		asiSubGroup: "ADDITIONAL INFORMATION",
		asiLabel: "Comply By",
		},
		{
		gItem: "52 - UNNECESSARY ARTICLES EXCLUDED, EXTERIOR AREAS MAINTAINED, LIVING QUARTERS SEPARATION",
		asiGroup: "EH_INS_CK_52",
		asiSubGroup: "ADDITIONAL INFORMATION",
		asiLabel: "Comply By",
		},
		{
		gItem: "53 - COMPLIANCE WITH OPERATING PERMIT CONDITIONS",
		asiGroup: "EH_INS_CK_53",
		asiSubGroup: "ADDITIONAL INFORMATION",
		asiLabel: "Comply By",
		},
		{
		gItem: "54 - POSTINGS AND NOTIFICATIONS ADEQUATE",
		asiGroup: "EH_INS_CK_54",
		asiSubGroup: "ADDITIONAL INFORMATION",
		asiLabel: "Comply By",
		},
		{
		gItem: "55 - PERMIT OBTAINED, PLANS APPROVED",
		asiGroup: "EH_INS_CK_55",
		asiSubGroup: "ADDITIONAL INFORMATION",
		asiLabel: "Comply By",
		},
		{
		gItem: "56 - CONDITIONS NOT ADDRESSED",
		asiGroup: "EH_INS_CK_56",
		asiSubGroup: "ADDITIONAL INFORMATION",
		asiLabel: "Comply By",
		},
		{
		gItem: "57 - COMPLIANCE WITH CLEAN INDOOR AIR ACT, PUBLIC HEALTH LAWS",
		asiGroup: "EH_INS_CK_57",
		asiSubGroup: "ADDITIONAL INFORMATION",
		asiLabel: "Comply By",
		},
		{
		gItem: "58 - LIMITED/MOBILE FOOD ESTABLISHMENTS",
		asiGroup: "EH_INS_CK_58",
		asiSubGroup: "ADDITIONAL INFORMATION",
		asiLabel: "Comply By",
		},
		{
		gItem: "59 - LIMITED/MOBILE FOOD ESTABLISHMENT COMMISSARY",
		asiGroup: "EH_INS_CK_59",
		asiSubGroup: "ADDITIONAL INFORMATION",
		asiLabel: "Comply By",
		},
		{
		gItem: "60 - TEMPORARY FOOD ESTABLISHMENTS",
		asiGroup: "EH_INS_CK_60",
		asiSubGroup: "ADDITIONAL INFORMATION",
		asiLabel: "Comply By",
		},
		{
		gItem: "61 - VENDING MACHINES",
		asiGroup: "EH_INS_CK_61",
		asiSubGroup: "ADDITIONAL INFORMATION",
		asiLabel: "Comply By",
	}
	];
	
	// Call the function with the session variable inspection ID from the InspectionScheduleAfter event
	updateGuidesheetASIFields(inspId, gName, guideItems, today);
}

function debugObject(object) {
	var output = ''; 
	for (property in object) { 
	  output += "<font color=red>" + property + "</font>" + ': ' + "<bold>" + object[property] + "</bold>" +'; ' + "<BR>"; 
	} 
	logDebug(output);
} 

function updateGuidesheetASIFields(inspId, gName, guideItems, today) {
  var itemCap = capId;

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
            if (guideSheetObj && gName.toUpperCase() == guideSheetObj.getGuideType().toUpperCase()) {

              var guidesheetItem = guideSheetObj.getItems();

              for (var idx = 0; idx < guideItems.length; idx++) {
                var gItem = guideItems[idx].gItem;
                var asiGroup = guideItems[idx].asiGroup;
                var asiSubGroup = guideItems[idx].asiSubGroup;
                var asiLabel = guideItems[idx].asiLabel;

                // Add 14 days to the "today" variable for the 29th guide item
                var updatedDate = new Date(today);
                if (idx >= 28) {
                  updatedDate.setDate(today.getDate() + 14);
                }
                var newValue = (updatedDate.getMonth() + 1) + "/" + updatedDate.getDate() + "/" + updatedDate.getFullYear();

                for (var j = 0; j < guidesheetItem.size(); j++) {
                  var item = guidesheetItem.get(j);

                  if (item && gItem == item.getGuideItemText() && asiGroup == item.getGuideItemASIGroupName()) {
                    var ASISubGroups = item.getItemASISubgroupList();
                    if (ASISubGroups) {

                      for (var k = 0; k < ASISubGroups.size(); k++) {
                        var ASISubGroup = ASISubGroups.get(k);
                        if (ASISubGroup && ASISubGroup.getSubgroupCode() == asiSubGroup) {
                          var ASIModels = ASISubGroup.getAsiList();
                          if (ASIModels) {

                            for (var m = 0; m < ASIModels.size(); m++) {
                              var ASIModel = ASIModels.get(m);
                              if (ASIModel && ASIModel.getAsiName() == asiLabel) {
                                logDebug("Change ASI value from:" + ASIModel.getAttributeValue() + " to " + newValue);
                                ASIModel.setAttributeValue(newValue);
                              }
                            }
                          }
                        }
                      }
                    }
                  }
                }
              }

              var updateResult = aa.guidesheet.updateGGuidesheet(guideSheetObj, guideSheetObj.getAuditID());
              if (updateResult.getSuccess()) {
                logDebug("Successfully updated " + gName + " on inspection " + inspId + ".");
                return true;
              } else {
                logDebug("Could not update guidesheet ID: " + updateResult.getErrorMessage());
                return false;
              }
            }
          }
        } else {
          // if there are no guidesheets
          logDebug("No guidesheets for this inspection");
          return false;
        }
      }
    }
  } else {
    logDebug("No inspections on the record");
    return false;
  }
}

function setInspectionTimeAndStartTime (inspId, inspSchedDate, itemCap) 
{
	try {
		var inspModel = aa.inspection.getInspection(itemCap, inspId).getOutput();
		//debugObject(inspModel);

		var inspAct = inspModel.getInspection().getActivity();	
		var insStatusDate = inspAct.getStatusDate();	
		logDebug("insStatusDate: " + insStatusDate);

		var inspectionScheduledDate = new Date(inspSchedDate);
		var month = inspectionScheduledDate.getMonth();
		var year = inspectionScheduledDate.getFullYear();
		var day = inspectionScheduledDate.getDate();
		logDebug("month: " + month);
		logDebug("year: " + year);
		logDebug("day: " + day);

		logDebug("*****Before****");
		debugObject(inspModel.getInspection().getActivity());
			
		//inspAct.setDesiredDate(scheduledDate); 
		//inspAct.setActivityDate(scheduledDate); 
		//inspAct.setEndActivityDate(scheduledDate); 
		//inspAct.setCompletionDate(scheduledDate); 
		
		var scheduledDate = new Date(year, month, day, 0, 0, 0, 0);

		inspAct.setStartTime(scheduledDate);
		inspAct.setCompleteTime2("1");
		inspAct.setCompleteTime1("PM");

		inspAct.setRecordDate(scheduledDate);

		aa.inspection.editInspection(inspModel);


		logDebug("*****After****");
		var inspModel1 = aa.inspection.getInspection(itemCap, inspId).getOutput();
		debugObject(inspModel1.getInspection().getActivity());


		
		
	}
	catch (exception) {
		logDebug("Excpetion: " + exception);
	}
}
