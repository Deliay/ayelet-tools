using Mikibot.Crawler.Http.Bilibili;
using ZeroAshTools.Backend.Data;
using ZeroAshTools.Backend.Service;
using ZeroAshTools.Backend.Service.Bangumi;
using ZeroAshTools.Backend.Service.Bilibili;
using ZeroAshTools.Backend.Service.LastFm;

if (!Directory.Exists("data"))
{
    Directory.CreateDirectory("data");
}

var builder = WebApplication.CreateSlimBuilder(args);
builder.Services.AddBilibiliProvider();
builder.Services.AddLastfmProvider();
builder.Services.AddBangumiTvProvider();

builder.Services.ConfigureHttpJsonOptions(options =>
{
    options.SerializerOptions.TypeInfoResolverChain.Insert(0, AppJsonSerializerContext.Default);
});

builder.Services.AddCors(cors =>
{
    cors.AddPolicy("trust-sites", (policy) => policy
        .WithOrigins("https://tools.ayelet.cn", "https://tools.zeroash.cn", "http://localhost:5173"));
});
builder.Services.AddResponseCaching();
builder.Services.AddResponseCompression();

var app = builder.Build();
await app.InitializeCache(app.Lifetime.ApplicationStopping);;
app.UseResponseCaching();
app.UseResponseCompression();

if (app.Environment.IsDevelopment())
{
    app.MapOpenApi();
}
app.UseCors("trust-sites");
var videoInfoProvider = app.Services.GetRequiredService<BilibiliVideoInfoProvider>();
var bilibiliApi = app.MapGroup("/api/v1/bilibili");

bilibiliApi.MapGet("/cover/{bv}", async (string bv, CancellationToken cancellationToken) =>
{
    try
    {
        return Results.Ok(await videoInfoProvider.GetAsync(bv, cancellationToken));
    }
    catch (Exception e)
    {
        Console.WriteLine(e);
        return Results.NotFound();
    }
}).RequireCors("trust-sites");

var lastfmApi = app.MapGroup("/api/v1/lastfm");
var lastfmProvider = app.Services.GetRequiredService<LastFmInfoProvider>();
var lastfmCoverProvider = app.Services.GetRequiredService<LastFmSongCoverProvider>();
lastfmApi.MapGet("/tracks/{term}", async (string term, CancellationToken cancellationToken) =>
{
    var searchSongs = await lastfmProvider.SearchSongs(term, 1, cancellationToken);
    return Results.Ok(searchSongs);
}).RequireCors("trust-sites");

lastfmApi.MapGet("/artist/{term}", async (string term, CancellationToken cancellationToken) =>
{
    var searchArtist = await lastfmProvider.SearchArtist(term, 1, cancellationToken);
    return Results.Ok(searchArtist);
}).RequireCors("trust-sites");

lastfmApi.MapGet("/tracks/{mbid}/cover", async (string mbid, CancellationToken cancellationToken) =>
{
    var cover = await lastfmCoverProvider.GetAsync(mbid, cancellationToken);
    return Results.Ok(cover);
}).RequireCors("trust-sites");

var bangumiApi = app.MapGroup("/api/v1/bangumi");
var bangumiProvider = app.Services.GetRequiredService<BangumiTvProvider>();
bangumiApi.MapGet("/subject/{term}", async (string term, CancellationToken cancellationToken) =>
{
    var result = await bangumiProvider.Search(term, cancellationToken);
    return Results.Ok(result);
}).RequireCors("trust-sites");
app.Run();
