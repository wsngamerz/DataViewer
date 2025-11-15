import React, {useRef, useState} from 'react';
import {createFileRoute, useNavigate} from '@tanstack/react-router';
import {useInfiniteQuery, useQuery} from '@tanstack/react-query';
import type {MessageDto} from '@/client/types.gen';
import {
    getApiFacebookChatsByIdSummaryOptions,
    getApiFacebookChatsByIdMessagesInfiniteOptions
} from "@/client/@tanstack/react-query.gen.ts";
import {getAvatarColor, getAvatarInitials, formatNumber} from '../lib/utils';
import {useUser} from '../lib/user-context';

const PAGE_SIZE = 100;
const SCROLL_THRESHOLD = 400;

export const Route = createFileRoute('/chats/$chatid')({
    component: ChatPage,
});

// Move groupMessages to outer scope
function groupMessages(messages: MessageDto[]) {
    const groups: { sender_id: string; messages: MessageDto[] }[] = [];
    let currentGroup: { sender_id: string; messages: MessageDto[] } | null = null;
    for (const msg of messages) {
        if (!currentGroup || currentGroup.sender_id !== msg.sender_id) {
            if (currentGroup) groups.push(currentGroup);
            currentGroup = {sender_id: msg.sender_id, messages: [msg]};
        } else {
            currentGroup.messages.push(msg);
        }
    }
    if (currentGroup) groups.push(currentGroup);
    return groups;
}

function ChatPage() {
    const {chatid} = Route.useParams();
    const navigate = useNavigate();
    const chatBodyRef = useRef<HTMLDivElement>(null);
    const {name: yourName} = useUser();
    const isInitialLoad = useRef(true);
    const prevDataLength = useRef(0);
    const [showModal, setShowModal] = useState(false);

    const {data: summaryData, status: summaryStatus} = useQuery(getApiFacebookChatsByIdSummaryOptions({path: {id: chatid}}));

    const {
        data,
        fetchNextPage,
        hasNextPage,
        isFetchingNextPage,
        status,
        error,
    } = useInfiniteQuery({
        ...getApiFacebookChatsByIdMessagesInfiniteOptions({
            path: {id: chatid},
            query: {pageSize: PAGE_SIZE},
        }),
        initialPageParam: 1,
        getNextPageParam: (lastPage, _allPages, lastPageParam) => {
            return lastPage.page < lastPage.pageCount ? (lastPageParam as number) + 1 : undefined
        },
        getPreviousPageParam: (firstPage, _allPages, firstPageParam) => {
            return firstPage.page > 1 ? (firstPageParam as number) - 1 : undefined
        },
    });

    // Scroll to bottom on initial load or when a new message is sent
    React.useEffect(() => {
        const chatBody = chatBodyRef.current;
        if (!chatBody) return;
        const allMessages = data?.pages.flatMap(page => page.messages || []) || [];
        if (isInitialLoad.current) {
            chatBody.scrollTop = chatBody.scrollHeight;
            isInitialLoad.current = false;
        } else if (prevDataLength.current < allMessages.length) {
            // New message sent (not older messages loaded)
            chatBody.scrollTop = chatBody.scrollHeight;
        }
        prevDataLength.current = allMessages.length;
    }, [data]);

    // Maintain scroll position when loading older messages
    const handleScroll = (e: React.UIEvent<HTMLDivElement>) => {
        const chatBody = e.currentTarget;
        if (chatBody.scrollTop < SCROLL_THRESHOLD && hasNextPage && !isFetchingNextPage) {
            const prevScrollHeight = chatBody.scrollHeight;
            fetchNextPage().then(() => {
                // After loading, adjust scrollTop so user stays at the same message
                setTimeout(() => {
                    if (chatBodyRef.current) {
                        const newScrollHeight = chatBodyRef.current.scrollHeight;
                        chatBodyRef.current.scrollTop = newScrollHeight - prevScrollHeight;
                    }
                }, 0);
            });
        }
    };

    const allMessages = (data?.pages.flatMap(page => page.messages || []) || [])
        .slice() // create a shallow copy to avoid mutating original
        .sort((a, b) => new Date(a.sent_at).getTime() - new Date(b.sent_at).getTime()); // oldest first
    const chatSummary = summaryData?.summary;
    const chatTitle = chatSummary?.title || chatid;
    const participantNames = chatSummary?.participant_ids?.map(x => x || "???") || [];

    const groupedMessages = groupMessages(allMessages);

    return (
        <div style={{height: 'calc(100dvh - 72px)', display: 'flex', flexDirection: 'column', background: '#f7f7fa'}}>
            {/* Header */}
            <div style={{
                padding: '16px',
                background: '#fff',
                borderBottom: '1px solid #eee',
                display: 'flex',
                alignItems: 'center',
                gap: 16,
                position: 'relative',
                justifyContent: 'space-between',
            }}>
                {/* Left: Back button, avatar, title */}
                <div style={{display: 'flex', alignItems: 'center', gap: 16}}>
                    <button
                        onClick={() => navigate({to: '/chats'})}
                        aria-label="Back to chats"
                        style={{
                            background: 'none',
                            border: 'none',
                            cursor: 'pointer',
                            padding: 0,
                            marginRight: 12,
                            display: 'flex',
                            alignItems: 'center',
                            fontSize: 22,
                            color: '#6366f1',
                        }}
                    >
                        <span style={{fontSize: 22, lineHeight: 1, marginRight: 2}}>&larr;</span>
                    </button>
                    {/* Avatar is now clickable to open modal */}
                    <button
                        onClick={() => setShowModal(true)}
                        aria-label="Show chat details"
                        style={{
                            width: 40,
                            height: 40,
                            borderRadius: '50%',
                            background: '#d1d5db',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            fontWeight: 700,
                            fontSize: 18,
                            color: '#444',
                            cursor: 'pointer',
                            outline: 'none',
                            border: '2px solid transparent',
                            marginRight: 0,
                        }}
                    >
                        {getAvatarInitials(chatTitle)}
                    </button>
                    <div>
                        <div style={{fontWeight: 600, fontSize: 18}}>{chatTitle}</div>
                        <div style={{fontSize: 12, color: '#888'}}>Facebook Chat</div>
                        {summaryStatus === 'pending' &&
                            <div style={{fontSize: 12, color: '#aaa'}}>Loading chat details...</div>}
                        {summaryStatus === 'error' && <div style={{fontSize: 12, color: 'red'}}>Error loading chat</div>}
                    </div>
                </div>
                {/* Right: Participants, message count, created date with icons */}
                {chatSummary && (
                    <div style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: 32,
                        minWidth: 0,
                        flex: 1,
                        justifyContent: 'flex-end',
                        flexWrap: 'nowrap',
                        textAlign: 'right',
                    }}>
                        {/* Participants: count, icon, names, ellipsis, tooltip */}
                        <div
                            title={participantNames.length > 0 ? participantNames.join(', ') : undefined}
                            style={{
                                display: 'flex',
                                alignItems: 'center',
                                minWidth: 0,
                                maxWidth: 320,
                                overflow: 'hidden',
                                whiteSpace: 'nowrap',
                                textOverflow: 'ellipsis',
                                gap: 6,
                                fontSize: 15,
                                color: '#666',
                            }}
                        >
                            <span title="Participant count" style={{display: 'flex', alignItems: 'center', gap: 4, fontSize: 15, color: '#666', whiteSpace: 'nowrap'}}>
                                <span aria-hidden="true">👥</span>
                                <span style={{position: 'absolute', left: '-9999px', width: 1, height: 1, overflow: 'hidden'}}>Participants</span>
                                <span>{formatNumber(participantNames.length)}</span>
                            </span>
                            <span style={{overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', display: 'inline-block'}}>
                                {participantNames.length > 0
                                    ? "- " + participantNames.map(n => n.split(" ")[0]).join(', ')
                                    : '—'}
                            </span>
                        </div>
                        {/* Message count */}
                        <div title="Message count" style={{display: 'flex', alignItems: 'center', gap: 4, fontSize: 15, color: '#666', whiteSpace: 'nowrap'}}>
                            <span aria-hidden="true">💬</span>
                            <span style={{position: 'absolute', left: '-9999px', width: 1, height: 1, overflow: 'hidden'}}>Messages</span>
                            <span>{formatNumber(chatSummary.message_count)}</span>
                        </div>
                        {/* Created date */}
                        <div title="Created" style={{display: 'flex', alignItems: 'center', gap: 4, fontSize: 15, color: '#666', whiteSpace: 'nowrap'}}>
                            <span aria-hidden="true">📅</span>
                            <span style={{position: 'absolute', left: '-9999px', width: 1, height: 1, overflow: 'hidden'}}>Created</span>
                            <span>{chatSummary.estimated_created_at ? new Date(chatSummary.estimated_created_at).toLocaleDateString(undefined, {year: 'numeric', month: 'short', day: 'numeric'}) : '—'}</span>
                        </div>
                    </div>
                )}

                {isFetchingNextPage && (
                    <div style={{
                        position: 'absolute',
                        bottom: "-64px",
                        left: '50%',
                        transform: 'translateX(-50%)',
                        color: '#666',
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        fontSize: 13,
                        zIndex: 10,
                    }}>
                        <div style={{
                            width: 20,
                            height: 20,
                            border: '3px solid #e5e7eb',
                            borderTop: '3px solid #6366f1',
                            borderRadius: '50%',
                            animation: 'spin 1s linear infinite',
                            marginBottom: 6,
                        }} />
                        <style>
                            {`@keyframes spin { 100% { transform: rotate(360deg); } }`}
                        </style>
                        <p>Loading more messages...</p>
                    </div>
                )}
            </div>

            {/* Chat body */}
            <div ref={chatBodyRef}
                 style={{flex: 1, overflow: 'auto', display: 'flex', flexDirection: 'column', padding: '24px 0'}}
                 onScroll={handleScroll}>
                {status === 'error' &&
                    <div style={{color: 'red', textAlign: 'center'}}>Error: {JSON.stringify(error)}</div>}
                {allMessages.length === 0 && status === 'success' && (
                    <div style={{textAlign: 'center', color: '#888', marginTop: 40, fontSize: 16}}>
                        No messages in this chat yet.
                    </div>
                )}

                {/* Render grouped messages */}
                {groupedMessages.map((group) => {
                    const isOwn = yourName && group.sender_id === yourName;
                    return (
                        <div key={group.messages[0].id + '-group'} style={{
                            display: 'flex',
                            flexDirection: isOwn ? 'row-reverse' : 'row',
                            alignItems: 'flex-end',
                            margin: '0 24px 12px 24px'
                        }}>
                            {/* Avatar and name only for first message in group */}
                            <div style={{
                                display: 'flex',
                                flexDirection: isOwn ? 'row-reverse' : 'row',
                                alignItems: 'flex-end'
                            }}>
                                <div style={{
                                    display: 'flex',
                                    flexDirection: 'column',
                                    alignItems: isOwn ? 'flex-end' : 'flex-start'
                                }}>
                                    {group.messages.map((msg, idx) => {
                                        // Border radius logic
                                        const isFirst = idx === 0;
                                        const isLast = idx === group.messages.length - 1;
                                        let borderStyle;
                                        if (isOwn) {
                                            borderStyle = {
                                                borderTopRightRadius: isFirst ? 16 : 6,
                                                borderBottomRightRadius: isLast ? 16 : 6,
                                                borderTopLeftRadius: 16,
                                                borderBottomLeftRadius: 16,
                                            };
                                        } else {
                                            borderStyle = {
                                                borderTopLeftRadius: isFirst ? 16 : 6,
                                                borderBottomLeftRadius: isLast ? 16 : 6,
                                                borderTopRightRadius: 16,
                                                borderBottomRightRadius: 16,
                                            };
                                        }
                                        // Refactor margin logic to avoid negated condition
                                        let marginLeft = 0;
                                        let marginRight = 0;
                                        if (isOwn) {
                                            marginRight = isFirst ? 0 : 48;
                                        } else {
                                            marginLeft = isFirst ? 0 : 48;
                                        }
                                        return (
                                            <div key={msg.id} style={{
                                                display: 'flex',
                                                flexDirection: isOwn ? 'row-reverse' : 'row',
                                                alignItems: 'flex-start',
                                                marginTop: isFirst ? 0 : 2
                                            }}>
                                                {/* Avatar only for first message in group */}
                                                {isFirst && (
                                                    <div style={{
                                                        width: 36,
                                                        height: 36,
                                                        borderRadius: '50%',
                                                        background: getAvatarColor(msg.sender_id),
                                                        display: 'flex',
                                                        alignItems: 'center',
                                                        justifyContent: 'center',
                                                        fontWeight: 700,
                                                        fontSize: 15,
                                                        color: '#fff',
                                                        margin: isOwn ? '0 0 0 12px' : '0 12px 0 0'
                                                    }}>
                                                        {getAvatarInitials(msg.sender_id)}
                                                    </div>
                                                )}
                                                {/* Message bubble */}
                                                <div style={{
                                                    background: isOwn ? '#6366f1' : '#fff',
                                                    color: isOwn ? '#fff' : '#222',
                                                    borderRadius: 16,
                                                    padding: '10px 16px',
                                                    maxWidth: 420,
                                                    boxShadow: '0 1px 4px rgba(0,0,0,0.04)',
                                                    position: 'relative',
                                                    border: isOwn ? '1.5px solid #6366f1' : '1px solid #e5e7eb',
                                                    marginLeft,
                                                    marginRight,
                                                    ...borderStyle,
                                                }}>
                                                    {/* Name only for first message in group */}
                                                    {isFirst && (
                                                        <div style={{
                                                            fontWeight: 500,
                                                            fontSize: 13,
                                                            marginBottom: 2
                                                        }}>{msg.sender_id}</div>
                                                    )}
                                                    <div style={{
                                                        fontSize: 15,
                                                        wordBreak: 'break-word'
                                                    }}>{msg.content}</div>
                                                    <div style={{
                                                        fontSize: 11,
                                                        color: isOwn ? '#d1d5db' : '#888',
                                                        marginTop: 6,
                                                        textAlign: 'right'
                                                    }}>{new Date(msg.sent_at).toLocaleString()}</div>
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>
                        </div>
                    );
                })}
            </div>

            {/* Modal for chat details and participants */}
            {showModal && chatSummary && (
                <dialog
                    open
                    aria-modal="true"
                    style={{
                        position: 'fixed',
                        top: 0,
                        left: 0,
                        width: '100vw',
                        height: '100vh',
                        background: 'rgba(0,0,0,0.32)',
                        zIndex: 1000,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        border: 'none',
                        padding: 0,
                    }}
                    onClick={() => setShowModal(false)}
                >
                    <div
                        role="document"
                        tabIndex={0}
                        style={{
                            background: '#fff',
                            borderRadius: 12,
                            boxShadow: '0 4px 32px rgba(0,0,0,0.12)',
                            padding: 32,
                            minWidth: 320,
                            maxWidth: "max(420px, 60dvw)",
                            width: '90vw',
                            maxHeight: '80vh',
                            overflowY: 'auto',
                            position: 'relative',
                            outline: 'none',
                        }}
                        onClick={e => e.stopPropagation()}
                    >
                        <button
                            onClick={() => setShowModal(false)}
                            aria-label="Close"
                            style={{
                                position: 'absolute',
                                top: 16,
                                right: 16,
                                background: 'none',
                                border: 'none',
                                fontSize: 22,
                                cursor: 'pointer',
                                color: '#888',
                            }}
                        >
                            &times;
                        </button>
                        <div style={{display: 'flex', alignItems: 'center', gap: 16, marginBottom: 16}}>
                            <div style={{
                                width: 48,
                                height: 48,
                                borderRadius: '50%',
                                background: '#d1d5db',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                fontWeight: 700,
                                fontSize: 22,
                                color: '#444',
                            }}>{getAvatarInitials(chatTitle)}</div>
                            <div>
                                <div style={{fontWeight: 600, fontSize: 20}}>{chatTitle}</div>
                                <div style={{fontSize: 13, color: '#888'}}>Facebook Chat</div>
                            </div>
                        </div>
                        <div style={{marginBottom: 18}}>
                            <div style={{fontSize: 15, color: '#666', marginBottom: 4}}>
                                <span style={{fontWeight: 500}}>Participants ({formatNumber(participantNames.length)}):</span>
                            </div>
                            <div style={{
                                display: 'flex',
                                flexWrap: 'wrap',
                                gap: '8px',
                                maxHeight: 180,
                                overflowY: 'auto',
                                margin: '0 -4px',
                            }}>
                                {participantNames.length > 0 ? participantNames.map((name, i) => (
                                    <span
                                        key={name + i}
                                        style={{
                                            display: 'inline-block',
                                            background: getAvatarColor(name),
                                            color: '#fff',
                                            borderRadius: 16,
                                            padding: '4px 12px',
                                            fontSize: 15,
                                            fontWeight: 500,
                                            margin: '0 4px 4px 0',
                                            boxShadow: '0 1px 2px rgba(0,0,0,0.03)',
                                            border: 'none',
                                            maxWidth: 180,
                                            whiteSpace: 'nowrap',
                                            textOverflow: 'ellipsis',
                                            overflow: 'hidden',
                                        }}
                                    >
                                        {name}
                                    </span>
                                )) : <span style={{color: '#aaa'}}>—</span>}
                            </div>
                        </div>
                        <div style={{fontSize: 15, color: '#666', marginBottom: 8}}>
                            <span style={{marginRight: 12}}><span aria-hidden="true">💬</span> {formatNumber(chatSummary.message_count)} messages</span>
                            <span><span aria-hidden="true">📅</span> {chatSummary.estimated_created_at ? new Date(chatSummary.estimated_created_at).toLocaleDateString(undefined, {year: 'numeric', month: 'short', day: 'numeric'}) : '—'}</span>
                        </div>
                    </div>
                </dialog>
            )}
        </div>
    );
}
