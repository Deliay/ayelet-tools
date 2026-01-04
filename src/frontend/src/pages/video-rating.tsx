import { useEffect, useState } from "react";
import { Input } from "@heroui/input";
import { Button } from "@heroui/button";
import { Select, SelectItem } from "@heroui/select";
import { Tooltip } from "@heroui/tooltip";
import { addToast } from "@heroui/toast";
import clsx from "clsx";

import DefaultLayout from "@/layouts/default";

interface VideoParseResult {
  title: string;
  author: string;
  image: string;
  url: string;
}

interface VideoCategories {
  [x: string]: { [bv: string]: VideoParseResult };
  夯爆了: { [bv: string]: VideoParseResult };
  夯: { [bv: string]: VideoParseResult };
  顶级: { [bv: string]: VideoParseResult };
  人上人: { [bv: string]: VideoParseResult };
  NPC: { [bv: string]: VideoParseResult };
  拉: { [bv: string]: VideoParseResult };
  拉完了: { [bv: string]: VideoParseResult };
}

const color: Record<string, string> = {
  夯爆了: "bg-[#8f0000]",
  夯: "bg-[#c00000]",
  顶级: "bg-[#ffc000]",
  人上人: "bg-[#ffd24b]",
  NPC: "bg-[#fedf82]",
  拉: "bg-[#aeadad]",
  拉完了: "bg-[#ffffff]",
};

async function getVideoInfo(bv: string) {
  const existsBv = localStorage.getItem(bv);

  if (existsBv) {
    return JSON.parse(existsBv) as VideoParseResult;
  }
  const res = await fetch(
    `https://ayelet-tools.fffdan.com/api/v1/bilibili/cover/${bv}`,
    {
      credentials: "omit",
    },
  );

  const result = (await res.json()) as VideoParseResult;

  localStorage.setItem(bv, JSON.stringify(result));

  return result;
}

const init = () =>
  ({
    夯爆了: {},
    夯: {},
    顶级: {},
    人上人: {},
    NPC: {},
    拉: {},
    拉完了: {},
  }) as VideoCategories;

const key = "RATED_VIDEOS";

function removeFromCategory(data: VideoCategories, bv: string) {
  for (const [, records] of Object.entries(data)) {
    delete records[bv];
  }

  return Object.assign({}, data);
}

function setBvToCategory(
  data: VideoCategories,
  category: string,
  bv: string,
  info: VideoParseResult,
) {
  for (const [, records] of Object.entries(data)) {
    delete records[bv];
  }
  data[category][bv] = info;

  return Object.assign({}, data);
}

function get() {
  const str = localStorage.getItem(key);

  if (!str) {
    return set(init());
  } else {
    return JSON.parse(str) as VideoCategories;
  }
}

function set(value: VideoCategories) {
  localStorage.setItem(key, JSON.stringify(value));

  return value;
}

function VideoCard({
  video,
  setRate,
  rate,
  bv,
}: {
  bv: string;
  video: VideoParseResult;
  setRate: (rates: VideoCategories) => void;
  rate: VideoCategories;
}) {
  function removeVideo() {
    setRate(set(removeFromCategory(rate, bv)));
  }

  return (
    <div className="overflow-hidden border h-full w-50 rounded-sm hover:[&>button]:visible">
      <Button isIconOnly className="fixed invisible mr-0" onPress={removeVideo}>
        X
      </Button>
      <Tooltip>
        <a className="h-full" href={video.url} rel="noreferrer" target="_blank">
          <div className="overflow-hidden ">
            <img alt={video.title} src={video.image} />
            <span className="text-sm p-1">{video.title}</span>
          </div>
        </a>
      </Tooltip>
    </div>
  );
}

function Rating({
  title,
  videos,
  setRate,
  rate,
}: {
  title: string;
  videos: { [bv: string]: VideoParseResult };
  setRate: (rates: VideoCategories) => void;
  rate: VideoCategories;
}) {
  return (
    <div className="min-h-30 h-40 flex flex-row justify-start align-middle items-center border">
      <div className={clsx("w-40 max-w-40 h-full text-black", color[title])}>
        <div className="w-full border h-full flex justify-center align-middle items-center text-2xl">
          {title}
        </div>
      </div>
      <div className="h-full w-full">
        {Object.entries(videos).map(([bv, video]) => (
          <VideoCard
            key={bv}
            bv={bv}
            rate={rate}
            setRate={setRate}
            video={video}
          />
        ))}
      </div>
    </div>
  );
}

export default function VideoRating() {
  const [rate, setRate] = useState<VideoCategories>(null!);
  const [bv, setBv] = useState<string>("");
  const [category, setCategory] = useState<string>("人上人");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!rate) setRate(get());
  });

  async function handleAdd() {
    setLoading(true);
    if (!bv.startsWith("BV")) {
      addToast({
        title: "请输入正确的BV号",
        description: "例如 BV1gyBQBZEFs",
        timeout: 2000,
        color: "warning",
      });

      setLoading(false);

      return;
    }
    const info = await getVideoInfo(bv);

    setRate(set(setBvToCategory(rate, category, bv, info)));
    setLoading(false);
  }

  return (
    <DefaultLayout>
      <div className="w-full p-4">
        <div className="w-full flex justify-center pb-4">
          <div className="flex justify-center items-start align-baseline w-1/2 gap-2">
            <Input
              className="w-60"
              placeholder="输入BV号"
              value={bv}
              onValueChange={setBv}
            />
            <Select
              className="max-w-32"
              items={Object.keys(color).map((key) => ({ key, label: key }))}
              selectedKeys={new Set([category])}
              selectionMode="single"
              onSelectionChange={([item]) =>
                setCategory(`${item || category || "人上人"}`)
              }
            >
              {(category) => <SelectItem>{category.label}</SelectItem>}
            </Select>
            <Button
              color="primary"
              disabled={loading}
              isLoading={loading}
              onPress={handleAdd}
            >
              添加
            </Button>
            {/* <Button>导出HTML</Button> */}
          </div>
        </div>
        <div className="w-full">
          {rate ? (
            Object.entries(rate).map(([title, videos]) => (
              <Rating
                key={title}
                rate={rate}
                setRate={setRate}
                title={title}
                videos={videos}
              />
            ))
          ) : (
            <div>Loading...</div>
          )}
        </div>
      </div>
    </DefaultLayout>
  );
}
