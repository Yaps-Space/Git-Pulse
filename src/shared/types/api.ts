export interface Membership {
  id:      string;
  classId: string;
  role:    string;
}

export interface TeamResult {
  id:          string;
  name:        string;
  role:        string;
  memberCount: number;
}