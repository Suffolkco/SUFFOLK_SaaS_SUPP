
namespace Accela.ACA.PaymentAdapter.CSPPayAdapter {
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
    public partial class PaymentRedirect : System.Web.UI.Page {

        private static readonly log4net.ILog _logger = LogFactory.Instance.GetLogger(typeof(PaymentRedirect));
        private long _timeFlag;
        private string _responseText = "success=false";

        public PaymentRedirect() {
            _timeFlag = DateTime.Now.Ticks;

            _logger.DebugFormat("---Page {0} Load begin [{1}]---", this.GetType().FullName, _timeFlag.ToString());
        }

        /// <summary>
        /// do dispose when leave this page
        /// </summary>
        public override void Dispose() {
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
                if (qString == null || qString == String.Empty) {
                    _logger.Debug("Query string is null");
                }
                else {
                    _logger.DebugFormat("Query String {0}", qString);
                }
                string transactionID = ParameterHelper.GetParameterByKey("req_reference_number");
                _logger.DebugFormat("Got transactionID {0} from parameters", transactionID);
                string cyberSourceID = ParameterHelper.GetParameterByKey("transaction_id");
                string responseCode = PaymentHelper.GetDataFromCache<string>(transactionID+"RESPONSE");
                _logger.DebugFormat("Got response code from cache {0}", responseCode);
                if (responseCode == "100") {
                     string paramToACA = AdapterUtil.GetRedirectUrlParamToACA(applicationID, transactionID, PaymentConstant.SUCCESS_CODE);
                    redirectUrl = String.Format("{0}?{1}", redirectUrl, paramToACA);
                    if (!String.IsNullOrEmpty(redirectUrl)) {
                        _logger.DebugFormat("Redirecting to {0}", redirectUrl);
                        Response.Redirect(redirectUrl);
                    }
                }
                else {
                    string errorMessage = AdapterUtil.GetConfig(responseCode);
                    StringBuilder paramToACA = new StringBuilder();
                    paramToACA.AppendFormat("{0}={1}", PaymentConstant.RETURN_CODE, PaymentConstant.FAILURE_CODE);
                    paramToACA.AppendFormat("&{0}={1}", PaymentConstant.APPLICATION_ID, applicationID);
                    paramToACA.AppendFormat("&{0}={1}", PaymentConstant.TRANSACTION_ID, transactionID);
                    paramToACA.AppendFormat("&{0}={1}", PaymentConstant.USER_MESSAGE, errorMessage);
                    redirectUrl = String.Format("{0}?{1}", redirectUrl, paramToACA.ToString());
                    if (!String.IsNullOrEmpty(redirectUrl)) {
                        _logger.DebugFormat("Redirecting to {0} ",redirectUrl);
                        Response.Redirect(redirectUrl);
                    }
                }
            }
            catch (Exception ex) {
                _logger.DebugFormat("Exception on page load of PaymentRedirect : {0}", ex.Message);
            }
        }
    }
}
