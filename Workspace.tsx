import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAgent }     from '../hooks/useAgent';
import { useChat }      from '../hooks/useChat';
import { useWebSocket } from '../hooks/useWebSocket';
import Sidebar          from '../components/Sidebar';
import MemoryBanner     from '../components/MemoryBanner';
import WorkflowPanel    from '../components/WorkflowPanel';
import ExecutionLog     from '../components/ExecutionLog';
import ChatWindow       from '../components/ChatWindow';
import { createSession, fetchMessages } from '../api/sessions';
import { ChatSession } from '../types';

export default function Workspace() {
    const { agentId } = useParams<{ agentId: string }>();
    const navigate    = useNavigate();

    const { agent, workflowSkills, sessions, setSessions, status, loading } = useAgent(agentId);
    const [activeSession, setActiveSession] = useState<ChatSession | null>(null);
    const { messages, setMessages, sending, send, letterDraft } = useChat(activeSession?.id || null);
    const { logs, connected } = useWebSocket(activeSession?.id || null);
    const [input, setInput] = useState('');

    // ── Auto-select most recent session, or create one if none exist ──
    useEffect(() => {
        if (loading) return;
        if (sessions.length > 0) {
            // Auto-select the most recent session
            const latest = sessions[0];
            setActiveSession(latest);
            fetchMessages(latest.id).then(setMessages).catch(console.error);
        } else if (agentId && sessions.length === 0) {
            // No sessions yet — auto-create one
            handleNewSession();
        }
    }, [loading, agentId]);

    // ── Load messages when session changes ──
    useEffect(() => {
        if (!activeSession) return;
        fetchMessages(activeSession.id).then(setMessages).catch(console.error);
    }, [activeSession?.id]);

    const handleNewSession = async () => {
        if (!agentId) return;
        try {
            const session = await createSession(agentId);
            setSessions(prev => [session, ...prev]);
            setActiveSession(session);
            setMessages([]);
        } catch (e) {
            console.error('Failed to create session:', e);
        }
    };

    const handleSelectSession = (s: ChatSession) => {
        setActiveSession(s);
        setMessages([]);
    };

    const handleSend = () => {
        if (!input.trim() || !activeSession) return;
        send(input);
        setInput('');
    };

    if (loading) return <div className='loading'>Loading agent...</div>;
    if (!agent)  return <div className='error'>Agent not found</div>;

    return (
        <div className='workspace'>
            <Sidebar
                agent={agent}
                sessions={sessions}
                activeSession={activeSession}
                onSelectSession={handleSelectSession}
                onNewSession={handleNewSession}
                onHome={() => navigate('/')}
            />
            <div className='ws-main'>
                <div className='ws-topbar'>
                    <span className='ws-agent-name'>{agent.display_name}</span>
                    <div style={{ display: 'flex', gap: 6 }}>
                        <button className='btn-primary'
                            onClick={() => navigate(`/agent/${agentId}`)}>
                            Edit agent
                        </button>
                        <button className='back-btn' onClick={() => navigate('/')}>
                            ← Home
                        </button>
                    </div>
                </div>

                <div className='ws-content'>
                    {agent.memory_snapshot && (
                        <MemoryBanner memory={agent.memory_snapshot as Record<string, unknown>} />
                    )}
                    <WorkflowPanel
                        skills={workflowSkills}
                        status={status}
                        agentId={agentId}
                    />
                    <ExecutionLog logs={logs} connected={connected} />
                </div>

                <div className='chat-section'>
                    <div className='chat-label'>
                        Chat
                        {activeSession && (
                            <span style={{ fontWeight: 400, color: '#6B7280', marginLeft: 8 }}>
                                — {activeSession.title || 'New session'}
                            </span>
                        )}
                    </div>

                    {!activeSession ? (
                        <div className='loading'>Starting session...</div>
                    ) : (
                        <>
                            <ChatWindow messages={messages} letterDraft={letterDraft} />
                            <div className='chat-input-bar'>
                                <div className='chat-input-wrap'>
                                    <input
                                        value={input}
                                        onChange={e => setInput(e.target.value)}
                                        onKeyDown={e => {
                                            if (e.key === 'Enter' && !sending) handleSend();
                                        }}
                                        placeholder={sending ? 'Agent is thinking...' : 'Ask the agent...'}
                                        disabled={sending}
                                        autoFocus
                                    />
                                    <button className='send-btn'
                                        onClick={handleSend}
                                        disabled={sending || !input.trim()}>
                                        →
                                    </button>
                                </div>
                            </div>
                        </>
                    )}
                </div>
            </div>
        </div>
    );
}
