import Project from "../models/Project.js";
import { getOrCreateDefaultProject } from "../utils/projectContext.js";

export const getProjects = async (_req, res) => {
  await getOrCreateDefaultProject();

  const projects = await Project.find().sort({ createdAt: 1 });
  res.json(projects);
};

export const createProject = async (req, res) => {
  const { name, description, status } = req.body;

  const project = await Project.create({
    name,
    description,
    status
  });

  res.status(201).json(project);
};
