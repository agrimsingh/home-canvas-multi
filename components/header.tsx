"use client";

import React, { memo } from "react";

const Header: React.FC = memo(() => {
  return (
    <header className="w-full p-4 text-center">
      <div className="flex items-center justify-center">
        <h1 className="text-6xl md:text-8xl font-extrabold tracking-tight text-zinc-800">
          Home Canvas
        </h1>
      </div>
      <p className="mt-4 text-lg text-zinc-600 max-w-3xl mx-auto">
        Simply upload photos of product and scene, then drag your product onto a
        perfect spot.
        <br />
        Gemini will create a photorealistic composite.
      </p>
    </header>
  );
});

Header.displayName = "Header";

export default Header;
