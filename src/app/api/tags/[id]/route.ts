import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { forbidden, jsonError, parseBody, prismaErrorResponse, unauthorized } from "@/lib/api";
import { tagBodySchema } from "@/lib/validations/taxonomy";

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession();
    if (!session?.user) return unauthorized();
    if (session.user.role !== "ADMIN") return forbidden();

    const body = await parseBody(request, tagBodySchema);
    if ("error" in body) return body.error;
    const { name, slug } = body.data;

    const { id } = await params;
    const tag = await prisma.tag.update({
      where: { id },
      data: {
        name,
        slug,
      },
    });

    return NextResponse.json(tag);
  } catch (error) {
    console.error("Error updating tag:", error);
    const known = prismaErrorResponse(error);
    if (known) return known;
    return NextResponse.json(
      { error: "Failed to update tag" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession();
    if (!session?.user) return unauthorized();
    if (session.user.role !== "ADMIN") return forbidden();

    const { id } = await params;
    await prisma.tag.delete({
      where: { id },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting tag:", error);
    const known = prismaErrorResponse(error);
    if (known) return known;
    return NextResponse.json(
      { error: "Failed to delete tag" },
      { status: 500 }
    );
  }
}
