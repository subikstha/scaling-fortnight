import { getAllProjects } from "@/dal/projects/queries";
import { Document, Project, ProjectTable, User } from "@/drizzle/schema";
import { eq, isNull, or } from "drizzle-orm";

function getUserPermissions(user: Pick<User, "department" | "role">) {
  const builder = new PermissionBuilder();

  const role = user.role;
  switch (role) {
    case "admin":
      addAdminPermissions(builder);
    case "editor":
      addEditorPermissions(builder, user);
    default:
      throw new Error(`Unhandled role: ${role satisfies never}`);
  }
}

function addAdminPermissions(builder: PermissionBuilder) {
  builder
    .allow("document", "read")
    .allow("document", "create")
    .allow("document", "update")
    .allow("document", "delete")
    .allow("project", "read")
    .allow("project", "create")
    .allow("project", "update")
    .allow("project", "delete");
}

async function addEditorPermissions(
  builder: PermissionBuilder,
  user: Pick<User, "department">,
) {
  builder
    .allow("project", "read", { department: user.department })
    .allow("project", "read", { department: null });

  const projects = await getDepartmentProjects(user.department);

  projects.forEach((project) => {
    builder
      .allow("document", "read", { projectId: project.id })
      .allow("document", "update", { projectId: project.id, isLocked: false });
  });
}

function getDepartmentProjects(department: string) {
  return getAllProjects(
    { ordered: false },
    or(
      eq(ProjectTable.department, department),
      isNull(ProjectTable.department),
    ),
  );
}

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

class PermissionBuilder {
  #permissions: PermissionStore = {
    document: [],
    project: [],
  };

  allow<Res extends keyof Resources>(
    resource: Res,
    action: Permission<Res>["action"],
    condition?: Permission<Res>["condition"],
  ) {
    this.#permissions[resource].push({ action, condition });
    return this; // returning this allows to chain the allow() calls together
  }
}

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
