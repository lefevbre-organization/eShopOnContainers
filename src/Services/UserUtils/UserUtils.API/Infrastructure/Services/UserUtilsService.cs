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

            _clientOnline = _clientFactory.CreateClient();
            _clientOnline.BaseAddress = new Uri(_settings.Value.OnlineUrl);

            var authData = Convert.ToBase64String(
                        System.Text.Encoding.ASCII.GetBytes($"{_settings.Value.OnlineLogin}:{_settings.Value.OnlinePassword}"));

            _clientOnline.DefaultRequestHeaders.Authorization = new AuthenticationHeaderValue("Basic", authData);

            _clientOnline.DefaultRequestHeaders.Add("Accept", "text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3");

            _clientLexonApi = _clientFactory.CreateClient();
            _clientLexonApi.BaseAddress = new Uri(_settings.Value.LexonApiUrl);
            _clientLexonApi.DefaultRequestHeaders.Add("Accept", "text/plain");
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
                            code = "Error_EncodeUser_Service",
                            detail = $"Error in call to {url} with code-> {(int)response.StatusCode} - {response.ReasonPhrase}"
                        });
                    }
                }
            }
            catch (Exception ex)
            {
                result.errors.Add(new ErrorInfo
                {
                    code = "Error_EncodeUser",
                    detail = $"General error when call online service",
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
                            code = "Error_DecodeUser_Service",
                            detail = $"Error in call to {url} with code-> {(int)response.StatusCode} - {response.ReasonPhrase}"
                        });
                    }
                }
            }
            catch (Exception ex)
            {
                result.errors.Add(new ErrorInfo
                {
                    code = "Error_DecodeUser",
                    detail = $"General error when call online service",
                    message = ex.Message
                });
            }

            return result;
        }

        public async Task<Result<List<LexApp>>> GetUserUtilsAsync(string idNavisionUser, bool onlyActives)
        {
            var result = new Result<List<LexApp>>(new List<LexApp>());
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
                            var resultado = (JsonConvert.DeserializeObject<LexApp[]>(rawResult));
                            var listAll = resultado.ToList();
                            UpdateListByPass(listAll, idNavisionUser, result.errors);
                            result.data = onlyActives ? listAll.Where(x => x.indAcceso > 0).ToList() : listAll.ToList();
                        }
                    }
                    else
                    {
                        result.errors.Add(new ErrorInfo
                        {
                            code = "Error_Get_Minihub_Service",
                            detail = $"Error in call to {url} with code-> {(int)response.StatusCode} - {response.ReasonPhrase}"
                        });
                    }
                }
            }
            catch (Exception ex)
            {
                result.errors.Add(new ErrorInfo
                {
                    code = "Error_Get_Minihub",
                    detail = $"General error in call Minihub data",
                    message = ex.Message
                });
            }

            return result;
        }

        private async void UpdateListByPass(List<LexApp> listAll, string idNavisionUser, List<ErrorInfo> errors)
        {
            try
            {
                var listaByPass = await _repository.GetListByPassAsync();
                foreach (var app in listAll)
                {
                    var encontrado = listaByPass.data.Find(x => x.NameService.Equals(app.descHerramienta.ToUpperInvariant()));
                    if (encontrado?.NameService != null)
                    {
                        //  encontrado.Url = app.url;
                        var urlReplace = encontrado.UrlByPass
                            .Replace("{idUserNavision}", idNavisionUser)
                            .Replace("{serviceName}", app.descHerramienta);
                        //  var actualizado = await _repository.PostByPassAsync(encontrado);
                        app.url = urlReplace;
                        return;
                    }
                }
            }
            catch (Exception ex)
            {
                errors.Add(new ErrorInfo
                {
                    code = "ErrorUpdateByPass",
                    detail = $"General error in update bypass data",
                    message = ex.Message
                });
            }
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
                            code = "Error_GetUserWithLogin_Service",
                            detail = $"Error in call to {url} with code-> {(int)response.StatusCode} - {response.ReasonPhrase}"
                        });
                    }
                }
            }
            catch (Exception ex)
            {
                result.errors.Add(new ErrorInfo
                {
                    code = "Error_GetUserWithLogin",
                    detail = $"General error when call commontool service",
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
                            code = "Error_GetUserWithEntry_Service",
                            detail = $"Error in call to {url} with code-> {(int)response.StatusCode} - {response.ReasonPhrase}"
                        });
                    }
                }
            }
            catch (Exception ex)
            {
                result.errors.Add(new ErrorInfo
                {
                    code = "Error_GetUserWithEntry",
                    detail = $"General error when call commontool service",
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
                            code = "Error_GetAreas_Service",
                            detail = $"Error in call to {url} with code-> {(int)response.StatusCode} - {response.ReasonPhrase}"
                        });
                    }
                }
            }
            catch (Exception ex)
            {
                result.errors.Add(new ErrorInfo
                {
                    code = "Error_GetAreas",
                    detail = $"General error when call online service",
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
            var byPassResult = await GetUserAsync(nameService);
            //if (byPassResult.errors?.Count == 0 && byPassResult.data?.Url != null)
            //{
            //    var newUrl = byPassResult.data?.Url;
            //    Result<string> temporalLinkResult = await GeUserUtilFinalLink(newUrl);
            //    result.data = temporalLinkResult.data;
            //}
            //else
            //{
            //    result.data = "http://www.google.es";
            //}

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
                    detail = $"Security error with token",
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

        private void AddValuesToPayload(JwtPayload payload, TokenRequest tokenRequest)
        {
            AddClaimToPayload(payload, tokenRequest.IdClienteNavision, nameof(tokenRequest.IdClienteNavision));
            AddClaimToPayload(payload, tokenRequest.Roles, nameof(tokenRequest.Roles));
            AddClaimToPayload(payload, tokenRequest.Name, nameof(tokenRequest.Name));
            AddClaimToPayload(payload, tokenRequest.IdApp, nameof(tokenRequest.IdApp));
            AddClaimToPayload(payload, tokenRequest.IdUser, nameof(tokenRequest.IdUser));

            if (tokenRequest is TokenRequestCentinelaViewFirm tokenRequestCentinelaViewFirm)
            {
                AddClaimToPayload(payload, tokenRequestCentinelaViewFirm.Guid, nameof(tokenRequestCentinelaViewFirm.Guid));
                if (tokenRequest is TokenRequestCentinelaNewFirm tokenRequestCentinela)
                {
                    AddClaimToPayload(payload, tokenRequestCentinela.DocumentsId, nameof(tokenRequestCentinela.DocumentsId));
                    AddClaimToPayload(payload, tokenRequestCentinela.RecipientsId, nameof(tokenRequestCentinela.RecipientsId));
                    AddClaimToPayload(payload, tokenRequestCentinela.MailsAdmins, nameof(tokenRequestCentinela.MailsAdmins));
                    AddClaimToPayload(payload, tokenRequestCentinela.LogoUrl, nameof(tokenRequestCentinela.LogoUrl));

                }
            }
            if (tokenRequest is TokenRequestDataBase tokenRequesDB)
            {
                AddClaimToPayload(payload, tokenRequesDB.bbdd, nameof(tokenRequesDB.bbdd));
            }
            if (tokenRequest is TokenRequestLogin tokenRequestLogin)
            {
                AddClaimToPayload(payload, tokenRequestLogin.Login, nameof(tokenRequestLogin.Login));
                AddClaimToPayload(payload, tokenRequestLogin.Password, nameof(tokenRequestLogin.Password));
            }
            if (tokenRequest is TokenRequestNewMail tokenRequestNewMail)
            {
                AddClaimToPayload(payload, tokenRequestNewMail.idEntity, nameof(tokenRequestNewMail.idEntity));
                AddClaimToPayload(payload, tokenRequestNewMail.idEntityType, nameof(tokenRequestNewMail.idEntityType));

                if (tokenRequest is TokenRequestOpenMail tokenRequestOpenMail)
                {
                    AddClaimToPayload(payload, tokenRequestOpenMail.mailAccount, nameof(tokenRequestOpenMail.mailAccount));
                    AddClaimToPayload(payload, tokenRequestOpenMail.provider, nameof(tokenRequestOpenMail.provider));
                    AddClaimToPayload(payload, tokenRequestOpenMail.folder, nameof(tokenRequestOpenMail.folder));
                    AddClaimToPayload(payload, tokenRequestOpenMail.idMail, nameof(tokenRequestOpenMail.idMail));
                }
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
                  && token.idEntity != null && token.idEntityType != null
                  && token.folder != null && token.provider != null
                  && token.idMail != null && token.mailAccount != null)
            {
                return new TokenRequestOpenMail
                {
                    IdApp = idApp,
                    IdClienteNavision = token.idClienteNavision,
                    bbdd = token.bbdd,
                    idEntity = (int)token.idEntity,
                    idEntityType = (short)token.idEntityType,
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
                    IdApp = idApp,
                    IdClienteNavision = token.idClienteNavision,
                    bbdd = token.bbdd,
                    idEntity = (int)token.idEntity,
                    idEntityType = (short)token.idEntityType
                };
            }
            else if (token.idClienteNavision != null && token.bbdd != null)
            {
                return new TokenRequestDataBase()
                {
                    IdApp = idApp,
                    IdClienteNavision = token.idClienteNavision,
                    bbdd = token.bbdd
                };
            }
            else if (token.login != null && token.password != null)
            {
                return new TokenRequestLogin() { IdApp = idApp, Login = token.login, Password = token.password };
            }
            else if (token.idClienteNavision != null)
            {
                return new TokenRequest() { IdApp = idApp, IdClienteNavision = token.idClienteNavision };
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
                     ? await GetUserDataWithLoginAsync(((TokenRequestLogin)token).Login, ((TokenRequestLogin)token).Password)
                     : await GetUserDataWithEntryAsync(token.IdClienteNavision);

                if (userLefebvreResult?.data?._idEntrada != null)
                {
                    result.data.valid = true;
                    token.IdClienteNavision = userLefebvreResult?.data?._idEntrada;
                    token.Name = userLefebvreResult?.data?.name;
                    token.Roles = new List<string>() { "gmailpanel", "outlookpanel", "lexonconnector", "centinelaconnector" };
                }
                else
                {
                    result.data.valid = false;
                    TraceOutputMessage(result.errors, $"Error validation user > User login or user idEntry don´t exist", "Error Validation User");
                    return result;
                }

                var apps = await GetUserUtilsAsync(token.IdClienteNavision, true);
                foreach (var app in apps.data)
                {
                    token.Roles.Add(app.descHerramienta);
                }

                var areas = await GetAreasByUserAsync(token.IdClienteNavision);
                foreach (var area in areas.data)
                {
                    token.Roles.Add(area.descArea);
                }
            }
            catch (Exception ex)
            {
                TraceOutputMessage(result.errors, $"Error validation user => {ex.Message}", "Error Validation");
            }
            return result;
        }

         private async Task<List<string>> GetRolesOfUserAsync(string idClienteNavision, string login, string password)
        {
            var apps = await GetUserUtilsAsync(idClienteNavision, true);
            var areas = await GetAreasByUserAsync(idClienteNavision);
            var appsWithAccess = new List<string>() { "lexonconnector", "centinelaconnector" };
            foreach (var app in apps.data)
            {
                appsWithAccess.Add(app.descHerramienta);
            }

            foreach (var area in areas.data)
            {
                appsWithAccess.Add(area.descArea);
            }

            var usuarioValido = !string.IsNullOrEmpty(login) && !string.IsNullOrEmpty(password);
            if (!string.IsNullOrEmpty(idClienteNavision) && usuarioValido)
            {
                appsWithAccess.Add("gmailpanel");
                appsWithAccess.Add("outlookpanel");
            }

            return appsWithAccess;
        }

        #endregion Auxiliar

        public async Task<Result<TokenData>> GetGenericTokenAsync(TokenRequest tokenRequest, bool addTerminatorToToken)
        {
            //1. Validar usuario contra loginurl o minuhub (pensar si de hace con todos)
            //4. Obtener roles y permisos de aplicación para el usuario (puede unificarse al paso 1)
            var result = await GetRolesAndValidate(tokenRequest);

            if (result.data?.valid == false) return result;

            //2. Obtener datos de lexon (TODO: evaluar si es necesari, se puede obviar con el paso anterior u obtenemos un método más eficiente)
            if (tokenRequest.IdApp == _settings.Value.IdAppLexon)
            {
                Result<LexUser> lexUserResult = await GetLexonUserAsync(tokenRequest.IdClienteNavision);
                if (string.IsNullOrEmpty(lexUserResult?.data?.idNavision))
                    TraceOutputMessage(result.errors, $"Error get user from lexon", "Error Get Lexon Token");
                tokenRequest.IdUser = lexUserResult?.data?.idUser;
               // tokenRequest.IdUser = "449";
            }

            //3. Obtener contactos si se necesita (evaluar si tengo que pasarlo a otros métodos y quitarlos del general
            //5. Construir token diferente según los datos proporcionados
            if (tokenRequest is TokenRequestNewMail || tokenRequest is TokenRequestOpenMail)
                GetContactDataFromLexon((TokenRequestNewMail)tokenRequest);

            if (tokenRequest is TokenRequestCentinelaNewFirm)
                ((TokenRequestCentinelaNewFirm)tokenRequest).Guid = Guid.NewGuid().ToString();

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

        private async Task<Result<LexUser>> GetLexonUserAsync(string idNavisionUser)
        {
            var result = new Result<LexUser>(new LexUser());

            var request = new HttpRequestMessage(HttpMethod.Get, $"{_settings.Value.LexonApiUrl}/user?idNavisionUser={idNavisionUser}");
            TraceLog(parameters: new string[] { $"request:{request}" });

            try
            {
                using (var response = await _clientLexonApi.SendAsync(request))
                {
                    if (response.IsSuccessStatusCode)
                    {
                        result = await response.Content.ReadAsAsync<Result<LexUser>>();
                        result.data.idNavision = idNavisionUser;
                    }
                    else
                    {
                        TraceOutputMessage(result.errors, "Response not ok with mysql.api", 2003);
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
            var lexUser = new LexUser() { idNavision = tokenRequest.IdClienteNavision, idUser = tokenRequest.IdUser, token = tokenResult.data.token };

            var resultLexUser = new Result<LexUser>(lexUser);
            resultLexUser.errors.AddRange(tokenResult.errors);
            resultLexUser.infos.AddRange(tokenResult.infos);

            return resultLexUser;
        }

        private async void GetContactDataFromLexon(TokenRequestNewMail token)
        {
            if (token.idEntityType == (short?)LexonAdjunctionType.files
                || token.idEntityType == (short?)LexonAdjunctionType.folders
                || token.idEntityType == (short?)LexonAdjunctionType.others
                || token.idEntityType == (short?)LexonAdjunctionType.documents)
                return;

            var search = new EntitySearchById
            {
                bbdd = token.bbdd,
                idEntity = token.idEntity,
                idType = token.idEntityType,
                idUser = token.IdClienteNavision
            };
            var contactsResult = await _repository.GetLexonContactsAsync(search);
            if (!string.IsNullOrEmpty(contactsResult?.data.Email))
            {
                if (token.mailContacts == null)
                    token.mailContacts = new List<string>();
                token.mailContacts.Add(contactsResult?.data.Email);
            }
        }
    }
}