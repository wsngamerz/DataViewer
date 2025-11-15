import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/chats/')({
  component: RouteComponent,
})

function RouteComponent() {
  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      height: '100%',
      minHeight: '60vh',
      color: '#888',
      fontSize: '1.3rem',
      letterSpacing: 0.1,
      textAlign: 'center',
      gap: '1.5rem',
    }}>
      <span style={{ fontSize: '2.5rem', color: '#d1d5db' }}>💬</span>
      <div>
        <strong>Click on a chat</strong> to get started<br />
        Select a conversation from the sidebar.
      </div>
    </div>
  );
}
