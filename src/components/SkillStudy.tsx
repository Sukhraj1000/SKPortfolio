import type { ReactNode } from "react";
import type { SkillGroupId } from "@/data/portfolio";
import styles from "./SkillsSection.module.css";

// Each study depicts an action in its discipline. Ink and moving parts start
// in their finished positions; only an in-view, motion-enabled visit animates them.
function Ink({ d, later = false }: { d: string; later?: boolean }) {
  return <path d={d} pathLength="1" data-ink data-later={later || undefined} />;
}

function Block({ x, joining = false }: { x: number; joining?: boolean }) {
  return (
    <g transform={`translate(${x} 0)`}>
      <g data-join={joining || undefined}>
        <path d="m0 29 15-8 15 8v20l-15 8-15-8z" fill="var(--pq-night)" />
        <path d="m0 29 15 8 15-8m-15 8v20" />
      </g>
    </g>
  );
}

const studies: Record<SkillGroupId, ReactNode> = {
  languages: (
    <>
      <path data-guide d="M12 12h136M12 64h136M82 20v36" />
      <path strokeWidth="3.5" d="m30 26-13 12 13 12m25-24 13 12-13 12m-7-30-9 36" />
      <g strokeWidth="3">
        <Ink d="M94 25h16m6 0h20M94 37h34" />
        <Ink d="M101 49h15m6 0h15" later />
      </g>
    </>
  ),
  "application-engineering": (
    <>
      <g data-guide>
        <path d="m16 48 54-25 72 17-55 26z" />
        <path d="m16 58 54-25 72 17-55 26z" />
      </g>
      <g data-layer>
        <path d="m16 32 54-25 72 17-55 26z" fill="var(--pq-night)" />
        <path d="m24 31 64 15" data-guide />
        <Ink d="m46 28 29-13 33 8" />
      </g>
      <g data-pin>
        <circle cx="120" cy="44" r="3" fill="currentColor" />
        <circle cx="119" cy="54" r="2" fill="currentColor" />
      </g>
    </>
  ),
  "ai-automation": (
    <>
      <g data-guide>
        <path d="M23 37h17l18-22h20m-38 22 18 23h20m21-45 17 22h20m-37 23 17-23" />
      </g>
      <g>
        <Ink d="M23 37h17l18-22h20" />
        <Ink later d="M99 15l17 22h20" />
      </g>
      <path d="m15 30 7 7-7 7-7-7zm70-22 7 7-7 7-7-7zm0 45 7 7-7 7-7-7z" fill="var(--pq-night)" />
      <circle cx="142" cy="37" r="7" />
      <circle data-pin cx="142" cy="37" r="2.7" fill="currentColor" />
    </>
  ),
  "backend-data": (
    <>
      <g data-guide>
        <path d="M15 11v49h131M15 43h126M15 26h126" />
      </g>
      <g fill="currentColor" stroke="none" opacity=".62">
        <rect data-bar x="27" y="39" width="10" height="20" />
        <rect data-bar x="48" y="31" width="10" height="28" />
        <rect data-bar x="69" y="37" width="10" height="22" />
        <rect data-bar x="90" y="23" width="10" height="36" />
        <rect data-bar x="111" y="18" width="10" height="41" />
      </g>
      <Ink d="m22 33 27-11 24 5 23-13 33-4" />
      <circle data-pin cx="129" cy="10" r="3" fill="currentColor" />
    </>
  ),
  "cloud-delivery": (
    <>
      <path data-guide d="M18 52h56l14-14h23M23 61h45" />
      <path d="m13 26 14-8 15 8v16l-15 8-14-8zm0 0 14 8 15-8m-15 8v16" />
      <path d="M99 49h31a12 12 0 0 0 1-24 19 19 0 0 0-36-3 14 14 0 0 0-2 27h6z" />
      <Ink d="M45 39h24l9-9h13" />
      <path data-packet d="m108 31 5-5 5 5-5 5z" fill="currentColor" />
    </>
  ),
  "testing-quality": (
    <>
      <path data-guide d="M15 36h20m20 0h23m21 0h22M15 58h127" />
      {[41, 83, 126].map((x, i) => (
        <g key={x} transform={`translate(${x} 36)`}>
          <circle r="15" />
          <path data-ink data-step={i} pathLength="1" strokeWidth="3" d="m-7 0 5 5 10-11" />
        </g>
      ))}
    </>
  ),
  "emerging-technology": (
    <>
      <path data-guide d="M9 64h140" />
      <Ink d="M41 39h21m28 0h22" />
      <Block x={12} />
      <Block x={61} />
      <Block x={110} joining />
    </>
  ),
  "vision-hardware": (
    <>
      <g data-guide>
        <path d="M11 13h89v49H11zM110 25h18l8-8h12m-38 32h18l8 8h12M110 37h34" />
      </g>
      <g data-reticle>
        <path d="M36 25v-7h12m19 0h12v7m0 22v8H67m-19 0H36v-8" />
        <circle cx="57.5" cy="36.5" r="8" />
        <circle cx="57.5" cy="36.5" r="2" fill="currentColor" />
      </g>
      <path data-scan d="M89 18v39" strokeWidth="2.5" />
      <circle data-pin cx="145" cy="37" r="3" fill="currentColor" />
    </>
  ),
};

export function SkillStudy({ kind }: { kind: SkillGroupId }) {
  return (
    <svg
      className={styles.figure}
      data-skill-art
      viewBox="0 0 160 80"
      width="160"
      height="80"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      focusable="false"
    >
      {studies[kind]}
    </svg>
  );
}
