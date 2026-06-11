import { NextResponse } from "next/server";
import {
  getFlashDesignsByStudioId,
  resolveFlashDesignPrice,
} from "@/lib/firestore/flash-designs.server";
import { getStudioBySlug } from "@/lib/firestore/studios.server";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ slug: string }> }
) {
  const { slug } = await params;
  const studio = await getStudioBySlug(slug);

  if (!studio || !studio.flashBookingEnabled) {
    return NextResponse.json({ designs: [], flashUniformPrice: null });
  }

  const designs = await getFlashDesignsByStudioId(studio.studioId, {
    activeOnly: true,
  });

  const publicDesigns = designs.map((design) => ({
    designId: design.designId,
    title: design.title,
    imageUrl: design.imageUrl,
    allowedSizes: design.allowedSizes,
    price: resolveFlashDesignPrice(design, studio.flashUniformPrice),
    usesUniformPrice: design.price === null,
  }));

  return NextResponse.json({
    designs: publicDesigns,
    flashUniformPrice: studio.flashUniformPrice ?? null,
  });
}
