

namespace Elavon_Adaptor {
   using System.Runtime.Serialization;
   using System;



  public partial class PaymentResult : object, System.Runtime.Serialization.IExtensibleDataObject, System.ComponentModel.INotifyPropertyChanged {
        
        [System.NonSerializedAttribute()]
        private System.Runtime.Serialization.ExtensionDataObject extensionDataField;
        
        [System.Runtime.Serialization.OptionalFieldAttribute()]
        private string NAMEField;
        
        [System.Runtime.Serialization.OptionalFieldAttribute()]
        private string PHONEField;
        
        [System.Runtime.Serialization.OptionalFieldAttribute()]
        private string FAXField;
        
        [System.Runtime.Serialization.OptionalFieldAttribute()]
        private string ADDRESS1Field;
        
        [System.Runtime.Serialization.OptionalFieldAttribute()]
        private string ADDRESS2Field;
        
        [System.Runtime.Serialization.OptionalFieldAttribute()]
        private string CITYField;
        
        [System.Runtime.Serialization.OptionalFieldAttribute()]
        private string STATEField;
        
        [System.Runtime.Serialization.OptionalFieldAttribute()]
        private string ZIPField;
        
        [System.Runtime.Serialization.OptionalFieldAttribute()]
        private string COUNTRYField;
        
        [System.Runtime.Serialization.OptionalFieldAttribute()]
        private string EMAILField;
        
        [System.Runtime.Serialization.OptionalFieldAttribute()]
        private string EMAIL1Field;
        
        [System.Runtime.Serialization.OptionalFieldAttribute()]
        private string EMAIL2Field;
        
        [System.Runtime.Serialization.OptionalFieldAttribute()]
        private string EMAIL3Field;
        
        [System.Runtime.Serialization.OptionalFieldAttribute()]
        private string LAST4NUMBERField;
        
        [System.Runtime.Serialization.OptionalFieldAttribute()]
        private string TOTALAMOUNTField;
        
        [System.Runtime.Serialization.OptionalFieldAttribute()]
        private string RECEIPTDATEField;
        
        [System.Runtime.Serialization.OptionalFieldAttribute()]
        private string RECEIPTTIMEField;
        
        [System.Runtime.Serialization.OptionalFieldAttribute()]
        private decimal ORDERIDField;
        
        [System.Runtime.Serialization.OptionalFieldAttribute()]
        private string AUTHCODEField;
        
        [System.Runtime.Serialization.OptionalFieldAttribute()]
        private string FAILMESSAGEField;
        
        [System.Runtime.Serialization.OptionalFieldAttribute()]
        private string LOCALREFIDField;
        
        [System.Runtime.Serialization.OptionalFieldAttribute()]
        private string PAYTYPEField;
        
        [System.Runtime.Serialization.OptionalFieldAttribute()]
        private System.DateTime ExpirationDateField;
        
        [System.Runtime.Serialization.OptionalFieldAttribute()]
        private string CreditCardTypeField;
        
        [System.Runtime.Serialization.OptionalFieldAttribute()]
        private string BillingNameField;
        
        [System.Runtime.Serialization.OptionalFieldAttribute()]
        private string AVSResponseField;
        
        [System.Runtime.Serialization.OptionalFieldAttribute()]
        private string CVVResponseField;
        
        [System.Runtime.Serialization.OptionalFieldAttribute()]
        private string FAILCODEField;
        
        [global::System.ComponentModel.BrowsableAttribute(false)]
        public System.Runtime.Serialization.ExtensionDataObject ExtensionData {
            get {
                return this.extensionDataField;
            }
            set {
                this.extensionDataField = value;
            }
        }
        
        [System.Runtime.Serialization.DataMemberAttribute()]
        public string NAME {
            get {
                return this.NAMEField;
            }
            set {
                if ((object.ReferenceEquals(this.NAMEField, value) != true)) {
                    this.NAMEField = value;
                    this.RaisePropertyChanged("NAME");
                }
            }
        }
        
        [System.Runtime.Serialization.DataMemberAttribute()]
        public string PHONE {
            get {
                return this.PHONEField;
            }
            set {
                if ((object.ReferenceEquals(this.PHONEField, value) != true)) {
                    this.PHONEField = value;
                    this.RaisePropertyChanged("PHONE");
                }
            }
        }
        
        [System.Runtime.Serialization.DataMemberAttribute(Order=2)]
        public string FAX {
            get {
                return this.FAXField;
            }
            set {
                if ((object.ReferenceEquals(this.FAXField, value) != true)) {
                    this.FAXField = value;
                    this.RaisePropertyChanged("FAX");
                }
            }
        }
        
        [System.Runtime.Serialization.DataMemberAttribute(Order=3)]
        public string ADDRESS1 {
            get {
                return this.ADDRESS1Field;
            }
            set {
                if ((object.ReferenceEquals(this.ADDRESS1Field, value) != true)) {
                    this.ADDRESS1Field = value;
                    this.RaisePropertyChanged("ADDRESS1");
                }
            }
        }
        
        [System.Runtime.Serialization.DataMemberAttribute(Order=4)]
        public string ADDRESS2 {
            get {
                return this.ADDRESS2Field;
            }
            set {
                if ((object.ReferenceEquals(this.ADDRESS2Field, value) != true)) {
                    this.ADDRESS2Field = value;
                    this.RaisePropertyChanged("ADDRESS2");
                }
            }
        }
        
        [System.Runtime.Serialization.DataMemberAttribute(Order=5)]
        public string CITY {
            get {
                return this.CITYField;
            }
            set {
                if ((object.ReferenceEquals(this.CITYField, value) != true)) {
                    this.CITYField = value;
                    this.RaisePropertyChanged("CITY");
                }
            }
        }
        
        [System.Runtime.Serialization.DataMemberAttribute(Order=6)]
        public string STATE {
            get {
                return this.STATEField;
            }
            set {
                if ((object.ReferenceEquals(this.STATEField, value) != true)) {
                    this.STATEField = value;
                    this.RaisePropertyChanged("STATE");
                }
            }
        }
        
        [System.Runtime.Serialization.DataMemberAttribute(Order=7)]
        public string ZIP {
            get {
                return this.ZIPField;
            }
            set {
                if ((object.ReferenceEquals(this.ZIPField, value) != true)) {
                    this.ZIPField = value;
                    this.RaisePropertyChanged("ZIP");
                }
            }
        }
        
        [System.Runtime.Serialization.DataMemberAttribute(Order=8)]
        public string COUNTRY {
            get {
                return this.COUNTRYField;
            }
            set {
                if ((object.ReferenceEquals(this.COUNTRYField, value) != true)) {
                    this.COUNTRYField = value;
                    this.RaisePropertyChanged("COUNTRY");
                }
            }
        }
        
        [System.Runtime.Serialization.DataMemberAttribute(Order=9)]
        public string EMAIL {
            get {
                return this.EMAILField;
            }
            set {
                if ((object.ReferenceEquals(this.EMAILField, value) != true)) {
                    this.EMAILField = value;
                    this.RaisePropertyChanged("EMAIL");
                }
            }
        }
        
        [System.Runtime.Serialization.DataMemberAttribute(Order=10)]
        public string EMAIL1 {
            get {
                return this.EMAIL1Field;
            }
            set {
                if ((object.ReferenceEquals(this.EMAIL1Field, value) != true)) {
                    this.EMAIL1Field = value;
                    this.RaisePropertyChanged("EMAIL1");
                }
            }
        }
        
        [System.Runtime.Serialization.DataMemberAttribute(Order=11)]
        public string EMAIL2 {
            get {
                return this.EMAIL2Field;
            }
            set {
                if ((object.ReferenceEquals(this.EMAIL2Field, value) != true)) {
                    this.EMAIL2Field = value;
                    this.RaisePropertyChanged("EMAIL2");
                }
            }
        }
        
        [System.Runtime.Serialization.DataMemberAttribute(Order=12)]
        public string EMAIL3 {
            get {
                return this.EMAIL3Field;
            }
            set {
                if ((object.ReferenceEquals(this.EMAIL3Field, value) != true)) {
                    this.EMAIL3Field = value;
                    this.RaisePropertyChanged("EMAIL3");
                }
            }
        }
        
        [System.Runtime.Serialization.DataMemberAttribute(Order=13)]
        public string LAST4NUMBER {
            get {
                return this.LAST4NUMBERField;
            }
            set {
                if ((object.ReferenceEquals(this.LAST4NUMBERField, value) != true)) {
                    this.LAST4NUMBERField = value;
                    this.RaisePropertyChanged("LAST4NUMBER");
                }
            }
        }
        
        [System.Runtime.Serialization.DataMemberAttribute(Order=14)]
        public string TOTALAMOUNT {
            get {
                return this.TOTALAMOUNTField;
            }
            set {
                if ((object.ReferenceEquals(this.TOTALAMOUNTField, value) != true)) {
                    this.TOTALAMOUNTField = value;
                    this.RaisePropertyChanged("TOTALAMOUNT");
                }
            }
        }
        
        [System.Runtime.Serialization.DataMemberAttribute(Order=15)]
        public string RECEIPTDATE {
            get {
                return this.RECEIPTDATEField;
            }
            set {
                if ((object.ReferenceEquals(this.RECEIPTDATEField, value) != true)) {
                    this.RECEIPTDATEField = value;
                    this.RaisePropertyChanged("RECEIPTDATE");
                }
            }
        }
        
        [System.Runtime.Serialization.DataMemberAttribute(Order=16)]
        public string RECEIPTTIME {
            get {
                return this.RECEIPTTIMEField;
            }
            set {
                if ((object.ReferenceEquals(this.RECEIPTTIMEField, value) != true)) {
                    this.RECEIPTTIMEField = value;
                    this.RaisePropertyChanged("RECEIPTTIME");
                }
            }
        }
        
        [System.Runtime.Serialization.DataMemberAttribute(Order=17)]
        public decimal ORDERID {
            get {
                return this.ORDERIDField;
            }
            set {
                if ((this.ORDERIDField.Equals(value) != true)) {
                    this.ORDERIDField = value;
                    this.RaisePropertyChanged("ORDERID");
                }
            }
        }
        
        [System.Runtime.Serialization.DataMemberAttribute(Order=18)]
        public string AUTHCODE {
            get {
                return this.AUTHCODEField;
            }
            set {
                if ((object.ReferenceEquals(this.AUTHCODEField, value) != true)) {
                    this.AUTHCODEField = value;
                    this.RaisePropertyChanged("AUTHCODE");
                }
            }
        }
        
        [System.Runtime.Serialization.DataMemberAttribute(Order=19)]
        public string FAILMESSAGE {
            get {
                return this.FAILMESSAGEField;
            }
            set {
                if ((object.ReferenceEquals(this.FAILMESSAGEField, value) != true)) {
                    this.FAILMESSAGEField = value;
                    this.RaisePropertyChanged("FAILMESSAGE");
                }
            }
        }
        
        [System.Runtime.Serialization.DataMemberAttribute(Order=20)]
        public string LOCALREFID {
            get {
                return this.LOCALREFIDField;
            }
            set {
                if ((object.ReferenceEquals(this.LOCALREFIDField, value) != true)) {
                    this.LOCALREFIDField = value;
                    this.RaisePropertyChanged("LOCALREFID");
                }
            }
        }
        
        [System.Runtime.Serialization.DataMemberAttribute(Order=21)]
        public string PAYTYPE {
            get {
                return this.PAYTYPEField;
            }
            set {
                if ((object.ReferenceEquals(this.PAYTYPEField, value) != true)) {
                    this.PAYTYPEField = value;
                    this.RaisePropertyChanged("PAYTYPE");
                }
            }
        }
        
        [System.Runtime.Serialization.DataMemberAttribute(Order=22)]
        public System.DateTime ExpirationDate {
            get {
                return this.ExpirationDateField;
            }
            set {
                if ((this.ExpirationDateField.Equals(value) != true)) {
                    this.ExpirationDateField = value;
                    this.RaisePropertyChanged("ExpirationDate");
                }
            }
        }
        
        [System.Runtime.Serialization.DataMemberAttribute(Order=23)]
        public string CreditCardType {
            get {
                return this.CreditCardTypeField;
            }
            set {
                if ((object.ReferenceEquals(this.CreditCardTypeField, value) != true)) {
                    this.CreditCardTypeField = value;
                    this.RaisePropertyChanged("CreditCardType");
                }
            }
        }
        
        [System.Runtime.Serialization.DataMemberAttribute(Order=24)]
        public string BillingName {
            get {
                return this.BillingNameField;
            }
            set {
                if ((object.ReferenceEquals(this.BillingNameField, value) != true)) {
                    this.BillingNameField = value;
                    this.RaisePropertyChanged("BillingName");
                }
            }
        }
        
        [System.Runtime.Serialization.DataMemberAttribute(Order=25)]
        public string AVSResponse {
            get {
                return this.AVSResponseField;
            }
            set {
                if ((object.ReferenceEquals(this.AVSResponseField, value) != true)) {
                    this.AVSResponseField = value;
                    this.RaisePropertyChanged("AVSResponse");
                }
            }
        }
        
        [System.Runtime.Serialization.DataMemberAttribute(Order=26)]
        public string CVVResponse {
            get {
                return this.CVVResponseField;
            }
            set {
                if ((object.ReferenceEquals(this.CVVResponseField, value) != true)) {
                    this.CVVResponseField = value;
                    this.RaisePropertyChanged("CVVResponse");
                }
            }
        }
        
        [System.Runtime.Serialization.DataMemberAttribute(Order=27)]
        public string FAILCODE {
            get {
                return this.FAILCODEField;
            }
            set {
                if ((object.ReferenceEquals(this.FAILCODEField, value) != true)) {
                    this.FAILCODEField = value;
                    this.RaisePropertyChanged("FAILCODE");
                }
            }
        }
        
        public event System.ComponentModel.PropertyChangedEventHandler PropertyChanged;
        
        protected void RaisePropertyChanged(string propertyName) {
            System.ComponentModel.PropertyChangedEventHandler propertyChanged = this.PropertyChanged;
            if ((propertyChanged != null)) {
                propertyChanged(this, new System.ComponentModel.PropertyChangedEventArgs(propertyName));
            }
        }
    }

}
    