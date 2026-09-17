// API-Client für Agentos-OS
// Zentrale API-Anfragen

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'

// Basis-Konfiguration
export interface ApiResponse<T> {
  data?: T
  error?: string
  message?: string
  status?: string
}

// HTTP-Methoden
type HttpMethod = 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH'

// Basis-Request-Funktion
async function request<T>(
  endpoint: string,
  method: HttpMethod = 'GET',
  data?: any,
  params?: Record<string, string | number | boolean>
): Promise<ApiResponse<T>> {
  try {
    const url = new URL(`${API_BASE_URL}/api${endpoint}`)
    
    // Query-Parameter hinzufügen
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          url.searchParams.append(key, String(value))
        }
      })
    }
    
    const options: RequestInit = {
      method,
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
    }
    
    if (data) {
      options.body = JSON.stringify(data)
    }
    
    const response = await fetch(url.toString(), options)
    
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}))
      return {
        error: errorData.detail || errorData.message || 'Unbekannter Fehler',
        status: response.status.toString()
      }
    }
    
    const result = await response.json()
    return { data: result, status: 'success' }
    
  } catch (error) {
    console.error('API-Request Fehler:', error)
    return {
      error: error instanceof Error ? error.message : 'Netzwerkfehler',
      status: 'error'
    }
  }
}

// ==================== Agenten-API ====================

export interface Agent {
  id: number
  name: string
  description: string | null
  role: string
  capabilities: string[]
  provider: string
  model: string
  status: string
  is_active: boolean
  system_prompt: string | null
  tools: string[]
  memory_enabled: boolean
  created_at: string
  updated_at: string
}

export interface AgentListResponse {
  agents: Agent[]
  total: number
  page: number
  page_size: number
}

export interface AgentStatus {
  agent_id: number
  agent_name: string
  status: string
  current_task: string | null
  tasks_completed: number
  tasks_failed: number
  uptime: number
  last_activity: string | null
}

export interface AgentMetrics {
  agent_id: number
  agent_name: string
  total_tasks: number
  completed_tasks: number
  failed_tasks: number
  avg_response_time: number
  total_tokens_used: number
  memory_entries: number
  active_conversations: number
}

// Agenten-Operationen
export const AgentsApi = {
  // Alle Agenten abrufen
  getAll: async (page: number = 1, pageSize: number = 50): Promise<ApiResponse<AgentListResponse>> => {
    return request<AgentListResponse>('/agents', 'GET', undefined, { page, page_size: pageSize })
  },
  
  // Bestimmten Agenten abrufen
  getByName: async (name: string): Promise<ApiResponse<Agent>> => {
    return request<Agent>(`/agents/${name}`, 'GET')
  },
  
  // Agenten erstellen
  create: async (agentData: Omit<Agent, 'id' | 'created_at' | 'updated_at'>): Promise<ApiResponse<Agent>> => {
    return request<Agent>('/agents', 'POST', agentData)
  },
  
  // Agenten aktualisieren
  update: async (name: string, agentData: Partial<Agent>): Promise<ApiResponse<Agent>> => {
    return request<Agent>(`/agents/${name}`, 'PUT', agentData)
  },
  
  // Agenten löschen
  delete: async (name: string): Promise<ApiResponse<void>> => {
    return request<void>(`/agents/${name}`, 'DELETE')
  },
  
  // Agenten starten
  start: async (name: string): Promise<ApiResponse<void>> => {
    return request<void>(`/agents/${name}/start`, 'POST')
  },
  
  // Agenten stoppen
  stop: async (name: string): Promise<ApiResponse<void>> => {
    return request<void>(`/agents/${name}/stop`, 'POST')
  },
  
  // Agenten pausieren
  pause: async (name: string): Promise<ApiResponse<void>> => {
    return request<void>(`/agents/${name}/pause`, 'POST')
  },
  
  // Agenten fortsetzen
  resume: async (name: string): Promise<ApiResponse<void>> => {
    return request<void>(`/agents/${name}/resume`, 'POST')
  },
  
  // Status aller Agenten
  getAllStatus: async (): Promise<ApiResponse<{ agents: AgentStatus[]; count: number }>> => {
    return request<{ agents: AgentStatus[]; count: number }>('/agents/status', 'GET')
  },
  
  // Status eines Agenten
  getStatus: async (name: string): Promise<ApiResponse<AgentStatus>> => {
    return request<AgentStatus>(`/agents/status/${name}`, 'GET')
  },
  
  // Metriken aller Agenten
  getAllMetrics: async (): Promise<ApiResponse<{ metrics: AgentMetrics[]; count: number }>> => {
    return request<{ metrics: AgentMetrics[]; count: number }>('/agents/metrics', 'GET')
  },
  
  // Nachricht an Agenten senden
  sendMessage: async (name: string, message: string): Promise<ApiResponse<{ message: string; agent: string; message_id: string; timestamp: string }>> => {
    return request<{ message: string; agent: string; message_id: string; timestamp: string }>(`/agents/${name}/message`, 'POST', { message })
  },
  
  // Nachrichten eines Agenten abrufen
  getMessages: async (name: string, limit: number = 50): Promise<ApiResponse<{ agent: string; messages: any[]; count: number }>> => {
    return request<{ agent: string; messages: any[]; count: number }>(`/agents/${name}/messages`, 'GET', undefined, { limit })
  },
  
  // Gedächtnis aktualisieren
  updateMemory: async (name: string, key: string, value: string, category?: string): Promise<ApiResponse<void>> => {
    return request<void>(`/agents/${name}/memory`, 'POST', { key, value, category })
  },
  
  // Gedächtnis abrufen
  getMemory: async (name: string, category?: string): Promise<ApiResponse<{ agent: string; memory: Record<string, any>; count: number }>> => {
    return request<{ agent: string; memory: Record<string, any>; count: number }>(`/agents/${name}/memory`, 'GET', undefined, { category })
  },
  
  // Gedächtnis löschen
  clearMemory: async (name: string, category?: string): Promise<ApiResponse<void>> => {
    return request<void>(`/agents/${name}/memory`, 'DELETE', undefined, { category })
  }
}

// ==================== Aufgaben-API ====================

export interface Task {
  id: string
  title: string
  description: string | null
  agent_id: number | null
  workflow_id: number | null
  status: string
  priority: number
  input_data: Record<string, any>
  output_data: Record<string, any>
  error_message: string | null
  progress: number
  steps_completed: number
  total_steps: number
  created_at: string
  started_at: string | null
  completed_at: string | null
  updated_at: string
}

export interface TaskListResponse {
  tasks: Task[]
  total: number
  page: number
  page_size: number
}

export interface TaskStatus {
  task_id: string
  title: string
  status: string
  progress: number
  steps_completed: number
  total_steps: number
  agent_id: number | null
  agent_name: string | null
  started_at: string | null
  completed_at: string | null
  error_message: string | null
}

export interface TaskMetrics {
  total_tasks: number
  pending_tasks: number
  running_tasks: number
  completed_tasks: number
  failed_tasks: number
  cancelled_tasks: number
  avg_completion_time: number
  avg_response_time: number
}

export interface TaskAnalysis {
  analysis: Record<string, any>
  recommendations: {
    agents: string[]
    task_type: string
    complexity: string
    estimated_duration: number
  }
}

// Aufgaben-Operationen
export const TasksApi = {
  // Alle Aufgaben abrufen
  getAll: async (page: number = 1, pageSize: number = 50, filters?: { status?: string; agent?: string; priority?: number }): Promise<ApiResponse<TaskListResponse>> => {
    return request<TaskListResponse>('/tasks', 'GET', undefined, { page, page_size: pageSize, ...filters })
  },
  
  // Bestimmte Aufgabe abrufen
  getById: async (taskId: string): Promise<ApiResponse<Task>> => {
    return request<Task>(`/tasks/${taskId}`, 'GET')
  },
  
  // Aufgabe erstellen
  create: async (taskData: Omit<Task, 'id' | 'created_at' | 'updated_at' | 'status' | 'progress' | 'steps_completed' | 'total_steps' | 'started_at' | 'completed_at' | 'error_message' | 'output_data'>): Promise<ApiResponse<Task>> => {
    return request<Task>('/tasks', 'POST', taskData)
  },
  
  // Aufgabe aktualisieren
  update: async (taskId: string, taskData: Partial<Task>): Promise<ApiResponse<Task>> => {
    return request<Task>(`/tasks/${taskId}`, 'PUT', taskData)
  },
  
  // Aufgabe löschen
  delete: async (taskId: string): Promise<ApiResponse<void>> => {
    return request<void>(`/tasks/${taskId}`, 'DELETE')
  },
  
  // Aufgabe ausführen
  execute: async (taskId: string, agentId?: number): Promise<ApiResponse<{ task_id: string; execution_id: string; status: string; agent_id: number | null; started_at: string; message: string }>> => {
    return request<{ task_id: string; execution_id: string; status: string; agent_id: number | null; started_at: string; message: string }>('/tasks/execute', 'POST', { task_id: taskId, agent_id: agentId })
  },
  
  // Aufgabe zuweisen
  assign: async (taskId: string, agentName: string): Promise<ApiResponse<void>> => {
    return request<void>(`/tasks/${taskId}/assign`, 'POST', { agent_name: agentName })
  },
  
  // Aufgabe abbrechen
  cancel: async (taskId: string): Promise<ApiResponse<void>> => {
    return request<void>(`/tasks/${taskId}/cancel`, 'POST')
  },
  
  // Status aller Aufgaben
  getAllStatus: async (): Promise<ApiResponse<{ total_tasks: number; running_tasks: number; pending_tasks: number; completed_tasks: number; failed_tasks: number }>> => {
    return request<{ total_tasks: number; running_tasks: number; pending_tasks: number; completed_tasks: number; failed_tasks: number }>('/tasks/status', 'GET')
  },
  
  // Status einer Aufgabe
  getStatus: async (taskId: string): Promise<ApiResponse<TaskStatus>> => {
    return request<TaskStatus>(`/tasks/status/${taskId}`, 'GET')
  },
  
  // Metriken aller Aufgaben
  getMetrics: async (): Promise<ApiResponse<TaskMetrics>> => {
    return request<TaskMetrics>('/tasks/metrics', 'GET')
  },
  
  // Aufgabe analysieren
  analyze: async (taskData: { title: string; description?: string; priority?: number }): Promise<ApiResponse<TaskAnalysis>> => {
    return request<TaskAnalysis>('/tasks/analyze', 'POST', taskData)
  }
}

// ==================== Workflows-API ====================

export interface Workflow {
  id: string
  name: string
  description: string | null
  definition: Record<string, any>
  steps: any[]
  is_active: boolean
  execution_count: number
  last_execution: string | null
  last_status: string | null
  created_at: string
  updated_at: string
  created_by: string | null
}

export interface WorkflowStatus {
  id: string
  name: string
  description: string | null
  status: string
  progress: number
  current_step: number
  total_steps: number
  completed_steps: number
  failed_steps: number
  created_at: string
  started_at: string | null
  completed_at: string | null
  steps: any[]
  context: Record<string, any>
}

// Workflow-Operationen
export const WorkflowsApi = {
  // Alle Workflows abrufen
  getAll: async (): Promise<ApiResponse<Workflow[]>> => {
    return request<Workflow[]>('/workflows', 'GET')
  },
  
  // Bestimmten Workflow abrufen
  getById: async (workflowId: string): Promise<ApiResponse<Workflow>> => {
    return request<Workflow>(`/workflows/${workflowId}`, 'GET')
  },
  
  // Workflow erstellen
  create: async (workflowData: Omit<Workflow, 'id' | 'created_at' | 'updated_at' | 'execution_count' | 'last_execution' | 'last_status'>): Promise<ApiResponse<Workflow>> => {
    return request<Workflow>('/workflows', 'POST', workflowData)
  },
  
  // Workflow aktualisieren
  update: async (workflowId: string, workflowData: Partial<Workflow>): Promise<ApiResponse<Workflow>> => {
    return request<Workflow>(`/workflows/${workflowId}`, 'PUT', workflowData)
  },
  
  // Workflow löschen
  delete: async (workflowId: string): Promise<ApiResponse<void>> => {
    return request<void>(`/workflows/${workflowId}`, 'DELETE')
  },
  
  // Workflow ausführen
  execute: async (workflowId: string): Promise<ApiResponse<{ status: string; workflow_id: string; workflow_name: string; completed_steps: number; failed_steps: number; total_steps: number }>> => {
    return request<{ status: string; workflow_id: string; workflow_name: string; completed_steps: number; failed_steps: number; total_steps: number }>(`/workflows/${workflowId}/execute`, 'POST')
  },
  
  // Workflow abbrechen
  cancel: async (workflowId: string): Promise<ApiResponse<void>> => {
    return request<void>(`/workflows/${workflowId}/cancel`, 'POST')
  },
  
  // Workflow-Status abrufen
  getStatus: async (workflowId: string): Promise<ApiResponse<WorkflowStatus>> => {
    return request<WorkflowStatus>(`/workflows/${workflowId}/status`, 'GET')
  }
}

// ==================== System-API ====================

export interface SystemInfo {
  name: string
  version: string
  description: string
  features: Record<string, boolean>
  ai_providers: string[]
}

export interface HealthStatus {
  status: string
  timestamp: string
  version: string
}

// System-Operationen
export const SystemApi = {
  // System-Info abrufen
  getInfo: async (): Promise<ApiResponse<SystemInfo>> => {
    return request<SystemInfo>('/info', 'GET')
  },
  
  // Health-Check
  getHealth: async (): Promise<ApiResponse<HealthStatus>> => {
    return request<HealthStatus>('/health', 'GET')
  }
}

// ==================== Monitoring-API ====================

export interface MonitoringMetrics {
  agents: {
    total: number
    active: number
    busy: number
  }
  tasks: {
    total: number
    running: number
    pending: number
    completed: number
    failed: number
  }
  workflows: {
    total: number
    running: number
    completed: number
    failed: number
  }
  tokens_used: number
  api_calls: number
}

// Monitoring-Operationen
export const MonitoringApi = {
  // Metriken abrufen
  getMetrics: async (): Promise<ApiResponse<MonitoringMetrics>> => {
    return request<MonitoringMetrics>('/monitoring/metrics', 'GET')
  },
  
  // Dashboard-Daten abrufen
  getDashboard: async (): Promise<ApiResponse<{ agents: AgentStatus[]; tasks: Task[]; workflows: Workflow[]; metrics: MonitoringMetrics }>> => {
    return request<{ agents: AgentStatus[]; tasks: Task[]; workflows: Workflow[]; metrics: MonitoringMetrics }>('/monitoring/dashboard', 'GET')
  }
}

// Export aller APIs
export const Api = {
  Agents: AgentsApi,
  Tasks: TasksApi,
  Workflows: WorkflowsApi,
  System: SystemApi,
  Monitoring: MonitoringApi
}

export default Api
