export interface AcademicOption {
  id:    string
  label: string
}

export interface AcademicData {
  academicYears: AcademicOption[]
  studyPrograms: AcademicOption[]
}

export async function fetchAcademicData(): Promise<AcademicData> {
  const res  = await fetch("/api/academic")
  const data = await res.json()
  return {
    academicYears: data.academicYears ?? [],
    studyPrograms: data.studyPrograms ?? [],
  }
}

export async function addAcademicOption(
  type:  "academicYear" | "studyProgram",
  label: string
): Promise<AcademicOption> {
  const res = await fetch("/api/academic", {
    method:  "POST",
    headers: { "Content-Type": "application/json" },
    body:    JSON.stringify({ type, label }),
  })
  return res.json()
}

export async function deleteAcademicOption(
  type: "academicYear" | "studyProgram",
  id:   string
): Promise<void> {
  await fetch(`/api/academic/${id}?type=${type}`, {
    method: "DELETE",
  })
}