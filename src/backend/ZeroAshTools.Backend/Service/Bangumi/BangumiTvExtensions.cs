using BangumiApi;

namespace ZeroAshTools.Backend.Service.Bangumi;

public static class BangumiTvExtensions
{
    extension(IServiceCollection registry)
    {
        public IServiceCollection AddBangumiTvProvider()
        {
            registry.AddSingleton<BangumiTvProvider>();
            registry.AddSingleton(ClientBuilder.CreatePublicClient());
            return registry;
        }
    }
}