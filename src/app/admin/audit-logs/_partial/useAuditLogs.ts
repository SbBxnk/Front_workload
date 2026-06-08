import { useState, useCallback, useEffect, useRef } from 'react'
import { useSession } from 'next-auth/react'
import { AuditLogServices } from '@/services/auditLogServices'
import { AuditLog, AuditLogParams } from './types'

interface UseAuditLogsReturn {
    data: AuditLog[]
    loading: boolean
    total: number
    page: number
    rowsPerPage: number
    searchInput: string
    methodFilter: string
    setSearchInput: (val: string) => void
    handleMethodChange: (val: string) => void
    handlePageChange: (newPage: number) => void
    handleRowsPerPageChange: (newLimit: number) => void
}

function updateUrlParams(newParams: Partial<AuditLogParams>): void {
    const urlParams = new URLSearchParams()
    if (newParams.search) urlParams.set('search', newParams.search)
    if (newParams.page) urlParams.set('page', newParams.page.toString())
    if (newParams.limit) urlParams.set('limit', newParams.limit.toString())
    if (newParams.method) urlParams.set('method', newParams.method)
    window.history.replaceState({}, '', `?${urlParams.toString()}`)
}

export function useAuditLogs(): UseAuditLogsReturn {
    const { data: session } = useSession()

    const [data, setData] = useState<AuditLog[]>([])
    const [loading, setLoading] = useState(false)
    const [total, setTotal] = useState(0)
    const [page, setPage] = useState(0)
    const [rowsPerPage, setRowsPerPage] = useState(10)
    const [searchInput, setSearchInput] = useState('')
    const [methodFilter, setMethodFilter] = useState('')
    const [params, setParams] = useState<AuditLogParams>({
        search: '',
        page: 1,
        limit: 10,
        method: '',
    })

    const isFirstRender = useRef(true)

    // Read URL params on mount
    useEffect(() => {
        const urlParams = new URLSearchParams(window.location.search)
        const searchFromUrl = urlParams.get('search') || ''
        const pageFromUrl = parseInt(urlParams.get('page') || '1', 10)
        const limitFromUrl = parseInt(urlParams.get('limit') || '10', 10)
        const methodFromUrl = urlParams.get('method') || ''

        setSearchInput(searchFromUrl)
        setMethodFilter(methodFromUrl)
        setParams({
            search: searchFromUrl,
            page: pageFromUrl,
            limit: limitFromUrl,
            method: methodFromUrl,
        })
    }, [])

    const fetchLogs = useCallback(
        async (search: string, fetchPage: number, limit: number, method: string) => {
            if (!session?.accessToken) return

            setLoading(true)
            setData([])
            try {
                const res = await AuditLogServices.getAllLogs({ search, page: fetchPage, limit, method })

                if (res.success) {
                    if (res.meta) {
                        setTotal(res.meta.total_rows)
                        setPage(res.meta.page - 1)
                        setRowsPerPage(res.meta.limit)
                    }
                    setData(res.payload || [])
                } else {
                    setData([])
                    setTotal(0)
                }
            } catch (error) {
                console.error('Error fetching logs:', error)
                setData([])
                setTotal(0)
            } finally {
                setLoading(false)
                updateUrlParams({ search, page: fetchPage, limit, method })
            }
        },
        [session?.accessToken]
    )

    // Debounce search — 500ms, reset page to 1
    useEffect(() => {
        if (isFirstRender.current) {
            isFirstRender.current = false
            return
        }

        const timer = setTimeout(() => {
            setParams((prev) => ({ ...prev, search: searchInput.trim(), page: 1 }))
        }, 500)
        return () => clearTimeout(timer)
    }, [searchInput])

    // Trigger fetch when params or token changes
    useEffect(() => {
        if (session?.accessToken) {
            fetchLogs(params.search, params.page, params.limit, params.method)
        }
    }, [params.search, params.page, params.limit, params.method, session?.accessToken, fetchLogs])

    const handleMethodChange = (val: string) => {
        setMethodFilter(val)
        setParams((prev) => ({ ...prev, method: val, page: 1 }))
    }

    const handlePageChange = (newPage: number) => {
        setPage(newPage)
        setParams((prev) => ({ ...prev, page: newPage + 1 }))
    }

    const handleRowsPerPageChange = (newLimit: number) => {
        setRowsPerPage(newLimit)
        setParams((prev) => ({ ...prev, limit: newLimit, page: 1 }))
    }

    return {
        data,
        loading,
        total,
        page,
        rowsPerPage,
        searchInput,
        methodFilter,
        setSearchInput,
        handleMethodChange,
        handlePageChange,
        handleRowsPerPageChange,
    }
}
