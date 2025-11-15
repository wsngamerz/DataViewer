import {createFileRoute, Link} from '@tanstack/react-router';
import { useQuery } from '@tanstack/react-query';
import { getApiFacebookChatsOptions } from '@/client/@tanstack/react-query.gen';
import type { ChatDto } from '@/client/types.gen';

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
        <div style={{ maxWidth: 600, margin: '0 auto', padding: '2rem 1rem' }}>
            <h1 style={{ marginBottom: '1.5rem' }}>Chats</h1>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                {chats.length === 0 && <div>No chats found.</div>}
                {chats.map(chat => (
                    <Link
                        key={chat.id}
                        to="/chat/$chatid"
                        params={{ chatid: chat.id }}
                        style={{
                            display: 'flex',
                            flexDirection: 'column',
                            padding: '1rem',
                            borderRadius: 8,
                            border: '1px solid #e0e0e0',
                            background: '#fff',
                            textDecoration: 'none',
                            color: 'inherit',
                            boxShadow: '0 1px 3px rgba(0,0,0,0.04)',
                            transition: 'box-shadow 0.15s, border 0.15s',
                        }}
                        onMouseOver={e => (e.currentTarget.style.boxShadow = '0 2px 8px rgba(0,0,0,0.10)')}
                        onMouseOut={e => (e.currentTarget.style.boxShadow = '0 1px 3px rgba(0,0,0,0.04)')}
                    >
                        <span style={{ fontWeight: 600, fontSize: '1.1rem', marginBottom: 4 }}>{chat.title || 'Untitled Chat'}</span>
                        <span style={{ color: '#888', fontSize: '0.95rem' }}>Created: {chat.created_at ? new Date(chat.created_at).toLocaleString() : 'Unknown'}</span>
                        <span style={{ color: '#bbb', fontSize: '0.85rem', marginTop: 2 }}>ID: {chat.id}</span>
                    </Link>
                ))}
            </div>
        </div>
    );
}
