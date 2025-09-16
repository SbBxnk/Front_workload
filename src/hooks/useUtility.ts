"use client"

import { useDispatch, useSelector } from "react-redux"
import { useCallback } from "react" 
import type { RootState } from "../stores/index"
import { setBreadcrumbs as setBreadcrumbsAction } from "../stores/features/utility"
import type { Breadcrumb } from "@/Types/breadcrumb"

function useUtility() {
  const dispatch = useDispatch()
  const breadcrumbs = useSelector((state: RootState) => state.utility.breadcrumbs)

  const setBreadcrumbs = useCallback(
    (payload: Breadcrumb[]) => {
      dispatch(setBreadcrumbsAction(payload))
    },
    [dispatch],
  )

  return {
    breadcrumbs,
    setBreadcrumbs, 
  }
}

export default useUtility
