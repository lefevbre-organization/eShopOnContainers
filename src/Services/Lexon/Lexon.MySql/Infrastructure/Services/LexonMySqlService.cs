using Lexon.MySql.Infrastructure.Repositories;
using Lexon.MySql.Model;
using Microsoft.eShopOnContainers.BuildingBlocks.Lefebvre.Models;
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

        #region Relations

        public async Task<Result<int>> AddRelationMailAsync(ClassificationAddView classification) => await _lexonRepository.AddRelationMailAsync(classification);

        public async Task<Result<int>> AddRelationContactsMailAsync(ClassificationContactsView classification) => await _lexonRepository.AddRelationContactsMailAsync(classification);

        public async Task<Result<int>> RemoveRelationMailAsync(ClassificationRemoveView classification) => await _lexonRepository.RemoveRelationMailAsync(classification);

       // public async Task<Result<JosRelationsList>> GetRelationsAsync(ClassificationSearchView classification) => await _lexonRepository.GetRelationsAsync(classification);
        public async Task<MySqlCompany> GetRelationsAsync(ClassificationSearchView classification) => await _lexonRepository.GetRelationsAsync(classification);

        #endregion Relations

        #region Entities

       // public async Task<MySqlList<JosEntityList, JosEntity>> GetEntitiesAsync(EntitySearchView entitySearch) => await _lexonRepository.SearchEntitiesAsync(entitySearch);

        public async Task<MySqlCompany> GetEntitiesAsync(EntitySearchView entitySearch) => await _lexonRepository.GetEntitiesAsync(entitySearch);
        public async Task<Result<LexEntity>> GetEntityAsync(EntitySearchById entitySearch) => await _lexonRepository.GetEntityAsync(entitySearch);

        public async Task<MySqlList<JosEntityTypeList, JosEntityType>> GetMasterEntitiesAsync() => await _lexonRepository.GetMasterEntitiesAsync();

        #endregion Entities

        #region User and tokens

        /// <summary>
        /// Obtener datos de usuario comprobando si se tiene acceso
        /// </summary>
        /// <param name="idUser">id del usuario navisión</param>
        /// <param name="bbdd">opcionalmente la bbdd en la que trabaja en usuario</param>
        /// <param name="idMail">id del enlace al correo, puede mandarse si se intenta aabrir un mail ya creado</param>
        /// <param name="idEntityType">opcionalmente el tipo de entidad si viene relacionado</param>
        /// <param name="idEntity">opcionalmente el id de entidad si viene relacionado</param>
        /// <returns></returns>
        public async Task<Result<LexUser>> GetUserAsync(
            string idUser,
            string bbdd,
            string provider = null,
            string mailAccount = null,
            string uidMail = null,
            string folder = null,
            short? idEntityType = null,
            int? idEntity = null,
            List<string> mailContacts = null,
            bool addTerminatorToToken = true)
        {
            var resultado = await _lexonRepository.GetUserAsync(idUser);
            if (string.IsNullOrEmpty(resultado?.data?.idUser))
            {
                resultado.errors.Add(new ErrorInfo() { code="5000", message= "No se recupera un idUser desde Lexon" });
            }

            resultado.data.token = BuildTokenWithPayloadAsync(new TokenModel
            {
                idClienteNavision = idUser,
                name = resultado?.data?.name,
                idUserApp = GetLongIdUser(resultado?.data?.idUser),
                bbdd = bbdd,
                provider = provider,
                mailAccount = mailAccount,
                folder = folder,
                idMail = uidMail,
                idEntityType = idEntityType,
                idEntity = idEntity,
                mailContacts = mailContacts,
                roles = GetRolesOfUser(idUser)
            }).Result;

            resultado.data.token += addTerminatorToToken ? "/" : "";

            return resultado;
        }

        private long? GetLongIdUser(string idUser)
        {
            long.TryParse(idUser, out long idUserLong);
            return idUserLong;
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
                //var roleOptions = GetRolesOfUser(clienteModel.idClienteNavision);
                AddClaimToPayload(payload, clienteModel.idClienteNavision, nameof(clienteModel.idClienteNavision));
                AddClaimToPayload(payload, clienteModel.idUserApp, nameof(clienteModel.idUserApp));
                AddClaimToPayload(payload, clienteModel.name, nameof(clienteModel.name));
                AddClaimToPayload(payload, clienteModel.bbdd, nameof(clienteModel.bbdd));
                AddClaimToPayload(payload, clienteModel.provider, nameof(clienteModel.provider));
                AddClaimToPayload(payload, clienteModel.mailAccount, nameof(clienteModel.mailAccount));
                AddClaimToPayload(payload, clienteModel.folder, nameof(clienteModel.folder));
                AddClaimToPayload(payload, clienteModel.idMail, nameof(clienteModel.idMail));
                AddClaimToPayload(payload, clienteModel.idEntityType, nameof(clienteModel.idEntityType));
                AddClaimToPayload(payload, clienteModel.idEntity, nameof(clienteModel.idEntity));
                AddClaimToPayload(payload, clienteModel.roles, nameof(clienteModel.roles));
                AddClaimToPayload(payload, clienteModel.mailContacts, nameof(clienteModel.mailContacts));
            }
        }

        private static List<string> GetRolesOfUser(string idClienteNavision)
        {
            //TODO: connect to external service to obtain de data
            return new List<string>() { "lexonconnector", "centinelaconnector" };
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

        #endregion User and tokens

        public async Task<Result<LexUser>> GetCompaniesFromUserAsync(int pageSize, int pageIndex, string idUser) 
            => await _lexonRepository.GetCompaniesListAsync(pageSize, pageIndex, idUser);

        public async Task<Result<long>> AddFolderToEntityAsync(FolderToEntity entityFolder)
            => await _lexonRepository.AddFolderToEntityAsync(entityFolder);
    }
}