//DUA:DEQ/ECOLOGY/IA/TRANSFER

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
