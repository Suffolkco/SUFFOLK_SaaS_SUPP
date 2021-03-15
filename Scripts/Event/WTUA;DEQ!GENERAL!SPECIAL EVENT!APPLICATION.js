//WTUA:DEQ/GENERAL/SPECIAL EVENT/APPLICATION

if (!isTaskActive("Plans Reviewed") && !isTaskActive("Pre-Event Inspection/Sampling"))
{
    updateAppStatus("Pending");
}