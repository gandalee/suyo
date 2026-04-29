"use client";

import Image from "next/image";
import { useState } from "react";

interface Props {
  name: string;
  photoUrl?: string | null;
  size?: number;
}

export default function CandidateAvatar({ name, photoUrl, size = 48 }: Props) {
  const [imgError, setImgError] = useState(false);
  const initial = name?.[0] ?? "?";

  if (photoUrl && !imgError) {
    return (
      <Image
        src={photoUrl}
        alt={name}
        width={size}
        height={size}
        onError={() => setImgError(true)}
        style={{
          width: size,
          height: size,
          borderRadius: "50%",
          objectFit: "cover",
          flexShrink: 0,
          background: "var(--line2)",
        }}
      />
    );
  }

  return (
    <div
      style={{
        width: size,
        height: size,
        borderRadius: "50%",
        background: "var(--line2)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        flexShrink: 0,
        fontSize: size * 0.4,
        fontWeight: 700,
        color: "var(--ink2)",
      }}
    >
      {initial}
    </div>
  );
}
