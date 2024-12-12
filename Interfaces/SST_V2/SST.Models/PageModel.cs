namespace SST.Models
{
    public class PageModel
    {
        public int Offset { get; set; } = 0;
        public int Limit { get; set; } = 10;
        public bool Hasmore { get; set; }
        public int Total { get; set; }

    }
}
