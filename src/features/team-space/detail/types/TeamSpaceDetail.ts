import { TeamMember } from "../../types/TeamSpace"

export interface TeamSpaceDetail {
  id:           string;
  name:         string;
  description:  string | null;
  repoFullName: string;
  ownerId:      string;
  inviteCode:   string;
  createdAt:    number | null;
  myRole:       string;
  myMembership: TeamMember;
  members:      TeamMember[];
  repoCommitsPerMonth: number[];
}