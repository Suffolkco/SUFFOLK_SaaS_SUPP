namespace SST.Models
{
    public class RecordModel
    {
        public AddressesModel[] Addresses { get; set; }
        public ParcelModel[] Parcels { get; set; }
        public CustomformModel[] CustomForms { get; set; }
        public string Id { get; set; } = "";
        public RecordTypeModel Type { get; set; }
        public string Module { get; set; } = "";
        public StatusModel Status { get; set; }
        public string ServiceProviderCode { get; set; } = "";
        public string OpenedDate { get; set; } = "";
        public string CustomId { get; set; } = "";
        public string ShortNotes { get; set; } = "";
        public WorkFlowHistoryModel WorkFlowHistory { get; set; }
        public bool ShowDetail { get; set; } = false;
        public bool ShowPlus { get; set; } = true;
        public bool HidePlusMinus { get; set; } = true;
        public string PlansCoordinationApprovedDate { get; set; } = "";
        public string FinalReviewApprovedDate { get; set; } = "";
        public string ParcelNumber { get; set; } = "";
        public string ParcelNumberShort { get; set; } = "";
        public bool ShowAllTaxMap { get; set; } = false;
        public string Hamlet { get; set; } = "";
        

        // OPC
        public string Address { get; set; } = "";
        public string FileReferenceNumber { get; set; } = "";
        public string OPCPermitToOperateStartDate { get; set; } = "";
        public string OPCPermitToOperateEndDate { get; set; } = "";
        public string NonFoilable { get; set; } = "";
        public string FoilableSite { get; set; } = "";
        public TankModel[] Tanks { get; set; }
    }
}
