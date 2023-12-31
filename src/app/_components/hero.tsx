"use client";

import { Suspense, useEffect, useRef, useState } from "react";

export default function Hero() {
  const [children, setChildren] = useState<Array<JSX.Element>>([]);
  const headingRef = useRef<HTMLDivElement>(null);
  const obsoleteCommands = [
    "npx create-next-app",
    "npm create svelte",
    "django-admin startproject",
    "npm i @remix-run/*",
    "npm create qwik",
    "npm init solid",
    "npx supastarter",
    "shipfa.st",
  ];

  const getObsoleteCommand = () =>
    obsoleteCommands[Math.floor(Math.random() * obsoleteCommands.length)];

  const randomTopPosition = (): number => {
    const top = Math.floor(Math.random() * window.innerHeight);

    const { top: heading_start, bottom: heading_end } =
      headingRef.current!.getBoundingClientRect();

    if (top > 100 && top < heading_start) return top;
    if (top > heading_end && top < window.innerHeight - 100) return top;

    return randomTopPosition();
  };

  const randomLeftPosition = (): number => {
    const left = Math.floor(Math.random() * window.innerWidth);
    if (window.innerWidth <= 640) {
      return window.screen.width / 2;
    }
    if (left > 300 && left < window.innerWidth - 300) return left;
    return randomLeftPosition();
  };

  useEffect(() => {
    const interval = setInterval(() => {
      const newChild = (
        <div
          key={Math.random()}
          className="animate-custom-ping absolute -translate-x-3/4 sm:translate-x-0"
          style={{
            top: randomTopPosition(),
            left: randomLeftPosition(),
          }}
        >
          No more &nbsp;
          <code className="bg-muted relative rounded px-[0.3rem] py-[0.2rem] font-mono text-xs font-semibold sm:text-sm">
            {getObsoleteCommand()}
          </code>
        </div>
      );
      setChildren((prevChildren) => [...prevChildren, newChild]);
    }, 1500);

    return () => clearInterval(interval);
  });

  return (
    <div className="relative flex h-screen items-center justify-center overflow-x-hidden">
      <div ref={headingRef} className="text-center text-7xl">
        1 Project Starter <br />
        To Rule Them All
      </div>
      <Suspense>
        <div className="absolute inset-0">
          {children.map((child) => (
            <div key={child.key}>{child}</div>
          ))}
        </div>
      </Suspense>
    </div>
  );
}
