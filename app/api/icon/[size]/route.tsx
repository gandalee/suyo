import { ImageResponse } from "next/og";
import { NextRequest } from "next/server";

export const runtime = "edge";

function buildIcon(size: number) {
  const radius = Math.round(size * 0.23);
  const fontSize = Math.round(size * 0.55);

  return new ImageResponse(
    (
      <div
        style={{
          width: size,
          height: size,
          background: "#B9D9A5",
          borderRadius: radius,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <span
          style={{
            fontSize,
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
    { width: size, height: size }
  );
}

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ size: string }> }
) {
  const { size: sizeParam } = await params;
  const size = parseInt(sizeParam, 10);

  if (!size || size < 16 || size > 1024) {
    return new Response("Invalid size", { status: 400 });
  }

  const response = buildIcon(size);
  response.headers.set("Cache-Control", "public, max-age=31536000, immutable");
  return response;
}
