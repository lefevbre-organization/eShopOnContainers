using Lefebvre.eLefebvreOnContainers.Services.Conference.API.Infrastructure.Exceptions;
using Lefebvre.eLefebvreOnContainers.Services.Conference.API.Infrastructure.Repositories;
using Lefebvre.eLefebvreOnContainers.Services.Conference.API.Models;
using Microsoft.eShopOnContainers.BuildingBlocks.EventBus.Abstractions;
using Microsoft.eShopOnContainers.BuildingBlocks.Lefebvre.Models;
using Microsoft.Extensions.Logging;
using Microsoft.Extensions.Options;
using Newtonsoft.Json;
using System;
using System.Collections.Generic;
using System.Linq;
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

        public async Task<Result<ConferenceModel>> CreateConferenceAsync(string idNavision, int idApp, ConferenceModel conference)
        {
            var result = new Result<ConferenceModel>(new ConferenceModel());
            try
            {
                var path = $"/colibri/conferences";
                SerializeObjectToPost(conference, path, out string url, out StringContent data);
                using (var response = await _clientJitsi.PostAsync(url, data))
                {
                    if (response.IsSuccessStatusCode)
                    {
                        var rawResult = await response.Content.ReadAsStringAsync();

                        if (!string.IsNullOrEmpty(rawResult))
                        {
                            var resultado = (JsonConvert.DeserializeObject<ConferenceModel>(rawResult));
                            result.data = resultado;
                        }

                    }
                    else
                        TraceError(result.errors, new ConferenceDomainException($"Probably error in jitsi when create conference -> {(int)response.StatusCode} - {response.ReasonPhrase}"), Codes.Conferences.Create, "JITSISVC");
                }
            }
            catch (Exception ex)
            {
                TraceError(result.errors, new ConferenceDomainException($"Error when call internal service of Jitsi", ex), Codes.Conferences.Create, "JITSISVC");
            }
            return result;
        }

        private void SerializeObjectToPost(object parameters, string path, out string url, out StringContent data)
        {
            url = $"{_settings.Value.JitsiUrl}{path}";
            TraceLog(parameters: new string[] { $"url={url}" });
            var json = parameters == null ? "{}": JsonConvert.SerializeObject(parameters);
            data = new StringContent(json, Encoding.UTF8, "application/json");
        }

        public async Task<Result<ConferenceModel>> GetConferenceByIdAsync(string idNavision, int idApp, string id)
        {
            var result = new Result<ConferenceModel>(new ConferenceModel());
            try
            {
                var url = $"{_settings.Value.JitsiUrl}/colibri/conferences/{id}";

                using (var response = await _clientJitsi.GetAsync(url))
                {
                    if (response.IsSuccessStatusCode)
                    {
                        var rawResult = await response.Content.ReadAsStringAsync();

                        if (!string.IsNullOrEmpty(rawResult))
                        {
                            var resultado = (JsonConvert.DeserializeObject<ConferenceModel>(rawResult));
                            result.data = resultado;
                        }
                    }
                    else
                    {
                        TraceError(result.errors, new ConferenceDomainException($"Error when get data of conference ({url}) with code-> {(int)response.StatusCode} - {response.ReasonPhrase}"), Codes.Conferences.Get, "JITSISVC");
                    }
                }
            }
            catch (Exception ex)
            {
                TraceError(result.errors, new ConferenceDomainException($"Error when get data of conference: {id} in {_settings.Value.JitsiUrl}", ex), Codes.Conferences.Get, "JITSISVC");
            }

            return result;
        }

        public async Task<Result<ConferenceStats>> GetStatsConferenceByIdAsync(string idNavision, int idApp, string id)
        {
            var result = new Result<ConferenceStats>(new ConferenceStats());
            try
            {
                var url = $"{_settings.Value.JitsiUrl}/colibri/stats";

                using (var response = await _clientJitsi.GetAsync(url))
                {
                    if (response.IsSuccessStatusCode)
                    {
                        var rawResult = await response.Content.ReadAsStringAsync();

                        if (!string.IsNullOrEmpty(rawResult))
                        {
                            var resultado = (JsonConvert.DeserializeObject<ConferenceStats>(rawResult));
                            result.data = resultado;
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

        public async Task<Result<UserRoom>> CreateRoomAsync(string idNavision, string name, int idApplication)
        {
            var rid = GetJitsiRid(10); //DateTime.Now.Ticks;
            //rid = 1766853816;
            var wait = "60";
            var lang = "en";
            var result = new Result<UserRoom>(new UserRoom() { url = $"{_settings.Value.JitsiRoomUrl}/{name}"});


            // request payload : 
            // <body content="text/xml; charset=utf-8" hold="1" rid="1766853815" to="meet.jitsi" ver="1.6" wait="60" xml:lang="en" xmlns="http://jabber.org/protocol/httpbind" xmlns:xmpp="urn:xmpp:xbosh" xmpp:version="1.0"/>
            // <body rid="1766853816" sid="965edbb6-d5f4-47ac-81be-8676582e7f58" xmlns="http://jabber.org/protocol/httpbind"><auth mechanism="ANONYMOUS" xmlns="urn:ietf:params:xml:ns:xmpp-sasl"/></body>
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


            try
            {
                var url = $"{_settings.Value.JitsiRoomUrl}/http-bind?room={name}";

                var someXmlString = $"<body content='text/xml; charset=utf-8' hold='1' rid='{rid}' to='meet.jitsi' ver='1.6' wait='{wait}' xml:lang='{lang}' xmlns='http://jabber.org/protocol/httpbind' xmlns:xmpp='urn:xmpp:xbosh' xmpp:version='1.0'/>";
                var xmlContent = new StringContent(someXmlString, Encoding.UTF8, "application/xml");
                using (var response = await _clientJitsi.PostAsync(url, xmlContent))
                {
                    if (response.IsSuccessStatusCode)
                    {
                        var rawResult = await response.Content.ReadAsStringAsync();

                        if (!string.IsNullOrEmpty(rawResult))
                        {
                            TraceInfo(result.infos, rawResult, Codes.Conferences.RoomCreate);
                            result.data.idApp = idApplication.ToString();
                            result.data.idNavision = idNavision;
                        }
                        else
                        {
                            TraceError(result.errors,
                                       new ConferenceDomainException($"Probably error in jitsi when create room  {_settings.Value.JitsiRoomUrl} : response:[{rawResult}]-> {(int)response.StatusCode} - {response.ReasonPhrase}"),
                                       Codes.Conferences.RoomCreate,
                                       "JITSISVC");

                        }

                    }
                    else
                        TraceError(result.errors,
                                   new ConferenceDomainException($"Probably error in jitsi when create room  {_settings.Value.JitsiRoomUrl} -> {(int)response.StatusCode} - {response.ReasonPhrase}"),
                                   Codes.Conferences.RoomCreate,
                                   "JITSISVC");
                }
            }
            catch (Exception ex)
            {
                TraceError(result.errors,
                           new ConferenceDomainException($"Error when call external service of Jitsi {_settings.Value.JitsiRoomUrl}", ex),
                           Codes.Conferences.RoomCreate,
                           "JITSISVC");
            }
            return result;
        }

        private string GetJitsiRid(int length)
        {
            var random = new Random();
            const string chars = "123456789";
            return new string(Enumerable.Repeat(chars, length).Select(s => s[random.Next(s.Length)]).ToArray());
        }




        public Task<Result<UserRoom>> NotifyRoomAsync(string idNavision, string name, int idApp)
        {
            throw new NotImplementedException();
        }

        public async Task<Result<UserRoom>> SecureRoomAsync(string idNavision, string name, string pass, int idApp)
        {
            // <body rid="1160796438" sid="50f79c79-a5a8-4b76-ab5b-c66b4951c606" xmlns="http://jabber.org/protocol/httpbind">
            //    <iq id="545a108f-e898-4cb9-b3cd-0742ead0734a:sendIQ" to="916359@muc.meet.jitsi" type="set" xmlns="jabber:client">
            //        <query xmlns="http://jabber.org/protocol/muc#owner">
            //            <x type="submit" xmlns="jabber:x:data">
            //                <field var="FORM_TYPE">
            //                    <value>http://jabber.org/protocol/muc#roomconfig</value>
            //                </field>
            //                <field var="muc#roomconfig_roomsecret">
            //                    <value>123456</value>
            //                </field>
            //                <field var="muc#roomconfig_whois">
            //                    <value>anyone</value>
            //                </field>
            //            </x>
            //        </query>
            //    </iq>
            //</body>

            var result = new Result<UserRoom>(new UserRoom() { url = $"{_settings.Value.JitsiRoomUrl}/{name}" });
            var rid = "1160796438";
            var guid = "50f79c79-a5a8-4b76-ab5b-c66b4951c606";
            var newGuid = Guid.NewGuid(); //545a108f-e898-4cb9-b3cd-0742ead0734a
            try
            {
                var url = $"{_settings.Value.JitsiRoomUrl}/http-bind?room={name}";

                var bodyBegin = $"<body rid='{rid}' sid='{guid}' xmlns='http://jabber.org/protocol/httpbind'>";
                var queryBegin = $"<iq id='{newGuid}:sendIQ' to='916359@muc.meet.jitsi' type='set' xmlns='jabber:client'>" +
                                 $"<query xmlns='http://jabber.org/protocol/muc#owner'>" +
                                 $"<x type='submit' xmlns='jabber:x:data'>";
                var fieldType = "<field var='FORM_TYPE'><value>http://jabber.org/protocol/muc#roomconfig</value></field>";
                var fieldSecret = $"<field var='muc#roomconfig_roomsecret'><value>{pass}</value></field>";
                var fieldWho = "<field var='muc#roomconfig_whois'><value>anyone</value></field>";

                var end = $"</x></query></iq></body>";

                var someXmlString = $"{bodyBegin}{queryBegin}{fieldType}{fieldSecret}{fieldWho}{end}";
                var xmlContent = new StringContent(someXmlString, Encoding.UTF8, "application/xml");
                using (var response = await _clientJitsi.PostAsync(url, xmlContent))
                {
                    if (response.IsSuccessStatusCode)
                    {
                        var rawResult = await response.Content.ReadAsStringAsync();

                        if (!string.IsNullOrEmpty(rawResult))
                        {
                            TraceInfo(result.infos, rawResult, Codes.Conferences.RoomCreate);
                            result.data.idApp = idApp.ToString();
                            result.data.idNavision = idNavision;
                        }
                        else
                        {
                            TraceError(result.errors,
                                       new ConferenceDomainException($"Probably error in jitsi when create room  {_settings.Value.JitsiRoomUrl} : response:[{rawResult}]-> {(int)response.StatusCode} - {response.ReasonPhrase}"),
                                       Codes.Conferences.RoomCreate,
                                       "JITSISVC");

                        }

                    }
                    else
                        TraceError(result.errors,
                                   new ConferenceDomainException($"Probably error in jitsi when create room  {_settings.Value.JitsiRoomUrl} -> {(int)response.StatusCode} - {response.ReasonPhrase}"),
                                   Codes.Conferences.RoomCreate,
                                   "JITSISVC");
                }
            }
            catch (Exception ex)
            {
                TraceError(result.errors,
                           new ConferenceDomainException($"Error when call external service of Jitsi {_settings.Value.JitsiRoomUrl}", ex),
                           Codes.Conferences.RoomCreate,
                           "JITSISVC");
            }
            return result;
        }
    }
}