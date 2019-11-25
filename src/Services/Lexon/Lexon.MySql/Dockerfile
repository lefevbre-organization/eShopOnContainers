FROM mcr.microsoft.com/dotnet/core/aspnet:2.2 AS base
WORKDIR /app
EXPOSE 80
#EXPOSE 443
EXPOSE 3315

FROM mcr.microsoft.com/dotnet/core/sdk:2.2 AS build
WORKDIR /src

# Keep the project list and command dotnet restore identical in all Dockfiles to maximize image cache utilization
COPY eLefebvreOnContainers-ServicesAndWebApps.sln .
COPY docker-compose.dcproj /src/
COPY src/ApiGateways/ApiGw-Base/OcelotApiGw.csproj src/ApiGateways/ApiGw-Base/
COPY src/BuildingBlocks/Devspaces.Support/Devspaces.Support.csproj src/BuildingBlocks/Devspaces.Support/
COPY src/BuildingBlocks/EventBus/EventBus/EventBus.csproj src/BuildingBlocks/EventBus/EventBus/
COPY src/BuildingBlocks/EventBus/EventBus.Tests/EventBus.Tests.csproj src/BuildingBlocks/EventBus/EventBus.Tests/
COPY src/BuildingBlocks/EventBus/EventBusRabbitMQ/EventBusRabbitMQ.csproj src/BuildingBlocks/EventBus/EventBusRabbitMQ/
COPY src/BuildingBlocks/EventBus/EventBusServiceBus/EventBusServiceBus.csproj src/BuildingBlocks/EventBus/EventBusServiceBus/
COPY src/BuildingBlocks/EventBus/IntegrationEventLogEF/IntegrationEventLogEF.csproj src/BuildingBlocks/EventBus/IntegrationEventLogEF/
COPY src/BuildingBlocks/WebHostCustomization/WebHost.Customization/WebHost.Customization.csproj src/BuildingBlocks/WebHostCustomization/WebHost.Customization/

# Lefebvre projects
COPY src/BuildingBlocks/EventBus/IntegrationEventLogMongoDB/IntegrationEventLogMongoDB.csproj src/BuildingBlocks/EventBus/IntegrationEventLogMongoDB/
COPY src/Services/Account/Account.API/Account.API.csproj src/Services/Account/Account.API/
COPY src/Services/Lexon/Lexon.API/Lexon.API.csproj src/Services/Lexon/Lexon.API/
COPY src/Services/Lexon/Lexon.MySql/Lexon.MySql.csproj src/Services/Lexon/Lexon.MySql/
COPY src/Web/WebGoogleClient/WebGoogleClient.csproj src/Web/WebGoogleClient/
COPY src/Web/WebLexonClient/WebLexonClient.csproj src/Web/WebLexonClient/
COPY src/Web/WebOffice365Client/WebOffice365Client.csproj src/Web/WebOffice365Client/
COPY src/Web/WebPortalClient/WebPortalClient.csproj src/Web/WebPortalClient/
COPY src/Web/WebImapClient/WebImapClient.csproj src/Web/WebImapClient/

RUN dotnet restore eLefebvreOnContainers-ServicesAndWebApps.sln

COPY . .
WORKDIR /src/src/Services/Lexon/Lexon.MySql
RUN dotnet publish --no-restore -c Release -o /app
RUN ls -lha /app

#FROM build as unittest
#WORKDIR /src/src/Services/Lexon/Lexon.UnitTests

FROM build as functionaltest
WORKDIR /src/src/Services/Lexon/Lexon.FunctionalTests

FROM build AS publish

FROM base AS final
#ENV ASPNETCORE_URLS="https://+"
#ENV ASPNETCORE_Kestrel__Certificates__Default__Path="./lexon_mysql.pfx"
#ENV ASPNETCORE_Kestrel__Certificates__Default__Password="lefebvre"
#ENV ASPNETCORE_Kestrel__Certificates__Default__AllowInvalid=true
WORKDIR /app
COPY --from=publish /app .
#RUN ls -lha /app

ENTRYPOINT ["dotnet", "Lexon.MySql.dll"]
