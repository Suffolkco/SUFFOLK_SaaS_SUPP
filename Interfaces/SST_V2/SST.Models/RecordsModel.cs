namespace SST.Models
{
    public class RecordsModel
    {
        public RecordModel[] Result { get; set; }
        public int Status { get; set; }
        public PageModel Page { get; set; }
        public string DisplayRange { get; set; } = "";
    }

}
