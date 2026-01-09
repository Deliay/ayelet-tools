using System.Text.Json.Serialization;
using IF.Lastfm.Core.Api;

namespace ZeroAshTools.Backend.Service.LastFm;

internal record Image(
    [property: JsonPropertyName("size")] string Size,
    [property: JsonPropertyName("#text")] string Url);

internal record Album([property: JsonPropertyName("image")] List<Image> Image);
internal record Track([property: JsonPropertyName("album")] Album Album);
internal record LastTrack([property: JsonPropertyName("track")] Track Track);

public class LastFmSongCoverProvider(LastfmClient client) : KeyValueFileCache<string>("mbid-covers.json")
{
    protected override async ValueTask<string> LoadValueAsync(string key, CancellationToken cancellationToken = default)
    {
        var result = await client.HttpClient.GetFromJsonAsync<LastTrack>(
            $"https://ws.audioscrobbler.com/2.0/?method=track.getInfo&mbid={key}&api_key={client.Auth.ApiKey}&format=json",
            cancellationToken: cancellationToken);

        return result?.Track.Album.Image.FirstOrDefault(i => i.Size == "extralarge")?.Url ??
               "https://lastfm.freetls.fastly.net/i/u/34s/2a96cbd8b46e442fc41c2b86b821562f.png";
    }
}