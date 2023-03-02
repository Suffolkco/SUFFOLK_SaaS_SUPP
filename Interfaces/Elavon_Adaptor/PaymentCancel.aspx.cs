using System;
using Accela.ACA.PaymentAdapter;


namespace Elavon_Adaptor
{


    /// <summary>
    /// deal with cancelled payment 
    /// </summary>
    public partial class PaymentCancel : System.Web.UI.Page
    {
        private static readonly log4net.ILog _logger = LogFactory.Instance.GetLogger(typeof(PaymentResponse));
        /// <summary>
        /// Handles the Load event of the Page control.
        /// </summary>
        /// <param name="sender">The source of the event.</param>
        /// <param name="e">The <see cref="System.EventArgs"/> instance containing the event data.</param>
        protected void Page_Load(object sender, EventArgs e)
        {
            string qString = ParameterHelper.GetReqeustParameters();

            // Scan: Fixed
            string qStringLog = System.Security.SecurityElement.Escape(qString);
            _logger.DebugFormat("PaymentResponse - Query string is {0}", qStringLog);
            PaymentHelper.HandleErrorRedirect("The 3rd party payment is cancelled", PaymentConstant.FAILURE_CODE);
        }
    }
}
