using Lefebvre.eLefebvreOnContainers.Services.Conference.API.Infrastructure.Repositories;
using Lefebvre.eLefebvreOnContainers.Services.Conference.API.Models;
using Microsoft.eShopOnContainers.BuildingBlocks.EventBus.Abstractions;
using Microsoft.eShopOnContainers.BuildingBlocks.Lefebvre.Models;
using Microsoft.Extensions.Logging;
using Microsoft.Extensions.Options;
using Newtonsoft.Json;
using System;
using System.Collections.Generic;
using System.Net.Http;
using System.Net.Http.Headers;
using System.Text;
using System.Threading.Tasks;

namespace Lefebvre.eLefebvreOnContainers.Services.Conference.API.Infrastructure.Services
{
    public class ConferenceService : BaseClass<ConferenceService>, IConferenceService
    {
        public readonly IConferenceRepository _repo;
        private readonly IEventBus _eventBus;
        private readonly IHttpClientFactory _clientFactory;
        private readonly HttpClient _clientJitsi;
        private readonly HttpClient _clientUserUtils;
        private readonly IOptions<ConferenceSettings> _settings;

        public ConferenceService(
                IOptions<ConferenceSettings> settings
                , IConferenceRepository databaseRepository
                , IEventBus eventBus
                , IHttpClientFactory clientFactory
                , ILogger<ConferenceService> logger
            ) : base(logger)
        {
            _settings = settings ?? throw new ArgumentNullException(nameof(settings));
            _repo = databaseRepository ?? throw new ArgumentNullException(nameof(databaseRepository));
            _eventBus = eventBus ?? throw new ArgumentNullException(nameof(eventBus));

            _clientFactory = clientFactory ?? throw new ArgumentNullException(nameof(clientFactory));

            _clientJitsi = _clientFactory.CreateClient();
            _clientJitsi.BaseAddress = new Uri(_settings.Value.JitsiUrl);
            _clientJitsi.DefaultRequestHeaders.Add("Accept", "application/json");
            //_clientJitsi.DefaultRequestHeaders.Add("Content-Type", "application/json");

            _clientUserUtils = _clientFactory.CreateClient();
            _clientUserUtils.BaseAddress = new Uri(_settings.Value.UserUtilsUrl);
            _clientUserUtils.DefaultRequestHeaders.Add("Accept", "text/plain");
        }


        public async Task<Result<UserConference>> GetUserAsync(string idNavisionUser, int idApp)
        {
            var result = new Result<UserConference>(new UserConference());
            return result;
        }

        public async Task<Result<UserConference>> PostUserAsync(UserConference user)
        {
            var result = new Result<UserConference>(new UserConference());
            return result;
        }

                public async Task<Result<List<ConferenceSimple>>> GetConferencesAsync(string idNavisionUser, int idApp)
        {
            var result = new Result<List<ConferenceSimple>>(new List<ConferenceSimple>());

            try
            {
                var url = $"{_settings.Value.JitsiUrl}/colibri/conferences";

                using (var response = await _clientJitsi.GetAsync(url))
                {
                    if (response.IsSuccessStatusCode)
                    {
                        var rawResult = await response.Content.ReadAsStringAsync();

                        if (!string.IsNullOrEmpty(rawResult))
                        {
                            var resultado = (JsonConvert.DeserializeObject<ConferenceSimple[]>(rawResult));
                            result.data = resultado.ToList();
                        }
                    }
                    else
                    {
                        TraceError(result.errors, new ConferenceDomainException($"Error when get list of conferences ({url}) with code-> {(int)response.StatusCode} - {response.ReasonPhrase}"), Codes.Conferences.Get, "JITSISVC");
                    }
                }
            }
            catch (Exception ex)
            {
                TraceError(result.errors, new ConferenceDomainException($"Error when get data of conferences {_settings.Value.JitsiUrl}", ex), Codes.Conferences.Get, "JITSISVC");
            }

            return result;
        }
        public async Task<Result<List<ConferenceSimple>>> GetConferencesAsync(string idNavisionUser, int idApp)
        {
            var result = new Result<List<ConferenceSimple>>(new List<ConferenceSimple>());
            return result;
        }

        public async Task<Result<ConferenceModel>> CreateConferenceAsync(string idNavision, int idApp, ConferenceModel conference)
        {
            var result = new Result<ConferenceModel>(new ConferenceModel());
            return result;
        }

        public async Task<Result<ConferenceModel>> GetConferenceByIdAsync(string idNavision, int idApp, string id)
        {
            var result = new Result<ConferenceModel>(new ConferenceModel());
            return result;
        }

        public async Task<Result<ConferenceStats>> GetStatsConferenceByIdAsync(string idNavision, int idApp, string id)
        {
            var result = new Result<ConferenceStats>(new ConferenceStats());
            return result;
        }

        public async Task<UserReservation> CreateReservationAsync(UserReservationRequest reservation)
        {
            var reservationCreated = new UserReservation();
            reservationCreated.id = DateTime.Now.Ticks;
            reservationCreated.name = reservation.name;
            reservationCreated.start_time = reservation.start_time;
            reservationCreated.mail_owner = reservation.mail_owner;
            reservationCreated.duration = 900000;
            //var result = new Result<UserReservation>(reservationCreated);
            return reservationCreated ;
        }

        public async Task<Result<UserRoom>> CreateRoomAsync(string idNavision, string name, int idApp)
        {
            var url = @"https://meet-test.lefebvre.es/http-bind?room={name}";
            //client https://meet-test.lefebvre.es/http-bind?room=testlefebvre
            // request payload : 
            // <body content="text/xml; charset=utf-8" hold="1" rid="2774357881" to="meet.jitsi" ver="1.6" wait="60" xml:lang="en" xmlns="http://jabber.org/protocol/httpbind" xmlns:xmpp="urn:xmpp:xbosh" xmpp:version="1.0"/>
            // response :
            // <body authid='8ff9d004-78a4-41c0-b561-a8c82768d2e1' inactivity='60' hold='1' polling='5' xmlns:stream='http://etherx.jabber.org/streams' xmpp:version='1.0' wait='60' sid='8ff9d004-78a4-41c0-b561-a8c82768d2e1' ver='1.6' from='meet.jitsi' secure='true' xmlns:xmpp='urn:xmpp:xbosh' xmlns='http://jabber.org/protocol/httpbind' requests='2'>
            //<stream:features xmlns='jabber:client'>
            //  <mechanisms xmlns='urn:ietf:params:xml:ns:xmpp-sasl'>
            //    <mechanism>ANONYMOUS</mechanism>
            //  </mechanisms>
            //  <starttls xmlns='urn:ietf:params:xml:ns:xmpp-tls'/>
            //</stream:features>
            //</body>

            var httpClient = new HttpClient();
            var someXmlString = "<body content='text/xml; charset=utf-8' hold='1' rid='2774357881' to='meet.jitsi' ver='1.6' wait='60' xml:lang='en' xmlns='http://jabber.org/protocol/httpbind' xmlns:xmpp='urn:xmpp:xbosh' xmpp:version='1.0'/>";
            var stringContent = new StringContent(someXmlString, Encoding.UTF8, "application/xml");
            var respone = await httpClient.PostAsync(url, stringContent);
            throw new NotImplementedException();
        }
    }
}