import { TeamMember } from "../../types/TeamSpace";

export interface TeamSpaceDetail {
  id:           string;
  name:         string;
  description:  string | null;
  repoFullName: string;
  ownerId:      string;
  inviteCode:   string;
  myRole:       string;
  myMembership: TeamMember;
  members:      TeamMember[];
}