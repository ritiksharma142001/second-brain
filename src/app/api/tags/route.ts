import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { forbidden, jsonError, parseBody, prismaErrorResponse, unauthorized } from "@/lib/api";
import { tagBodySchema } from "@/lib/validations/taxonomy";

export async function GET() {
  try {
    const tags = await prisma.tag.findMany({
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

    return NextResponse.json(tags);
  } catch (error) {
    console.error("Error fetching tags:", error);
    return NextResponse.json(
      { error: "Failed to fetch tags" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession();
    if (!session?.user) return unauthorized();
    if (session.user.role !== "ADMIN") return forbidden();

    const body = await parseBody(request, tagBodySchema);
    if ("error" in body) return body.error;
    const { name, slug } = body.data;

    const tag = await prisma.tag.create({
      data: {
        name,
        slug,
      },
    });

    return NextResponse.json(tag, { status: 201 });
  } catch (error) {
    console.error("Error creating tag:", error);
    const known = prismaErrorResponse(error);
    if (known) return known;
    return NextResponse.json(
      { error: "Failed to create tag" },
      { status: 500 }
    );
  }
}
