namespace SST.Models
{
    public class WorkFlowModel
    {
        public string Description { get; set; } = "";
        public WorkFlowStatusModel Status { get; set; }
        public string StatusDate { get; set; } = "";
        public string Comment { get; set; } = "";
        public string LastModifiedDate { get; set; } = "";
    }
}
