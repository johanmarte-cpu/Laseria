import { cn } from "@/lib/utils";
import { initials } from "@/lib/utils";

const GRADIENTS = [
  "linear-gradient(135deg, #F3E5E5, #E8D8CC)",
  "linear-gradient(135deg, #E8D8CC, #C9A96E)",
  "linear-gradient(135deg, #F5F0EA, #F3E5E5)",
  "linear-gradient(135deg, #F3E5E5, #F5F0EA)",
];

export function ProfessionalAvatar({
  firstName,
  lastName,
  photoUrl,
  className,
}: {
  firstName: string;
  lastName: string;
  photoUrl?: string | null;
  className?: string;
}) {
  const index = Number(photoUrl) || (firstName.charCodeAt(0) % GRADIENTS.length);
  const gradient = GRADIENTS[index % GRADIENTS.length];

  return (
    <div
      className={cn(
        "flex items-center justify-center rounded-full font-display text-xl text-ink-soft",
        className
      )}
      style={{ background: gradient }}
      aria-hidden="true"
    >
      {initials(firstName, lastName)}
    </div>
  );
}
