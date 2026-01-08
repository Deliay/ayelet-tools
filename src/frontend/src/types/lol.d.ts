declare module lol {
  export interface Hero {
    heroId: string;
    name: string;
    alias: string;
    title: string;
    roles: string[];
    isWeekFree: string;
    attack: string;
    defense: string;
    magic: string;
    difficulty: string;
    selectAudio: string;
    banAudio: string;
    isARAMweekfree: string;
    ispermanentweekfree: string;
    changeLabel: string;
    goldPrice: string;
    couponPrice: string;
    camp: string;
    campId: string;
    keywords: string;
    instance_id: string;
  }
  export interface HeroList {
    fileName: string;
    fileTime: string;
    hero: Array<Hero>;
    version: string;
  }
  export type HeroMap = Record<string, Hero>;
  export interface WeeklyFreeHero {
    fightHero: string;
    foreverFreeHero: string;
    freeHero: string;
    newBulle: {
      freeNum: string;
      iDate: string;
      version: string;
    };
  }
  export type WeeklyFreeHeroList = Record<string, WeeklyFreeHero>;
}

declare module globalThis {
  interface Window {
    ZMSubject_Board_Site_List: lol.WeeklyFreeHeroList;
  }
}
