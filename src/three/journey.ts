// Shared journey constants — deliberately free of three.js imports so the
// 2D shell (AscentApp, WaypointPanel) can use them without pulling the 3D
// graph into the eager bundle.

export type SectionId =
  | 'about'
  | 'skills'
  | 'experience'
  | 'projects'
  | 'github'
  | 'contact';

// Scroll progress t for each section, index-aligned with
// [home, about, skills, experience, projects, github, contact].
export const WAYPOINT_T: Record<string, number> = {
  home: 0,
  about: 0.18,
  skills: 0.34,
  experience: 0.5,
  projects: 0.66,
  github: 0.82,
  contact: 1,
};
