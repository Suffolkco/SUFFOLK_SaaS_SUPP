using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using System.Xml.Serialization;
using Accela.ACA.Payment.Xml;

namespace Accela.ACA.PaymentAdapter.Service.Common {

    [XmlRoot("MerchantMapping")]
    public sealed class MerchantMapping {
        /// <summary>
        /// The parameters group
        /// </summary>
        [XmlElement("Adapter", typeof(AdapterMerchant))]
        public AdapterMerchant Merchant = new AdapterMerchant();
    }
}
