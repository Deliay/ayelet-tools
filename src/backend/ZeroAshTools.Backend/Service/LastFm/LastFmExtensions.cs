using IF.Lastfm.Core.Api;

namespace ZeroAshTools.Backend.Service.LastFm;

public static class LastFmExtensions
{
    private static string RequireEnv(string name) => Environment.GetEnvironmentVariable(name)
        ?? throw new Exception($"Environment variable {name} is required.");

    extension(IServiceCollection registry)
    {
        public IServiceCollection AddLastfmProvider()
        {
            registry.AddSingleton<LastFmInfoProvider>();
            
            registry.AddSingleton<LastAuth>((sp) =>
                new LastAuth(
                    RequireEnv("LASTFM_API_KEY"), 
                    RequireEnv("LASTFM_API_SECRET")));

            registry.AddSingleton<LastfmClient>();

            registry.AddCache<LastFmSongCoverProvider>();
            
            return registry;
        }
    }
}