using BangumiApi;
using BangumiApi.V0.Search.Subjects;
using ZeroAshTools.Backend.Data;

namespace ZeroAshTools.Backend.Service.Bangumi;

public class BangumiTvProvider(ApiClient client)
{
    public async ValueTask<IEnumerable<RateItem>> Search(string term, CancellationToken cancellationToken = default)
    {
        var result = await client.V0.Search.Subjects.PostAsync(new SubjectsPostRequestBody()
        {
            Sort = SubjectsPostRequestBody_sort.Heat,
            Keyword = term,
            Filter = new SubjectsPostRequestBody_filter()
            {
                Type = [2],
                Nsfw = false,
            }
        }, cancellationToken: cancellationToken);

        return (result?.Data ?? []).Select((s) => new RateItem(
            $"{s.NameCn} / {s.Name}",
            "",
            s.Images?.Common ?? "",
            $"https://bangumi.tv/subject/{s.Id}",
            "bangumi-subject"));
    }
}