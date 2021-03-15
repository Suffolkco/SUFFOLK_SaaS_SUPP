function getWorkflowParams4Notification(emailParams) 
{
	// pass in a hashtable and it will add the additional parameters to the table
	addParameter(emailParams, "$$wfStatus$$", wfStatus);
	addParameter(emailParams, "$$wfTask$$", wfTask);
	addParameter(emailParams, "$$wfComment$$", wfComment);
	return emailParams;
}