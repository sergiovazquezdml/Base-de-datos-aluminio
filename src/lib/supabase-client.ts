import { createClient } from '@supabase/supabase-js';
import { MOCK_USERS, MOCK_EMPRESAS, MOCK_PLANTAS, MOCK_PRENSAS } from './data';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

// Detect if we should use local mock instead of real Supabase connection
const useMock =
  process.env.NEXT_PUBLIC_USE_MOCK_SUPABASE === 'true' ||
  !supabaseUrl;


const isBrowser = typeof window !== 'undefined';

// Helpers to match database snake_case conventions
function keysToSnake(o: any): any {
  if (Array.isArray(o)) return o.map(keysToSnake);
  if (o !== null && typeof o === 'object') {
    const n: any = {};
    Object.keys(o).forEach(k => {
      const sk = k.replace(/[A-Z]/g, letter => `_${letter.toLowerCase()}`);
      if (k === 'campos_especiales' || k === 'camposEspeciales' || k === 'configuracion_puntos' || k === 'configuracionPuntos') {
        n[sk] = o[k];
      } else {
        n[sk] = keysToSnake(o[k]);
      }
    });
    return n;
  }
  return o;
}

function getLocalStorageTable(tableName: string): any[] {
  if (!isBrowser) return [];
  const val = localStorage.getItem(`sb_mock_${tableName}`);
  if (val) {
    try {
      return JSON.parse(val);
    } catch {
      return [];
    }
  }
  return seedLocalStorageTable(tableName);
}

function saveLocalStorageTable(tableName: string, data: any[]) {
  if (!isBrowser) return;
  localStorage.setItem(`sb_mock_${tableName}`, JSON.stringify(data));
}

function seedLocalStorageTable(tableName: string): any[] {
  let initialData: any[] = [];
  if (tableName === 'perfiles') {
    initialData = keysToSnake(MOCK_USERS);
  } else if (tableName === 'empresas') {
    initialData = keysToSnake(MOCK_EMPRESAS);
  } else if (tableName === 'plantas') {
    initialData = keysToSnake(MOCK_PLANTAS);
  } else if (tableName === 'prensas') {
    initialData = keysToSnake(MOCK_PRENSAS);
  }

  if (isBrowser) {
    localStorage.setItem(`sb_mock_${tableName}`, JSON.stringify(initialData));
  }
  return initialData;
}

// Mock Query Builder supporting chainable queries and returning local storage data
class MockQueryBuilder {
  tableName: string;
  operations: Array<(data: any[]) => any[]>;
  isSingle: boolean;
  isDelete: boolean;
  isUpdate: boolean;
  isInsert: boolean;
  isUpsert: boolean;
  payload: any;

  constructor(tableName: string) {
    this.tableName = tableName;
    this.operations = [];
    this.isSingle = false;
    this.isDelete = false;
    this.isUpdate = false;
    this.isInsert = false;
    this.isUpsert = false;
    this.payload = null;
  }

  select(fields?: string) {
    return this;
  }

  eq(column: string, value: any) {
    this.operations.push((data) => data.filter(item => item[column] === value));
    return this;
  }

  neq(column: string, value: any) {
    this.operations.push((data) => data.filter(item => item[column] !== value));
    return this;
  }

  not(column: string, operator: string, value: any) {
    if (operator === 'is' && value === null) {
      this.operations.push((data) => data.filter(item => item[column] !== null && item[column] !== undefined));
    }
    return this;
  }

  order(column: string, options?: { ascending?: boolean }) {
    const asc = options?.ascending !== false;
    this.operations.push((data) => {
      return [...data].sort((a, b) => {
        const valA = a[column];
        const valB = b[column];
        if (valA < valB) return asc ? -1 : 1;
        if (valA > valB) return asc ? 1 : -1;
        return 0;
      });
    });
    return this;
  }

  single() {
    this.isSingle = true;
    return this;
  }

  insert(data: any | any[]) {
    this.isInsert = true;
    this.payload = data;
    return this;
  }

  update(data: any) {
    this.isUpdate = true;
    this.payload = data;
    return this;
  }

  delete() {
    this.isDelete = true;
    return this;
  }

  upsert(data: any | any[]) {
    this.isUpsert = true;
    this.payload = data;
    return this;
  }

  async then(onfulfilled?: (value: any) => any, onrejected?: (reason: any) => any) {
    try {
      const result = await this.execute();
      if (onfulfilled) {
        return onfulfilled(result);
      }
      return result;
    } catch (err) {
      if (onrejected) {
        return onrejected(err);
      }
      throw err;
    }
  }

  async execute() {
    let tableData = getLocalStorageTable(this.tableName);

    if (this.isInsert) {
      const newItems = Array.isArray(this.payload) ? this.payload : [this.payload];
      const seededNewItems = newItems.map(item => ({
        id: item.id || (isBrowser && window.crypto?.randomUUID ? window.crypto.randomUUID() : Math.random().toString(36).substring(2, 9)),
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        deleted: false,
        ...item
      }));
      tableData = [...tableData, ...seededNewItems];
      saveLocalStorageTable(this.tableName, tableData);
      
      return { data: Array.isArray(this.payload) ? seededNewItems : seededNewItems[0], error: null };
    }

    if (this.isUpdate) {
      let filteredData = [...tableData];
      for (const op of this.operations) {
        filteredData = op(filteredData);
      }
      const updatedIds = filteredData.map(item => item.id);
      tableData = tableData.map(item => {
        if (updatedIds.includes(item.id)) {
          return { ...item, ...this.payload, updated_at: new Date().toISOString() };
        }
        return item;
      });
      saveLocalStorageTable(this.tableName, tableData);

      const updatedItems = tableData.filter(item => updatedIds.includes(item.id));
      return { data: this.isSingle ? updatedItems[0] : updatedItems, error: null };
    }

    if (this.isDelete) {
      let filteredData = [...tableData];
      for (const op of this.operations) {
        filteredData = op(filteredData);
      }
      const deletedIds = filteredData.map(item => item.id);
      tableData = tableData.filter(item => !deletedIds.includes(item.id));
      saveLocalStorageTable(this.tableName, tableData);
      return { data: filteredData, error: null };
    }

    if (this.isUpsert) {
      const itemsToUpsert = Array.isArray(this.payload) ? this.payload : [this.payload];
      const upsertedItems = itemsToUpsert.map(item => {
        const existingIndex = tableData.findIndex(t => t.id === item.id);
        const resolvedItem = {
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
          ...item
        };
        if (existingIndex >= 0) {
          tableData[existingIndex] = { ...tableData[existingIndex], ...resolvedItem };
          return tableData[existingIndex];
        } else {
          const newItem = {
            id: item.id || (isBrowser && window.crypto?.randomUUID ? window.crypto.randomUUID() : Math.random().toString(36).substring(2, 9)),
            ...resolvedItem
          };
          tableData.push(newItem);
          return newItem;
        }
      });
      saveLocalStorageTable(this.tableName, tableData);
      return { data: Array.isArray(this.payload) ? upsertedItems : upsertedItems[0], error: null };
    }

    let filteredData = [...tableData];
    for (const op of this.operations) {
      filteredData = op(filteredData);
    }

    // Mock relational join for prensa queries
    if (this.tableName === 'prensas') {
      const pullers = getLocalStorageTable('pullers');
      const aplicaciones = getLocalStorageTable('aplicaciones_lubricacion');
      filteredData = filteredData.map(prensa => {
        return {
          ...prensa,
          pullers: pullers.filter(p => p.prensa_id === prensa.id),
          aplicaciones_lubricacion: aplicaciones.filter(a => a.prensa_id === prensa.id)
        };
      });
    }

    if (this.isSingle) {
      return { data: filteredData[0] || null, error: filteredData[0] ? null : { message: 'Not found' } };
    }

    return { data: filteredData, error: null };
  }
}

// Mock Auth Client matching Supabase GoTrueClient APIs
class MockAuthClient {
  listeners: Array<(event: string, session: any) => void> = [];

  async getSession() {
    if (!isBrowser) return { data: { session: null }, error: null };
    const sessionStr = localStorage.getItem('sb_mock_session');
    if (sessionStr) {
      try {
        const session = JSON.parse(sessionStr);
        return { data: { session }, error: null };
      } catch {
        return { data: { session: null }, error: null };
      }
    }
    return { data: { session: null }, error: null };
  }

  onAuthStateChange(callback: (event: string, session: any) => void) {
    this.listeners.push(callback);
    
    this.getSession().then(({ data: { session } }) => {
      callback('INITIAL_SESSION', session);
    });

    return {
      data: {
        subscription: {
          unsubscribe: () => {
            this.listeners = this.listeners.filter(l => l !== callback);
          }
        }
      }
    };
  }

  async signInWithPassword({ email, password }: any) {
    if (!isBrowser) return { data: { user: null, session: null }, error: { message: 'Server-side auth not supported' } };
    
    const profiles = getLocalStorageTable('perfiles');
    const userProfile = profiles.find(p => p.email.toLowerCase() === email.toLowerCase());

    if (!userProfile) {
      return { data: { user: null, session: null }, error: { message: 'Usuario no encontrado' } };
    }

    // Password validation - match email prefix or allow 'admin' / 'password'
    const expectedPassword = email.split('@')[0];
    if (password !== expectedPassword && password !== 'admin' && password !== 'password') {
      return { data: { user: null, session: null }, error: { message: 'Contraseña incorrecta' } };
    }

    const mockUser = {
      id: userProfile.id,
      email: userProfile.email,
      user_metadata: {
        nombre: userProfile.nombre,
        rol: userProfile.rol
      }
    };

    const mockSession = {
      user: mockUser,
      access_token: 'mock-access-token-' + Math.random().toString(36).substring(7),
      refresh_token: 'mock-refresh-token-' + Math.random().toString(36).substring(7),
      expires_in: 3600
    };

    localStorage.setItem('sb_mock_session', JSON.stringify(mockSession));
    
    this.listeners.forEach(l => l('SIGNED_IN', mockSession));

    return { data: { user: mockUser, session: mockSession }, error: null };
  }

  async signOut() {
    if (!isBrowser) return { error: null };
    localStorage.removeItem('sb_mock_session');
    
    this.listeners.forEach(l => l('SIGNED_OUT', null));
    
    return { error: null };
  }

  admin = {
    listUsers: async () => {
      const perfiles = getLocalStorageTable('perfiles');
      const users = perfiles.map(p => ({
        id: p.id,
        email: p.email,
        user_metadata: { nombre: p.nombre, rol: p.rol }
      }));
      return { data: { users }, error: null };
    },
    createUser: async (userData: any) => {
      const perfiles = getLocalStorageTable('perfiles');
      const id = isBrowser && window.crypto?.randomUUID ? window.crypto.randomUUID() : Math.random().toString(36).substring(2, 9);
      const newProfile = {
        id,
        nombre: userData.user_metadata?.nombre || userData.email.split('@')[0],
        email: userData.email,
        rol: userData.user_metadata?.rol || 'consultor',
        activo: true,
        created_at: new Date().toISOString()
      };
      perfiles.push(newProfile);
      saveLocalStorageTable('perfiles', perfiles);
      
      const user = {
        id,
        email: userData.email,
        user_metadata: userData.user_metadata
      };
      return { data: { user }, error: null };
    },
    updateUserById: async (id: string, userData: any) => {
      return { data: { user: { id } }, error: null };
    }
  };
}

const mockAuth = new MockAuthClient();

const mockSupabase = {
  auth: mockAuth,
  from(tableName: string) {
    return new MockQueryBuilder(tableName);
  }
};

const realSupabase = (supabaseUrl && supabaseAnonKey)
  ? createClient(supabaseUrl, supabaseAnonKey)
  : (null as unknown as ReturnType<typeof createClient>);

// Export the Mock Client if useMock is true, otherwise the real Supabase client
export const supabase = useMock
  ? (mockSupabase as unknown as typeof realSupabase)
  : realSupabase;


