import {createFileRoute, Link, Outlet, useMatch} from '@tanstack/react-router';
import {useQuery} from '@tanstack/react-query';
import {getApiFacebookChatsSummariesOptions} from '@/client/@tanstack/react-query.gen';
import type {ChatSummaryDto} from '@/client/types.gen';
import {getAvatarColor, getAvatarInitials, formatNumber} from '../lib/utils';
import {UserProvider, useUser} from '../lib/user-context';
import {useEffect, useState} from 'react';

export const Route = createFileRoute('/chats')({
    component: ChatsPage,
});

function NameSelector() {
    const {name, setName} = useUser();
    return (
        <div style={{display: 'flex', flexDirection: 'column', gap: 4}}>
            <label htmlFor="your-name" style={{fontSize: 13, color: '#888', marginBottom: 2}}>Your Name</label>
            <input
                id="your-name"
                type="text"
                value={name}
                onChange={e => setName(e.target.value)}
                placeholder="Type your name..."
                style={{
                    padding: '6px 10px',
                    borderRadius: 6,
                    border: '1px solid #e0e0e0',
                    fontSize: 15,
                    outline: 'none',
                    width: '100%',
                }}
            />
        </div>
    );
}

function SettingsModal({open, onClose}: { open: boolean; onClose: () => void }) {
    // Accessibility: close on Escape
    useEffect(() => {
        if (!open) return;

        function onKeyDown(e: KeyboardEvent) {
            if (e.key === 'Escape') onClose();
        }

        window.addEventListener('keydown', onKeyDown);
        return () => window.removeEventListener('keydown', onKeyDown);
    }, [open, onClose]);
    if (!open) return null;
    return (
        <div
            role="dialog"
            aria-modal="true"
            tabIndex={-1}
            style={{
                position: 'fixed',
                top: 0,
                left: 0,
                width: '100vw',
                height: '100vh',
                background: 'rgba(0,0,0,0.18)',
                zIndex: 1000,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
            }}
            onClick={onClose}
            onKeyDown={e => {
                if (e.key === 'Escape') onClose();
            }}
        >
            <div
                role="document"
                tabIndex={0}
                aria-label="Settings"
                style={{
                    background: '#fff',
                    borderRadius: 12,
                    boxShadow: '0 4px 32px rgba(0,0,0,0.13)',
                    padding: '2rem 2rem 1.5rem 2rem',
                    minWidth: 320,
                    maxWidth: '90vw',
                    position: 'relative',
                }}
                onClick={e => e.stopPropagation()}
            >
                <button
                    onClick={onClose}
                    aria-label="Close settings"
                    style={{
                        position: 'absolute',
                        top: 12,
                        right: 12,
                        background: 'none',
                        border: 'none',
                        fontSize: 22,
                        color: '#888',
                        cursor: 'pointer',
                    }}
                >
                    ×
                </button>
                <h2 style={{fontSize: 20, marginBottom: 18, color: '#222'}}>Settings</h2>
                <NameSelector/>
            </div>
        </div>
    );
}

function ChatsPage() {
    const {data, isLoading, error} = useQuery(getApiFacebookChatsSummariesOptions());
    const chats: ChatSummaryDto[] = (data?.summaries ?? []).slice().sort((a, b) => {
        const nameA = (a.title || '').trim();
        const nameB = (b.title || '').trim();
        if (!nameA && nameB) return 1;   // a is untitled, b is titled
        if (nameA && !nameB) return -1;  // a is titled, b is untitled
        if (!nameA && !nameB) return 0;  // both untitled
        return nameA.localeCompare(nameB, undefined, {sensitivity: 'base'});
    });
    const [settingsOpen, setSettingsOpen] = useState(false);
    const match = useMatch({from: '/chats/$chatid', shouldThrow: false});
    const activeChatId = match?.params?.chatid;

    if (isLoading) return <div>Loading...</div>;
    if (error) return <div>Error loading chats</div>;

    return (
        <UserProvider>
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
                        width: 420,
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
                    <SettingsModal open={settingsOpen} onClose={() => setSettingsOpen(false)}/>
                    <div style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        marginBottom: '1.5rem'
                    }}>
                        <h1 style={{fontSize: '1.3rem', margin: 0}}>Chats</h1>
                        <button
                            aria-label="Open settings"
                            onClick={() => setSettingsOpen(true)}
                            style={{
                                background: 'none',
                                border: 'none',
                                cursor: 'pointer',
                                padding: 0,
                                marginLeft: 8,
                                color: '#888',
                                fontSize: 22,
                                display: 'flex',
                                alignItems: 'center',
                            }}
                        >⚙️
                        </button>
                    </div>
                    {/* Chat list */}
                    <nav style={{display: 'flex', flexDirection: 'column', gap: 0}}>
                        {chats.length === 0 &&
                            <div style={{color: '#aaa', textAlign: 'center', marginTop: 32}}>No chats found.</div>}
                        {chats.map((chat, _idx) => {
                            const isActive = activeChatId === chat.id;
                            return (
                                <Link
                                    key={chat.id}
                                    to="/chats/$chatid"
                                    params={{chatid: chat.id}}
                                    style={{
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: '1rem',
                                        padding: '0.7rem 0.5rem 0.7rem 0.5rem',
                                        borderRadius: 6,
                                        background: isActive ? '#f1f5fd' : 'transparent',
                                        color: isActive ? '#2563eb' : '#222',
                                        textDecoration: 'none',
                                        cursor: 'pointer',
                                        transition: 'background 0.13s, color 0.13s',
                                        position: 'relative',
                                    }}
                                    onMouseOver={e => (e.currentTarget.style.background = isActive ? '#e0e7ff' : '#f3f4f6')}
                                    onMouseOut={e => (e.currentTarget.style.background = isActive ? '#f1f5fd' : 'transparent')}
                                >
                                    {/* Avatar Circle */}
                                    <span style={{
                                        width: 38,
                                        height: 38,
                                        borderRadius: '50%',
                                        background: getAvatarColor(chat.id || chat.title || ''),
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        fontWeight: 700,
                                        fontSize: '1.05rem',
                                        color: '#fff',
                                        flexShrink: 0,
                                        border: isActive ? '2px solid #2563eb' : '1px solid #e5e7eb',
                                        boxShadow: isActive ? '0 0 0 2px #e0e7ff' : undefined,
                                        transition: 'border 0.13s, box-shadow 0.13s',
                                    }}>
                                    {getAvatarInitials(chat.title || chat.id || '')}
                                </span>
                                    <span style={{display: 'flex', flexDirection: 'column', flex: 1, minWidth: 0}}>
                                    <span style={{
                                        fontWeight: 600,
                                        fontSize: '1.08rem',
                                        marginBottom: 1,
                                        whiteSpace: 'nowrap',
                                        overflow: 'hidden',
                                        textOverflow: 'ellipsis'
                                    }}>{chat.title || 'Untitled Chat'}</span>
                                    <span style={{
                                        color: isActive ? '#2563eb' : '#888',
                                        fontSize: '0.93rem',
                                        whiteSpace: 'nowrap',
                                        overflow: 'hidden',
                                        textOverflow: 'ellipsis',
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: 8,
                                    }}>
                                        <span title="Message count">💬 {formatNumber(chat?.message_count ?? 0)}</span>
                                        {/* Last message */}
                                        {chat?.last_message ? (
                                            <span style={{color: '#aaa', fontSize: '0.9em'}}>
                                                        • {chat.last_message.content ? chat.last_message.content.slice(0, 32) : '[No content]'}
                                                {chat.last_message.sent_at && (
                                                    <span style={{marginLeft: 6, color: '#bbb', fontSize: '0.85em'}}>
                                                        ({new Date(chat.last_message.sent_at).toLocaleString()})
                                                    </span>
                                                )}
                                            </span>
                                        ) : null}
                                    </span>
                                </span>
                                    {/* Unread dot or other indicators could go here */}
                                </Link>
                            );
                        })}
                        {/* Divider between chats */}
                        {chats.length > 1 && (
                            <style>{`
                          nav > a:not(:last-child) {
                            border-bottom: 1px solid #f1f1f1;
                          }
                          nav > a:hover {
                            background: #f3f4f6 !important;
                          }
                        `}</style>
                        )}
                    </nav>
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
                    <Outlet/>
                </main>
            </div>
        </UserProvider>
    );
}
