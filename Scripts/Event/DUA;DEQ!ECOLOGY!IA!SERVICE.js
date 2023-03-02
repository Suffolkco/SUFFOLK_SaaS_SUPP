//DUA:DEQ/ECOLOGY/IA/SERVICE

if (publicUser)
{
    if (cap.isCompleteCap())
    {
        if (getAppStatus() == "Resubmission Required")
        {
            updateAppStatus("Resubmitted");
        }
    }
}
