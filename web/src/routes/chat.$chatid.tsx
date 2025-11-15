import React, {useRef} from 'react';
import {createFileRoute} from '@tanstack/react-router';
import {useInfiniteQuery} from '@tanstack/react-query';
import type {MessageDto} from '@/client/types.gen';
import {getApiFacebookMessagesByChatIdInfiniteOptions} from "@/client/@tanstack/react-query.gen.ts";

export const Route = createFileRoute('/chat/$chatid')({
    component: ChatPage,
});

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

    return (
        <div style={{height: '80vh', overflow: 'auto', display: 'flex', flexDirection: 'column-reverse'}}
             onScroll={handleScroll}>
            <div ref={bottomRef}/>
            {status === 'error' && <div>Error: {JSON.stringify(error)}</div>}
            {data?.pages.map((page, i) => (
                <React.Fragment key={i}>
                    {page.messages?.map((msg: MessageDto) => (
                        <div key={msg.id}
                             style={{margin: '8px 0', alignSelf: msg.sender_id === chatid ? 'flex-end' : 'flex-start'}}>
                            <div style={{background: '#eee', borderRadius: 8, padding: 8, maxWidth: 400}}>
                                <div><b>{msg.sender_id}</b></div>
                                <div>{msg.content}</div>
                                <div style={{
                                    fontSize: 10,
                                    color: '#888'
                                }}>{new Date(msg.created_at).toLocaleString()}</div>
                            </div>
                        </div>
                    ))}
                </React.Fragment>
            ))}
            {isFetchingNextPage && <div>Loading more...</div>}
        </div>
    );
}

