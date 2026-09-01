import { ImageResponse } from "next/og";

export const size = { width: 64, height: 64 };
export const contentType = "image/png";

export default function Icon() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "#294238",
          color: "#FFF9EC",
          fontFamily: "Georgia, serif",
          fontSize: 27,
          fontWeight: 700,
          letterSpacing: "-2px",
        }}
      >
        B<span style={{ color: "#C98A3E", margin: "0 1px" }}>/</span>X
      </div>
    ),
    size,
  );
}

