import React, { createContext, useContext, useReducer, ReactNode, useEffect } from 'react';
import apiService from '../services/api';
import { TicketAnalysisRequest, DashboardMetrics } from '../types/api';

export interface Ticket {
  id: string;
  title: string;
  description: string;
  priority: 'Low' | 'Medium' | 'High' | 'Critical';
  status: 'Open' | 'In Progress' | 'Resolved';
  assignee: string;
  created: string;
  category: string;
  gradient: [string, string];
  aiSuggestion: string;
  estimatedTime: string;
  complexity: 'Low' | 'Medium' | 'High';
  progress: number;
  ticket_id?: string; // API ticket ID
}

export interface Stats {
  totalTickets: number;
  openTickets: number;
  resolvedToday: number;
  highPriority: number;
  teamPerformance: number;
  avgResponseTime: string;
  resolutionRate: number;
  satisfaction: number;
  // API metrics
  apiMetrics?: DashboardMetrics;
}

interface TicketState {
  tickets: Ticket[];
  stats: Stats;
  recentTickets: Ticket[];
  systemAlerts: any[];
  loading: boolean;
  error: string | null;
}

type TicketAction =
  | { type: 'ADD_TICKET'; payload: Omit<Ticket, 'id' | 'created' | 'progress'> }
  | { type: 'UPDATE_TICKET'; payload: { id: string; updates: Partial<Ticket> } }
  | { type: 'DELETE_TICKET'; payload: string }
  | { type: 'UPDATE_STATS'; payload: Partial<Stats> }
  | { type: 'INITIALIZE_DATA'; payload: TicketState }
  | { type: 'SET_LOADING'; payload: boolean }
  | { type: 'SET_ERROR'; payload: string | null }
  | { type: 'FETCH_DASHBOARD_SUCCESS'; payload: DashboardMetrics };

const initialState: TicketState = {
  loading: false,
  error: null,
  tickets: [
    {
      id: '1',
      title: 'Network Connectivity Issues in Building A',
      description: 'Multiple users reporting intermittent connection drops across floors 2-4',
      priority: 'High',
      status: 'Open',
      assignee: 'John Smith',
      created: '2h ago',
      category: 'Network',
      gradient: ['#EF4444', '#DC2626'],
      aiSuggestion: 'Router firmware update recommended',
      estimatedTime: '30 min',
      complexity: 'Medium',
      progress: 25
    },
    {
      id: '2',
      title: 'Printer Queue Jam - HP LaserJet Pro',
      description: 'Print jobs stuck in queue, unable to clear spooler service',
      priority: 'Medium',
      status: 'In Progress',
      assignee: 'You',
      created: '4h ago',
      category: 'Hardware',
      gradient: ['#F59E0B', '#F97316'],
      aiSuggestion: 'Clear print spooler and restart service',
      estimatedTime: '15 min',
      complexity: 'Low',
      progress: 65
    },
    {
      id: '3',
      title: 'Software Installation Request - Adobe Creative Suite',
      description: 'User needs Creative Suite installed on new workstation with license activation',
      priority: 'Low',
      status: 'Resolved',
      assignee: 'Mike Johnson',
      created: '1d ago',
      category: 'Software',
      gradient: ['#10B981', '#059669'],
      aiSuggestion: 'Automated deployment available',
      estimatedTime: '45 min',
      complexity: 'Low',
      progress: 100
    },
    {
      id: '4',
      title: 'Email Server Performance Degradation',
      description: 'Slow email delivery and retrieval reported by multiple departments',
      priority: 'High',
      status: 'Open',
      assignee: 'Sarah Davis',
      created: '3h ago',
      category: 'Server',
      gradient: ['#EF4444', '#DC2626'],
      aiSuggestion: 'Database optimization required',
      estimatedTime: '2h',
      complexity: 'High',
      progress: 15
    },
    {
      id: '5',
      title: 'Password Reset Request - Multiple Users',
      description: 'Batch password reset for security compliance following policy update',
      priority: 'Medium',
      status: 'In Progress',
      assignee: 'You',
      created: '5h ago',
      category: 'Security',
      gradient: ['#F59E0B', '#F97316'],
      aiSuggestion: 'Bulk reset script available',
      estimatedTime: '1h',
      complexity: 'Medium',
      progress: 40
    },
  ],
  stats: {
    totalTickets: 156,
    openTickets: 12,
    resolvedToday: 8,
    highPriority: 3,
    teamPerformance: 94,
    avgResponseTime: '4.2m',
    resolutionRate: 94,
    satisfaction: 4.8
  },
  recentTickets: [],
  systemAlerts: [
    { 
      id: '1', 
      message: 'Server CPU usage at 85%', 
      description: 'Main database server experiencing high load',
      type: 'warning', 
      time: '1h ago',
      severity: 'medium'
    },
    { 
      id: '2', 
      message: 'All systems operational', 
      description: 'Network performance is optimal',
      type: 'success', 
      time: '2h ago',
      severity: 'low'
    },
    { 
      id: '3', 
      message: 'Backup completed successfully', 
      description: 'Daily backup finished at 03:00 AM',
      type: 'info', 
      time: '5h ago',
      severity: 'low'
    },
  ]
};

function ticketReducer(state: TicketState, action: TicketAction): TicketState {
  switch (action.type) {
    case 'SET_LOADING': {
      return { ...state, loading: action.payload };
    }
    
    case 'SET_ERROR': {
      return { ...state, error: action.payload, loading: false };
    }
    
    case 'FETCH_DASHBOARD_SUCCESS': {
      return {
        ...state,
        stats: {
          ...state.stats,
          apiMetrics: action.payload,
          totalTickets: action.payload.total_tickets_analyzed,
        },
        loading: false,
        error: null,
      };
    }
    
    case 'ADD_TICKET': {
      const newTicket: Ticket = {
        ...action.payload,
        id: Date.now().toString(),
        created: 'Just now',
        progress: 0
      };
      
      const updatedTickets = [newTicket, ...state.tickets];
      const updatedStats = calculateStats(updatedTickets);
      
      return {
        ...state,
        tickets: updatedTickets,
        stats: updatedStats,
        recentTickets: updatedTickets.slice(0, 3)
      };
    }
    
    case 'UPDATE_TICKET': {
      const updatedTickets = state.tickets.map(ticket =>
        ticket.id === action.payload.id
          ? { ...ticket, ...action.payload.updates }
          : ticket
      );
      const updatedStats = calculateStats(updatedTickets);
      
      return {
        ...state,
        tickets: updatedTickets,
        stats: updatedStats,
        recentTickets: updatedTickets.slice(0, 3)
      };
    }
    
    case 'DELETE_TICKET': {
      const updatedTickets = state.tickets.filter(ticket => ticket.id !== action.payload);
      const updatedStats = calculateStats(updatedTickets);
      
      return {
        ...state,
        tickets: updatedTickets,
        stats: updatedStats,
        recentTickets: updatedTickets.slice(0, 3)
      };
    }
    
    case 'UPDATE_STATS': {
      return {
        ...state,
        stats: { ...state.stats, ...action.payload }
      };
    }
    
    case 'INITIALIZE_DATA': {
      return action.payload;
    }
    
    default:
      return state;
  }
}

function calculateStats(tickets: Ticket[]): Stats {
  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  
  const openTickets = tickets.filter(t => t.status === 'Open').length;
  const highPriority = tickets.filter(t => t.priority === 'High' || t.priority === 'Critical').length;
  const resolvedToday = tickets.filter(t => 
    t.status === 'Resolved' && t.created.includes('h ago') && parseInt(t.created) <= 24
  ).length;
  
  // Calculate team performance based on resolution rate
  const totalResolved = tickets.filter(t => t.status === 'Resolved').length;
  const resolutionRate = tickets.length > 0 ? Math.round((totalResolved / tickets.length) * 100) : 0;
  
  return {
    totalTickets: tickets.length,
    openTickets,
    resolvedToday,
    highPriority,
    teamPerformance: resolutionRate,
    avgResponseTime: '4.2m',
    resolutionRate,
    satisfaction: 4.8
  };
}

interface TicketContextType {
  state: TicketState;
  dispatch: React.Dispatch<TicketAction>;
  // API methods
  analyzeTicket: (data: TicketAnalysisRequest) => Promise<any>;
  fetchDashboardMetrics: () => Promise<void>;
  searchKnowledge: (query: string, category?: string) => Promise<any>;
}

const TicketContext = createContext<TicketContextType | null>(null);

export function TicketProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(ticketReducer, initialState);

  // Fetch dashboard metrics on mount
  useEffect(() => {
    fetchDashboardMetrics();
  }, []);

  const analyzeTicket = async (data: TicketAnalysisRequest) => {
    try {
      dispatch({ type: 'SET_LOADING', payload: true });
      const response = await apiService.analyzeTicket(data);
      console.log('Ticket analysis response:', response);
      dispatch({ type: 'SET_LOADING', payload: false });
      return response;
    } catch (error: any) {
      console.log('Ticket analysis failed:', JSON.stringify(error));
      dispatch({ type: 'SET_ERROR', payload: error.message });
      throw error;
    }
  };

  const fetchDashboardMetrics = async () => {
    try {
      dispatch({ type: 'SET_LOADING', payload: true });
      const response = await apiService.getDashboardMetrics(30);
      dispatch({ type: 'FETCH_DASHBOARD_SUCCESS', payload: response.metrics });
    } catch (error: any) {
      console.log('Dashboard metrics fetch failed:', error.message);
      dispatch({ type: 'SET_ERROR', payload: error.message });
    }
  };

  const searchKnowledge = async (query: string, category?: string) => {
    try {
      dispatch({ type: 'SET_LOADING', payload: true });
      const response = await apiService.searchKnowledgeBase({ q: query, category, limit: 10 });
      dispatch({ type: 'SET_LOADING', payload: false });
      return response;
    } catch (error: any) {
      dispatch({ type: 'SET_ERROR', payload: error.message });
      throw error;
    }
  };

  return (
    <TicketContext.Provider value={{ state, dispatch, analyzeTicket, fetchDashboardMetrics, searchKnowledge }}>
      {children}
    </TicketContext.Provider>
  );
}

export function useTickets() {
  const context = useContext(TicketContext);
  if (!context) {
    throw new Error('useTickets must be used within a TicketProvider');
  }
  return context;
}
