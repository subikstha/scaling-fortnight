import { Document, Project } from "@/drizzle/schema";

type Resources = {
  project: {
    action: "create" | "read" | "update" | "delete";
    condition: Pick<Project, "department">;
  };
  document: {
    action: "create" | "read" | "update" | "delete";
    condition: Pick<
      Document,
      "projectId" | "creatorId" | "status" | "isLocked"
    >;
  };
};

type Permission<Res extends keyof Resources> = {
  action: Resources[Res]["action"];
  condition?: Partial<Resources[Res]["condition"]>; // Partial in TS means we can pass in any subset of our conditions
};

type PermissionStore = {
  [Res in keyof Resources]: Permission<Res>[];
};

/*
The above PermissionStore type lets us do this
const a: PermissionStore = {
    project: [
        {
            action: ...
            condition: ...
        }
    ],
    document: []
}
*/
