import useSWR from "swr"
import { fetchAcademicData, AcademicData } from "../services/AcademicService"

export function useAcademicData() {
  const { data, isLoading, error, mutate } = useSWR<AcademicData>("academic", fetchAcademicData, {
    fallbackData:      { academicYears: [], studyPrograms: [] },
    revalidateOnFocus: false,
  })

  return {
    academicYears: data!.academicYears,
    studyPrograms: data!.studyPrograms,
    loading:       isLoading,
    error:         error ? "Gagal memuat data akademik" : null,
    refresh:       mutate,
  }
}