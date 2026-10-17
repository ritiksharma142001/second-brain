import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { forbidden, jsonError, parseBody, prismaErrorResponse, unauthorized } from "@/lib/api";
import { categoryBodySchema } from "@/lib/validations/taxonomy";

export async function GET() {
  try {
    const categories = await prisma.category.findMany({
      include: {
        _count: {
          select: {
            posts: true,
          },
        },
      },
      orderBy: {
        name: "asc",
      },
    });

    return NextResponse.json(categories);
  } catch (error) {
    console.error("Error fetching categories:", error);
    return NextResponse.json(
      { error: "Failed to fetch categories" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession();
    if (!session?.user) return unauthorized();
    if (session.user.role !== "ADMIN") return forbidden();

    const body = await parseBody(request, categoryBodySchema);
    if ("error" in body) return body.error;
    const { name, slug, description } = body.data;

    const category = await prisma.category.create({
      data: {
        name,
        slug,
        description: description || null,
      },
    });

    return NextResponse.json(category, { status: 201 });
  } catch (error) {
    console.error("Error creating category:", error);
    const known = prismaErrorResponse(error);
    if (known) return known;
    return NextResponse.json(
      { error: "Failed to create category" },
      { status: 500 }
    );
  }
}
