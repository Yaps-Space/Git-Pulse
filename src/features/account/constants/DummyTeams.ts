export const DUMMY_TEAMS = [
  { id: "1", name: "Proyek Tugas Akhir", role: "owner",       memberCount: 4 },
  { id: "2", name: "Tim Capstone 2026",  role: "evaluator",   memberCount: 6 },
  { id: "3", name: "Kelompok Praktikum", role: "contributor", memberCount: 3 },
  { id: "4", name: "Proyek Tugas Akhir", role: "contributor", memberCount: 4 },
];

export const ROLE_CONFIG = {
  owner:       { label: "Owner",       bg: "#6265FE", text: "#000000", dot: "#000000" },
  evaluator:   { label: "Evaluator",   bg: "#B6BBFF", text: "#000000", dot:"#000000" },
  contributor: { label: "Contributor", bg: "#BEF3DF", text: "#000000", dot: "#000000" },
} as const;