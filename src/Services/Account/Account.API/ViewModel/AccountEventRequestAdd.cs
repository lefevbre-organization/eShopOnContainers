
namespace Lefebvre.eLefebvreOnContainers.Services.Account.API.ViewModel
{
    using Account.API.Model;
    public class AccountEventAddRequest: AccountEventRequest
    {
        public EventType eventType { get; set; }
    }
}
