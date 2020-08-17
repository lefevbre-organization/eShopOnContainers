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
            //_clientMinihub.DefaultRequestHeaders.Add("Accept", "text/plain");

            _clientLogin = _clientFactory.CreateClient();
            _clientLogin.BaseAddress = new Uri(_settings.Value.LoginUrl);
            _clientLogin.DefaultRequestHeaders.Add("Accept", "text/plain");

            //_clientOnline = _clientFactory.CreateClient();
            //_clientOnline.BaseAddress = new Uri(_settings.Value.OnlineUrl);

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
                //https://online.elderecho.com/ws/encriptarEntrada.do?nEntrada=E1654569
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
                        result.errors.Add(new ErrorInfo
                        {
                            code = "EncodeUser_StatusCode",
                            detail = $"Error in call to {url} with code-> {(int)response.StatusCode} - {response.ReasonPhrase}"
                        });
                    }
                }
            }
            catch (Exception ex)
            {
                result.errors.Add(new ErrorInfo
                {
                    code = "EncodeUser",
                    detail = $"General error when call online service -> {ex.InnerException}",
                    message = ex.Message
                });
            }

            return result;
        }

        public async Task<Result<string>> GetDecodeUserAsync(string idEncodeNavisionUser)
        {
            var result = new Result<string>(string.Empty);
            try
            {
                //https://online.elderecho.com/ws/desencriptarEntrada.do?entradaEncriptada=eHRscn1hYA%3D%3D
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
                        result.errors.Add(new ErrorInfo
                        {
                            code = "DecodeUser_WebStatus",
                            detail = $"Error in call to {url} with code-> {(int)response.StatusCode} - {response.ReasonPhrase}"
                        });
                    }
                }
            }
            catch (Exception ex)
            {
                result.errors.Add(new ErrorInfo
                {
                    code = "DecodeUser",
                    detail = $"General error when call online service -> {ex.InnerException}",
                    message = ex.Message
                });
            }

            return result;
        }

        public async Task<Result<List<LefebvreApp>>> GetUserUtilsAsync(string idNavisionUser, bool onlyActives)
        {
            var result = new Result<List<LefebvreApp>>(new List<LefebvreApp>());
            try
            {
                var usuarioEncriptado = await GetEncodeUserAsync(idNavisionUser); // "f3NrcnZs";
                result.errors.AddRange(usuarioEncriptado.errors);
                result.infos.AddRange(usuarioEncriptado.infos);

                //http://led-pre-servicehub/Herramientas/Get?IdUsuarioPro=E0383956&IdUsuarioProEncriptado=f3NrcnZs&indMinuHub=1
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
                        result.errors.Add(new ErrorInfo
                        {
                            code = "Minihub_WebStatus",
                            detail = $"Error in call to {url} with code-> {(int)response.StatusCode} - {response.ReasonPhrase}"
                        });
                    }
                }
            }
            catch (Exception ex)
            {
                result.errors.Add(new ErrorInfo
                {
                    code = "Minihub",
                    detail = $"General error in call Minihub data -> {ex.InnerException}",
                    message = ex.Message
                });
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
                errors.Add(new ErrorInfo
                {
                    code = "UpdateByPass",
                    detail = $"General error in update bypass data",
                    message = ex.Message
                });
            }
            // modelo.apps = cleanListApp.ToArray();
            return modelo.apps.ToList();
        }

        public async Task<Result<ServiceComUser>> GetUserDataWithLoginAsync(string login, string pass)
        {
            var result = new Result<ServiceComUser>(new ServiceComUser());
            try
            {
                var loginClean = HttpUtility.UrlEncode(login);
                //Http://led-servicecomtools/Login/RecuperarUsuario?strLogin=f.reyes-ext@lefebvreelderecho.com&strPass=etEb9221
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
                        result.errors.Add(new ErrorInfo
                        {
                            code = "GetUserWithLogin_WebStatus",
                            detail = $"Error in call to {url} with code-> {(int)response.StatusCode} - {response.ReasonPhrase}"
                        });
                    }
                }
            }
            catch (Exception ex)
            {
                result.errors.Add(new ErrorInfo
                {
                    code = "GetUserWithLogin",
                    detail = $"General error when call commontool service -> {ex.InnerException}",
                    message = ex.Message
                });
            }

            return result;
        }

        public async Task<Result<ServiceComUser>> GetUserDataWithEntryAsync(string idNavisionUser)
        {
            var result = new Result<ServiceComUser>(new ServiceComUser());
            try
            {
                //http://led-pre-servicecomtools/Login/RecuperarUsuarioPorEntrada?idUsuarioPro=e0384919
                //http://led-servicecomtools/Login/RecuperarUsuarioPorEntrada?idUsuarioPro=E1621396
                //http://led-servicecomtools/Login/RecuperarUsuarioPorEntrada?idUsuarioPro=E1676156

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
                        result.errors.Add(new ErrorInfo
                        {
                            code = "GetUserWithEntry_Webstatus",
                            detail = $"Error in call to {url} with code-> {(int)response.StatusCode} - {response.ReasonPhrase}"
                        });
                    }
                }
            }
            catch (Exception ex)
            {
                result.errors.Add(new ErrorInfo
                {
                    code = "GetUserWithEntry",
                    detail = $"General error when call commontool service -> {ex.InnerException}",
                    message = ex.Message
                });
            }

            return result;
        }

        public async Task<Result<ServiceComArea[]>> GetAreasByUserAsync(string idNavisionUser)
        {
            var result = new Result<ServiceComArea[]>(null);
            try
            {
                //http://led-servicecomtools/Areas/GetUsuariosProAreas?idUsuarioPro=E0384919
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
                        result.errors.Add(new ErrorInfo
                        {
                            code = "GetAreas_Webstatus",
                            detail = $"Error in call to {url} with code-> {(int)response.StatusCode} - {response.ReasonPhrase}"
                        });
                    }
                }
            }
            catch (Exception ex)
            {
                result.errors.Add(new ErrorInfo
                {
                    code = "GetAreas",
                    detail = $"General error when call online service -> {ex.InnerException}",
                    message = ex.Message
                });
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
            if (user.errors?.Count == 0)
            {
                var app = user.data?.apps?.FirstOrDefault(x => x.descHerramienta == nameService);
                Result<string> temporalLinkResult = await GeUserUtilFinalLink(app?.urlByPass);
                result.data = temporalLinkResult?.data;
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
                        result.errors.Add(new ErrorInfo
                        {
                            code = "ErrorFinalLink_WebStatus",
                            detail = $"Error in call to {newUrl} with code-> {(int)response.StatusCode} - {response.ReasonPhrase}"
                        });
                    }
                }
            }
            catch (Exception ex)
            {
                result.errors.Add(new ErrorInfo
                {
                    code = "FinalLink",
                    detail = $"General error in call Final Link -> {ex.InnerException}",
                    message = ex.Message
                });
            }

            return result;
        }

        #endregion Generic

        #region Token Common

        #region Token Validation

        private TokenValidationParameters GetValidationParameters()
        {
            return new TokenValidationParameters()
            {
                ValidateLifetime = true, // Because there is no expiration in the generated token
                ValidateAudience = false, // Because there is no audiance in the generated token
                ValidateIssuer = false,   // Because there is no issuer in the generated token
                ValidIssuer = "Lexon",
                ValidAudience = "Lexones",
                IssuerSigningKey = new SymmetricSecurityKey(System.Text.Encoding.UTF8.GetBytes(_settings.Value.TokenKey)) // The same key as the one that generate the token
            };
        }

        public async Task<Result<TokenData>> VadidateTokenAsync(TokenData tokenRequest)
        {
            var result = new Result<TokenData>(tokenRequest);

            try
            {
                var tokenHandler = new JwtSecurityTokenHandler();
                tokenHandler.ValidateToken(tokenRequest.token, GetValidationParameters(), out SecurityToken validatedToken);
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

        private void AddValuesToPayload(JwtPayload payload, TokenRequest tokenRequest)
        {
            AddClaimToPayload(payload, tokenRequest.idClienteNavision, nameof(tokenRequest.idClienteNavision));
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
        }

        private void AddClaimToPayload(JwtPayload payload, object valorClaim, string nombreClaim)
        {
            if (valorClaim == null) return;

            _logger.LogInformation("Claim {0} --> {1}", nombreClaim, valorClaim);
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
                    env =token.env,
                    idClienteNavision = token.idClienteNavision,
                    bbdd = token.bbdd
                };
            }
            else if (token.login != null && token.password != null)
            {
                return new TokenRequestLogin() { idApp = idApp, env= token.env, login = token.login, password = token.password };
            }
            else if (token.idClienteNavision != null)
            {
                return new TokenRequest() { idApp = idApp, env =token.env, idClienteNavision = token.idClienteNavision };
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
                var userLefebvreResult = (token is TokenRequestLogin)
                     ? await GetUserDataWithLoginAsync(((TokenRequestLogin)token).login, ((TokenRequestLogin)token).password)
                     : await GetUserDataWithEntryAsync(token.idClienteNavision);

                if (userLefebvreResult?.data?._idEntrada != null)
                {
                    result.data.valid = true;
                    token.idClienteNavision = userLefebvreResult?.data?._idEntrada;
                    token.name = userLefebvreResult?.data?.name;
                    token.roles = new List<string>() { "gmailpanel", "outlookpanel", "lexonconnector", "centinelaconnector" };
                }
                else
                {
                    result.data.valid = false;
                    TraceOutputMessage(result.errors, $"Error validation user > User login or user idEntry don´t exist", "Error Validation User");
                    return result;
                }

                var apps = await GetUserUtilsAsync(token.idClienteNavision, true);
                foreach (var app in apps.data)
                {
                    token.roles.Add(app.descHerramienta);
                }

                var areas = await GetAreasByUserAsync(token.idClienteNavision);
                foreach (var area in areas.data)
                {
                    token.roles.Add(area.descArea);
                }
            }
            catch (Exception ex)
            {
                TraceOutputMessage(result.errors, $"Error validation user => {ex.Message}", "Error Validation");
            }
            return result;
        }

        #endregion Auxiliar

        public async Task<Result<TokenData>> GetGenericTokenAsync(TokenRequest tokenRequest, bool addTerminatorToToken)
        {
            var result = await GetRolesAndValidate(tokenRequest);

            if (string.IsNullOrEmpty(tokenRequest.env))
                tokenRequest.env = _settings.Value.DefaultEnvironment;

            if (result.data?.valid == false) return result;

            if (tokenRequest.idApp == _settings.Value.IdAppLexon)
            {
                var lexUserResult = await GetLexonUserIdAsync(tokenRequest.idClienteNavision);
                if (string.IsNullOrEmpty(lexUserResult?.data?.idUser))
                    TraceOutputMessage(result.errors, $"Error get user from lexon", "Error Get Lexon Token");
                tokenRequest.idUserApp = lexUserResult?.data?.idUser;
            }
            if (tokenRequest is TokenRequestNewMail || tokenRequest is TokenRequestOpenMail)
                tokenRequest = await GetContactDataFromLexon((TokenRequestNewMail)tokenRequest);

            if (tokenRequest is TokenRequestCentinelaNewFirm firm)
            {
                firm.guid = firm.guid ?? Guid.NewGuid().ToString();
            }

            var tokenString = await Task.Run(() =>
            {
                _logger.LogInformation("START --> {0} con tiempo {1} y caducidad token {2}", nameof(GetGenericTokenAsync), DateTime.Now, DateTime.Now.AddSeconds(_settings.Value.TokenCaducity));

                var exp = DateTime.UtcNow.AddSeconds(_settings.Value.TokenCaducity);
                var payload = new JwtPayload(null, "", new List<Claim>(), null, exp);

                AddValuesToPayload(payload, tokenRequest);

                var key = new SymmetricSecurityKey(System.Text.Encoding.UTF8.GetBytes(_settings.Value.TokenKey));
                var creds = new SigningCredentials(key, SecurityAlgorithms.HmacSha256);

                var jwtToken = new JwtSecurityToken(new JwtHeader(creds), payload);
                return new JwtSecurityTokenHandler().WriteToken(jwtToken);
            });

            _logger.LogInformation("END --> {0} con token: {1}", nameof(GetGenericTokenAsync), tokenString);

            tokenString += addTerminatorToToken ? "/" : "";
            result.data.token = tokenString;
            //result.data.valid = true;

            return result;
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
                        TraceOutputMessage(result.errors, "Response not ok with mysql.api", null, 2003);
                    }
                }
            }
            catch (Exception ex)
            {
                TraceMessage(result.errors, ex);
            }
            return result;
        }

        public async Task<Result<LexUser>> GetLexonGenericAsync(TokenModelView token, short idApp, bool addTerminatorToToken)
        {
            var tokenRequest = BuidSpecificToken(token, idApp);

            var tokenResult = await GetGenericTokenAsync(tokenRequest, addTerminatorToToken);
            var lexUser = new LexUser() { idNavision = tokenRequest.idClienteNavision, idUser = tokenRequest.idUserApp, token = tokenResult.data.token };

            var resultLexUser = new Result<LexUser>(lexUser);
            resultLexUser.errors.AddRange(tokenResult.errors);
            resultLexUser.infos.AddRange(tokenResult.infos);

            return resultLexUser;
        }

        private async Task<TokenRequestNewMail> GetContactDataFromLexon(TokenRequestNewMail token)
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
            var resultContact = new Result<LexContact>(new LexContact());

            try
            {
                var path = $"/entities/contact/getbyid";
                SerializeObjectToPost(search, path, out string url, out StringContent data);
                using (var response = await _clientLexonApi.PostAsync(url, data))
                {
                    if (response.IsSuccessStatusCode)
                        resultContact = await response.Content.ReadAsAsync<Result<LexContact>>();
                    else
                        TraceOutputMessage(resultContact.errors, $"Response not ok with lexon.api with code-> {response.StatusCode} - {response.ReasonPhrase}", null, 2003);
                }
            }
            catch (Exception ex)
            {
                TraceMessage(resultContact.errors, ex);
            }
            return resultContact;
        }

        public async Task<Result<bool>> FirmCheckAsync(string idClient, string numDocs)
        {
            var result = new Result<bool>(false);

        
            // https://led-pre-serviceclaves.lefebvre.es/FirmaDigital/ComprobarPuedeCrearFirmaDigital?IdClientNav={idClientNav}&NumDocuments={NumDocuments}&idUic=1
            var request = new HttpRequestMessage(HttpMethod.Get, $"{_settings.Value.ClavesUrl}/FirmaDigital/ComprobarPuedeCrearFirmaDigital?IdClientNav={idClient}&NumDocuments={numDocs}&idUic=1");
            TraceLog(parameters: new string[] { $"request:{request}" });

            try
            {
                using (var response = await _clientClaves.SendAsync(request))
                {
                    if (response.IsSuccessStatusCode)
                    {
                        var resultString = await response.Content.ReadAsAsync<string>();
                        result.data = resultString.Equals("true") ? true: false;
                    }
                    else                         
                    {
                        TraceOutputMessage(result.errors, "Response not ok when check firm", null, 2003);
                    }                                                     
                }
            }
            catch (Exception ex)
            {
                TraceMessage(result.errors, ex);
            }
            return result;
        }

        public async Task<Result<bool>> FirmUseAsync(string idClient, string idUser, string numDocs)
        {
            var result = new Result<bool>(false);

            // https://led-pre-serviceclaves.lefebvre.es/FirmaDigital/CrearFirmaDigital?IdClientNav={idClientNav}&idUsuarioPro={idUsuarioPro}&NumDocuments={NumDocuments}&idUic=1

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
                        TraceOutputMessage(result.errors, "Response not ok when use firm", null, 2003);
                    }
                }
            }
            catch (Exception ex)
            {
                TraceMessage(result.errors, ex);
            }
            return result;
        }
    }
}