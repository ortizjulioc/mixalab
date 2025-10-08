import Image from "next/image";
import Link from "next/link";
import React from "react";

export default function Logo({ src = "/mixaLabLogo.png", alt = "MixaLab Logo", text = "MixaLab", href = "/" }) {
  return (
    <Link href={href} className="flex items-center gap-1 flex-shrink-0">
      <Image
        src={src}
        alt={alt}
        width={38}
        height={38}
        priority
        className="flex-shrink-0"
      />
     
    </Link>
  );
}