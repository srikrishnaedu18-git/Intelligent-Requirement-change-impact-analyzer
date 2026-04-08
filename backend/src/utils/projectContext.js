import Project from "../models/Project.js";

const DEFAULT_PROJECT_NAME = "Project Alpha";

export const getOrCreateDefaultProject = async () => {
  let project = await Project.findOne({ isDefault: true });

  if (!project) {
    project = await Project.create({
      name: DEFAULT_PROJECT_NAME,
      description: "Default project workspace for SCM data.",
      isDefault: true
    });
  }

  return project;
};

export const resolveProject = async ({ projectId }) => {
  if (projectId) {
    const project = await Project.findById(projectId);

    if (!project) {
      throw new Error("Project not found");
    }

    return project;
  }

  return getOrCreateDefaultProject();
};
