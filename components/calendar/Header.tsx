import React from "react";

export interface HeaderProps {
  goToToday: () => void;
  moveWeek: (amount: number) => void;
  headerTitle: string;
}

const Header: React.FC<HeaderProps> = ({ goToToday, moveWeek, headerTitle }) => (
  <header className="border-b border-[#e0e0e0] bg-[#f1f3f4]">
    <div className="mx-auto flex h-18 max-w-400 items-center gap-4 px-3 md:px-6">
      <div className="hidden items-center gap-3 rounded-full bg-white px-3 py-2 shadow-sm md:flex">
        <div className="h-8 w-8 rounded-full bg-[#d1d5db]" />
        <span className="text-sm font-medium">Ngo The Hieu</span>
      </div>
      <button
        type="button"
        onClick={goToToday}
        className="rounded-full border border-[#b6b6b6] px-5 py-2 text-sm font-semibold hover:bg-white"
      >
        Hom nay
      </button>
      <button type="button" onClick={() => moveWeek(-1)} className="text-xl text-[#5f6368]">
        &#8249;
      </button>
      <button type="button" onClick={() => moveWeek(1)} className="text-xl text-[#5f6368]">
        &#8250;
      </button>
      <h1 className="ml-1 text-lg font-semibold md:text-[2rem]">{headerTitle}</h1>
      <div className="ml-auto flex items-center gap-3 text-[#5f6368]">
        <span className="text-lg">&#9906;</span>
        <span className="text-lg">?</span>
        <span className="text-lg">&#9881;</span>
      </div>
    </div>
  </header>
);

export default Header;
