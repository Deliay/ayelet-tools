import React, { useEffect, useState } from "react";
import clsx from "clsx";
import { Button } from "@heroui/button";
import { Navbar, NavbarBrand, NavbarContent } from "@heroui/navbar";

import DefaultLayout from "@/layouts/default";
import { useTitle } from "@/util/title-provider";

const herListUrl =
  "https://game.gtimg.cn/images/lol/act/img/js/heroList/hero_list.js";

async function getFullHeroMap(signal?: AbortSignal) {
  const res = await fetch(herListUrl, { signal });
  const { hero: heroes } = (await res.json()) as lol.HeroList;

  return heroes.reduce(
    (map, hero) => Object.assign(map, { [hero.heroId]: hero }),
    {},
  ) as lol.HeroMap;
}

function getFreeHeroList() {
  const allFreeList = window.ZMSubject_Board_Site_List;

  const freeRound = lastFreeRound(allFreeList);
  const { freeHero, fightHero, foreverFreeHero, newBulle } =
    allFreeList[freeRound];

  return { freeHero, fightHero, foreverFreeHero, newBulle };
}

function lastFreeRound(freeList: lol.WeeklyFreeHeroList) {
  return Object.keys(freeList)
    .map(Number)
    .reduce((curr, max) => Math.max(curr, max), 0);
}

function pickRamdom(list: number[], count: number) {
  const set = new Set(list);
  const picked = [];

  while (picked.length < count && set.size > 0) {
    const arr = [...set];
    const idx = Math.floor(Math.random() * arr.length);
    const item = arr[idx];

    set.delete(item);
    picked.push(item);
  }

  return { remain: [...set], picked: picked };
}

const emptyHeroIds = {
  pickedHeroIds: [] as number[],
  pickedFreeHeroIds: [] as number[],
};

function generateHeroIds(heroMap: lol.HeroMap, selectedHeroIds: number[]) {
  const { freeHero, foreverFreeHero } = getFreeHeroList();
  const normalFreeIds = String(`${freeHero},${foreverFreeHero}`)
    .split(",")
    .map(Number);

  const unavailableAllHeroIds = new Set([...normalFreeIds, ...selectedHeroIds]);
  // calculate remaining hero ids, exclude selected, freeHero from full list
  const availableHeroIds = Object.keys(heroMap)
    .map(Number)
    .filter((id) => !unavailableAllHeroIds.has(id));

  // randomize pick 12 heroes from full list
  const { remain: remainHeroIds, picked: pickedHeroIds } = pickRamdom(
    availableHeroIds,
    12,
  );
  const pickedHeroIdsSet = new Set(pickedHeroIds);

  // pick 3 heroes from free list
  const unavailableFreeHeroIds = new Set([
    ...selectedHeroIds,
    ...pickedHeroIds,
  ]);
  const availableFreeHeroIds = normalFreeIds.filter(
    (id) => !unavailableFreeHeroIds.has(id),
  );
  const { picked: pickedFreeHeroIds } = pickRamdom(availableFreeHeroIds, 3);

  return { pickedHeroIds, pickedFreeHeroIds };
}

function HeroList({
  category,
  heroMap,
  heroIds,
  className,
}: {
  category: string;
  className?: string;
  heroMap: lol.HeroMap;
  heroIds: number[];
}) {
  return (
    <div
      className={clsx(
        "w-full flex flex-col justify-center items-center align-middle pt-4",
        className,
      )}
    >
      <h5 className="text-shadow-purple-500 text-shadow-2xs font-bold scroll-pb-40">
        {category}
      </h5>
      <div className="w-full flex flex-wrap justify-center items-center align-middle gap-4">
        {heroIds
          .map((key) => heroMap[key])
          .map((hero) => (
            <p
              key={hero.alias}
              className="max-w-20 hero animate-appearance-in flex flex-col justify-center items-center align-middle overflow-hidden text-ellipsis whitespace-nowrap"
            >
              <img
                alt="hero"
                className="border-2 w-20 border-white/10"
                src={`https://game.gtimg.cn/images/lol/act/img/champion/${hero.alias}.png`}
              />
              <span>{hero.name}</span>
            </p>
          ))}
      </div>
    </div>
  );
}

function Team({
  name,
  heroMap,
  teamHeroList,
  comment,
  flagClassName,
  borderClassName,
}: {
  comment: string;
  teamHeroList: ReturnType<typeof generateHeroIds>;
  heroMap: lol.HeroMap;
  name: string;
  flagClassName?: string;
  borderClassName?: string;
}) {
  return (
    <div
      className={clsx(
        "w-full border-3 rounded-md rounded-b-none",
        borderClassName,
      )}
    >
      <div
        className={clsx(
          "flex justify-center items-center align-middle h-14 w-full",
          flagClassName,
        )}
      >
        <span className="text-2xl">{name}</span>
        <span className="text-small">{comment}</span>
      </div>
      <div className="w-full flex flex-col gap-4">
        <HeroList
          category="周免池"
          heroIds={teamHeroList.pickedFreeHeroIds}
          heroMap={heroMap}
        />
        <HeroList
          category="全英雄池"
          heroIds={teamHeroList.pickedHeroIds}
          heroMap={heroMap}
        />
      </div>
    </div>
  );
}

function HeroSelection({
  freeHeroList,
}: {
  freeHeroList: lol.WeeklyFreeHeroList;
}) {
  const { title } = useTitle();
  const [heroMap, setHeroMap] = React.useState<lol.HeroMap>({});
  const [teamAHeroIds, setTeamA] = React.useState(emptyHeroIds);
  const [teamBHeroIds, setTeamB] = React.useState(emptyHeroIds);

  function clean() {
    setTeamA(emptyHeroIds);
    setTeamB(emptyHeroIds);
  }
  function refresh(fullMap: lol.HeroMap) {
    const a = generateHeroIds(fullMap, []);
    const b = generateHeroIds(fullMap, [
      ...a.pickedFreeHeroIds,
      ...a.pickedHeroIds,
    ]);

    setTeamA(a);
    setTeamB(b);
  }
  React.useEffect(() => {
    const cts = new AbortController();

    getFullHeroMap(cts.signal).then((fullMap) => {
      setHeroMap(fullMap);
      refresh(fullMap);
    });

    return () => cts.abort();
  }, []);
  const click = React.useCallback(async () => {
    clean();
    refresh(heroMap);
  }, [heroMap]);

  const heroIds = Object.keys(heroMap);

  if (heroIds.length == 0 || !freeHeroList) {
    return <h1>Loading...</h1>;
  }

  const { newBulle } = getFreeHeroList();

  return (
    <div className="w-full p-4 flex flex-col gap-2">
      <Navbar className="w-full [&>header]:max-w-[unset]">
        <NavbarBrand>
          版本{newBulle.version} ({newBulle.iDate}#{newBulle.freeNum}周)
        </NavbarBrand>
        <NavbarContent justify="center">
          <h1 className="text-3xl text-center">
            {title === "玩伊会工具箱" ? (
              <span>
                玩伊会
                <br />
              </span>
            ) : (
              ""
            )}
            大乱斗骰子
          </h1>
        </NavbarContent>
        <NavbarContent justify="end">
          <Button color="primary" onPress={click}>
            刷新
          </Button>
        </NavbarContent>
      </Navbar>
      <div className="w-full flex gap-2 align-middle">
        <Team
          borderClassName="border-blue-600"
          comment=""
          flagClassName="bg-blue-600"
          heroMap={heroMap}
          name="队伍1"
          teamHeroList={teamAHeroIds}
        />
        <Team
          borderClassName="border-rose-600"
          comment=""
          flagClassName="bg-rose-600"
          heroMap={heroMap}
          name="队伍2"
          teamHeroList={teamBHeroIds}
        />
      </div>
    </div>
  );
}

export default function LolDice() {
  const [isFreeHeroLoaded, setFreeHeroLoaded] = useState(false);
  const [freeList, setFreeList] = useState<lol.WeeklyFreeHeroList>(null!);
  const { setPageName } = useTitle();

  useEffect(() => setPageName("大乱斗骰子"));
  useEffect(() => {
    const onload = () => {
      setFreeHeroLoaded(true);
      setFreeList(window.ZMSubject_Board_Site_List);
    };
    let script = document.querySelector<HTMLScriptElement>(
      "script#free-hero-list",
    );

    if (window.ZMSubject_Board_Site_List) {
      onload();
    } else if (script) {
      script.addEventListener("load", onload);

      return () => script?.removeEventListener("load", onload);
    }

    script = document.createElement("script");

    script.addEventListener("load", onload);
    script.id = "free-hero-list";
    script.src =
      "https://lol.qq.com/act/AutoCMS/publish/LOLAct/ZMSubject_Board_Site/ZMSubject_Board_Site.js";
    document.body.appendChild(script);

    return () => script.removeEventListener("load", onload);
  }, []);

  return (
    <DefaultLayout>
      <div>
        {!isFreeHeroLoaded ? (
          <div>加载中...</div>
        ) : (
          <HeroSelection freeHeroList={freeList} />
        )}
      </div>
    </DefaultLayout>
  );
}
