import { ImageResponse } from "next/og";

export const size = { width: 512, height: 512 };
export const contentType = "image/png";

export default function Icon() {
  return new ImageResponse(
    (
      <div
        style={{
          width: 512,
          height: 512,
          background: "#B9D9A5",
          borderRadius: 120,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <span
          style={{
            fontSize: 280,
            fontWeight: 900,
            color: "#2D2D2D",
            lineHeight: 1,
            fontFamily: "sans-serif",
          }}
        >
          수
        </span>
      </div>
    ),
    { ...size }
  );
}
