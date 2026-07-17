import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { WorkflowSkill, AgentStatus } from '../types';

interface Props {
    skills:  WorkflowSkill[];
    status:  AgentStatus | null;
    agentId?: string;
}

export default function WorkflowPanel({ skills, status, agentId }: Props) {
    const [open,          setOpen]          = useState(false);
    const [localSkills,   setLocalSkills]   = useState<WorkflowSkill[]>(skills);
    const navigate = useNavigate();

    // Sync if parent skills change
    useState(() => { setLocalSkills(skills); });

    const toggleSkill = async (skill: WorkflowSkill) => {
        const updated = { ...skill, enabled: !skill.enabled };
        setLocalSkills(prev => prev.map(s => s.id === skill.id ? updated : s));

        // Persist to backend
        try {
            await fetch(`/backend/api/agents/${agentId}/skills/${skill.id}`, {
                method:  'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body:    JSON.stringify({ enabled: updated.enabled }),
            });
        } catch (e) {
            console.error('Failed to update skill:', e);
            // Revert on error
            setLocalSkills(prev => prev.map(s => s.id === skill.id ? skill : s));
        }
    };

    const activeCount = localSkills.filter(s => s.enabled).length;

    return (
        <div className='collapse-card'>
            <div className='collapse-header' onClick={() => setOpen(o => !o)}>
                <span className='ch-title'>Workflow steps</span>
                <span className='ch-meta'>
                    {activeCount} of {localSkills.length} steps active
                </span>
                <span className={`chevron ${open ? 'open' : ''}`}>▼</span>
            </div>
            {open && (
                <div className='collapse-body open'>
                    <div className='wf-steps'>
                        {localSkills.length === 0 && (
                            <div className='exec-empty'>
                                No workflow steps configured
                            </div>
                        )}
                        {localSkills.map((s, i) => {
                            const skillStatus = status?.skills.find(
                                ss => ss.skill_name === s.skill_name
                            );
                            const available = skillStatus?.ds_enabled !== false;
                            return (
                                <div key={s.id}
                                    className='step-row'
                                    style={{ opacity: s.enabled ? 1 : 0.5 }}>
                                    <span className='step-num'
                                        style={!s.enabled ? { background: '#CBD5E1' } : {}}>
                                        {i + 1}
                                    </span>
                                    <span className='step-name'
                                        style={!s.enabled ? { color: '#9CA3AF' } : {}}>
                                        {s.skill_display_name}
                                    </span>
                                    {s.ds_name && (
                                        <span className={`ds-badge ${s.ds_name} ${!available ? 'unavailable' : ''}`}>
                                            {s.ds_name}{!available ? ' ⚠' : ''}
                                        </span>
                                    )}
                                    {s.enabled ? (
                                        <button
                                            className='enb on'
                                            onClick={() => toggleSkill(s)}
                                            title='Click to disable'>
                                            On
                                        </button>
                                    ) : (
                                        <button
                                            className='enb'
                                            onClick={() => toggleSkill(s)}
                                            title='Click to enable'>
                                            Off
                                        </button>
                                    )}
                                </div>
                            );
                        })}
                    </div>
                    {agentId && (
                        <div style={{ padding: '6px 14px 8px', borderTop: '0.5px solid #E2E8F0' }}>
                            <button
                                className='btn-accent'
                                style={{ fontSize: 11, padding: '4px 10px' }}
                                onClick={() => navigate(`/agent/${agentId}`)}>
                                Edit agent — add · remove · reorder steps
                            </button>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}
