using SST.Models;
using System.Threading.Tasks;

namespace SST.Web.Services
{
    public interface IRecordService
    {
        Task<RecordsModel> SearchRecords(SearchRecordsModel search, PageModel page);
        Task<RecordModel> GetTanks(RecordModel record);
        Task GetLastInspectionDate(TankModel tank);
    }
}
