export interface Agent {
    id:               string;
    name:             string;
    display_name:     string;
    description:      string | null;
    system_prompt:    string;
    guardrails:       string | null;
    interrupt_before: string[];
    workflow_id:      string | null;
    workflow_skills?: WorkflowSkill[];
    memory_snapshot:  Record<string, unknown> | null;
    enabled:          boolean;
    updated_on:       string;
}

export interface Skill {
    id:             string;
    name:           string;
    display_name:   string;
    description:    string | null;
    content:        string;
    data_source_id: string | null;
    ds_name:        string | null;
    enabled:        boolean;
    linked_agents:  string[];
}

export interface WorkflowSkill {
    id:                 string;
    skill_id:           string;
    skill_name:         string;
    skill_display_name: string;
    step_order:         number;
    next_skill_id:      string | null;
    condition:          string | null;
    is_entry_point:     boolean;
    is_terminal:        boolean;
    enabled:            boolean;
    ds_name:            string | null;
}

export interface ChatSession {
    id:              string;
    agent_id:        string;
    thread_id:       string | null;
    title:           string;
    status:          string;
    memory_snapshot: Record<string, unknown> | null;
    created_on:      string;
    updated_on:      string;
}

export interface ChatMessage {
    id:         string;
    session_id: string;
    role:       'user' | 'assistant';
    content:    string;
    created_on: string;
}

export interface SkillStatus {
    skill_name: string;
    ds_name:    string | null;
    ds_enabled: boolean;
}

export interface AgentStatus {
    agent_id: string;
    skills:   SkillStatus[];
    can_run:  boolean;
}

export interface ActivismLetter {
    id:          string;
    filename:    string;
    activist:    string | null;
    processed:   boolean;
    uploaded_on: string;
    updated_on:  string;
}

export interface StyleVector {
    id:           string;
    activist:     string;
    letter_count: number;
    sample_text:  string;
    updated_on:   string;
}
