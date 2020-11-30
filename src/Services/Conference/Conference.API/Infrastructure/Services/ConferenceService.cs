﻿using Lefebvre.eLefebvreOnContainers.Services.Conference.API.Infrastructure.Exceptions;
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
using System.Text;
using System.Threading.Tasks;
using System.Xml.Linq;

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

        public async Task<Result<UserConference>> GetUserAsync(string idNavisionUser, short idApp)
            => await _repo.GetUserAsync(idNavisionUser, idApp);

        public async Task<Result<UserConference>> PostUserAsync(UserConference user)
            => await _repo.PostUserAsync(user);

        public async Task<Result<List<ConferenceSimple>>> GetConferencesAsync(string idNavisionUser, short idApp)
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

        public async Task<Result<ConferenceModel>> CreateConferenceAsync(string idNavision, short idApp, ConferenceModel conference)
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
            var json = parameters == null ? "{}" : JsonConvert.SerializeObject(parameters);
            data = new StringContent(json, Encoding.UTF8, "application/json");
        }

        public async Task<Result<ConferenceModel>> GetConferenceByIdAsync(string idNavision, short idApp, string id)
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

        public async Task<Result<ConferenceStats>> GetStatsConferenceByIdAsync(string idNavision, short idApp, string id)
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
            return reservationCreated;
        }

        public async Task<Result<UserConference>> CreateRoomAsync(string idNavision, string name, string pass, short idApp)
        {
            var rid = GetJitsiRid(10);  //1766853816;
            var wait = "90";
            var lang = "es";
            var result = new Result<UserConference>(new UserConference());

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
                var bodyXml = $"<body content='text/xml; charset=utf-8' hold='1' rid='{rid}' to='meet.jitsi' ver='1.6' wait='{wait}' xml:lang='{lang}' xmlns='http://jabber.org/protocol/httpbind' xmlns:xmpp='urn:xmpp:xbosh' xmpp:version='1.0' />";

                var xmlContent = new StringContent(bodyXml, Encoding.UTF8, "application/xml");
                using (var response = await _clientJitsi.PostAsync(url, xmlContent))
                {
                    if (response.IsSuccessStatusCode)
                    {
                        var rawResult = await response.Content.ReadAsStringAsync();
                        var room = new Room
                        {
                            id = rid,
                            url = $"{_settings.Value.JitsiRoomUrl}/{name}",
                            name = name
                        };

                        XDocument xd = XDocument.Parse(rawResult);
                        foreach (XElement element in xd.Elements())
                        {
                            room.guidJitsi = element.Attribute("authid")?.Value;
                        }

                        var userResult = await _repo.UpsertRoomAsync(idNavision, idApp, room);
                        AddResultTrace(userResult, result);

                        if (!string.IsNullOrEmpty(room.guidJitsi))
                        {
                            TraceInfo(result.infos, $"se Obtiene un guid de Jitsi {room.guidJitsi} que se guarda en el usuario {idNavision}", Codes.Conferences.RoomCreate);
                            result.data = userResult.data;
                            AddResultTrace(userResult, result);
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

        public Task<Result<UserRoom>> NotifyRoomAsync(string idNavision, string name, short idApp)
        {
            throw new NotImplementedException();
        }

        public async Task<Result<UserRoom>> SecureRoomAsync(string idNavision, string idRoom, string pass, short idApp)
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
            var result = new Result<UserRoom>();

            try
            {
                var userRoom = new UserRoom { idNavision = idNavision };

                var userResult = await GetUserAsync(idNavision, idApp);

                var rooms = userResult.data.rooms?.ToList();
                var roomFind = rooms?.FirstOrDefault(x => x.id == idRoom);
                if (roomFind == null)
                {
                    TraceInfo(result.infos, $"No hay room que securizar {idRoom} del usuario {idNavision}", Codes.Conferences.RoomSecure);
                    return result;
                }

                if (roomFind.pass != null)
                {
                    TraceInfo(result.infos, $"Ya se ha securizado la room {idRoom} del usuario {idNavision}", Codes.Conferences.RoomSecure);
                    return result;
                }

                TraceInfo(userResult.infos, $"Se intenta securizar la room {idRoom} del usuario {idNavision}", Codes.Conferences.RoomSecure);

                var url = $"{_settings.Value.JitsiRoomUrl}/http-bind?room={roomFind.name}";

                var bodyBegin = $"<body rid='{roomFind.id}' sid='{roomFind.guidJitsi}' xmlns='http://jabber.org/protocol/httpbind'>";
                var end = "</body>";
                var someXmlString = $"{bodyBegin}{GetIqPass(pass)}{end}";

                var xmlContent = new StringContent(someXmlString, Encoding.UTF8, "application/xml");
                using (var response = await _clientJitsi.PostAsync(url, xmlContent))
                {
                    if (response.IsSuccessStatusCode)
                    {
                        var rawResult = await response.Content.ReadAsStringAsync();

                        if (!string.IsNullOrEmpty(rawResult))
                        {
                            TraceInfo(result.infos, rawResult, Codes.Conferences.RoomCreate);
                        }
                        else
                        {
                            TraceError(result.errors,
                                       new ConferenceDomainException($"Probably error in jitsi when create room  {_settings.Value.JitsiRoomUrl} : response:[{rawResult}]-> {(int)response.StatusCode} - {response.ReasonPhrase}"),
                                       Codes.Conferences.RoomSecure,
                                       Codes.Areas.Jitsi);
                        }
                    }
                    else
                        TraceError(result.errors,
                                   new ConferenceDomainException($"Probably error in jitsi when create room  {_settings.Value.JitsiRoomUrl} -> {(int)response.StatusCode} - {response.ReasonPhrase}"),
                                   Codes.Conferences.RoomSecure,
                                   Codes.Areas.Jitsi);
                }
            }
            catch (Exception ex)
            {
                TraceError(result.errors, 
                           new ConferenceDomainException($"Error when call external service of Jitsi {_settings.Value.JitsiRoomUrl}", ex),
                           Codes.Conferences.RoomSecure,
                           Codes.Areas.Jitsi);
            }

            return result;
        }

        private string GetIqPass(string pass)
        {
            var newGuid = Guid.NewGuid();

            var queryBegin = $"<iq id='{newGuid}:sendIQ' to='916359@muc.meet.jitsi' type='set' xmlns='jabber:client'>" +
                 $"<query xmlns='http://jabber.org/protocol/muc#owner'>" +
                 $"<x type='submit' xmlns='jabber:x:data'>";
            var fieldType = "<field var='FORM_TYPE'><value>http://jabber.org/protocol/muc#roomconfig</value></field>";
            var fieldSecret = $"<field var='muc#roomconfig_roomsecret'><value>{pass}</value></field>";
            var fieldWho = "<field var='muc#roomconfig_whois'><value>anyone</value></field>";
            var queryEnd = $"</x></query></iq>";

            return $"{queryBegin}{fieldType}{fieldSecret}{fieldWho}{queryEnd}";
        }
    }
}