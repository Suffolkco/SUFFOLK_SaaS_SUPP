namespace SST.Models
{
    public class TankModel
    {
        public CustomformModel[] CustomForms { get; set; }
        public string CustomId { get; set; } = "";
        public StatusModel Status { get; set; }
        public string Id { get; set; } = "";
        public string LastInspectionDate { get; set; } = "";
        public string SCDHSTankNumber { get; set; } = "";
        public string TankLocation { get; set; } = "";
        public string Capacity { get; set; } = "";
        public string UnitsLabel { get; set; } = "";
        public string ProductStored { get; set; } = "";
        public string StorageTypeLabel { get; set; } = "";
        public string AsiStatus { get; set; } = "";
        public string DateInstalled { get; set; } = "";
        public string DateOfPermanentClosureOrOutOfService { get; set; } = "";
        public bool showLoading = true;
        public bool Hide { get; set; } = false;
    }
}
