import type { AssesseeSummary, RoundList } from '@/Types/setAssessor'

export interface UseAssessmentInfoResult {
    // params
    formlistIdParam: string | undefined
    setAssesInfoIdParam: string | undefined
    // session / guard
    accessToken: string | undefined
    isSessionLoading: boolean
    assessorLoading: boolean
    // data
    assesseeInfo: AssesseeSummary | null
    roundInfo: RoundList | null
    // derived display
    assesseeDisplayName: string
    combinedPositionDisplay: string
    workloadGroupDisplay: string
    roundTitle: string
    // selection
    selectedComponent: number | null
    handleComponentClick: (componentNumber: number) => void
    // status
    isLoading: boolean
    error: string | null
}
