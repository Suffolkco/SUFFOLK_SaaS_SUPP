var showDebug = false;
 
if (wfTask == "Review" && wfStatus == "Complete")
{
    logDebug("WF Task and WF Status is correct.");
    logDebug(wfComment + "is the value of wfComment.");
    if (wfComment !== null)
    {
        logDebug("A report will be fired, with the Standard Comment inside.")
        workflowFoodReviewCompleteWWM("Food Review Notice", "RecordID");
        //need to single out Applicant only
        // need to update notification template DEQ_WWM_FOOD_REVIEW_NOTICE with language from Suffolk County
    }
    else if (wfComment == null)
    {
        logDebug("A report will not be fired, since there is no Comment entered here.")
    }
}
