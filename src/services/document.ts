import {
  createDocument,
  deleteDocument,
  updateDocument,
} from "@/dal/documents/mutations";
import { AuthorizationError } from "@/lib/errors";
import { getCurrentUser } from "@/lib/session";
import { DocumentFormValues, documentSchema } from "@/schemas/documents";

export async function createDocumentService(
  projectId: string,
  data: DocumentFormValues,
) {
  const user = await getCurrentUser();
  if (user == null) throw new Error("Unauthenticated");

  //   PERMISSION:
  if (user.role !== "author" && user.role !== "admin") {
    return new AuthorizationError();
  }

  const result = documentSchema.safeParse(data);
  if (!result.success) throw new Error("Invalid data");

  return createDocument({
    ...result.data,
    projectId,
    creatorId: user.id,
    lastEditedById: user.id,
  });
}

export async function updateDocumentService(
  documentId: string,
  data: DocumentFormValues,
) {
  const user = await getCurrentUser();
  if (user == null) throw new Error("Unauthenticated");

  //   PERMISSION:
  if (user.role === "viewer") {
    return new AuthorizationError();
  }

  const result = documentSchema.safeParse(data);
  if (!result.success) throw new Error("Invalid data");

  return updateDocument(documentId, {
    ...result.data,
    lastEditedById: user.id,
  });
}

export async function deleteDocumentService(documentId: string) {
  const user = await getCurrentUser();
  if (user == null) throw new Error("Unauthenticated");

  //   PERMISSION:
  if (user.role !== "admin") {
    return new AuthorizationError();
  }

  return deleteDocument(documentId);
}
