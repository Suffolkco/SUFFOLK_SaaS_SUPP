
namespace Accela.ACA.PaymentAdapter.CSPPayAdapter {
    using System;
    using System.Collections;
    using System.Collections.Generic;
    using System.Collections.Specialized;
    using System.Configuration;
    using System.Text;
    using System.Web;

    using Accela.ACA.PaymentAdapter.Service;


    public partial class PaymentFailure : System.Web.UI.Page
    {
        private static readonly log4net.ILog _logger = LogFactory.Instance.GetLogger(typeof(PaymentFailure));
        private long _timeFlag;
        private string _responseText = "success=false";

        public PaymentFailure()
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
            // payment was posted by Session.aspx, just redirect
            string redirectUrl = AdapterUtil.GetConfig("ACARedirectURL");
            string applicationID = PaymentHelper.GetDataFromCache<string>(PaymentConstant.APPLICATION_ID);
            string qString = ParameterHelper.GetReqeustParameters();
            _logger.DebugFormat("Query string from BoA {0}", qString);
            string BOAApplicationID = ParameterHelper.GetParameterByKey("application_id");
            string messageVersion = ParameterHelper.GetParameterByKey("message_version");
            string transactionID = ParameterHelper.GetParameterByKey("remittance_id");
            string securityID = ParameterHelper.GetParameterByKey("security_id");
            string failCode = PaymentHelper.GetDataFromCache<string>(transactionID+"FAILCODE");
            string errorMessage = String.Empty;
            try {
                if (failCode == null && failCode == String.Empty)
                    _logger.DebugFormat("Invalid fail code {0}", failCode);
                else
                    errorMessage = AdapterUtil.GetConfig(failCode);
            }
            catch (Exception ex) {
                _logger.DebugFormat("Exception getting error message for fail code {0}, error {1}", failCode, ex.Message);
            }
            _logger.DebugFormat("Error code {0} from BoA, error message {1}", failCode, errorMessage);
          //  PaymentHelper.HandleErrorRedirect(errorMessage, PaymentConstant.FAILURE_CODE);

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
}