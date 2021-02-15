using Microsoft.eShopOnContainers.BuildingBlocks.EventBus.Abstractions;
using Microsoft.eShopOnContainers.BuildingBlocks.Lefebvre.Models;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.Logging;
using Microsoft.Extensions.Options;
using MongoDB.Driver;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace Lefebvre.eLefebvreOnContainers.Services.Calendar.API.Infrastructure.Repositories
{
 
    using Infrastructure.Exceptions;
    using Model;

    public class EventsRepository : BaseClass<EventsRepository>, IEventsRepository
    {
        private readonly CalendarContext _context;
        private readonly IEventBus _eventBus;

        public EventsRepository(
            IOptions<CalendarSettings> settings,
            IEventBus eventBus,
            ILogger<EventsRepository> logger,
            IConfiguration configuration) : base(logger)
        {
            _context = new CalendarContext(settings, eventBus, configuration);
            _eventBus = eventBus;
        }

        #region Common

        private void ReviewAccountEventsMail(AccountEventTypes account)
        {
            account.email = account.email.ToUpperInvariant();

            var eventsList = account.eventTypes.ToList();

            if (eventsList.Count > 0)
            {
                foreach (var ev in eventsList)
                {
                    ReviewEvents(ev);
                }
            }
        }

        private static void ReviewEvents(EventType eve)
        {
            if (string.IsNullOrEmpty(eve.idEvent))
                eve.idEvent = Guid.NewGuid().ToString();
            eve.name = eve.name.Trim();
            eve.color = eve.color.Trim();
        }

        private static FilterDefinition<AccountEventTypes> GetFilterAccountEvents(string mail)
        {
            return Builders<AccountEventTypes>.Filter.Eq(u => u.email, mail.ToUpperInvariant());
        }

        #endregion Common

        #region EventTypes

        public async Task<Result<AccountEventTypes>> GetEventTypesByAccount(string account)
        {
            var result = new Result<AccountEventTypes>();
            try
            {
                result.data = await _context.AccountEvents.Find(GetFilterAccountEvents(account)).FirstOrDefaultAsync();

                if (result.data == null)
                    TraceInfo(result.infos, $"No se encuentra ningún EventTypes para esa cuenta {account}", "AC40");
                else
                {
                    var orderEvents = result.data?.eventTypes.OrderByDescending(x => x.name).ToList();
                    if (orderEvents != null)
                        result.data.eventTypes = orderEvents.ToArray();
                }
            }
            catch (Exception ex)
            {
                TraceError(result.errors, new CalendarDomainException($"Error when get EventTypes of {account}", ex), "AC40");
            }
            return result;
        }

        public async Task<Result<AccountEventTypes>> UpsertAccountEventTypes(AccountEventTypes accountIn)
        {
            var result = new Result<AccountEventTypes>();
            ReviewAccountEventsMail(accountIn);

            try
            {
                var resultReplace = await _context.AccountEvents.ReplaceOneAsync(GetFilterAccountEvents(accountIn.email), accountIn, GetUpsertOptions());

                accountIn.Id = ManageUpsert<AccountEventTypes>($"Don´t insert or modify the user {accountIn.email}",
                    $"Se modifica la cuenta {accountIn.email}",
                    $"Se inserta la cuenta {accountIn.email} con {resultReplace.UpsertedId}",
                     result, resultReplace, "AC41");

                result.data = accountIn;
            }
            catch (Exception ex)
            {
                TraceError(result.errors, new CalendarDomainException($"Error when upsert EventTypes of {accountIn.email}", ex), "AC41");
            }
            return result;
        }

        public async Task<Result<bool>> RemoveEventType(string email, string idEvent)
        {
            var result = new Result<bool>();
            var resultAccount = new Result<AccountEventTypes>();
            var options = new FindOneAndUpdateOptions<AccountEventTypes> { ReturnDocument = ReturnDocument.After };
            try
            {
                var update = Builders<AccountEventTypes>.Update.PullFilter(
                    p => p.eventTypes,
                    f => f.idEvent.Equals(idEvent.ToLowerInvariant())
                    );

                var userUpdate = await _context.AccountEvents.FindOneAndUpdateAsync<AccountEventTypes>(
                    GetFilterAccountEvents(email),
                    update, options);

                if (userUpdate != null)
                {
                    TraceInfo(result.infos, $"Se ha removido el evento {idEvent} de la cuenta {email}", "AC42");
                    resultAccount.data = userUpdate;
                    result.data = true;
                }
                else
                {
                    TraceInfo(result.infos, $"No se encuentra la cuenta {email} para remover el evento {idEvent}", "AC42");
                }
            }
            catch (Exception ex)
            {
                TraceError(result.errors, new CalendarDomainException($"Error when remove EventTypes of {email}", ex), "AC42");
            }

            return result;
        }

        public async Task<Result<EventType>> AddEventType(string email, EventType eventType)
        {
            var resultBoolean = new Result<bool>();
            var result = new Result<EventType>();
            var IdEventDontExistImNew = eventType.idEvent == null;
            ReviewEvents(eventType);

            try
            {
                var account = await _context.AccountEvents.FindAsync(c => c.email.Equals(email.ToUpperInvariant())).Result.FirstOrDefaultAsync();

                if (account == null)
                {
                    var arrayEvents = new List<EventType> { eventType };

                    var resultInsertAccountEvent = await UpsertAccountEventTypes(new AccountEventTypes() { email = email, eventTypes = arrayEvents.ToArray() });
                    account = resultInsertAccountEvent.data;
                }
                else
                {
                    if (IdEventDontExistImNew)
                        InsertEventType(account, eventType, result);
                    else
                        UpdateEventType(account, eventType, result);

                    await _context.AccountEvents.ReplaceOneAsync(c => c.Id == account.Id, account);
                }

                result.data = eventType;
            }
            catch (Exception ex)
            {
                TraceError(result.errors, new CalendarDomainException($"Error when add EventTypes of {email}", ex), "AC43");
            }

            return result;
        }

        private void InsertEventType(AccountEventTypes account, EventType eventType, Result<EventType> result)
        {
            //TODO: cambiar "EventIdExist"
            var ev = account.eventTypes.FirstOrDefault(s => s.idEvent == eventType.idEvent);
            if (ev == null)
            {
                var evByName = account.eventTypes.FirstOrDefault(s => s.name.ToUpperInvariant().Equals(eventType.name.ToUpperInvariant()));
                if (evByName != null)
                {
                    TraceError(result.errors, new CalendarDomainException($"Error, exist other eventType with same name {eventType.name}, review it"), "AC43");
                }
                else
                {
                    var listEvents = account.eventTypes.ToList();

                    listEvents.Add(eventType);
                    account.eventTypes = listEvents.ToArray();
                    TraceInfo(result.infos, $"insert new eventType {eventType.idEvent}-{eventType.name}", "AC43");
                }
            }
            else
            {
                TraceError(result.errors, new CalendarDomainException($"Error, eventType id exist, review {eventType.idEvent}  or correct account"), "AC43");
            }
        }

        private void UpdateEventType(AccountEventTypes account, EventType eventType, Result<EventType> result)
        {
            //TODO: quitar EventIdUnknow
            var ev = account.eventTypes.FirstOrDefault(s => s.idEvent == eventType.idEvent);
            if (ev == null)
            {
                TraceError(result.errors, new CalendarDomainException($"Error, eventType id don´t exist, review {eventType.idEvent}  or correct account"), "AC43");
            }
            else
            {
                ev.name = eventType.name;
                ev.color = eventType.color;

                if (ev.name.ToUpperInvariant() == eventType.name?.ToUpperInvariant())
                    TraceInfo(result.infos, $"Same name, modify eventType {ev.idEvent} -> {ev.name} with new color", "AC43");
                else
                    TraceInfo(result.infos, $"Modify eventType {ev.idEvent} -> {ev.name} with {ev.color}", "AC43");
            }
        }

        public async Task<Result<bool>> RemoveAccountEventType(string email)
        {
            var result = new Result<bool>();
            try
            {
                var resultRemove = await _context.AccountEvents.DeleteOneAsync(GetFilterAccountEvents(email));
                result.data = resultRemove.IsAcknowledged && resultRemove.DeletedCount > 0;
                if (result.data)
                {
                    TraceInfo(result.infos, $"Se ha eliminado correctamente a {email}", "AC44");
                }
            }
            catch (Exception ex)
            {
                TraceError(result.errors, new CalendarDomainException($"Error when remove eventType of {email}", ex), "AC44");
            }
            return result;
        }

        #endregion EventTypes
    }
}