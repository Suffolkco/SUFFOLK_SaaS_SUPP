using Microsoft.AspNetCore.Mvc.RazorPages;
using Microsoft.Extensions.Logging;
using Microsoft.AspNetCore.Http;

namespace SST.Web.Pages
{
    public class _Host : PageModel
    {
        private readonly IHttpContextAccessor _httpContextAccssor;
        private ILogger<_Host> Logger { get; }
        public _Host(IHttpContextAccessor httpContextAccssor, ILogger<_Host> logger)
        {
            _httpContextAccssor = httpContextAccssor;
            Logger = logger;
        }

        public string UserAgent { get; set; }

        public void OnGet()
        {
            UserAgent = _httpContextAccssor.HttpContext.Request.Headers["User-Agent"];
            Logger.LogInformation($"UserAgent = {UserAgent}");
        }
    }
}
