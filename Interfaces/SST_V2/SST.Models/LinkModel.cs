namespace SST.Models
{
    public class LinkModel
    {
        public string Text { get; set; } = "";
        public int Page { get; set; }
        public bool Enabled { get; set; }
        public bool Active { get; set; }

        public LinkModel(int page, bool enabled, string text)
        {
            Page = page;
            Enabled = enabled;
            Text = text;
        }

        public LinkModel(int page, bool enabled)
            :this(page, enabled, page.ToString())
        {
        }

        public LinkModel(int page)
            :this(page, true)
        {
        }

    }
}
