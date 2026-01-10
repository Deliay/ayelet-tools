import { useDroppable } from "@dnd-kit/core";
import clsx from "clsx";

import RateItemCard from "./rate-card";

import useRating from "@/contexts/rating-context";

export default function RateLine({
  category,
  colorClassName,
}: {
  category: string;
  colorClassName: string;
}) {
  const { isOver, setNodeRef } = useDroppable({ id: category });
  const { rates } = useRating();
  const items = rates[category] || [];

  return (
    <div
      ref={setNodeRef}
      className={clsx(
        "grid grid-flow-col justify-start align-middle items-center",
        isOver ? "bg-white/30 in-light:bg-black/30" : "",
      )}
      id={category}
    >
      <div
        className={clsx("h-full max-w-40 min-w-40 text-black", colorClassName)}
      >
        <div className="w-full h-full flex justify-center align-middle items-center text-2xl">
          {category}
        </div>
      </div>
      <div className="w-full flex flex-wrap grow min-h-20 gap-2 p-2">
        {items.map((item) => (
          <RateItemCard key={item.id} item={item} />
        ))}
      </div>
    </div>
  );
}
