import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { forbidden, jsonError, parseBody, prismaErrorResponse, unauthorized } from "@/lib/api";
import { categoryBodySchema } from "@/lib/validations/taxonomy";

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession();
    if (!session?.user) return unauthorized();
    if (session.user.role !== "ADMIN") return forbidden();

    const body = await parseBody(request, categoryBodySchema);
    if ("error" in body) return body.error;
    const { name, slug, description } = body.data;

    const { id } = await params;
    const category = await prisma.category.update({
      where: { id },
      data: {
        name,
        slug,
        description: description || null,
      },
    });

    return NextResponse.json(category);
  } catch (error) {
    console.error("Error updating category:", error);
    const known = prismaErrorResponse(error);
    if (known) return known;
    return NextResponse.json(
      { error: "Failed to update category" },
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
    await prisma.category.delete({
      where: { id },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting category:", error);
    const known = prismaErrorResponse(error);
    if (known) return known;
    return NextResponse.json(
      { error: "Failed to delete category" },
      { status: 500 }
    );
  }
}
