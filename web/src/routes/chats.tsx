import React from 'react';
import {createFileRoute, Link} from '@tanstack/react-router';
import { useQuery } from '@tanstack/react-query';
import { getApiFacebookChatsOptions } from '@/client/@tanstack/react-query.gen';
import type { ChatDto } from '@/client/types.gen';
import {type ColumnDef, flexRender, getCoreRowModel, useReactTable} from '@tanstack/react-table';

export const Route = createFileRoute('/chats')({
    component: ChatsPage,
});

function ChatsPage() {
    // Fetch chats using the generated TanStack Query client
    const { data, isLoading, error } = useQuery(getApiFacebookChatsOptions());
    const chats: ChatDto[] = data?.chats ?? [];

    // Define columns for the table
    const columns: ColumnDef<ChatDto, any>[] = React.useMemo(
        () => [
            { accessorKey: 'id', header: 'Chat ID', cell: info => <Link to={`/chat/$chatid`} params={{chatid: info.getValue()}}>{info.getValue()}</Link> },
            { accessorKey: 'title', header: 'Title' },
            { accessorKey: 'created_at', header: 'Created At' },
            // Add more columns as needed based on ChatDto
        ],
        []
    );

    // Provide filterFns to satisfy TableOptions
    const table = useReactTable({
        data: chats,
        columns,
        filterFns: {},
        getCoreRowModel: getCoreRowModel(),
    });

    if (isLoading) return <div>Loading...</div>;
    if (error) return <div>Error loading chats</div>;

    return (
        <div>
            <h1>Chats</h1>
            <table>
                <thead>
                {table.getHeaderGroups().map(headerGroup => (
                    <tr key={headerGroup.id}>
                        {headerGroup.headers.map(header => (
                            <th key={header.id}>
                                {flexRender(header.column.columnDef.header, header.getContext())}
                            </th>
                        ))}
                    </tr>
                ))}
                </thead>
                <tbody>
                {table.getRowModel().rows.map(row => (
                    <tr key={row.id}>
                        {row.getVisibleCells().map(cell => (
                            <td key={cell.id}>
                                {flexRender(cell.column.columnDef.cell, cell.getContext())}
                            </td>
                        ))}
                    </tr>
                ))}
                </tbody>
            </table>
        </div>
    );
}
