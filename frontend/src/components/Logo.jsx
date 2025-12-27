import React from "react";
import { LOGO_SRC } from "@/config/brand";

export default function Logo({ size = 48, className = "", src }) {
  const imageSrc = src || LOGO_SRC; // default to public/logo.png
  return (
    <img
      src={imageSrc}
      alt="Shop Logo"
      width={size}
      height={size}
      className={`object-contain ${className}`}
      onError={(e) => {
        e.currentTarget.outerHTML = `<div style="font-weight:bold;font-size:${Math.max(
          14,
          size / 3
        )}px">SHOP</div>`;
      }}
    />
  );
}
