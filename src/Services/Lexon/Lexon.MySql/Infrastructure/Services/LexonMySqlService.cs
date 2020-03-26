﻿using Lexon.MySql.Infrastructure.Repositories;
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

        public async Task<Result<List<int>>> AddRelationMailAsync(ClassificationAddView classification) => await _lexonRepository.AddRelationMailAsync(classification);

        public async Task<Result<int>> AddRelationContactsMailAsync(ClassificationContactsView classification) => await _lexonRepository.AddRelationContactsMailAsync(classification);

        public async Task<Result<int>> RemoveRelationMailAsync(ClassificationRemoveView classification) => await _lexonRepository.RemoveRelationMailAsync(classification);

        public async Task<MySqlCompany> GetRelationsAsync(ClassificationSearchView classification) => await _lexonRepository.GetRelationsAsync(classification);

        #endregion Relations

        #region Entities

        public async Task<MySqlCompany> GetEntitiesAsync(IEntitySearchView entitySearch) => await _lexonRepository.GetEntitiesAsync(entitySearch);

        public async Task<MySqlCompany> GetFoldersFilesEntitiesAsync(IEntitySearchView entitySearch) => await _lexonRepository.GetFoldersFilesEntitiesAsync(entitySearch);

        public async Task<Result<LexEntity>> GetEntityAsync(EntitySearchById entitySearch) => await _lexonRepository.GetEntityAsync(entitySearch);

        public async Task<Result<LexContact>> GetContactAsync(EntitySearchById entitySearch) => await _lexonRepository.GetContactAsync(entitySearch);

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
            string login = null,
            string password = null,
            bool addTerminatorToToken = true)
        {
            idUser = ValidarUsuario(login, password, idUser);
            var resultado = await _lexonRepository.GetUserAsync(idUser);

            if (string.IsNullOrEmpty(resultado?.data?.idUser))
            {
                resultado.errors.Add(new ErrorInfo() { code = "5000", message = "No se recupera un idUser desde Lexon" });
            }
            await GetContactData(resultado?.data?.idUser, bbdd, idEntityType, idEntity, mailContacts);

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
                roles = GetRolesOfUser(idUser, login, password)
            }).Result;

            resultado.data.token += addTerminatorToToken ? "/" : "";
            return resultado;
        }

        private async Task GetContactData(string idUser, string bbdd, short? idEntityType, int? idEntity, List<string> mailContacts)
        {
            if (idEntityType == (short?)LexonAdjunctionType.files
                && idEntityType == (short?)LexonAdjunctionType.folders
                && idEntityType == (short?)LexonAdjunctionType.others
                && idEntityType == (short?)LexonAdjunctionType.documents)
                return;

            EntitySearchById search = new EntitySearchById
            {
                bbdd = bbdd,
                idEntity = idEntity,
                idType = idEntityType,
                idUser = idUser
            };
            Result<LexContact> contacto = await _lexonRepository.GetContactAsync(search);
            if (!string.IsNullOrEmpty(contacto?.data.Email))
            {
                mailContacts.Add(contacto?.data.Email);
            }
        }

        private string ValidarUsuario(string login, string password, string idUser)
        {
            //TODO: validar usuario
            if (!string.IsNullOrEmpty(login) && !string.IsNullOrEmpty(password) && string.IsNullOrEmpty(idUser))
                idUser = "E1621396";

            return idUser;
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

        private static List<string> GetRolesOfUser(string idClienteNavision, string login, string password)
        {
            //TODO: connect to external service to obtain de data
            var usuarioValido = !string.IsNullOrEmpty(login) && !string.IsNullOrEmpty(password);
            if (!string.IsNullOrEmpty(idClienteNavision) && usuarioValido)
                return new List<string>() { "lexonconnector", "centinelaconnector", "gmailpanel", "outlookpanel" };
            else if (!string.IsNullOrEmpty(idClienteNavision))
                return new List<string>() { "lexonconnector", "centinelaconnector" };

            return new List<string>() { };
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

        public async Task<Result<LexUser>> GetCompaniesFromUserAsync(string idUser)
            => await _lexonRepository.GetCompaniesListAsync(idUser);

        public async Task<Result<long>> AddFolderToEntityAsync(FolderToEntity entityFolder)
            => await _lexonRepository.AddFolderToEntityAsync(entityFolder);

        public Result<LexNestedEntity> GetNestedFolderAsync(FolderNestedView entityFolder)
        {
            var limit = entityFolder.nestedLimit <= 0 ? 2 : entityFolder.nestedLimit;

            var result = new Result<LexNestedEntity>(new LexNestedEntity());
            var search = new EntitySearchFoldersView(entityFolder.bbdd, entityFolder.idUser) 
            { 
                idParent = entityFolder.idFolder, 
                search = entityFolder.search 
            };
            if (entityFolder.includeFiles)
            {
                search.idFolder = entityFolder.idFolder;
            }
            else
            {
                search.idType = (short?)LexonAdjunctionType.folders;
            }

            var partialResultTop = _lexonRepository.GetFoldersFilesEntitiesAsync(search).Result;
            result.errors.AddRange(partialResultTop.Errors);
            result.infos.AddRange(partialResultTop.Infos);

            if (!partialResultTop.PossibleHasData())
            {
                result.infos.Add(new Info() { code = "noChilds", message = $"{entityFolder.idFolder} no tiene  folders anidados" });
                return result;
            }

            var entity = new LexNestedEntity(partialResultTop.Data[0]);

            GetRecursiveEntities(entityFolder, result, entity, ref limit);

            result.data = entity;
            return result;
        }

        private void GetRecursiveEntities(FolderNestedView entityFolder, Result<LexNestedEntity> result, LexNestedEntity entity, ref int limit)
        {
            var search = new EntitySearchFoldersView(entityFolder.bbdd, entityFolder.idUser) { idParent = entity.idRelated };
            if (entityFolder.includeFiles)
            {
                search.idFolder = entity.idRelated;
            }
            else
            {
                search.idType = (short?)LexonAdjunctionType.folders;
            }

            var partialResult = _lexonRepository.GetFoldersFilesEntitiesAsync(search).Result;
            if (!partialResult.PossibleHasData())
                return;

            foreach (var item in partialResult.Data)
            {
                var nestedentity = new LexNestedEntity(item);
                GetRecursiveEntities(entityFolder, result, nestedentity, ref limit);
                entity.subChild.Add(nestedentity);
            };
            //limit -= 1;
        }
    }
}