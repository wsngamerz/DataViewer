import {createFileRoute, Link, Outlet} from '@tanstack/react-router';
import { useQuery } from '@tanstack/react-query';
import { getApiFacebookChatsOptions } from '@/client/@tanstack/react-query.gen';
import type { ChatDto } from '@/client/types.gen';
import { getAvatarColor, getAvatarInitials } from '../lib/utils';

export const Route = createFileRoute('/chats')({
    component: ChatsPage,
});

function ChatsPage() {
    // Fetch chats using the generated TanStack Query client
    const { data, isLoading, error } = useQuery(getApiFacebookChatsOptions());
    const chats: ChatDto[] = data?.chats ?? [];

    if (isLoading) return <div>Loading...</div>;
    if (error) return <div>Error loading chats</div>;

    return (
        <div
            style={{
                display: 'flex',
                height: 'calc(100dvh - 72px)',
                background: '#f7f7f7',
                minHeight: 0,
            }}
        >
            {/* Sidebar */}
            <aside
                style={{
                    width: 300,
                    minWidth: 220,
                    maxWidth: 340,
                    background: '#fff',
                    borderRight: '1px solid #e0e0e0',
                    padding: '2rem 1rem',
                    boxShadow: '2px 0 8px rgba(0,0,0,0.03)',
                    display: 'flex',
                    flexDirection: 'column',
                    overflowY: 'auto',
                    height: '100%',
                    minHeight: 0,
                }}
            >
                <h1 style={{ marginBottom: '1.5rem', fontSize: '1.3rem' }}>Chats</h1>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                    {chats.length === 0 && <div>No chats found.</div>}
                    {chats.map(chat => (
                        <Link
                            key={chat.id}
                            to="/chats/$chatid"
                            params={{ chatid: chat.id }}
                            style={{
                                display: 'flex',
                                alignItems: 'center',
                                gap: '1rem',
                                padding: '0.75rem 1rem',
                                borderRadius: 8,
                                border: '1px solid #e0e0e0',
                                background: '#fff',
                                textDecoration: 'none',
                                color: 'inherit',
                                boxShadow: '0 1px 3px rgba(0,0,0,0.04)',
                                transition: 'box-shadow 0.15s, border 0.15s',
                                cursor: 'pointer',
                            }}
                            onMouseOver={e => (e.currentTarget.style.boxShadow = '0 2px 8px rgba(0,0,0,0.10)')}
                            onMouseOut={e => (e.currentTarget.style.boxShadow = '0 1px 3px rgba(0,0,0,0.04)')}
                        >
                            {/* Avatar Circle */}
                            <span style={{
                                width: 40,
                                height: 40,
                                borderRadius: '50%',
                                background: getAvatarColor(chat.id || chat.title || ''),
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                fontWeight: 700,
                                fontSize: '1.1rem',
                                color: '#fff',
                                flexShrink: 0,
                                border: '1px solid #e5e7eb',
                            }}>
                                {getAvatarInitials(chat.title || chat.id || '')}
                            </span>
                            <span style={{ display: 'flex', flexDirection: 'column', flex: 1, minWidth: 0 }}>
                                <span style={{ fontWeight: 600, fontSize: '1.1rem', marginBottom: 2, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{chat.title || 'Untitled Chat'}</span>
                                <span style={{ color: '#888', fontSize: '0.95rem', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>Created: {chat.created_at ? new Date(chat.created_at).toLocaleString() : 'Unknown'}</span>
                            </span>
                        </Link>
                    ))}
                </div>
            </aside>
            {/* Main content area for chat messages */}
            <main
                style={{
                    flex: 1,
                    minWidth: 0,
                    minHeight: 0,
                    overflowY: 'auto',
                }}
            >
                <Outlet />
            </main>
        </div>
    );
}
