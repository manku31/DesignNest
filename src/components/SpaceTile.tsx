import { Armchair, BedDouble, CookingPot, Plus } from "lucide-react";
import { Link } from "react-router-dom";
import type { Room } from "../data/mockData";

export default function SpaceTile({
  room,
  onAdd,
}: {
  room?: Room;
  onAdd?: () => void;
}) {
  if (!room)
    return (
      <button onClick={onAdd} className="space-tile space-add active:scale-95">
        <span>
          <Plus size={25} strokeWidth={1.4} />
        </span>
        <small>Add Space</small>
      </button>
    );
  const Icon =
    room.type === "Bedroom"
      ? BedDouble
      : room.type === "Kitchen"
        ? CookingPot
        : Armchair;
  return (
    <Link to={`/room/${room.id}`} className="space-tile active:scale-95">
      <span>
        <Icon size={26} strokeWidth={1.4} />
      </span>
      <small>{room.name}</small>
    </Link>
  );
}
