"use client";

import { useState } from "react";

export function ExplainToggle({ title, children }: { title: string; children: React.ReactNode }) {
  const [open, setOpen] = useState(false);
  return <div className="explain-toggle">
    <button type="button" onClick={() => setOpen((value) => !value)} aria-expanded={open}>What does this mean? <span>{open ? "−" : "+"}</span></button>
    {open && <div className="explain-content"><strong>{title}</strong>{children}</div>}
  </div>;
}
