using Lexon.MySql.Infrastructure.Repositories;
using Lexon.MySql.Model;
using Microsoft.Extensions.Logging;
using Microsoft.Extensions.Options;
using Microsoft.IdentityModel.Tokens;
using System;
using System.Collections.Generic;
using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Threading.Tasks;

namespace Lexon.MySql.Infrastructure.Services
{
    public partial class LexonMySqlService : ILexonMySqlService
    {
        public readonly ILexonMySqlRepository _lexonRepository;
        private readonly IOptions<LexonSettings> _settings;
        internal readonly ILogger<LexonMySqlService> _logger;

        public LexonMySqlService(
            IOptions<LexonSettings> settings
            , ILogger<LexonMySqlService> logger
            , ILexonMySqlRepository lexonRepository
            )
        {
            _settings = settings ?? throw new ArgumentNullException(nameof(settings));
            _lexonRepository = lexonRepository ?? throw new ArgumentNullException(nameof(lexonRepository));
            _logger = logger ?? throw new ArgumentNullException(nameof(logger));
        }

        public async Task<Result<int>> AddRelationMailAsync(short idType, string bbdd, string idUser, MailInfo[] listaMails, long idRelated)
        {
            return await _lexonRepository.AddRelationMailAsync(idType, bbdd, idUser, listaMails, idRelated);
        }

        public async Task<Result<int>> RemoveRelationMailAsync(short idType, string bbdd, string idUser, string provider, string mailAccount, string uidMail, long idRelated)
        {
            return await _lexonRepository.RemoveRelationMailAsync(idType, bbdd, idUser, provider, mailAccount, uidMail, idRelated);
        }

        public async Task<Result<JosUserCompanies>> GetCompaniesFromUserAsync(int pageSize, int pageIndex, string idUser)
        {
            return await _lexonRepository.GetCompaniesListAsync(pageSize, pageIndex, idUser);
        }

        public async Task<Result<JosEntityList>> GetEntitiesAsync(int pageSize, int pageIndex, short? idType, string bbdd, string idUser, string search, long? idFilter)
        {
            return await _lexonRepository.SearchEntitiesAsync(pageSize, pageIndex, idType, bbdd, idUser, search, idFilter);
        }

        public async Task<Result<JosEntityTypeList>> GetMasterEntitiesAsync()
        {
            return await _lexonRepository.GetMasterEntitiesAsync();
        }

        /// <summary>
        /// Obtener datos de usuario comprobando si se tiene acceso
        /// </summary>
        /// <param name="idUser">id del usuario navisión</param>
        /// <param name="bbdd">opcionalmente la bbdd en la que trabaja en usuario</param>
        /// <param name="idMail">id del enlace al correo, puede mandarse si se intenta aabrir un mail ya creado</param>
        /// <param name="idEntityType">opcionalmente el tipo de entidad si viene relacionado</param>
        /// <param name="idEntity">opcionalmente el id de entidad si viene relacionado</param>
        /// <returns></returns>
        public async Task<Result<JosUser>> GetUserAsync(string idUser, string bbdd, string provider = null, string mailAccount = null, string uidMail = null, short? idEntityType = null, int? idEntity = null )
        {
            var resultado = await _lexonRepository.GetUserAsync(idUser);
            resultado.data.Token = BuildTokenWithPayloadAsync(new TokenModel
            {
                idClienteNavision = idUser,
                name= resultado?.data?.Name,
                idLexonUser= resultado?.data?.IdUser,
                bbdd = bbdd,
                provider = provider,
                mailAccount = mailAccount,
                idMail= uidMail,
                idEntityType= idEntityType,
                idEntity = idEntity
            }).Result;
            return resultado;

        }

        /// <summary>
        ///   Se crea el claim a pelo como en el ejemplo https://stackoverflow.com/questions/29715178/complex-json-web-token-array-in-webapi-with-owin
        /// </summary>
        /// <param name="token"></param>
        /// <returns></returns>
        public async Task<string> BuildTokenWithPayloadAsync(TokenModel token)
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

        private void AddValuesToPayload(JwtPayload payload, TokenModel modelo)
        {
            if (modelo is TokenModel clienteModel) 
            {
                AddClaimToPayload(payload, clienteModel.idClienteNavision, nameof(clienteModel.idClienteNavision));
                AddClaimToPayload(payload, clienteModel.idLexonUser, nameof(clienteModel.idLexonUser));
                AddClaimToPayload(payload, clienteModel.name, nameof(clienteModel.name));
                AddClaimToPayload(payload, clienteModel.bbdd, nameof(clienteModel.bbdd));
                AddClaimToPayload(payload, clienteModel.provider, nameof(clienteModel.provider));
                AddClaimToPayload(payload, clienteModel.mailAccount, nameof(clienteModel.mailAccount));
                AddClaimToPayload(payload, clienteModel.idMail, nameof(clienteModel.idMail));
                AddClaimToPayload(payload, clienteModel.idEntityType, nameof(clienteModel.idEntityType));
                AddClaimToPayload(payload, clienteModel.idEntity, nameof(clienteModel.idEntity));

            }
        }

        private void AddClaimNumberToPayload(JwtPayload payload, long? valorClaim, string nombreClaim)
        {
            if (valorClaim == null) return;

            _logger.LogInformation("Claim númerico {0} --> {1}", nombreClaim, valorClaim);
            payload.Add(nombreClaim, valorClaim);
        }

        //private void AddClaimToPayload(JwtPayload payload, string valorClaim, string nombreClaim)
        //{
        //    if (valorClaim == null) return;

        //    _logger.LogInformation("Claim {0} --> {1}", nombreClaim, valorClaim);
        //    payload.Add(nombreClaim, valorClaim);
        //}

        private void AddClaimToPayload(JwtPayload payload, object valorClaim, string nombreClaim)
        {
            if (valorClaim == null) return;

            _logger.LogInformation("Claim {0} --> {1}", nombreClaim, valorClaim);
            payload.Add(nombreClaim, valorClaim);
        }

        public async Task<Result<JosRelationsList>> GetRelationsAsync(int pageSize, int pageIndex, short? idType, string bbdd, string idUser, string idMail)
        {
            return await _lexonRepository.SearchRelationsAsync(pageSize, pageIndex, idType, bbdd, idUser, idMail);
        }
    }
}