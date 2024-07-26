import React, { useEffect, useState } from "react";

export function Button({
  className = '',
  label = '',
  onClick,
}: {
  className?: string;
  onClick?: (arg?: any) => void;
  label: string | React.ReactNode;
}) {
  return (
    <button
      className={className}
      onClick={onClick}
    >
      {label}
    </button>
  );
}
