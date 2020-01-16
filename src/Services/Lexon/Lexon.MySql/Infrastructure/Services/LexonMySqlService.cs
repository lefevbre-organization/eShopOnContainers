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

        public async Task<Result<int>> RemoveRelationMailAsync(short idType, string bbdd, string idUser, string idMail, long idRelated)
        {
            return await _lexonRepository.RemoveRelationMailAsync(idType, bbdd, idUser, idMail, idRelated);
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
        public async Task<Result<JosUser>> GetUserAsync(string idUser, string bbdd,  string idMail = null, short? idEntityType = null, int? idEntity = null )
        {
            var resultado = await _lexonRepository.GetUserAsync(idUser);
            resultado.data.Token = BuildTokenWithPayloadAsync(new TokenModel
            {
                idClienteNavision = idUser,
                name= resultado?.data?.Name,
                idLexonUser= resultado?.data?.IdUser,
                bbdd = bbdd,
                idMail= idMail,
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
            if (modelo is TokenModel clienteModel) //TODO ver si necesito diferentes tokens
            {
                var idClienteNavision = clienteModel.idClienteNavision;
                _logger.LogInformation("Modelo --> {0} con idClienteNavision {1}", nameof(TokenModel), idClienteNavision);
                payload.Add(nameof(idClienteNavision), idClienteNavision);

                var idLexonUser = clienteModel.idLexonUser;
                _logger.LogInformation("Modelo --> {0} con idLexonUser {1}", nameof(TokenModel), idLexonUser);
                payload.Add(nameof(idLexonUser), idLexonUser);

                var nameUser = clienteModel.name;
                _logger.LogInformation("Modelo --> {0} con name {1}", nameof(TokenModel), nameUser);
                payload.Add(nameof(nameUser), nameUser);

                if (modelo.bbdd != null)
                {
                    var bbdd = clienteModel.bbdd;
                    _logger.LogInformation("Modelo --> {0} con name {1}", nameof(TokenModel), clienteModel.bbdd);
                    payload.Add(nameof(bbdd), bbdd);
                }

                if (modelo.idMail != null)
                {
                    var idMail = clienteModel.idMail;
                    _logger.LogInformation("Modelo --> {0} con name {1}", nameof(TokenModel), clienteModel.idMail);
                    payload.Add(nameof(idMail), idMail);
                }

                if (modelo.idEntityType != null)
                {
                    var idEntityType = clienteModel.idEntityType;
                    _logger.LogInformation("Modelo --> {0} con name {1}", nameof(TokenModel), clienteModel.idEntityType);
                    payload.Add(nameof(idEntityType), idEntityType);
                }

                if (modelo.idEntity != null)
                {
                    var idEntity = clienteModel.idEntity;
                    _logger.LogInformation("Modelo --> {0} con name {1}", nameof(TokenModel), clienteModel.idEntity);
                    payload.Add(nameof(idEntity), idEntity);
                }
            }
        }

        public async Task<Result<JosRelationsList>> GetRelationsAsync(int pageSize, int pageIndex, short? idType, string bbdd, string idUser, string idMail)
        {
            return await _lexonRepository.SearchRelationsAsync(pageSize, pageIndex, idType, bbdd, idUser, idMail);
        }
    }
}