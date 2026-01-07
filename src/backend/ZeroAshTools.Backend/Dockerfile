FROM mcr.microsoft.com/dotnet/aspnet:10.0 AS base
USER $APP_UID
WORKDIR /app
EXPOSE 8080
EXPOSE 8081

FROM mcr.microsoft.com/dotnet/sdk:10.0 AS build
ARG BUILD_CONFIGURATION=Release
WORKDIR /src
COPY ["src/backend/AyeletTools.Backend/AyeletTools.Backend.csproj", "src/backend/AyeletTools.Backend/"]
RUN dotnet restore "src/backend/AyeletTools.Backend/AyeletTools.Backend.csproj"
COPY . .
WORKDIR "/src/src/backend/AyeletTools.Backend"
RUN dotnet build "./AyeletTools.Backend.csproj" -c $BUILD_CONFIGURATION -o /app/build

FROM build AS publish
ARG BUILD_CONFIGURATION=Release
RUN dotnet publish "./AyeletTools.Backend.csproj" -c $BUILD_CONFIGURATION -o /app/publish /p:UseAppHost=false

FROM base AS final
WORKDIR /app
COPY --from=publish /app/publish .
ENTRYPOINT ["dotnet", "AyeletTools.Backend.dll"]
