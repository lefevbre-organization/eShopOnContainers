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
using UserUtils.API.Infrastructure.Repositories;
using UserUtils.API.Models;

namespace UserUtils.API.Infrastructure.Services
{
    public class UserUtilsService : BaseClass<UserUtilsService>, IUserUtilsService
    {
        public readonly IUserUtilsRepository _repository;
        private readonly IEventBus _eventBus;
        private readonly IHttpClientFactory _clientFactory;
        private readonly HttpClient _clientMinihub;
        private readonly HttpClient _clientOnline;
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
            _clientMinihub.DefaultRequestHeaders.Add("Accept", "text/plain");

            //var handler = new HttpClientHandler()
            //{
            //    AllowAutoRedirect = false,
            //    ServerCertificateCustomValidationCallback = HttpClientHandler.DangerousAcceptAnyServerCertificateValidator
            //};

            //_clientOnline = new HttpClient(handler)
            //{
            //    BaseAddress = new Uri(_settings.Value.OnlineUrl)
            //};

            //var authData = "d3M6MjJsY3FzcDExbHN3";
            _clientOnline = _clientFactory.CreateClient();
            _clientOnline.BaseAddress = new Uri(_settings.Value.OnlineUrl);

            var authData = Convert.ToBase64String(
                        System.Text.Encoding.ASCII.GetBytes($"{_settings.Value.OnlineLogin}:{_settings.Value.OnlinePassword}"));

            _clientOnline.DefaultRequestHeaders.Authorization = new AuthenticationHeaderValue("Basic", authData);

            _clientOnline.DefaultRequestHeaders.Add("Accept", "text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3");
        }

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
                            code = "553",
                            detail = $"Error in call to {url} with code-> {(int)response.StatusCode} - {response.ReasonPhrase}"
                        });
                    }
                }
            }
            catch (Exception ex)
            {
                result.errors.Add(new ErrorInfo
                {
                    code = "554",
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
                            code = "553",
                            detail = $"Error in call to {url} with code-> {(int)response.StatusCode} - {response.ReasonPhrase}"
                        });
                    }
                }
            }
            catch (Exception ex)
            {
                result.errors.Add(new ErrorInfo
                {
                    code = "554",
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
                            result.data = onlyActives ? listAll.Where(x => x.indAcceso > 0).ToList() : listAll.ToList();
                        }
                    }
                    else
                    {
                        result.errors.Add(new ErrorInfo
                        {
                            code = "533",
                            detail = $"Error in call to {url} with code-> {(int)response.StatusCode} - {response.ReasonPhrase}"
                        });
                    }
                }
            }
            catch (Exception ex)
            {
                result.errors.Add(new ErrorInfo
                {
                    code = "534",
                    detail = $"General error in call Minihub data",
                    message = ex.Message
                });
            }

            return result;
        }

        private string ValidarUsuario(string login, string password, string idUser)
        {
            //TODO: validar usuario
            if (!string.IsNullOrEmpty(login) && !string.IsNullOrEmpty(password) && string.IsNullOrEmpty(idUser))
                idUser = "E1621396";

            return idUser;
        }

        public async Task<Result<TokenData>> GetTokenAsync(TokenModelBase tokenRequest, bool addTerminatorToToken)
        {
            tokenRequest.roles = await GetRolesOfUserAsync(tokenRequest.idClienteNavision, tokenRequest.login, tokenRequest.password);
            var resultado = new Result<TokenData>(new TokenData());

            resultado.data.token = BuildTokenWithPayloadAsync(tokenRequest).Result;

            resultado.data.token += addTerminatorToToken ? "/" : "";
            resultado.data.valid = true;
            return resultado;
        }

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

            var validationParameters = GetValidationParameters();

            var tokenHandler = new JwtSecurityTokenHandler();
            SecurityToken validatedToken = null;
            try
            {
                tokenHandler.ValidateToken(tokenRequest.token, validationParameters, out validatedToken);
                result.data.valid = validatedToken != null;
            }
            catch (SecurityTokenException ex)
            {
                result.errors.Add(new ErrorInfo
                {
                    code = "574",
                    detail = $"Security error with token",
                    message = ex.Message
                });
                result.data.valid = false;
            }
            catch (Exception ex)
            {
                result.errors.Add(new ErrorInfo
                {
                    code = "575",
                    detail = $"General error with token",
                    message = ex.Message
                });
                result.data.valid = false;
            }
            //... manual validations return false if anything untoward is discovered
            return result;
        }

        /// <summary>
        ///   Se crea el claim a pelo como en el ejemplo https://stackoverflow.com/questions/29715178/complex-json-web-token-array-in-webapi-with-owin
        /// </summary>
        /// <param name="token"></param>
        /// <returns></returns>
        public async Task<string> BuildTokenWithPayloadAsync(TokenModelBase token)
        {
            var accion = await Task.Run(() =>
            {
                _logger.LogInformation("START --> {0} con tiempo {1} y caducidad token {2}", nameof(BuildTokenWithPayloadAsync), DateTime.Now, DateTime.Now.AddSeconds(_settings.Value.TokenCaducity));

                var exp = DateTime.UtcNow.AddSeconds(_settings.Value.TokenCaducity);
                var payload = new JwtPayload(null, "", new List<Claim>(), null, exp);

                AddValuesToPayload(payload, token);

                var key = new SymmetricSecurityKey(System.Text.Encoding.UTF8.GetBytes(_settings.Value.TokenKey));
                var creds = new SigningCredentials(key, SecurityAlgorithms.HmacSha256);

                var jwtToken = new JwtSecurityToken(new JwtHeader(creds), payload);
                return new JwtSecurityTokenHandler().WriteToken(jwtToken);
            });

            _logger.LogInformation("END --> {0} con token: {1}", nameof(BuildTokenWithPayloadAsync), accion);

            return accion;
        }

        private void AddValuesToPayload(JwtPayload payload, TokenModelBase modelo)
        {
            if (modelo is TokenModelBase clienteModel)
            {
                AddClaimToPayload(payload, clienteModel.idClienteNavision, nameof(clienteModel.idClienteNavision));
                AddClaimToPayload(payload, clienteModel.roles, nameof(clienteModel.roles));
                AddClaimToPayload(payload, clienteModel.login, nameof(clienteModel.login));
            }
            else
            {
                //AddClaimToPayload(payload, clienteModel.idUserApp, nameof(clienteModel.idUserApp));
                //AddClaimToPayload(payload, clienteModel.name, nameof(clienteModel.name));

                //AddClaimToPayload(payload, clienteModel.bbdd, nameof(clienteModel.bbdd));
                //AddClaimToPayload(payload, clienteModel.provider, nameof(clienteModel.provider));
                //AddClaimToPayload(payload, clienteModel.mailAccount, nameof(clienteModel.mailAccount));
                //AddClaimToPayload(payload, clienteModel.folder, nameof(clienteModel.folder));
                //AddClaimToPayload(payload, clienteModel.idMail, nameof(clienteModel.idMail));
                //AddClaimToPayload(payload, clienteModel.idEntityType, nameof(clienteModel.idEntityType));
                //AddClaimToPayload(payload, clienteModel.idEntity, nameof(clienteModel.idEntity));
            }
        }

        private async Task<List<string>> GetRolesOfUserAsync(string idClienteNavision, string login, string password)
        {
            var apps = await GetUserUtilsAsync(idClienteNavision, true);
            var appsWithAccess = new List<string>() { "lexonconnector", "centinelaconnector" };
            foreach (var app in apps.data)
            {
                appsWithAccess.Add(app.descHerramienta);
            }

            var usuarioValido = !string.IsNullOrEmpty(login) && !string.IsNullOrEmpty(password);
            if (!string.IsNullOrEmpty(idClienteNavision) && usuarioValido)
            {
                appsWithAccess.Add("gmailpanel");
                appsWithAccess.Add("outlookpanel");
            }

            return appsWithAccess;
        }

        private void AddClaimNumberToPayload(JwtPayload payload, long? valorClaim, string nombreClaim)
        {
            if (valorClaim == null) return;

            _logger.LogInformation("Claim númerico {0} --> {1}", nombreClaim, valorClaim);
            payload.Add(nombreClaim, valorClaim);
        }

        private void AddClaimToPayload(JwtPayload payload, object valorClaim, string nombreClaim)
        {
            if (valorClaim == null) return;

            _logger.LogInformation("Claim {0} --> {1}", nombreClaim, valorClaim);
            payload.Add(nombreClaim, valorClaim);
        }

        public Task<Result<TokenData>> GetUserFromLoginAsync(int? idApp, string login, string password, bool addTerminatorToToken)
        {
            throw new NotImplementedException();
        }

        public Task<Result<TokenData>> GetLexonUserSimpleAsync(string idClienteNavision, bool addTerminatorToToken)
        {
            throw new NotImplementedException();
        }

        public Task<Result<TokenData>> GetLexonNewMailAsync(TokenRequestNewMail tokenRequest, bool addTerminatorToToken)
        {
            throw new NotImplementedException();
        }

        public Task<Result<TokenData>> GetLexonOpenMailAsync(TokenRequestOpenMail tokenRequest, bool addTerminatorToToken)
        {
            throw new NotImplementedException();
        }

        public Task<Result<TokenData>> GetLexonUserDbAsync(TokenRequestDataBase tokenRequest, bool addTerminatorToToken)
        {
            throw new NotImplementedException();
        }
    }
}