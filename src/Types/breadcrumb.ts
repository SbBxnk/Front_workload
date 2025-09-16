export interface Breadcrumb {
  text: string
  path: string
}

export interface UtilityState {
  breadcrumbs: Breadcrumb[]
}

export interface RootState {
  utility: UtilityState
}
