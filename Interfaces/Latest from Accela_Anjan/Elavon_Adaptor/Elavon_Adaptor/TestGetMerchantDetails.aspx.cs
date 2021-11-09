using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;
using System.Web.UI;
using System.Web.UI.WebControls;
using Elavon_Adaptor.Connectivity;

namespace Elavon_Adapter {
    public partial class TestGetMerchantDetails : System.Web.UI.Page {
        protected void Page_Load(object sender, EventArgs e) {
            var merchantObj = AccelaRestHandler.GetMerchantDetails("14");
            return;
        }
    }
}