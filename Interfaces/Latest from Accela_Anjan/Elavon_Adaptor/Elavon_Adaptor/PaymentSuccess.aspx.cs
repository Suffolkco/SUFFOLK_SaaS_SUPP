
namespace Accela.ACA.PaymentAdapter.CSPPayAdapter
{
    using System;
    using System.Collections;
    using System.Collections.Generic;
    using System.Collections.Specialized;
    using System.Configuration;
    using System.Text;
    using System.Web;

    using Accela.ACA.PaymentAdapter.Service;

    /// <summary>
    /// deal with successful payment
    /// </summary>
    public partial class PaymentSuccess : System.Web.UI.Page
    {
          private static readonly log4net.ILog _logger = LogFactory.Instance.GetLogger(typeof(PaymentSuccess));
        private long _timeFlag;
        private string _responseText = "success=false";

        public PaymentSuccess()
        {
            _timeFlag = DateTime.Now.Ticks;

            _logger.DebugFormat("---Page {0} Load begin [{1}]---", this.GetType().FullName, _timeFlag.ToString());
        }

        /// <summary>
        /// do dispose when leave this page
        /// </summary>
        public override void Dispose()
        {
            base.Dispose();

            _logger.DebugFormat("---Page {0} Load End [{1}]---", this.GetType().FullName, _timeFlag.ToString());
        } 

        /// <summary>
        /// Handles the Load event of the Page control.
        /// </summary>
        /// <param name="sender">The source of the event.</param>
        /// <param name="e">The <see cref="System.EventArgs"/> instance containing the event data.</param>
        protected void Page_Load(object sender, EventArgs e) {
            try {
                // payment was posted by Session.aspx, just redirect
                string redirectUrl = AdapterUtil.GetConfig("ACARedirectURL");
                _logger.DebugFormat("redirectURL = {0}", redirectUrl);
                string applicationID = PaymentHelper.GetDataFromCache<string>(PaymentConstant.APPLICATION_ID);
                string qString = ParameterHelper.GetReqeustParameters();
                string BOAApplicationID = ParameterHelper.GetParameterByKey("application_id");
                string messageVersion = ParameterHelper.GetParameterByKey("message_version");
                string transactionID = ParameterHelper.GetParameterByKey("remittance_id");
                string securityID = ParameterHelper.GetParameterByKey("security_id");
                string paramToACA = AdapterUtil.GetRedirectUrlParamToACA(applicationID, transactionID, PaymentConstant.SUCCESS_CODE);
                redirectUrl = String.Format("{0}?{1}", redirectUrl, paramToACA);
                if (!String.IsNullOrEmpty(redirectUrl)) {
                    _logger.DebugFormat("Redirecting to {0}", redirectUrl);
                    Response.Redirect(redirectUrl);
                }
            }
            catch (Exception e) {
                _logger.DebugFormat("Exception on page load of PaymentSuccess : {0}", e.Message);
            }
        }
    }
}
