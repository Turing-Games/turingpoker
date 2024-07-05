import React, { useEffect, useState } from "react";
import "@static/styles/collapse.css";

export default function Sidebar({ items = [] }: {
  items: any[];
}) {
  return (
    <div className="border border-black rounded-lg">
      {
        items.map((item) => {
          return (
            <div className="px-[12px] py-[8px]">
              {item.name}
            </div>
          )
        })
      }
    </div>
  );
}