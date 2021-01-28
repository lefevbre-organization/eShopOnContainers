FROM mcr.microsoft.com/dotnet/core/aspnet:3.0-buster-slim AS base
WORKDIR /app
EXPOSE 80

FROM mcr.microsoft.com/dotnet/core/sdk:3.0-buster AS build
WORKDIR /src

# Install ASP.NET Core
ENV ASPNETCORE_VERSION 2.2.1
RUN curl -SL --output aspnetcore.tar.gz https://dotnetcli.blob.core.windows.net/dotnet/aspnetcore/Runtime/$ASPNETCORE_VERSION/aspnetcore-runtime-$ASPNETCORE_VERSION-linux-x64.tar.gz \
    && aspnetcore_sha512='e027a5dada5d139a44675f28090f996375e49fbd72f7897aa925e48803632d5bf187d4f22dc8225505ac33e6a7a05dcdd8ed19d8b6d5e46b22e628315cf13e3e' \
    && echo "$aspnetcore_sha512  aspnetcore.tar.gz" | sha512sum -c - \
    && mkdir -p /usr/share/dotnet \
    && tar -zxf aspnetcore.tar.gz -C /usr/share/dotnet \
    && rm aspnetcore.tar.gz \
    && ln -sf /usr/share/dotnet/dotnet /usr/bin/dotnet


# Keep the project list and command dotnet restore identical in all Dockfiles to maximize image cache utilization
COPY eLefebvreOnContainers-ServicesAndWebApps.sln .
COPY docker-compose.dcproj /src/
COPY src/ApiGateways/ApiGw-Base/OcelotApiGw.csproj src/ApiGateways/ApiGw-Base/
COPY src/BuildingBlocks/Devspaces.Support/Devspaces.Support.csproj src/BuildingBlocks/Devspaces.Support/
COPY src/BuildingBlocks/Models/Lef.Models/Lef.Models.csproj src/BuildingBlocks/Models/Lef.Models/
COPY src/BuildingBlocks/EventBus/EventBus/EventBus.csproj src/BuildingBlocks/EventBus/EventBus/
COPY src/BuildingBlocks/EventBus/EventBus.Tests/EventBus.Tests.csproj src/BuildingBlocks/EventBus/EventBus.Tests/
COPY src/BuildingBlocks/EventBus/EventBusRabbitMQ/EventBusRabbitMQ.csproj src/BuildingBlocks/EventBus/EventBusRabbitMQ/
COPY src/BuildingBlocks/EventBus/EventBusServiceBus/EventBusServiceBus.csproj src/BuildingBlocks/EventBus/EventBusServiceBus/
COPY src/BuildingBlocks/EventBus/IntegrationEventLogEF/IntegrationEventLogEF.csproj src/BuildingBlocks/EventBus/IntegrationEventLogEF/
COPY src/BuildingBlocks/WebHostCustomization/WebHost.Customization/WebHost.Customization.csproj src/BuildingBlocks/WebHostCustomization/WebHost.Customization/

# Lefebvre projects
COPY src/BuildingBlocks/EventBus/IntegrationEventLogMongoDB/IntegrationEventLogMongoDB.csproj src/BuildingBlocks/EventBus/IntegrationEventLogMongoDB/
COPY src/Services/Account/Account.API/Account.API.csproj src/Services/Account/Account.API/
COPY src/Services/Account/Calendar.API/Calendar.API.csproj src/Services/Account/Calendar.API/
COPY src/Services/Lexon/Lexon.API/Lexon.API.csproj src/Services/Lexon/Lexon.API/
COPY src/Services/Lexon/Lexon.MySql/Lexon.MySql.csproj src/Services/Lexon/Lexon.MySql/
COPY src/Services/UserUtils/UserUtils.API/UserUtils.API.csproj src/Services/UserUtils/UserUtils.API/
COPY src/Services/Centinela/Centinela.API/Centinela.API.csproj src/Services/Centinela/Centinela.API/
COPY src/Services/Signature/Signature.API/Signature.API.csproj src/Services/Signature/Signature.API/
COPY src/Services/Database/Database.API/Database.API.csproj src/Services/Database/Database.API/
COPY src/Services/Conference/Conference.API/Conference.API.csproj src/Services/Conference/Conference.API/
COPY src/Web/WebGoogleClient/WebGoogleClient.csproj src/Web/WebGoogleClient/
COPY src/Web/WebLexonClient/WebLexonClient.csproj src/Web/WebLexonClient/
COPY src/Web/WebAddonLauncher/WebAddonLauncher.csproj src/Web/WebAddonLauncher/
COPY src/Web/WebOffice365Client/WebOffice365Client.csproj src/Web/WebOffice365Client/
COPY src/Web/WebPortalClient/WebPortalClient.csproj src/Web/WebPortalClient/
COPY src/Web/WebImapClient/WebImapClient.csproj src/Web/WebImapClient/
COPY src/Web/WebStatusLef/WebStatusLef.csproj src/Web/WebStatusLef/
COPY src/Web/WebSignatureClient/WebSignatureClient.csproj src/Web/WebSignatureClient/
COPY src/Web/WebCentinelaClient/WebCentinelaClient.csproj src/Web/WebCentinelaClient/
COPY src/Web/WebDatabaseClient/WebDatabaseClient.csproj src/Web/WebDatabaseClient/
COPY src/Addon/Lexon/Office365/WebOffice365AddonLexon/WebOffice365AddonLexon.csproj src/Addon/Lexon/Office365/WebOffice365AddonLexon/
COPY src/Addon/Centinela/Office365/WebOffice365AddonCentinela/WebOffice365AddonCentinela.csproj src/Addon/Centinela/Office365/WebOffice365AddonCentinela/

RUN dotnet restore eLefebvreOnContainers-ServicesAndWebApps.sln

COPY . .
WORKDIR /src/src/Services/Conference/Conference.API
RUN dotnet publish --no-restore -c Release -o /app

#FROM build as unittest
#WORKDIR /src/src/Services/Conference/Conference.UnitTests

#FROM build as functionaltest
#WORKDIR /src/src/Services/Conference/Conference.FunctionalTests
#
FROM build AS publish

FROM base AS final

USER root
RUN whoami
RUN apt update && apt dist-upgrade -y

#RUN sed -i 's/TLSv1.2/TLSv1.0/g' /etc/ssl/openssl.cnf
#RUN sed -i 's/TLSv1.3/TLSv1.0/g' /etc/ssl/openssl.cnf
#RUN sed -i 's/TLSv1.1/TLSv1.0/g' /etc/ssl/openssl.cnf
RUN apt-get install ca-certificates
RUN apt-get update && apt-get install -y --no-install-recommends apt-utils gss-ntlmssp
RUN update-ca-certificates

#ENV ASPNETCORE_URLS="https://+"
WORKDIR /app
COPY --from=publish /app .
#RUN ls -lha /app
ENTRYPOINT ["dotnet", "Conference.API.dll"]
