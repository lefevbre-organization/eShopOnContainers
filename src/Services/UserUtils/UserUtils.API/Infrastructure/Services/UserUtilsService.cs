using Lefebvre.eLefebvreOnContainers.Services.UserUtils.API.Infrastructure.Exceptions;
using Lefebvre.eLefebvreOnContainers.Services.UserUtils.API.Infrastructure.Repositories;
using Lefebvre.eLefebvreOnContainers.Services.UserUtils.API.Models;
using Microsoft.eShopOnContainers.BuildingBlocks.EventBus.Abstractions;
using Microsoft.eShopOnContainers.BuildingBlocks.Lefebvre.Models;
using Microsoft.Extensions.Logging;
using Microsoft.Extensions.Options;
using Microsoft.IdentityModel.Tokens;
using Newtonsoft.Json;
using System;
using System.Collections.Generic;
using System.IdentityModel.Tokens.Jwt;
using System.Linq;
using System.Net.Http;
using System.Net.Http.Headers;
using System.Security.Claims;
using System.Text;
using System.Threading.Tasks;
using System.Web;

namespace Lefebvre.eLefebvreOnContainers.Services.UserUtils.API.Infrastructure.Services
{
    public class UserUtilsService : BaseClass<UserUtilsService>, IUserUtilsService
    {
        public readonly IUserUtilsRepository _repository;
        private readonly IEventBus _eventBus;
        private readonly IHttpClientFactory _clientFactory;
        private readonly HttpClient _clientMinihub;
        private readonly HttpClient _clientOnline;
        private readonly HttpClient _clientLogin;
        private readonly HttpClient _clientLexonApi;
        private readonly HttpClient _clientClaves;
        private readonly IOptions<UserUtilsSettings> _settings;
        internal readonly ILogger<UserUtilsService> _logger;

        public UserUtilsService(
                IOptions<UserUtilsSettings> settings
                , IUserUtilsRepository usersRepository
                , IEventBus eventBus
                , IHttpClientFactory clientFactory
                , ILogger<UserUtilsService> logger
            ) : base(logger)
        {
            _settings = settings ?? throw new ArgumentNullException(nameof(settings));
            _repository = usersRepository ?? throw new ArgumentNullException(nameof(usersRepository));
            _eventBus = eventBus ?? throw new ArgumentNullException(nameof(eventBus));
            _clientFactory = clientFactory ?? throw new ArgumentNullException(nameof(clientFactory));
            _logger = logger ?? throw new ArgumentNullException(nameof(logger));

            _clientMinihub = _clientFactory.CreateClient();
            _clientMinihub.BaseAddress = new Uri(_settings.Value.MinihubUrl);

            _clientLogin = _clientFactory.CreateClient();
            _clientLogin.BaseAddress = new Uri(_settings.Value.LoginUrl);
            _clientLogin.DefaultRequestHeaders.Add("Accept", "text/plain");

            var handler = new HttpClientHandler()
            {
                ServerCertificateCustomValidationCallback = HttpClientHandler.DangerousAcceptAnyServerCertificateValidator
            };
            _clientOnline = new HttpClient(handler)
            {
                BaseAddress = new Uri(_settings.Value.OnlineUrl)
            };

            var authData = Convert.ToBase64String(
                        System.Text.Encoding.ASCII.GetBytes($"{_settings.Value.OnlineLogin}:{_settings.Value.OnlinePassword}"));

            _clientOnline.DefaultRequestHeaders.Authorization = new AuthenticationHeaderValue("Basic", authData);

            _clientOnline.DefaultRequestHeaders.Add("Accept", "text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3");

            _clientLexonApi = _clientFactory.CreateClient();
            _clientLexonApi.BaseAddress = new Uri(_settings.Value.LexonApiUrl);
            _clientLexonApi.DefaultRequestHeaders.Add("Accept", "text/plain");

            _clientClaves = _clientFactory.CreateClient();
            _clientClaves.BaseAddress = new Uri(_settings.Value.ClavesUrl);
        }

        #region Generic

        public async Task<Result<string>> GetEncodeUserAsync(string idNavisionUser)
        {
            var result = new Result<string>(string.Empty);
            try
            {
                var url = $"{_settings.Value.OnlineUrl}/encriptarEntrada.do?nEntrada={idNavisionUser}";

                using (var response = await _clientOnline.GetAsync(url))
                {
                    if (response.IsSuccessStatusCode)
                    {
                        var rawResult = await response.Content.ReadAsStringAsync();

                        if (!string.IsNullOrEmpty(rawResult))
                        {
                            var resultado = (JsonConvert.DeserializeObject<OnlineEntrada>(rawResult));
                            result.data = resultado.ENTRADA_ENCRIPTADA;
                        }
                    }
                    else
                    {
                        TraceError(result.errors,
                                   new UserUtilsDomainException($"Error when get encode user ({url}) with code-> {(int)response.StatusCode} - {response.ReasonPhrase}"),
                                   Codes.UserUtils.UserEncode,
                                   Codes.Areas.Online);
                    }
                }
            }
            catch (Exception ex)
            {
                TraceError(result.errors,
                           new UserUtilsDomainException($"Error when get encode user: {idNavisionUser} in {_settings.Value.OnlineUrl}", ex),
                           Codes.UserUtils.UserEncode,
                           Codes.Areas.Online);
            }

            return result;
        }

        public async Task<Result<string>> GetDecodeUserAsync(string idEncodeNavisionUser)
        {
            var result = new Result<string>(string.Empty);
            try
            {
                var url = $"{_settings.Value.OnlineUrl}/desencriptarEntrada.do?entradaEncriptada={idEncodeNavisionUser}";

                using (var response = await _clientOnline.GetAsync(url))
                {
                    if (response.IsSuccessStatusCode)
                    {
                        var rawResult = await response.Content.ReadAsStringAsync();

                        if (!string.IsNullOrEmpty(rawResult))
                        {
                            var resultado = (JsonConvert.DeserializeObject<OnlineEntrada>(rawResult));
                            result.data = resultado.N_ENTRADA;
                        }
                    }
                    else
                    {
                        TraceError(result.errors,
                                   new UserUtilsDomainException($"Error when get decode user ({url}) with code-> {(int)response.StatusCode} - {response.ReasonPhrase}"),
                                   Codes.UserUtils.UserDecode,
                                   Codes.Areas.Online);
                    }
                }
            }
            catch (Exception ex)
            {
                TraceError(result.errors,
                           new UserUtilsDomainException($"Error when get decode user: {idEncodeNavisionUser} in {_settings.Value.OnlineUrl}", ex),
                           Codes.UserUtils.UserDecode,
                           Codes.Areas.Online);
            }

            return result;
        }

        public async Task<Result<List<LefebvreApp>>> GetUserUtilsAsync(string idNavisionUser, bool onlyActives)
        {
            var result = new Result<List<LefebvreApp>>(new List<LefebvreApp>());
            try
            {
                var usuarioEncriptado = await GetEncodeUserAsync(idNavisionUser);
                AddResultTrace(usuarioEncriptado, result);

                var url = $"{_settings.Value.MinihubUrl}?IdUsuarioPro={idNavisionUser}&IdUsuarioProEncriptado={usuarioEncriptado.data}&indMinuHub=1";

                using (var response = await _clientMinihub.GetAsync(url))
                {
                    if (response.IsSuccessStatusCode)
                    {
                        var rawResult = await response.Content.ReadAsStringAsync();

                        if (!string.IsNullOrEmpty(rawResult))
                        {
                            var resultado = (JsonConvert.DeserializeObject<LefebvreApp[]>(rawResult));
                            result.data = await UpdateListByPass(idNavisionUser, resultado, result.errors, onlyActives);
                        }
                    }
                    else
                    {
                        TraceError(result.errors,
                                   new UserUtilsDomainException($"Error when get tools of user ({url}) with code-> {(int)response.StatusCode} - {response.ReasonPhrase}"),
                                   Codes.UserUtils.GetHub,
                                   Codes.Areas.Com);
                    }
                }
            }
            catch (Exception ex)
            {
                TraceError(result.errors,
                           new UserUtilsDomainException($"Error when get tools of user: {idNavisionUser} in {_settings.Value.MinihubUrl}", ex),
                           Codes.UserUtils.GetHub,
                           Codes.Areas.Com);
            }

            return result;
        }

        private async Task<List<LefebvreApp>> UpdateListByPass(string idNavisionUser, LefebvreApp[] resultado, List<ErrorInfo> errors, bool onlyActives)
        {
            var modelo = new UserUtilsModel() { idNavision = idNavisionUser, version = _settings.Value.Version };
            try
            {
                modelo.apps = resultado.ToList().Where(i => i.indAcceso > 0 && onlyActives || !onlyActives).ToArray();
                await PostUserAsync(modelo);
            }
            catch (Exception ex)
            {
                TraceError(errors,
                           new UserUtilsDomainException($"Error when update list of bypass of user {idNavisionUser}", ex),
                           Codes.UserUtils.GetHub,
                           Codes.Areas.Com);
            }
            return modelo.apps.ToList();
        }

        public async Task<Result<ServiceComUser>> GetUserDataWithLoginAsync(string login, string pass)
        {
            var result = new Result<ServiceComUser>(new ServiceComUser());
            try
            {
                var loginClean = HttpUtility.UrlEncode(login);
                var url = $"{_settings.Value.LoginUrl}/Login/RecuperarUsuario?strLogin={login}&strPass={pass}";

                using (var response = await _clientLogin.GetAsync(url))
                {
                    if (response.IsSuccessStatusCode)
                    {
                        var rawResult = await response.Content.ReadAsStringAsync();

                        if (!string.IsNullOrEmpty(rawResult))
                        {
                            var resultado = (JsonConvert.DeserializeObject<ServiceComUser>(rawResult));
                            result.data = resultado;
                        }
                    }
                    else
                    {
                        TraceError(result.errors,
                                   new UserUtilsDomainException($"Error when get data of user ({url}) with code-> {(int)response.StatusCode} - {response.ReasonPhrase}"),
                                   Codes.UserUtils.GetUserLef,
                                   Codes.Areas.Com);
                    }
                }
            }
            catch (Exception ex)
            {
                TraceError(result.errors,
                           new UserUtilsDomainException($"Error when get data of user {login} in {_settings.Value.LoginUrl}", ex),
                           Codes.UserUtils.GetUserLef,
                           Codes.Areas.Com);
            }

            return result;
        }

        public async Task<Result<ServiceComUser>> GetUserDataWithEntryAsync(string idNavisionUser)
        {
            var result = new Result<ServiceComUser>(new ServiceComUser());
            try
            {
                var url = $"{_settings.Value.LoginUrl}/Login/RecuperarUsuarioPorEntrada?idUsuarioPro={idNavisionUser}";

                using (var response = await _clientLogin.GetAsync(url))
                {
                    if (response.IsSuccessStatusCode)
                    {
                        var rawResult = await response.Content.ReadAsStringAsync();

                        if (!string.IsNullOrEmpty(rawResult))
                        {
                            var resultado = (JsonConvert.DeserializeObject<ServiceComUser>(rawResult));
                            result.data = resultado;
                        }
                    }
                    else
                    {
                        TraceError(result.errors,
                                   new UserUtilsDomainException($"Error when get data of user ({url}) with code-> {(int)response.StatusCode} - {response.ReasonPhrase}"),
                                   Codes.UserUtils.GetUserLef,
                                   Codes.Areas.Com);
                    }
                }
            }
            catch (Exception ex)
            {
                TraceError(result.errors,
                           new UserUtilsDomainException($"Error when get data of user {idNavisionUser} in {_settings.Value.LoginUrl}", ex),
                           Codes.UserUtils.GetUserLef,
                           Codes.Areas.Com);
            }

            return result;
        }

        public async Task<Result<ServiceComArea[]>> GetAreasByUserAsync(string idNavisionUser)
        {
            var result = new Result<ServiceComArea[]>(null);
            try
            {
                var url = $"{_settings.Value.LoginUrl}/Areas/GetUsuariosProAreas?idUsuarioPro={idNavisionUser}";

                using (var response = await _clientOnline.GetAsync(url))
                {
                    if (response.IsSuccessStatusCode)
                    {
                        var rawResult = await response.Content.ReadAsStringAsync();

                        if (!string.IsNullOrEmpty(rawResult))
                        {
                            var resultado = (JsonConvert.DeserializeObject<ServiceComArea[]>(rawResult));
                            result.data = resultado;
                        }
                    }
                    else
                    {
                        TraceError(result.errors,
                                   new UserUtilsDomainException($"Error when get areas of user ({url}) with code-> {(int)response.StatusCode} - {response.ReasonPhrase}"),
                                   Codes.UserUtils.GetAreas,
                                   Codes.Areas.Com);
                    }
                }
            }
            catch (Exception ex)
            {
                TraceError(result.errors,
                           new UserUtilsDomainException($"Error when get areas of user {idNavisionUser} in {_settings.Value.LoginUrl}", ex),
                           Codes.UserUtils.GetAreas,
                           Codes.Areas.Com);
            }
            return result;
        }

        #region Mongo User

        public async Task<Result<UserUtilsModel>> PostUserAsync(UserUtilsModel user)
            => await _repository.PostUserAsync(user);

        public async Task<Result<UserUtilsModel>> GetUserAsync(string idNavision)
            => await _repository.GetUserAsync(idNavision);

        public async Task<Result<bool>> RemoveUserAsync(string idNavision)
            => await _repository.RemoveUserAsync(idNavision);

        #endregion Mongo User

        public async Task<Result<string>> GetUserUtilsActualToServiceAsync(string idUser, string nameService)
        {
            var result = new Result<string>(null);
            var user = await GetUserAsync(idUser);
            result.errors.AddRange(user.errors);
            result.infos.AddRange(user.infos);

            if (user.errors?.Count == 0)
            {
                var app = user.data?.apps?.FirstOrDefault(x => x.descHerramienta == nameService);
                Result<string> temporalLinkResult = await GeUserUtilFinalLink(app?.urlByPass);
                result.errors.AddRange(temporalLinkResult.errors);
                result.infos.AddRange(temporalLinkResult.infos);
                result.data = temporalLinkResult?.data;
            }

            return result;
        }

        public async Task<Result<string>> GetUserUtilsActualToSignatureAsync(string idUser)
        {
            var result = new Result<string>(null);
            var urlReplace = "";
            try
            {
                var userDecoded = await GetDecodeUserAsync(idUser);
                AddResultTrace(userDecoded, result);

                var listByPass = _settings.Value.ByPassUrls?.ToList();
                if (listByPass?.Count == 0)
                    return result;

                var tokenRequest = new TokenRequest { idApp = (int?)AppCode.Signaturit, idClienteNavision = userDecoded.data };
                var userSignature = await GetGenericTokenAsync(tokenRequest, true);
                result.errors.AddRange(userSignature.errors);
                result.infos.AddRange(userSignature.infos);

                var encontrado = listByPass.Find(x => x.NameService.Equals("Signature-Direct"));
                if (encontrado?.NameService == null)
                    return result;

                urlReplace = encontrado.UrlByPass
                    .Replace("{tokenSignature}", userSignature.data.token);

                result.data = urlReplace;
            }
            catch (Exception ex)
            {
                TraceError(result.errors, new UserUtilsDomainException($"Error when get final link of bypass {urlReplace}", ex), Codes.UserUtils.ByPassSignature, Codes.Areas.Hub);
            }
            return result;
        }

        private async Task<Result<string>> GeUserUtilFinalLink(string newUrl)
        {
            var result = new Result<string>(null);
            try
            {
                using (var response = await _clientMinihub.GetAsync(newUrl))
                {
                    if (response.IsSuccessStatusCode)
                    {
                        var rawResult = await response.Content.ReadAsStringAsync();

                        if (!string.IsNullOrEmpty(rawResult))
                        {
                            var resultado = (JsonConvert.DeserializeObject<UrlJson>(rawResult));
                            result.data = resultado.url;
                        }
                    }
                    else
                    {
                        TraceError(result.errors,
                                   new UserUtilsDomainException($"Error when get bypass url ({newUrl}) with code-> {(int)response.StatusCode} - {response.ReasonPhrase}"),
                                   Codes.UserUtils.ByPass,
                                   Codes.Areas.Hub);
                    }
                }
            }
            catch (Exception ex)
            {
                TraceError(result.errors,
                           new UserUtilsDomainException($"Error when get final link of bypass {newUrl}", ex),
                           Codes.UserUtils.ByPass,
                           Codes.Areas.Hub);
            }

            return result;
        }

        #endregion Generic

        #region Token Common

        #region Token Validation

        private TokenValidationParameters GetValidationParameters(bool validateCaducity = true)
        {
            return new TokenValidationParameters()
            {
                ValidateLifetime = validateCaducity,
                ValidateAudience = false, // Because there is no audiance in the generated token
                ValidateIssuer = false,   // Because there is no issuer in the generated token
                ValidIssuer = "Lexon",
                ValidAudience = "Lexones",
                IssuerSigningKey = new SymmetricSecurityKey(System.Text.Encoding.UTF8.GetBytes(_settings.Value.TokenKey)) // The same key as the one that generate the token
            };
        }

        public async Task<Result<TokenData>> VadidateTokenAsync(TokenData tokenRequest, bool validateCaducity = true)
        {
            var result = new Result<TokenData>(tokenRequest);

            try
            {
                var tokenHandler = new JwtSecurityTokenHandler();
                tokenHandler.ValidateToken(tokenRequest.token, GetValidationParameters(validateCaducity), out SecurityToken validatedToken);
                result.data.valid = validatedToken != null;
            }
            catch (SecurityTokenException ex)
            {
                result.errors.Add(new ErrorInfo
                {
                    code = "Token Invalid",
                    detail = $"Security error with token -> {ex.InnerException}",
                    message = ex.Message
                });
                result.data.valid = false;
            }
            catch (Exception ex)
            {
                result.errors.Add(new ErrorInfo
                {
                    code = "Token Validation Error",
                    detail = $"General error with token",
                    message = ex.Message
                });
                result.data.valid = false;
            }
            //... manual validations return false if anything untoward is discovered
            return result;
        }

        #endregion Token Validation

        private long? GetLongIdUser(string idUser)
        {
            long.TryParse(idUser, out long idUserLong);
            return idUserLong;
        }

        //private long? GetIntIdCompany(string idUser)
        //{
        //    long.TryParse(idUser, out long idUserLong);
        //    return idUserLong;
        //}

        private void AddValuesToPayload(JwtPayload payload, TokenRequest tokenRequest)
        {
            AddClaimToPayload(payload, tokenRequest.idClienteNavision, nameof(tokenRequest.idClienteNavision));
            AddClaimToPayload(payload, tokenRequest.idClienteLef, nameof(tokenRequest.idClienteLef));
            AddClaimToPayload(payload, tokenRequest.roles, nameof(tokenRequest.roles));
            AddClaimToPayload(payload, tokenRequest.name, nameof(tokenRequest.name));
            AddClaimToPayload(payload, tokenRequest.idApp, nameof(tokenRequest.idApp));
            AddClaimToPayload(payload, GetLongIdUser(tokenRequest.idUserApp), nameof(tokenRequest.idUserApp));
            AddClaimToPayload(payload, tokenRequest.idUserApp, "idUser");
            AddClaimToPayload(payload, tokenRequest.env, nameof(tokenRequest.env));

            if (tokenRequest is TokenRequestCentinelaNewFirm tokenRequestCentinela)
            {
                AddClaimToPayload(payload, tokenRequestCentinela.guid, nameof(tokenRequestCentinela.guid));
                AddClaimToPayload(payload, tokenRequestCentinela.documentsId, nameof(tokenRequestCentinela.documentsId));
                AddClaimToPayload(payload, tokenRequestCentinela.recipientsId, nameof(tokenRequestCentinela.recipientsId));
                AddClaimToPayload(payload, tokenRequestCentinela.mailsAdmins, nameof(tokenRequestCentinela.mailsAdmins));
                AddClaimToPayload(payload, tokenRequestCentinela.logoUrl, nameof(tokenRequestCentinela.logoUrl));
                AddClaimToPayload(payload, tokenRequestCentinela.service, nameof(tokenRequestCentinela.service));
            }

            if (tokenRequest is TokenRequestNewMail tokenRequestNewMail)
            {
                AddClaimToPayload(payload, tokenRequestNewMail.idEntity, nameof(tokenRequestNewMail.idEntity));
                AddClaimToPayload(payload, tokenRequestNewMail.idEntityType, nameof(tokenRequestNewMail.idEntityType));
                AddClaimToPayload(payload, tokenRequestNewMail.mailContacts, nameof(tokenRequestNewMail.mailContacts));

                if (tokenRequest is TokenRequestOpenMail tokenRequestOpenMail)
                {
                    AddClaimToPayload(payload, tokenRequestOpenMail.mailAccount, nameof(tokenRequestOpenMail.mailAccount));
                    AddClaimToPayload(payload, tokenRequestOpenMail.provider, nameof(tokenRequestOpenMail.provider));
                    AddClaimToPayload(payload, tokenRequestOpenMail.folder, nameof(tokenRequestOpenMail.folder));
                    AddClaimToPayload(payload, tokenRequestOpenMail.idMail, nameof(tokenRequestOpenMail.idMail));
                }
            }
            if (tokenRequest is TokenRequestDataBase tokenRequesDB)
            {
                AddClaimToPayload(payload, tokenRequesDB.bbdd, nameof(tokenRequesDB.bbdd));
            }
            if (tokenRequest is TokenRequestLogin tokenRequestLogin)
            {
                AddClaimToPayload(payload, tokenRequestLogin.login, nameof(tokenRequestLogin.login));
                AddClaimToPayload(payload, tokenRequestLogin.password, nameof(tokenRequestLogin.password));
            }

            if (tokenRequest is TokenRequestEventNew tokenRequestEventNew)
            {
                AddClaimToPayload(payload, tokenRequestEventNew.idActuation, nameof(tokenRequestEventNew.idActuation));
                AddClaimToPayload(payload, tokenRequestEventNew.title, nameof(tokenRequestEventNew.title));

                if (tokenRequest is TokenRequestEventOpen tokenRequestEventOpen)
                {
                    AddClaimToPayload(payload, tokenRequestEventOpen.idEvent, nameof(tokenRequestEventOpen.idEvent));
                }
            }
        }

        private void AddClaimToPayload(JwtPayload payload, object valorClaim, string nombreClaim)
        {
            if (valorClaim == null) return;

            //_logger.LogInformation("Claim {0} --> {1}", nombreClaim, valorClaim);
            payload.Add(nombreClaim, valorClaim);
        }

        private TokenRequest BuidSpecificToken(TokenModelView token, short idApp)
        {
            if (token.idClienteNavision != null && token.bbdd != null
                  //&& token.idEntity != null && token.idEntityType != null
                  && token.folder != null && token.provider != null
                  && token.idMail != null && token.mailAccount != null)
            {
                return new TokenRequestOpenMail
                {
                    idApp = idApp,
                    env = token.env,
                    idClienteNavision = token.idClienteNavision,
                    bbdd = token.bbdd,
                    idEntity = token.idEntity,
                    idEntityType = token.idEntityType,
                    folder = token.folder,
                    provider = token.provider,
                    idMail = token.idMail,
                    mailAccount = token.mailAccount,
                    mailContacts = token.mailContacts
                };
            }
            else if (token.idClienteNavision != null && token.bbdd != null
                && token.idEntity != null && token.idEntityType != null)
            {
                return new TokenRequestNewMail()
                {
                    idApp = idApp,
                    env = token.env,
                    idClienteNavision = token.idClienteNavision,
                    bbdd = token.bbdd,
                    idEntity = (int)token.idEntity,
                    idEntityType = (short)token.idEntityType,
                    mailContacts = token.mailContacts
                };
            }
            else if (token.idClienteNavision != null && token.bbdd != null)
            {
                return new TokenRequestDataBase()
                {
                    idApp = idApp,
                    env = token.env,
                    idClienteNavision = token.idClienteNavision,
                    bbdd = token.bbdd
                };
            }
            else if (token.login != null && token.password != null)
            {
                return new TokenRequestLogin() { idApp = idApp, env = token.env, login = token.login, password = token.password };
            }
            else if (token.idClienteNavision != null)
            {
                return new TokenRequest() { idApp = idApp, env = token.env, idClienteNavision = token.idClienteNavision };
            }

            return null;
        }

        #endregion Token Common

        #region Auxiliar

        private async Task<Result<TokenData>> GetRolesAndValidate(TokenRequest token)
        {
            var result = new Result<TokenData>(new TokenData());

            try
            {
                var userLefebvreResult = (token is TokenRequestLogin myToken)
                     ? await GetUserDataWithLoginAsync(myToken.login, myToken.password)
                     : await GetUserDataWithEntryAsync(token.idClienteNavision);
                AddResultTrace(userLefebvreResult, result);

                if (userLefebvreResult?.data?._idEntrada != null)
                {
                    result.data.valid = true;
                    token.idClienteNavision = userLefebvreResult?.data?._idEntrada;
                    token.idClienteLef = userLefebvreResult?.data?._idClienteNav;
                    token.name = userLefebvreResult?.data?.name;
                    token.roles = new List<string>() { "gmailpanel", "outlookpanel", "lexonconnector", "centinelaconnector" };
                }
                else
                {
                    result.data.valid = false;
                    TraceError(result.errors, new UserUtilsDomainException($"Error when validation user > User login or user idEntry don´t exist"), "UU20", "API");
                    return result;
                }

                var appsResult = await GetUserUtilsAsync(token.idClienteNavision, true);
                AddResultTrace(appsResult, result);
                foreach (var app in appsResult.data)
                {
                    token.roles.Add(app.descHerramienta);
                }

                var areasResult = await GetAreasByUserAsync(token.idClienteNavision);
                AddResultTrace(areasResult, result);
                foreach (var area in areasResult.data)
                {
                    token.roles.Add(area.descArea);
                }
            }
            catch (Exception ex)
            {
                TraceError(result.errors, new UserUtilsDomainException($"Error when validation user", ex), "UU20", "API");
            }
            return result;
        }

        #endregion Auxiliar

        public async Task<Result<TokenData>> GetGenericTokenAsync(TokenRequest tokenRequest, bool addTerminatorToToken)
        {
            _logger.LogInformation("START --> {0} con tiempo {1}", nameof(GetGenericTokenAsync), DateTime.Now);

            var result = await GetRolesAndValidate(tokenRequest);

            if (string.IsNullOrEmpty(tokenRequest.env))
                tokenRequest.env = _settings.Value.DefaultEnvironment;

            if (result.data?.valid == false) return result;

            await ManageTokenLexon(tokenRequest, result);

            if (tokenRequest is TokenRequestCentinelaNewFirm firm)
            {
                firm.guid = firm.guid ?? Guid.NewGuid().ToString();
                firm.service = firm.service ?? "signature";
            }

            var tokenString = await Task.Run(() =>
            {
                var exp = DateTime.UtcNow.AddSeconds(_settings.Value.TokenCaducity);
                var payload = new JwtPayload(null, "", new List<Claim>(), null, exp);

                AddValuesToPayload(payload, tokenRequest);

                var key = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(_settings.Value.TokenKey));
                var creds = new SigningCredentials(key, SecurityAlgorithms.HmacSha256);

                var jwtToken = new JwtSecurityToken(new JwtHeader(creds), payload);
                return new JwtSecurityTokenHandler().WriteToken(jwtToken);
            });

            tokenString += addTerminatorToToken ? "/" : "";
            result.data.token = tokenString;

            _logger.LogInformation("END --> {0} con token: {1}", nameof(GetGenericTokenAsync), tokenString);

            return result;
        }

        private async Task ManageTokenLexon(TokenRequest tokenRequest, Result<TokenData> result)
        {
            if (tokenRequest.idApp == _settings.Value.IdAppLexon)
            {
                var lexUserResult = await GetLexonUserIdAsync(tokenRequest.idClienteNavision);
                AddResultTrace(lexUserResult, result);
                if (string.IsNullOrEmpty(lexUserResult?.data?.idUser))
                    TraceError(result.errors, new UserUtilsDomainException($"Error get user from lexon"), Codes.UserUtils.GetToken, Codes.Areas.Api);
                tokenRequest.idUserApp = lexUserResult?.data?.idUser;
            }
            else
            {
                tokenRequest.idUserApp = tokenRequest.idClienteLef.ToString();
            }

            if (tokenRequest is TokenRequestNewMail || tokenRequest is TokenRequestOpenMail)
                tokenRequest = await GetContactDataFromLexon((TokenRequestNewMail)tokenRequest, result);
        }

        private async Task<Result<LexUserSimple>> GetLexonUserIdAsync(string idNavisionUser)
        {
            var result = new Result<LexUserSimple>(new LexUserSimple());

            var request = new HttpRequestMessage(HttpMethod.Get, $"{_settings.Value.LexonApiUrl}/user/getid?idNavisionUser={idNavisionUser}");
            TraceLog(parameters: new string[] { $"request:{request}" });

            try
            {
                using (var response = await _clientLexonApi.SendAsync(request))
                {
                    if (response.IsSuccessStatusCode)
                    {
                        result = await response.Content.ReadAsAsync<Result<LexUserSimple>>();
                        result.data.idNavision = idNavisionUser;
                    }
                    else
                    {
                        TraceError(result.errors,
                                   new UserUtilsDomainException($"Probably error in mysql, view rest collection of errors -> {(int)response.StatusCode} - {response.ReasonPhrase}"),
                                   Codes.UserUtils.GetLexonUser,
                                   Codes.Areas.InternalApi);
                    }
                }
            }
            catch (Exception ex)
            {
                TraceError(result.errors, new UserUtilsDomainException($"Error when call internal service in Amazon", ex), Codes.UserUtils.GetLexonUser, Codes.Areas.InternalApi);
            }
            return result;
        }

        public async Task<Result<LexUser>> GetLexonGenericAsync(TokenModelView token, short idApp, bool addTerminatorToToken)
        {
            var tokenRequest = BuidSpecificToken(token, idApp);

            var tokenResult = await GetGenericTokenAsync(tokenRequest, addTerminatorToToken);

            var lexUser = new LexUser() { idNavision = tokenRequest.idClienteNavision, idUser = tokenRequest.idUserApp, token = tokenResult.data.token };
            var resultLexUser = new Result<LexUser>(lexUser);
            AddResultTrace(tokenResult, resultLexUser);

            TraceInfo(resultLexUser.infos, $"The Token is type {tokenRequest.GetType()}", Codes.UserUtils.GetToken);

            return resultLexUser;
        }

        private async Task<TokenRequestNewMail> GetContactDataFromLexon(TokenRequestNewMail token, Result<TokenData> result)
        {
            if (token.idEntityType == (short?)LexonAdjunctionType.files
                || token.idEntityType == (short?)LexonAdjunctionType.folders
                || token.idEntityType == (short?)LexonAdjunctionType.others
                || token.idEntityType == (short?)LexonAdjunctionType.documents)
                return token;

            var search = new EntitySearchById
            {
                bbdd = token.bbdd,
                idEntity = token.idEntity,
                idType = token.idEntityType,
                idUser = token.idUserApp
            };
            Result<LexContact> contactsResult = await GetLexonContactsAsync(search);
            AddResultTrace(contactsResult, result);
            if (!string.IsNullOrEmpty(contactsResult?.data.Email))
            {
                if (token.mailContacts == null)
                    token.mailContacts = new List<string>();
                token.mailContacts.Add(contactsResult?.data.Email);
            }
            return token;
        }

        private void SerializeObjectToPost(object parameters, string path, out string url, out StringContent data)
        {
            url = $"{_settings.Value.LexonApiUrl}{path}";
            TraceLog(parameters: new string[] { $"url={url}" });
            var json = JsonConvert.SerializeObject(parameters);
            data = new StringContent(json, Encoding.UTF8, "application/json");
        }

        private async Task<Result<LexContact>> GetLexonContactsAsync(EntitySearchById search)
        {
            var result = new Result<LexContact>(new LexContact());

            try
            {
                var path = $"/entities/contact/getbyid";
                SerializeObjectToPost(search, path, out string url, out StringContent data);
                using (var response = await _clientLexonApi.PostAsync(url, data))
                {
                    if (response.IsSuccessStatusCode)
                        result = await response.Content.ReadAsAsync<Result<LexContact>>();
                    else
                        TraceError(result.errors,
                                   new UserUtilsDomainException($"Probably error in mysql when get contacts, view collection of errors -> {(int)response.StatusCode} - {response.ReasonPhrase}"),
                                   Codes.UserUtils.GetLexonContact,
                                   Codes.Areas.InternalApi);
                }
            }
            catch (Exception ex)
            {
                TraceError(result.errors, new UserUtilsDomainException($"Error when call internal service in Amazon", ex), Codes.UserUtils.GetLexonContact, Codes.Areas.InternalApi);
            }
            return result;
        }

        public async Task<Result<bool>> FirmCheckAsync(string idClient, string numDocs)
        {
            var result = new Result<bool>(false);

            var request = new HttpRequestMessage(HttpMethod.Get, $"{_settings.Value.ClavesUrl}/FirmaDigital/ComprobarPuedeCrearFirmaDigital?IdClientNav={idClient}&NumDocuments={numDocs}&idUic=1");
            TraceLog(parameters: new string[] { $"request:{request}" });

            try
            {
                using (var response = await _clientClaves.SendAsync(request))
                {
                    if (response.IsSuccessStatusCode)
                    {
                        var resultString = await response.Content.ReadAsAsync<string>();
                        result.data = resultString.Equals("true") ? true : false;
                    }
                    else
                    {
                        TraceError(result.errors,
                                   new UserUtilsDomainException($"Error when call service of {_settings.Value.ClavesUrl} to check firm -> {(int)response.StatusCode} - {response.ReasonPhrase}"),
                                   Codes.UserUtils.FirmCheck,
                                   Codes.Areas.Claves);
                    }
                }
            }
            catch (Exception ex)
            {
                TraceError(result.errors,
                           new UserUtilsDomainException($"Error when call service of {_settings.Value.ClavesUrl}", ex),
                           Codes.UserUtils.FirmCheck,
                           Codes.Areas.Claves);
            }
            return result;
        }

        public async Task<Result<string>> FirmCheckAvailableAsync(string idClient)
        {
            var result = new Result<string>("0");

            var request = new HttpRequestMessage(HttpMethod.Get, $"{_settings.Value.ClavesUrl}/FirmaDigital/RecuperarFirmasDigitalesDisponibles?IdClientNav={idClient}");
            TraceLog(parameters: new string[] { $"request:{request}" });

            try
            {
                using (var response = await _clientClaves.SendAsync(request))
                {
                    if (response.IsSuccessStatusCode)
                    {
                        var resultString = await response.Content.ReadAsAsync<string>();
                        result.data = resultString;
                    }
                    else
                    {
                        TraceError(result.errors,
                                   new UserUtilsDomainException($"Error when call service of {_settings.Value.ClavesUrl} to check available firms -> {(int)response.StatusCode} - {response.ReasonPhrase}"),
                                   Codes.UserUtils.FirmCheckAvaliable,
                                   Codes.Areas.Claves);
                    }
                }
            }
            catch (Exception ex)
            {
                TraceError(result.errors,
                           new UserUtilsDomainException($"Error when call service of {_settings.Value.ClavesUrl}", ex),
                           Codes.UserUtils.FirmCheckAvaliable,
                           Codes.Areas.Claves);
            }
            return result;
        }

        public async Task<Result<bool>> FirmUseAsync(string idClient, string idUser, string numDocs)
        {
            var result = new Result<bool>(false);

            var url = $"{_settings.Value.ClavesUrl}/FirmaDigital/CrearFirmaDigital?IdClientNav={idClient}&idUsuarioPro={idUser}&NumDocuments={numDocs}&idUic=1";
            TraceLog(parameters: new string[] { $"request:{url}" });
            try
            {
                using (var response = await _clientClaves.PostAsync(url, null))
                {
                    if (response.IsSuccessStatusCode)
                    {
                        var resultString = await response.Content.ReadAsAsync<string>();
                        int.TryParse(resultString, out int resultInt);
                        result.data = (resultInt > 0);
                    }
                    else
                    {
                        TraceError(result.errors,
                                   new UserUtilsDomainException($"Error when call service of {_settings.Value.ClavesUrl} to use firm -> {(int)response.StatusCode} - {response.ReasonPhrase}"),
                                   Codes.UserUtils.FirmUse,
                                   Codes.Areas.Claves);
                    }
                }
            }
            catch (Exception ex)
            {
                TraceError(result.errors,
                           new UserUtilsDomainException($"Error when call service of {_settings.Value.ClavesUrl} to use firm", ex),
                           Codes.UserUtils.FirmUse,
                           Codes.Areas.Claves);
            }
            return result;
        }
    }
}