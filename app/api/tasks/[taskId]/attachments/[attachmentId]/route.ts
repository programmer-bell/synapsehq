import { Buffer } from "node:buffer";

import { getCurrentUser } from "@/src/modules/auth";
import { getTaskAttachmentForUser } from "@/src/modules/tasks";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ taskId: string; attachmentId: string }> },
) {
  const user = await getCurrentUser();
  if (!user) return new Response("Unauthorized", { status: 401 });

  const { taskId, attachmentId } = await params;
  const attachment = await getTaskAttachmentForUser(
    user.id,
    taskId,
    attachmentId,
  );
  if (!attachment) return new Response("Not found", { status: 404 });

  const safeName = attachment.fileName.replace(/["\\\r\n]/g, "_");
  return new Response(Buffer.from(attachment.data), {
    headers: {
      "Content-Type": attachment.contentType,
      "Content-Length": String(attachment.sizeBytes),
      "Content-Disposition": `attachment; filename="${safeName}"; filename*=UTF-8''${encodeURIComponent(attachment.fileName)}`,
      "Cache-Control": "private, no-store",
      "X-Content-Type-Options": "nosniff",
    },
  });
}
