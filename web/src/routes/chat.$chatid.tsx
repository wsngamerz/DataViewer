import React, {useRef} from 'react';
import {createFileRoute, useNavigate} from '@tanstack/react-router';
import {useInfiniteQuery, useQuery} from '@tanstack/react-query';
import type {MessageDto} from '@/client/types.gen';
import {getApiFacebookMessagesByChatIdInfiniteOptions, getApiFacebookChatsByIdOptions} from "@/client/@tanstack/react-query.gen.ts";

export const Route = createFileRoute('/chat/$chatid')({
    component: ChatPage,
});

function getInitials(senderId: string) {
    return senderId?.slice(0, 2).toUpperCase();
}

// Utility to generate a consistent color from a string (senderId)
function getAvatarColor(senderId: string): string {
    // Simple hash function to get a number from the string
    let hash = 0;
    for (let i = 0; i < senderId.length; i++) {
        hash = senderId.charCodeAt(i) + ((hash << 5) - hash);
    }
    // Generate color from hash
    const colors = [
        '#fbbf24', // amber
        '#a5b4fc', // indigo
        '#34d399', // green
        '#f472b6', // pink
        '#60a5fa', // blue
        '#f87171', // red
        '#facc15', // yellow
        '#38bdf8', // sky
        '#c084fc', // purple
        '#fb7185', // rose
    ];
    const idx = Math.abs(hash) % colors.length;
    return colors[idx];
}

function ChatPage() {
    const {chatid} = Route.useParams();
    const navigate = useNavigate();
    const bottomRef = useRef<HTMLDivElement>(null);

    // Fetch chat details
    const {data: chatData, status: chatStatus} = useQuery(
        getApiFacebookChatsByIdOptions({
            path: {id: chatid},
        })
    );

    const {
        data,
        fetchNextPage,
        hasNextPage,
        isFetchingNextPage,
        status,
        error,
    } = useInfiniteQuery({
        ...getApiFacebookMessagesByChatIdInfiniteOptions({
            path: {chatID: chatid},
        }),
        getNextPageParam: (lastPage, _pages) => lastPage.total,
        initialPageParam: 0,
    });

    React.useEffect(() => {
        if (bottomRef.current) {
            bottomRef.current.scrollIntoView({behavior: 'smooth'});
        }
    }, [data]);

    const handleScroll = (e: React.UIEvent<HTMLDivElement>) => {
        const {scrollTop} = e.currentTarget;
        if (scrollTop === 0 && hasNextPage && !isFetchingNextPage) {
            fetchNextPage();
        }
    };

    const allMessages = data?.pages.flatMap(page => page.messages || []) || [];
    const chat = chatData?.chat;
    const chatTitle = chat?.title || chatid;
    const participantNames = chat?.participant_ids || []; // the ids are actually names for now. this will be fixed when we have accounts data

    return (
        <div style={{height: '100vh', display: 'flex', flexDirection: 'column', background: '#f7f7fa'}}>
            {/* Header */}
            <div style={{padding: '16px', background: '#fff', borderBottom: '1px solid #eee', display: 'flex', alignItems: 'center', gap: 16}}>
                {/* Back button */}
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
                    {/* Simple left arrow icon */}
                    <span style={{fontSize: 22, lineHeight: 1, marginRight: 2}}>&larr;</span>
                </button>
                <div style={{width: 40, height: 40, borderRadius: '50%', background: '#d1d5db', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, fontSize: 18, color: '#444'}}>
                    {getInitials(chatTitle)}
                </div>
                <div>
                    <div style={{fontWeight: 600, fontSize: 18}}>{chatTitle}</div>
                    <div style={{fontSize: 12, color: '#888'}}>Facebook Chat</div>
                    {chatStatus === 'pending' && <div style={{fontSize: 12, color: '#aaa'}}>Loading chat details...</div>}
                    {chatStatus === 'error' && <div style={{fontSize: 12, color: 'red'}}>Error loading chat</div>}
                    {chat && participantNames.length > 0 && (
                        <div style={{fontSize: 13, color: '#666', marginTop: 2}}>
                            Participants: {participantNames.join(', ')}
                        </div>
                    )}
                </div>
            </div>

            {/* Chat body */}
            <div style={{flex: 1, overflow: 'auto', display: 'flex', flexDirection: 'column-reverse', padding: '24px 0'}} onScroll={handleScroll}>
                <div ref={bottomRef}/>
                {status === 'error' && <div style={{color: 'red', textAlign: 'center'}}>Error: {JSON.stringify(error)}</div>}
                {allMessages.length === 0 && status === 'success' && (
                    <div style={{textAlign: 'center', color: '#888', marginTop: 40, fontSize: 16}}>
                        No messages in this chat yet.
                    </div>
                )}
                {data?.pages.map((page) => (
                    <React.Fragment key={page?.messages?.[0]?.id || Math.random()}>
                        {page.messages?.map((msg: MessageDto) => {
                            const isOwn = msg.sender_id === chatid;
                            return (
                                <div key={msg.id} style={{display: 'flex', flexDirection: isOwn ? 'row-reverse' : 'row', alignItems: 'flex-end', margin: '12px 24px'}}>
                                    {/* Avatar */}
                                    <div style={{width: 36, height: 36, borderRadius: '50%', background: getAvatarColor(msg.sender_id), display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, fontSize: 15, color: '#fff', margin: isOwn ? '0 0 0 12px' : '0 12px 0 0'}}>
                                        {getInitials(msg.sender_id)}
                                    </div>
                                    {/* Message bubble */}
                                    <div style={{background: isOwn ? '#6366f1' : '#fff', color: isOwn ? '#fff' : '#222', borderRadius: 16, padding: '10px 16px', maxWidth: 420, boxShadow: '0 1px 4px rgba(0,0,0,0.04)', position: 'relative'}}>
                                        <div style={{fontWeight: 500, fontSize: 13, marginBottom: 2}}>{msg.sender_id}</div>
                                        <div style={{fontSize: 15, wordBreak: 'break-word'}}>{msg.content}</div>
                                        <div style={{fontSize: 11, color: isOwn ? '#d1d5db' : '#888', marginTop: 6, textAlign: 'right'}}>{new Date(msg.sent_at).toLocaleString()}</div>
                                    </div>
                                </div>
                            );
                        })}
                    </React.Fragment>
                ))}
                {isFetchingNextPage && <div style={{textAlign: 'center', color: '#888', margin: 16}}>Loading more...</div>}
            </div>
        </div>
    );
}
