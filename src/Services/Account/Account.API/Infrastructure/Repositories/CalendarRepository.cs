namespace Lefebvre.eLefebvreOnContainers.Services.Account.API.Infrastructure.Repositories
{
    #region using

    using IntegrationEvents.Events;
    using Lefebvre.eLefebvreOnContainers.Services.Account.API.Infrastructure.Exceptions;
    using Lefebvre.eLefebvreOnContainers.Services.Account.API.Model;
    using Microsoft.eShopOnContainers.BuildingBlocks.EventBus.Abstractions;
    using Microsoft.eShopOnContainers.BuildingBlocks.Lefebvre.Models;
    using Microsoft.Extensions.Configuration;
    using Microsoft.Extensions.Logging;
    using Microsoft.Extensions.Options;
    using MongoDB.Bson;
    using MongoDB.Driver;
    using System;
    using System.Collections.Generic;
    using System.Linq;
    using System.Threading.Tasks;

    #endregion using

    public class CalendarRepository : AccountsBaseClass<CalendarRepository>, ICalendarRepository
    {
        private readonly AccountContext _context;
        private readonly IEventBus _eventBus;

        public CalendarRepository(
            IOptions<AccountSettings> settings,
            IEventBus eventBus,
            ILogger<CalendarRepository> logger,
            IConfiguration configuration) : base(logger)
        {
            _context = new AccountContext(settings, eventBus, configuration);
            _eventBus = eventBus;
        }


        public async Task<Result<CalendarUser>> GetCalendarUser(string idNavision, string idNextCloud)
        {
            var result = new Result<CalendarUser>();
            try
            {
                result.data = await _context.CalendarUsers.Find(GetFilterCalendarUser(idNavision, idNextCloud)).FirstOrDefaultAsync();

                if (result.data == null)
                    TraceInfo(result.infos, $"No se encuentra ningún calendario para esa cuenta {idNavision}", Codes.Calendar.CalGet);
                else
                {
                    var orderEvents = result.data?.calendars.OrderByDescending(x => x.titulo).ToList();
                    if (orderEvents != null)
                        result.data.calendars = orderEvents.ToArray();
                }
            }
            catch (Exception ex)
            {
                TraceError(result.errors,
                           new AccountDomainException($"Error when get calendars of {idNavision}", ex),
                           Codes.Calendar.CalGet,
                           Codes.Areas.Mongo);
            }
            return result;
        }


        public async Task<Result<CalendarUser>> UpsertCalendarUser(CalendarUser calendar)
        {
            var result = new Result<CalendarUser>();
            ReviewCalendarUser(calendar);

            try
            {
                var resultReplace = await _context.CalendarUsers.ReplaceOneAsync(GetFilterCalendarUser(calendar.idNavision, calendar.idNextCloud), calendar, GetUpsertOptions());

                calendar.Id = ManageUpsert<CalendarUser>($"Don´t insert or modify the user {calendar.idNavision}",
                    $"Se modifica la cuenta {calendar.idNavision}",
                    $"Se inserta la cuenta {calendar.idNavision} con {resultReplace.UpsertedId}",
                     result, resultReplace, Codes.Calendar.CalUpsert);

                result.data = calendar;
            }
            catch (Exception ex)
            {
                TraceError(result.errors,
                           new AccountDomainException($"Error when upsert celendar of {calendar.idNavision}", ex),
                           Codes.Calendar.CalUpsert,
                           Codes.Areas.Mongo);
            }
            return result;
        }

        public async Task<Result<bool>> RemoveCalendarUser(string idNavision)
        {
            var result = new Result<bool>();
            try
            {
                var resultRemove = await _context.CalendarUsers.DeleteOneAsync(GetFilterCalendarUser(idNavision, null));
                result.data = resultRemove.IsAcknowledged && resultRemove.DeletedCount > 0;
                if (result.data)
                {
                    TraceInfo(result.infos, $"Se ha eliminado correctamente a {idNavision}", Codes.Calendar.CalAccountRemove);
                }
            }
            catch (Exception ex)
            {
                TraceError(result.errors,
                           new AccountDomainException($"Error when remove calndar of {idNavision}", ex),
                           Codes.Calendar.CalAccountRemove,
                           Codes.Areas.Mongo);
            }
            return result;
        }

        public async Task<Result<bool>> RemoveCalendar(string idNavision, string idNextCloud, string idCalendar)
        {
            var result = new Result<bool>();
            var resultAccount = new Result<CalendarUser>();
            var options = new FindOneAndUpdateOptions<CalendarUser> { ReturnDocument = ReturnDocument.After };
            try
            {
                var update = Builders<CalendarUser>.Update.PullFilter(
                    p => p.calendars,
                    f => f.idCalendar.Equals(idCalendar.ToLowerInvariant())
                    );

                var userUpdate = await _context.CalendarUsers.FindOneAndUpdateAsync<CalendarUser>(
                    GetFilterCalendarUser(idNavision, idNextCloud),
                    update, options);

                if (userUpdate != null)
                {
                    TraceInfo(result.infos, $"Se ha removido el calendario {idCalendar} de la cuenta {idNavision}", Codes.Calendar.CalRemove);
                    resultAccount.data = userUpdate;
                    result.data = true;
                }
                else
                {
                    TraceInfo(result.infos, $"No se encuentra la cuenta {idNavision} para remover el calendario {idCalendar}", Codes.Calendar.CalRemove);
                }
            }
            catch (Exception ex)
            {
                TraceError(result.errors,
                           new AccountDomainException($"Error when remove calendars of {idNavision}", ex),
                           Codes.Calendar.CalRemove,
                           Codes.Areas.Mongo);
            }

            return result;
        }

        public async Task<Result<Calendar>> AddCalendar(string idNavision, string idNextCloud, Calendar calendar)
        {
            var resultBoolean = new Result<bool>();
            var result = new Result<Calendar>();
            var IdEventDontExistImNew = calendar.idCalendar == null;
            ReviewCalendar(calendar);

            try
            {
                var account = await _context.CalendarUsers.FindAsync(c => c.idNavision.Equals(idNavision.ToUpperInvariant())).Result.FirstOrDefaultAsync();

                if (account == null)
                {
                    var arrayEvents = new List<Calendar> { calendar };

                    var resultInsertAccountEvent = await UpsertCalendarUser(new CalendarUser() { idNavision = idNavision, idNextCloud = idNextCloud, calendars = arrayEvents.ToArray() });
                    account = resultInsertAccountEvent.data;
                }
                else
                {
                    if (IdEventDontExistImNew)
                        InsertCalendar(account, calendar, result);
                    else
                        UpdateCalendar(account, calendar, result);

                    await _context.CalendarUsers.ReplaceOneAsync(c => c.Id == account.Id, account);
                }

                result.data = calendar;
            }
            catch (Exception ex)
            {
                TraceError(result.errors,
                           new AccountDomainException($"Error when add calendars of {idNavision}", ex),
                           Codes.Calendar.CalAdd,
                           Codes.Areas.Mongo);
            }

            return result;
        }



        private void InsertCalendar(CalendarUser calendarUser, Calendar calendar, Result<Calendar> result)
        {
            //TODO: cambiar "EventIdExist" 
            var ev = calendarUser.calendars.FirstOrDefault(s => s.idCalendar == calendar.idCalendar);
            if (ev == null)
            {
                var evByName = calendarUser.calendars.FirstOrDefault(s => s.titulo.ToUpperInvariant().Equals(calendar.titulo.ToUpperInvariant()));
                if (evByName != null)
                {
                    TraceError(result.errors,
                               new AccountDomainException($"Error, exist other calendar  with same name {calendar.titulo}, review it"),
                               Codes.Calendar.CalAdd,
                               Codes.Areas.Mongo);
                }
                else
                {
                    var listEvents = calendarUser.calendars.ToList();

                    listEvents.Add(calendar);
                    calendarUser.calendars = listEvents.ToArray();
                    TraceInfo(result.infos, $"insert new calendar {calendar.idCalendar}-{calendar.titulo}", Codes.Calendar.CalAdd);
                }
            }
            else
            {
                TraceError(result.errors,
                           new AccountDomainException($"Error, calendar id exist, review {calendar.idCalendar}  or correct account"),
                           Codes.Calendar.CalAdd,
                           Codes.Areas.Mongo);
            }
        }

        private void UpdateCalendar(CalendarUser calendarUser, Calendar calendar, Result<Calendar> result)
        {
            //TODO: quitar EventIdUnknow
            var ev = calendarUser.calendars.FirstOrDefault(s => s.idCalendar == calendar.idCalendar);
            if (ev == null)
            {
                TraceError(result.errors, new AccountDomainException($"Error, calendar id don´t exist, review {calendar.idCalendar}  or correct account"), Codes.Calendar.CalAdd);
            }
            else
            {
                ev.titulo = calendar.titulo;
                ev.descripcion = calendar.descripcion;
                ev.color = calendar.color;

                if (ev.titulo.ToUpperInvariant() == calendar.titulo?.ToUpperInvariant())
                    TraceInfo(result.infos, $"Same titulo, modify calendar {ev.idCalendar} -> {ev.titulo} with new color", Codes.Calendar.CalAdd);
                else
                    TraceInfo(result.infos, $"Modify calendar {ev.idCalendar} -> {ev.titulo} with {ev.color}", Codes.Calendar.CalAdd);
            }
        }



        private void ReviewCalendarUser(CalendarUser calendarUser)
        {
            calendarUser.idNavision = calendarUser.idNavision.ToUpperInvariant();
            calendarUser.idNextCloud = calendarUser.idNextCloud.ToUpperInvariant();

            var calendarList = calendarUser.calendars.ToList();

            if (calendarList.Count > 0)
            {
                foreach (var ev in calendarList)
                {
                    ReviewCalendar(ev);
                }
            }
        }

        private static void ReviewCalendar(Calendar eve)
        {
            if (string.IsNullOrEmpty(eve.idCalendar))
                eve.idCalendar = Guid.NewGuid().ToString();
            eve.titulo = eve.titulo.Trim();
            eve.descripcion = eve.descripcion.Trim();
            eve.color = eve.color.Trim();
        }


        private static FilterDefinition<CalendarUser> GetFilterCalendarUser(string idNavision, string idNextCloud)
        {
            return Builders<CalendarUser>.Filter.Or(
                Builders<CalendarUser>.Filter.Eq(u => u.idNavision, idNavision.ToUpperInvariant()),
                Builders<CalendarUser>.Filter.Eq(u => u.idNextCloud, idNextCloud?.ToUpperInvariant())
                );
        }

    }
}