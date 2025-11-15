import React, {useRef} from 'react';
import {createFileRoute} from '@tanstack/react-router';
import {useInfiniteQuery} from '@tanstack/react-query';
import type {MessageDto} from '@/client/types.gen';
import {getApiFacebookMessagesByChatIdInfiniteOptions} from "@/client/@tanstack/react-query.gen.ts";

export const Route = createFileRoute('/chat/$chatid')({
    component: ChatPage,
});

function getInitials(senderId: string) {
    // Simple initials from senderId (could be improved if names are available)
    return senderId?.slice(0, 2).toUpperCase();
}

function ChatPage() {
    const {chatid} = Route.useParams();
    const bottomRef = useRef<HTMLDivElement>(null);

    const {
        data,
        fetchNextPage,
        hasNextPage,
        isFetchingNextPage,
        status,
        error,
    } = useInfiniteQuery({
        ...getApiFacebookMessagesByChatIdInfiniteOptions({
            path: {
                chatID: chatid,
            },
        }),
        getNextPageParam: (lastPage, _pages) => lastPage.total,
        initialPageParam: 0,
    });

    React.useEffect(() => {
        if (bottomRef.current) {
            bottomRef.current.scrollIntoView({behavior: 'smooth'});
        }
    }, [data]);

    // Infinite scroll handler
    const handleScroll = (e: React.UIEvent<HTMLDivElement>) => {
        const {scrollTop} = e.currentTarget;
        if (scrollTop === 0 && hasNextPage && !isFetchingNextPage) {
            fetchNextPage();
        }
    };

    // Flatten all messages for easier checks
    const allMessages = data?.pages.flatMap(page => page.messages || []) || [];

    return (
        <div style={{height: '100vh', display: 'flex', flexDirection: 'column', background: '#f7f7fa'}}>
            {/* Header */}
            <div style={{padding: '16px', background: '#fff', borderBottom: '1px solid #eee', display: 'flex', alignItems: 'center', gap: 16}}>
                <div style={{width: 40, height: 40, borderRadius: '50%', background: '#d1d5db', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, fontSize: 18, color: '#444'}}>
                    {getInitials(chatid)}
                </div>
                <div>
                    <div style={{fontWeight: 600, fontSize: 18}}>Chat: {chatid}</div>
                    <div style={{fontSize: 12, color: '#888'}}>Facebook Chat</div>
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
                {data?.pages.map((page, i) => (
                    <React.Fragment key={i}>
                        {page.messages?.map((msg: MessageDto) => {
                            const isOwn = msg.sender_id === chatid;
                            return (
                                <div key={msg.id} style={{display: 'flex', flexDirection: isOwn ? 'row-reverse' : 'row', alignItems: 'flex-end', margin: '12px 24px'}}>
                                    {/* Avatar */}
                                    <div style={{width: 36, height: 36, borderRadius: '50%', background: isOwn ? '#a5b4fc' : '#fbbf24', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, fontSize: 15, color: '#fff', margin: isOwn ? '0 0 0 12px' : '0 12px 0 0'}}>
                                        {getInitials(msg.sender_id)}
                                    </div>
                                    {/* Message bubble */}
                                    <div style={{background: isOwn ? '#6366f1' : '#fff', color: isOwn ? '#fff' : '#222', borderRadius: 16, padding: '10px 16px', maxWidth: 420, boxShadow: '0 1px 4px rgba(0,0,0,0.04)', position: 'relative'}}>
                                        <div style={{fontWeight: 500, fontSize: 13, marginBottom: 2}}>{msg.sender_id}</div>
                                        <div style={{fontSize: 15, wordBreak: 'break-word'}}>{msg.content}</div>
                                        <div style={{fontSize: 11, color: isOwn ? '#d1d5db' : '#888', marginTop: 6, textAlign: 'right'}}>{new Date(msg.created_at).toLocaleString()}</div>
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
