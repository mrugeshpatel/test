import { useState, useEffect } from 'react';
import { Agent, WorkflowSkill, ChatSession, AgentStatus } from '../types';
import { fetchAgent, fetchAgentStatus } from '../api/agents';
import { fetchSessions } from '../api/sessions';

export function useAgent(agentId: string | undefined) {
    const [agent,          setAgent]          = useState<Agent | null>(null);
    const [workflowSkills, setWorkflowSkills] = useState<WorkflowSkill[]>([]);
    const [sessions,       setSessions]       = useState<ChatSession[]>([]);
    const [status,         setStatus]         = useState<AgentStatus | null>(null);
    const [loading,        setLoading]        = useState(true);

    useEffect(() => {
        if (!agentId) return;
        setLoading(true);
        Promise.all([
            fetchAgent(agentId),
            fetchAgentStatus(agentId),
            fetchSessions(agentId),
        ]).then(([agentData, statusData, sessionsData]) => {
            setAgent(agentData);
            setWorkflowSkills((agentData as any).workflow_skills || []);
            setStatus(statusData);
            // Sort by updated_on DESC — most recently active session first
            const sorted = [...sessionsData].sort((a, b) =>
                new Date(b.updated_on).getTime() - new Date(a.updated_on).getTime()
            );
            setSessions(sorted);
        }).catch(console.error)
          .finally(() => setLoading(false));
    }, [agentId]);

    return { agent, workflowSkills, sessions, setSessions, status, loading };
}
