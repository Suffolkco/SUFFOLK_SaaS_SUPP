namespace SST.Models
{
    public class AddressesModel
    {
        public int StreetStart { get; set; } = -1;
        public DirectionModel Direction { get; set; }
        public string StreetName { get; set; } = "";
        public StreetSuffixModel StreetSuffix { get; set; }
        public StreetSuffixDirectionModel StreetSuffixDirection { get; set; }
        public string UnitStart { get; set; } = "";
        public string City { get; set; } = "";
        public StateModel State { get; set; }
        public string PostalCode { get; set; } = "";
        public string IsPrimary { get; set; } = "";

    }
}