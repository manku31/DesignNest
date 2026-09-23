import { useApp } from "../state/AppContext";
import Image from "./Image";

export default function AvatarStack() {
  const {
    content: { members },
  } = useApp();
  return (
    <div className="member-stack">
      <div className="avatars">
        {members.map((member) => (
          <Image key={member.name} src={member.image} alt={member.name} />
        ))}
      </div>
      <span>{members.length} Members</span>
    </div>
  );
}
