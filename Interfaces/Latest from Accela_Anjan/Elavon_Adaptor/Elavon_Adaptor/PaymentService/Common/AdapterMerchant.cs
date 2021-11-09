using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using System.Xml.Serialization;
using Accela.ACA.Payment.Xml;

namespace Accela.ACA.PaymentAdapter.Service.Common {
    /// <summary>
    /// the adapter node
    /// </summary>
    public sealed class AdapterMerchant {
        /// <summary>
        /// the adapter name
        /// </summary>
        [XmlAttribute("AdapterName")]
        public string AdapterName;

        /// <summary>
        /// The merchant list group
        /// </summary>
        [XmlElement("Merchant", typeof(MerchantNode))]
        public List<MerchantNode> Merchants = new List<MerchantNode>();
    }
}
