var approvalRequired = getAppSpecific("DEQ/OWM Approval Required?")
var dateSubmitted = getAppSpecific("Date Submitted to OWM");
var dateOWMApproval = getAppSpecific("Date of OWM Approval");

//Intake and Payment
editTaskSpecific("Intake and Payment", "DEQ/OWM Approval Required?", approvalRequired);
editTaskSpecific("Intake and Payment", "Date Submitted to OWM", dateSubmitted);
editTaskSpecific("Intake and Payment", "Date of OWM Approval", dateOWMApproval);


//PHP Review
editTaskSpecific("PHP Review", "DEQ/OWM Approval Required?", approvalRequired);
editTaskSpecific("PHP Review", "Date Submitted to OWM", dateSubmitted);
editTaskSpecific("PHP Review", "Date of OWM Approval", dateOWMApproval);


//Inspection
editTaskSpecific("Inspection", "DEQ/OWM Approval Required?", approvalRequired);
editTaskSpecific("Inspection", "Date Submitted to OWM", dateSubmitted);
editTaskSpecific("Inspection", "Date of OWM Approval", dateOWMApproval);


//Minor Plan Approval
editTaskSpecific("Minor Plan Approval", "DEQ/OWM Approval Required?", approvalRequired);
editTaskSpecific("Minor Plan Approval", "Date Submitted to OWM", dateSubmitted);
editTaskSpecific("Minor Plan Approval", "Date of OWM Approval", dateOWMApproval);

//Final Approval
editTaskSpecific("Final Approval", "DEQ/OWM Approval Required?", approvalRequired);
editTaskSpecific("Final Approval", "Date Submitted to OWM", dateSubmitted);
editTaskSpecific("Final Approval", "Date of OWM Approval", dateOWMApproval);
