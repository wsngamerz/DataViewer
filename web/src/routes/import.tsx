import {createFileRoute, Link} from '@tanstack/react-router'
import {useMutation, useQuery, useQueryClient} from '@tanstack/react-query'
import {type FormEventHandler, useEffect, useRef, useState} from 'react'
import {
    getApiFacebookImportsByIdOptions,
    getApiFacebookImportsQueryKey,
    postApiFacebookImportsMutation
} from '../client/@tanstack/react-query.gen'
import {Button} from '../components/ui/button'

export const Route = createFileRoute('/import')({
    component: RouteComponent,
})

function RouteComponent() {
    const [file, setFile] = useState<File | null>(null)
    const [name, setName] = useState('')
    const [message, setMessage] = useState<string | null>(null)
    const [error, setError] = useState<string | null>(null)
    const [importId, setImportId] = useState<string | null>(null)
    const [importStatus, setImportStatus] = useState<string | null>(null)
    const inputRef = useRef<HTMLInputElement | null>(null)
    const queryClient = useQueryClient()

    const mutation = useMutation(
        postApiFacebookImportsMutation(),
    )

    const {data: importStatusData} = useQuery({
        ...getApiFacebookImportsByIdOptions({path: {id: importId || ''}}),
        enabled: !!importId,
        refetchInterval: importId ? 500 : false as false,
    })

    // Watch for status changes and update state
    useEffect(() => {
        const status = importStatusData?.import?.status
        if (status) {
            setImportStatus(status)
            if (status === 'completed' || status === 'failed') {
                setImportId(null)
            }
        }
    }, [importStatusData])

    const onSubmit: FormEventHandler<HTMLFormElement> = async (e) => {
        e.preventDefault()
        setMessage(null)
        setError(null)
        setImportStatus(null)
        setImportId(null)
        if (!file) {
            setError('Please choose an archive file to upload')
            return
        }
        const usedName = name || file.name
        try {
            const result = await mutation.mutateAsync({
                body: {
                    file,
                    name: usedName,
                },
            })
            // Get import ID from response
            const newImportId = result?.import?.id
            if (newImportId) {
                setImportId(newImportId)
                setImportStatus(result.import.status)
            }
            setMessage('Upload complete! Your archive was submitted for import.')
            setName('')
            setFile(null)
            if (inputRef.current) inputRef.current.value = ''
            await queryClient.invalidateQueries({queryKey: getApiFacebookImportsQueryKey()})
        } catch (err: any) {
            setError(err?.message ?? 'Upload failed')
        }
    }

    const isUploading = mutation.isPending

    return (
        <div className="p-6 max-w-2xl mx-auto">
            <h2 className="text-2xl font-semibold mb-4">Import Facebook Archive</h2>
            <p className="text-sm text-gray-500 mb-6">
                Choose your exported Facebook archive (.zip) and upload it for processing.
            </p>

            <form onSubmit={onSubmit} className="space-y-4">
                <div>
                    <label className="block text-sm font-medium mb-1" htmlFor="archive">
                        Archive file
                    </label>
                    <input
                        id="archive"
                        name="archive"
                        ref={inputRef}
                        type="file"
                        accept=".zip,.tar,.tar.gz,.tgz,.7z"
                        onChange={(e) => {
                            const f = e.target.files?.[0] ?? null
                            setFile(f)
                            if (f && !name) setName(f.name)
                        }}
                        className="block w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-cyan-500"
                        disabled={isUploading}
                    />
                </div>

                <div>
                    <label className="block text-sm font-medium mb-1" htmlFor="name">
                        Import name (optional)
                    </label>
                    <input
                        id="name"
                        name="name"
                        type="text"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        placeholder="My Facebook Export"
                        className="block w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-cyan-500"
                        disabled={isUploading}
                    />
                </div>

                <div className="flex items-center gap-3">
                    <Button type="submit" disabled={isUploading || !file}>
                        {isUploading ? (
                            <>
                                <span
                                    className="inline-block size-4 rounded-full border-2 border-cyan-500 border-t-transparent animate-spin"/>
                                Uploading...
                            </>
                        ) : (
                            'Upload'
                        )}
                    </Button>

                    {!isUploading && (
                        <Link to="/chats" className="text-sm text-cyan-700 hover:underline">
                            Go to Chats
                        </Link>
                    )}
                </div>

                {isUploading && (
                    <div className="mt-2 flex items-center gap-2 text-sm text-gray-600">
                        <span
                            className="inline-block h-1 w-24 bg-gradient-to-r from-cyan-400 to-cyan-600 animate-pulse rounded"/>
                        Upload in progress. Please wait...
                    </div>
                )}

                {message && (
                    <div className="text-green-700 bg-green-50 border border-green-200 rounded p-3 text-sm">
                        {message}
                    </div>
                )}
                {error && (
                    <div className="text-red-700 bg-red-50 border border-red-200 rounded p-3 text-sm">
                        {error}
                    </div>
                )}
            </form>

            {importStatus && (
                <div
                    className="mt-4 text-sm text-blue-700 bg-blue-50 border border-blue-200 rounded p-3 flex items-center gap-2">
                    <b>Import status:</b> {importStatus}
                    {importStatus !== 'completed' && importStatus !== 'failed' && (
                        <span
                            className="inline-block size-4 rounded-full border-2 border-cyan-500 border-t-transparent animate-spin ml-2"/>
                    )}
                </div>
            )}

            {mutation.isSuccess && (
                <div className="mt-6 text-sm text-gray-600 flex gap-1">
                    You can monitor processed data under
                    <Link to="/chats" className="text-cyan-700 hover:underline">Chats</Link>
                    once available.
                </div>
            )}
        </div>
    )
}
