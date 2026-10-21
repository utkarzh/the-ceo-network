import { useId } from "react";
import { C } from "./brand";

type Hair = "short" | "side" | "long" | "bun" | "curly" | "bald" | "scarf";

export interface Look {
  skin: string;
  hair: Hair;
  hairColor: string;
  suit: string;
  bg: string;
  tie?: string;
  glasses?: boolean;
}

/** A varied cast of illustrated business leaders. None of them is a real person. */
export const CAST: Look[] = [
  { skin: "#e0b08d", hair: "short", hairColor: "#2b211b", suit: C.navy800, tie: C.gold500, bg: "#cdd6e6" },
  { skin: "#7a4b2f", hair: "curly", hairColor: "#1f1a17", suit: "#2b2f36", bg: C.gold200 },
  { skin: "#f2d0b5", hair: "long", hairColor: "#b98d58", suit: C.navy600, bg: "#dfe7f2" },
  { skin: "#c68a62", hair: "scarf", hairColor: "#5b6f8c", suit: "#1f4e5a", bg: C.gold100 },
  { skin: "#9a6440", hair: "bald", hairColor: "#1f1a17", suit: C.navy800, tie: "#9d2f45", bg: "#d6e4e0", glasses: true },
  { skin: "#f5d9c3", hair: "bun", hairColor: "#3b2a20", suit: "#6b2737", bg: C.navy100 },
  { skin: "#e8c3a0", hair: "side", hairColor: "#a4a9b0", suit: C.navy700, tie: C.gold400, bg: "#f3e6d0", glasses: true },
  { skin: "#6e452b", hair: "short", hairColor: "#1a1512", suit: C.navy600, tie: C.gold500, bg: "#cfd8e8" },
  { skin: "#d9a57e", hair: "long", hairColor: "#2b211b", suit: C.navy800, bg: "#efe2c8" },
  { skin: "#b97a52", hair: "side", hairColor: "#3b2a20", suit: "#2b2f36", tie: C.navy500, bg: "#e9dccb", glasses: true },
];

const BACK_HAIR: Partial<Record<Hair, string>> = {
  long: "M34 54 C32 28 46 20 60 20 C74 20 88 28 86 54 L88 94 L32 94 Z",
  scarf: "M33 58 C31 30 45 19 60 19 C75 19 89 30 87 58 C87 76 80 90 60 97 C40 90 33 76 33 58 Z",
};

const FRONT_HAIR: Partial<Record<Hair, string>> = {
  short: "M38 52 C35 30 48 25 60 25 C73 25 86 30 82 52 C80 42 74 37 66 36 C58 35 46 38 38 52 Z",
  side: "M38 52 C36 30 50 24 62 25 C76 26 85 34 82 52 C80 44 77 40 72 38 C62 40 50 38 44 34 C41 39 39 45 38 52 Z",
  long: "M39 50 C37 30 50 26 60 26 C72 26 84 32 81 50 C74 40 64 34 54 36 C48 38 42 44 39 50 Z",
  bun: "M39 48 C38 32 49 27 60 27 C71 27 82 32 81 48 C76 39 68 35 60 35 C52 35 44 39 39 48 Z",
  curly: "M38 46 C38 30 50 26 60 26 C70 26 82 30 82 46 C76 38 68 36 60 37 C52 36 44 38 38 46 Z",
  scarf: "M41 46 C46 35 54 32 60 32 C66 32 74 35 79 46 C72 39 66 37 60 37 C54 37 48 39 41 46 Z",
};

/** A flat, friendly portrait bust drawn in a 120×120 circle. */
export function Leader({ look, size, ring = C.gold400, ringWidth = 4 }: { look: Look; size: number; ring?: string | null; ringWidth?: number }) {
  const id = `clip${useId().replace(/[^a-zA-Z0-9]/g, "")}`;
  const { skin, hair, hairColor, suit, bg, tie, glasses } = look;
  const scarf = hair === "scarf";
  const ink = "#1b2233";
  return (
    <svg width={size} height={size} viewBox="0 0 120 120" style={{ display: "block", overflow: "visible" }}>
      <defs>
        <clipPath id={id}>
          <circle cx="60" cy="60" r="60" />
        </clipPath>
      </defs>
      <g clipPath={`url(#${id})`}>
        <rect width="120" height="120" fill={bg} />
        {hair === "curly" && (
          <g fill={hairColor}>
            <circle cx="60" cy="40" r="27" />
            <circle cx="37" cy="50" r="12" />
            <circle cx="83" cy="50" r="12" />
            <circle cx="45" cy="27" r="12" />
            <circle cx="75" cy="27" r="12" />
          </g>
        )}
        {BACK_HAIR[hair] && <path d={BACK_HAIR[hair]} fill={hairColor} />}
        <path d="M8 124 C12 96 34 84 60 84 C86 84 108 96 112 124 Z" fill={scarf ? hairColor : suit} />
        {scarf && <path d="M22 124 C26 104 40 96 60 96 C80 96 94 104 98 124 Z" fill={suit} />}
        {!scarf && (
          <>
            <path d="M48 84 L60 104 L72 84 Z" fill="#f8f6f2" />
            <path d="M48 84 L60 104 L53 122 L40 90 Z" fill="black" opacity="0.16" />
            <path d="M72 84 L60 104 L67 122 L80 90 Z" fill="black" opacity="0.16" />
            {tie && <path d="M57 88 L63 88 L64.5 104 L60 110 L55.5 104 Z" fill={tie} />}
          </>
        )}
        {!scarf && (
          <>
            <rect x="51" y="64" width="18" height="24" rx="6" fill={skin} />
            <rect x="51" y="66" width="18" height="8" fill="black" opacity="0.12" />
            <circle cx="39" cy="55" r="4.5" fill={skin} />
            <circle cx="81" cy="55" r="4.5" fill={skin} />
          </>
        )}
        <ellipse cx="60" cy={scarf ? 55 : 52} rx={scarf ? 17.5 : 21} ry={scarf ? 21 : 24} fill={skin} />
        {hair === "bun" && <circle cx="60" cy="21" r="10" fill={hairColor} />}
        {FRONT_HAIR[hair] && <path d={FRONT_HAIR[hair]} fill={hairColor} />}
        {hair === "bald" && <ellipse cx="52" cy="36" rx="7" ry="3.5" fill="white" opacity="0.18" />}
        <path d="M48 47.5 Q52 45.5 56 47.5" stroke={hair === "bald" ? ink : hairColor} strokeWidth="2" fill="none" strokeLinecap="round" opacity="0.85" />
        <path d="M64 47.5 Q68 45.5 72 47.5" stroke={hair === "bald" ? ink : hairColor} strokeWidth="2" fill="none" strokeLinecap="round" opacity="0.85" />
        <circle cx="52" cy="54" r="2.4" fill={ink} />
        <circle cx="68" cy="54" r="2.4" fill={ink} />
        <circle cx="47" cy="61" r="4" fill="#e07a5f" opacity="0.18" />
        <circle cx="73" cy="61" r="4" fill="#e07a5f" opacity="0.18" />
        <path d="M54 63 Q60 68.5 66 63" stroke="#7a3b2e" strokeWidth="2.2" fill="none" strokeLinecap="round" />
        {glasses && (
          <g stroke={ink} strokeWidth="1.8" fill="white" fillOpacity="0.12">
            <circle cx="52" cy="54" r="6.5" />
            <circle cx="68" cy="54" r="6.5" />
            <path d="M58.5 54 L61.5 54" fill="none" />
          </g>
        )}
      </g>
      {ring && <circle cx="60" cy="60" r={60 - ringWidth / 2} fill="none" stroke={ring} strokeWidth={ringWidth} />}
    </svg>
  );
}
