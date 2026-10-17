import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { jsonError, parseBody, unauthorized } from "@/lib/api";
import { profileBodySchema } from "@/lib/validations/taxonomy";

export async function PATCH(request: NextRequest) {
  try {
    const session = await getServerSession();
    if (!session?.user?.id) return unauthorized();

    const body = await parseBody(request, profileBodySchema);
    if ("error" in body) return body.error;

    const user = await prisma.user.update({
      where: { id: session.user.id },
      data: {
        name: body.data.name,
        // Only touch bio/image when the client sent them.
        ...(body.data.bio !== undefined && { bio: body.data.bio || null }),
        ...(body.data.image !== undefined && { image: body.data.image }),
      },
      select: { id: true, name: true, email: true, image: true, bio: true },
    });

    return NextResponse.json(user);
  } catch (error) {
    console.error("Error updating profile:", error);
    return jsonError("Failed to update profile", 500);
  }
}
