ARG NODE_IMAGE=node:12
FROM mcr.microsoft.com/dotnet/aspnet:5.0 AS base
WORKDIR /app
EXPOSE 80
## EXPOSE 443

FROM ${NODE_IMAGE} as node-build
WORKDIR /web
COPY ["src/Addon/Lexon/Office365/WebOffice365AddonLexon/Client/", "./"]
#COPY ["src/Addon/Lexon/Office365/WebOffice365AddonCentinela/Client/package.json", "./"]
RUN ["npm", "install", "--silent"]
#COPY ["src/Addon/Lexon/Office365/WebOffice365AddonCentinela/Client/", "./"]
RUN ["npm", "run", "build", "--silent"]
#RUN ls -lha /web

FROM mcr.microsoft.com/dotnet/sdk:5.0.102-ca-patch-buster-slim AS build
WORKDIR /src

COPY "eLefebvreOnContainers-ServicesAndWebApps.sln" "eLefebvreOnContainers-ServicesAndWebApps.sln"

# Keep the project list and command dotnet restore identical in all Dockfiles to maximize image cache utilization
COPY "src/ApiGateways/ApiGw-Base/OcelotApiGw.csproj" "src/ApiGateways/ApiGw-Base/"
COPY "src/BuildingBlocks/Devspaces.Support/Devspaces.Support.csproj" "src/BuildingBlocks/Devspaces.Support/"
COPY "src/BuildingBlocks/Models/Lef.Models/Lef.Models.csproj" "src/BuildingBlocks/Models/Lef.Models/"
COPY "src/BuildingBlocks/EventBus/EventBus/EventBus.csproj" "src/BuildingBlocks/EventBus/EventBus/"
COPY "src/BuildingBlocks/EventBus/EventBus.Tests/EventBus.Tests.csproj" "src/BuildingBlocks/EventBus/EventBus.Tests/"
COPY "src/BuildingBlocks/EventBus/EventBusRabbitMQ/EventBusRabbitMQ.csproj" "src/BuildingBlocks/EventBus/EventBusRabbitMQ/"
COPY "src/BuildingBlocks/EventBus/EventBusServiceBus/EventBusServiceBus.csproj" "src/BuildingBlocks/EventBus/EventBusServiceBus/"
COPY "src/BuildingBlocks/EventBus/IntegrationEventLogEF/IntegrationEventLogEF.csproj" "src/BuildingBlocks/EventBus/IntegrationEventLogEF/"
COPY "src/BuildingBlocks/WebHostCustomization/WebHost.Customization/WebHost.Customization.csproj" "src/BuildingBlocks/WebHostCustomization/WebHost.Customization/"

# Lefebvre projects
COPY "src/BuildingBlocks/EventBus/IntegrationEventLogMongoDB/IntegrationEventLogMongoDB.csproj" "src/BuildingBlocks/EventBus/IntegrationEventLogMongoDB/"
COPY "src/Services/Account/Account.API/Account.API.csproj" "src/Services/Account/Account.API/"
COPY "src/Services/Account/Calendar.API/Calendar.API.csproj" "src/Services/Account/Calendar.API/"
COPY "src/Services/Lexon/Lexon.API/Lexon.API.csproj" "src/Services/Lexon/Lexon.API/"
COPY "src/Services/Signature/Signature.API/Signature.API.csproj" "src/Services/Signature/Signature.API/"
COPY "src/Services/UserUtils/UserUtils.API/UserUtils.API.csproj" "src/Services/UserUtils/UserUtils.API/"
COPY "src/Services/Centinela/Centinela.API/Centinela.API.csproj" "src/Services/Centinela/Centinela.API/"
COPY "src/Services/Signature/Signature.API/Signature.API.csproj" "src/Services/Signature/Signature.API/"
COPY "src/Services/Database/Database.API/Database.API.csproj" "src/Services/Database/Database.API/"
COPY "src/Services/Conference/Conference.API/Conference.API.csproj" "src/Services/Conference/Conference.API/"
COPY "src/Services/Google/GoogleAccount.API/GoogleAccount.API.csproj" "src/Services/Google/GoogleAccount.API/"
COPY "src/Services/Google/GoogleDrive.API/GoogleDrive.API.csproj" "src/Services/Google/GoogleDrive.API/"
COPY "src/Web/WebGoogleClient/WebGoogleClient.csproj" "src/Web/WebGoogleClient/"
COPY "src/Web/WebLexonClient/WebLexonClient.csproj" "src/Web/WebLexonClient/"
COPY "src/Web/WebAddonLauncher/WebAddonLauncher.csproj" "src/Web/WebAddonLauncher/"
COPY "src/Web/WebOffice365Client/WebOffice365Client.csproj" "src/Web/WebOffice365Client/"
COPY "src/Web/WebPortalClient/WebPortalClient.csproj" "src/Web/WebPortalClient/"
COPY "src/Web/WebImapClient/WebImapClient.csproj" "src/Web/WebImapClient/"
COPY "src/Web/WebStatusLef/WebStatusLef.csproj" "src/Web/WebStatusLef/"
COPY "src/Web/WebSignatureClient/WebSignatureClient.csproj" "src/Web/WebSignatureClient/"
COPY "src/Web/WebCentinelaClient/WebCentinelaClient.csproj" "src/Web/WebCentinelaClient/"
COPY "src/Web/WebDatabaseClient/WebDatabaseClient.csproj" "src/Web/WebDatabaseClient/"
COPY "src/Addon/Lexon/Office365/WebOffice365AddonLexon/WebOffice365AddonLexon.csproj" "src/Addon/Lexon/Office365/WebOffice365AddonLexon/"
COPY "src/Addon/Centinela/Office365/WebOffice365AddonCentinela/WebOffice365AddonCentinela.csproj" "src/Addon/Centinela/Office365/WebOffice365AddonCentinela/"

COPY "docker-compose.dcproj" "docker-compose.dcproj"
COPY "NuGet.config" "NuGet.config"

RUN ["dotnet", "restore", "eLefebvreOnContainers-ServicesAndWebApps.sln"]

COPY . .
COPY --from=node-build /web/build /src/src/Addon/Lexon/Office365/WebOffice365AddonLexon/wwwroot
WORKDIR /src/src/Addon/Lexon/Office365/WebOffice365AddonLexon
#RUN ls -lha /src/src/Web/WebLexonClient/wwwroot
RUN dotnet publish --no-restore -c Release -o /app

FROM build AS publish

FROM base AS final
WORKDIR /app
COPY --from=publish /app .
ENTRYPOINT ["dotnet", "WebOffice365AddonLexon.dll"]
