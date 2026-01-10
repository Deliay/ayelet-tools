import { DndContext, DragEndEvent } from "@dnd-kit/core";

import RateLine from "./rate-line";

import useRating, { RateItem } from "@/contexts/rating-context";

const colors: Record<string, string> = {
  夯爆了: "bg-[#8f0000]",
  夯: "bg-[#c00000]",
  顶级: "bg-[#ffc000]",
  人上人: "bg-[#ffd24b]",
  NPC: "bg-[#fedf82]",
  拉: "bg-[#aeadad]",
  拉完了: "bg-[#e2e2e2]",
};

export default function RateTable() {
  const { rates, addItem, removeItem } = useRating();

  function handleDrag(ev: DragEndEvent) {
    const bv = ev.active.id as string;

    if (!bv) return;
    if (!ev.over) {
      removeItem(ev.active.data.current as RateItem);

      return;
    }

    const target = ev.over.id as string;

    addItem(ev.active.data.current as RateItem, target);
  }

  return (
    <DndContext onDragEnd={handleDrag}>
      <div className="w-full border border-white/50 in-light:border-black/50 rounded-2xl overflow-hidden">
        {Object.keys(rates).map((category) => (
          <RateLine
            key={category}
            category={category}
            colorClassName={colors[category]}
          />
        ))}
      </div>
    </DndContext>
  );
}
