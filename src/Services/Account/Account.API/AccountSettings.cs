
namespace Lefebvre.eLefebvreOnContainers.Services.Account.API
{
    using BuidingBlocks.Lefebvre.Models;
    public class AccountSettings :BaseSettings
    {

        public string CollectionRaw { get;  set; }
        public string CollectionCalendar { get; set; }
        public string CollectionCalendarUser { get; set; }

    }
}