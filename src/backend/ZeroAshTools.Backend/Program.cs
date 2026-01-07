using System.IO.Compression;
using System.Text.Json.Serialization;
using Mikibot.Crawler.Http.Bilibili;

var builder = WebApplication.CreateSlimBuilder(args);
builder.Services.AddSingleton<HttpClient>();
builder.Services.AddSingleton<BiliVideoCrawler>();

builder.Services.ConfigureHttpJsonOptions(options =>
{
    options.SerializerOptions.TypeInfoResolverChain.Insert(0, AppJsonSerializerContext.Default);
});

builder.Services.AddOpenApi();
builder.Services.AddCors(cors =>
{
    cors.AddPolicy("trust-sites", (policy) => policy
        .WithOrigins("https://tools.ayelet.cn", "https://tools.zeroash.cn", "http://localhost:5173"));
});

var app = builder.Build();

if (app.Environment.IsDevelopment())
{
    app.MapOpenApi();
}

app.UseCors("trust-sites");
var crawler = app.Services.GetRequiredService<BiliVideoCrawler>();
var httpClient = app.Services.GetRequiredService<HttpClient>();
var bilibiliApi = app.MapGroup("/api/v1/bilibili");
bilibiliApi.MapGet("/cover/{bv}", async (string bv) =>
{
    try
    {
        var info = await crawler.GetVideoInfo(bv, null);
        var data = await httpClient.GetByteArrayAsync($"{info.CoverUrl}@300w_168h_1c.jpg");
        var dataUri = $"data:image/jpeg;base64,{Convert.ToBase64String(data)}";
        return Results.Ok(new VideoParseResult(
            info.Title,
            info.Owner.Name,
            dataUri,
            $"https://www.bilibili.com/video/{bv}"));
    }
    catch (Exception e)
    {
        return Results.NotFound();
    }
}).RequireCors("trust-sites");

app.Run();

public record VideoParseResult(string Title, string Author, string Image, string Url);

[JsonSerializable(typeof(VideoParseResult[]))]
internal partial class AppJsonSerializerContext : JsonSerializerContext
{
}