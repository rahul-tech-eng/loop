import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";
import { z } from "zod";
import  Papa  from "papaparse";

// Zod schema to validate each CSV row
const CsvRowSchema = z.object({
  content: z.string().min(1, "Content is required"),
  // After
channel: z.enum(["MANUAL",
     "CSV",
      "APP_STORE", 
      "SUPPORT",
       "NPS",
        "SOCIAL"
    ]),
  customer_label: z.string().optional(),
  created_at: z.string().optional(),
});

export async function POST(req: NextRequest) {
  // 1. Auth check
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // 2. Role check — only ADMIN or ANALYST can ingest
  const user = await db.user.findUnique({
    where: { email: session.user.email! },
  });
  if (!user || user.role === "VIEWER") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  // 3. Get the file from form data
  const formData = await req.formData();
  const file = formData.get("file") as File | null;

  if (!file) {
    return NextResponse.json({ error: "No file uploaded" }, { status: 400 });
  }

  if (!file.name.endsWith(".csv")) {
    return NextResponse.json(
      { error: "File must be a .csv" },
      { status: 400 }
    );
  }

  // 4. Parse CSV
  const text = await file.text();
  const { data: rows, errors: parseErrors } = Papa.parse(text, {
    header: true,
    skipEmptyLines: true,
  });

  if (parseErrors.length > 0) {
    return NextResponse.json(
      { error: "CSV parsing failed", details: parseErrors },
      { status: 400 }
    );
  }

  // 5. Validate each row
  const toInsert: any[] = [];
  const failed: { row: number; reason: string }[] = [];

  (rows as any[]).forEach((row, index) => {
    const result = CsvRowSchema.safeParse(row);
    if (result.success) {
      toInsert.push({
        content: result.data.content,
        channel: result.data.channel,
        customerLabel: result.data.customer_label ?? null,
        createdAt: result.data.created_at
          ? new Date(result.data.created_at)
          : new Date(),
        status: "NEW",
        workspaceId: user.workspaceId,
      });
    } else {
      failed.push({
        row: index + 2, // +2 because row 1 = header
         reason: String(result.error),
      });
    }
  });

  
  let imported = 0;
  if (toInsert.length > 0) {
    const result = await db.feedback.createMany({
      data: toInsert,
      skipDuplicates: true,
    });
    imported = result.count;
  }

  // 7. Return summary
  return NextResponse.json({
    imported,
    failed: failed.length,
    errors: failed,
  });
}