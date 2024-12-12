using System.Text.Json.Serialization;

namespace SST.Models
{
    
    public class CustomformModel
    {
        public string Id { get; set; } = "";


        /* 
            * WWM 
        */
        public string Hamlet { get; set; } = "";



        /* 
         * OPC Sites 
        */

        // ASI section "OPC" > "id": "DEQ_SITE-OPC.cSPECIFIC"

        [JsonPropertyName("File Reference Number")]
            public string FileReferenceNumber { get; set; } = "";

        [JsonPropertyName("Facility Type Code")]
            public string FacilityTypeCode { get; set; } = "";

        [JsonPropertyName("OPC Permit to Operate Start Date")]
            public string OPCPermitToOperateStartDate { get; set; } = "";

        [JsonPropertyName("OPC Permit to Operate End Date")]
            public string OPCPermitToOperateEndDate { get; set; } = "";

        [JsonPropertyName("NON-FOILABLE")]
            public string NonFoilable { get; set; } = "";
        [JsonPropertyName("FOILABLE SITE")]
        public string FoilableSite { get; set; } = "";


        /* 
        * OPC Tanks 
        */

        // ASI section "OFFICIAL USE" section > "id": "HZ_MAT_TNK-OFFICIAL.cUSE"
        [JsonPropertyName("SCDHS Tank #")]
            public string SCDHSTankNumber { get; set; } = "";

        [JsonPropertyName("Official Use Code")]
            public string OfficialUseCode { get; set; } = "";

        [JsonPropertyName("Storage Type Label")]
            public string StorageTypeLabel { get; set; } = "";

        [JsonPropertyName("CBS Reg")]
            public string CbsReg { get; set; } = "";


        // ASI Section "TANK GENERAL INFORMATION" > "id": "HZ_MAT_TNK-TANK.cGENERAL.cINFORMATION"
        [JsonPropertyName("Status")]
            public string Status { get; set; }

        [JsonPropertyName("Tank Location")]
            public string TankLocation { get; set; } = "";

        [JsonPropertyName("Capacity")]
            public string Capacity { get; set; } = "";

        [JsonPropertyName("Units Label")]
            public string UnitsLabel { get; set; } = "";

        [JsonPropertyName("Product Stored Code")]
            public string ProductStoredCode { get; set; } = "";

        [JsonPropertyName("Other Product Stored")]
            public string OtherProductStored { get; set; } = "";

        [JsonPropertyName("Product Stored Label")]
            public string ProductStoredLabel { get; set; } = "";

        [JsonPropertyName("Date Installed")]
            public string DateInstalled { get; set; } = "";

        [JsonPropertyName("Date of Permanent Closure or Out of Service")]
            public string DateOfPermanentClosureOrOutOfService { get; set; } = "";

    }
}
