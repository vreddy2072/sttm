/**
 * API client for the STTM application.
 */

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api';

// Types
export interface Mapping {
  id: number;
  source_table_id: number;
  source_column_id: number;
  target_table_id: number;
  target_column_id: number;
  release_id?: number;
  jira_ticket?: string;
  status: string;
  description: string;
  created_at: string;
  updated_at: string;
}

export interface EnrichedMapping extends Mapping {
  source_table_name?: string;
  source_column_name?: string;
  target_table_name?: string;
  target_column_name?: string;
  release_name?: string;
}

export interface Table {
  id: number;
  name: string;
  description: string;
}

export interface Column {
  id: number;
  table_id: number;
  name: string;
  data_type: string;
  description: string;
}

export interface Release {
  id: number;
  name: string;
  description: string;
  status: string;
}

export interface MappingCreate {
  source_table_id: number;
  source_column_id: number;
  target_table_id: number;
  target_column_id: number;
  release_id?: number;
  jira_ticket?: string;
  status?: string;
  description?: string;
}

export interface MappingUpdate {
  source_table_id?: number;
  source_column_id?: number;
  target_table_id?: number;
  target_column_id?: number;
  release_id?: number;
  jira_ticket?: string;
  status?: string;
  description?: string;
}

// API client
class ApiClient {
  private async request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
    const url = `${API_BASE_URL}${endpoint}`;
    const headers = {
      'Content-Type': 'application/json',
      ...options.headers,
    };
    
    const response = await fetch(url, {
      ...options,
      headers,
    });
    
    if (!response.ok) {
      const error = await response.json().catch(() => ({}));
      throw new Error(error.detail || `API error: ${response.status}`);
    }
    
    // For DELETE requests with 204 No Content
    if (response.status === 204) {
      return {} as T;
    }
    
    return await response.json();
  }
  
  // Mappings
  async getMappings(releaseId?: number, status?: string): Promise<EnrichedMapping[]> {
    let endpoint = '/mappings/';
    const params = new URLSearchParams();
    
    if (releaseId) {
      params.append('release_id', releaseId.toString());
    }
    
    if (status) {
      params.append('status', status);
    }
    
    if (params.toString()) {
      endpoint += `?${params.toString()}`;
    }
    
    return this.request<EnrichedMapping[]>(endpoint);
  }
  
  async getEnrichedMappings(): Promise<EnrichedMapping[]> {
    return this.request<EnrichedMapping[]>('/mappings/enriched');
  }
  
  async getMapping(id: number): Promise<Mapping> {
    return this.request<Mapping>(`/mappings/${id}`);
  }
  
  async createMapping(mapping: MappingCreate): Promise<Mapping> {
    return this.request<Mapping>('/mappings/', {
      method: 'POST',
      body: JSON.stringify(mapping),
    });
  }
  
  async updateMapping(id: number, mapping: MappingUpdate): Promise<Mapping> {
    return this.request<Mapping>(`/mappings/${id}`, {
      method: 'PUT',
      body: JSON.stringify(mapping),
    });
  }
  
  async deleteMapping(id: number): Promise<void> {
    await this.request<void>(`/mappings/${id}`, {
      method: 'DELETE',
    });
  }
  
  // Tables
  async getSourceTables(): Promise<Table[]> {
    return this.request<Table[]>('/tables/source');
  }
  
  async getTargetTables(): Promise<Table[]> {
    return this.request<Table[]>('/tables/target');
  }
  
  // Columns
  async getSourceColumns(tableId?: number): Promise<Column[]> {
    let endpoint = '/columns/source';
    
    if (tableId) {
      endpoint += `?table_id=${tableId}`;
    }
    
    return this.request<Column[]>(endpoint);
  }
  
  async getTargetColumns(tableId?: number): Promise<Column[]> {
    let endpoint = '/columns/target';
    
    if (tableId) {
      endpoint += `?table_id=${tableId}`;
    }
    
    return this.request<Column[]>(endpoint);
  }
  
  // Releases
  async getReleases(): Promise<Release[]> {
    return this.request<Release[]>('/releases/');
  }
}

// Export a singleton instance
export const api = new ApiClient(); 