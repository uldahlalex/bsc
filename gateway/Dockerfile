FROM mcr.microsoft.com/dotnet/aspnet:6.0-focal AS base
WORKDIR /app
EXPOSE 5000

ENV ASPNETCORE_URLS=http://+:5000

# Creates a non-root user with an explicit UID and adds permission to access the /app folder
# For more info, please refer to https://aka.ms/vscode-docker-dotnet-configure-containers
RUN adduser -u 5678 --disabled-password --gecos "" appuser && chown -R appuser /app
USER appuser

FROM mcr.microsoft.com/dotnet/sdk:6.0-focal AS build
WORKDIR /app
COPY ["gateway.csproj", "./"]
RUN dotnet restore "gateway.csproj"
COPY . .
WORKDIR "/app/."

RUN dotnet build "gateway.csproj" -c Release -o /app/build

FROM build AS publish
COPY ocelot.json ./app/
RUN dotnet publish "gateway.csproj" -c Release -o /app/publish /p:UseAppHost=false

FROM base AS final
WORKDIR /app
COPY --from=publish /app/publish .
COPY ocelot.json .
ENTRYPOINT ["dotnet", "gateway.dll"]
