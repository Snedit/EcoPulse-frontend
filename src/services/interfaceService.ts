/* eslint-disable @typescript-eslint/no-explicit-any */
export interface Interface {
  id: string;
  name: string;
  description: string;
  createdAt?: string;
}
interface deleteAccess  {
interface_id: string,
password: string
}
export const interfaceService = {

  async removeAccess({interface_id, password}:deleteAccess){
    const token = localStorage.getItem('eco_monitor_user_jwt');
    const response = await fetch(`http://localhost:8000/api/interface/${interface_id}`, {
      method:"DELETE",
      headers:{
        'Content-Type': 'application/json',
        "Authorization": `Bearer ${token}`,
        
      },
      body: JSON.stringify({password})
    });
    if (!response.ok) {
      throw new Error('Failed to remove access');
    }
    const data = await response.json();
    console.log(data)
    return data.data;
  },


  async getInterfaces(): Promise<Interface[]> {
      const token = localStorage.getItem('eco_monitor_user_jwt');

    const response = await fetch('http://localhost:8000/api/interface',
      {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          "Authorization": `Bearer ${token}`,
        },
      }
    );
    if (!response.ok) {
      throw new Error('Failed to fetch interfaces');
    }
    const data = await response.json();
    console.log(data)
    return data.data;
    
  },

  async getInterface(id: string): Promise<Interface> {
      const token = localStorage.getItem('eco_monitor_user_jwt');

    const response = await fetch(`http://localhost:8000/api/interface/${id}`, 
       {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          "Authorization": `Bearer ${token}`,
        },
      }
    );
    if (!response.ok) {
      throw new Error(`Failed to fetch interface with ID ${id}`);
    }
    return await response.json();
  },

  async createInterface(data: { name: string; description: string }): Promise<Interface> {
          const token = localStorage.getItem('eco_monitor_user_jwt');

    const response = await fetch('http://localhost:8000/api/interface', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
                  "Authorization": `Bearer ${token}`,

      },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      throw new Error('Failed to create interface');
    }

    return await response.json();
  },

  async deleteInterface(id: string): Promise<void> {
              const token = localStorage.getItem('eco_monitor_user_jwt');

    const response = await fetch(`http://localhost:8000/api/interface/${id}`, {
      method: 'DELETE',
      headers: {
                          "Authorization": `Bearer ${token}`,

      }
    });

    if (!response.ok) {
      throw new Error(`Failed to delete interface with ID ${id}`);
    }
  },

  async getInterfaceById(id: string, ): Promise<Interface> {
              const token = localStorage.getItem('eco_monitor_user_jwt');
    const response = await fetch(`http://localhost:8000/api/interface/${id}`, {
      method: 'GET',
      headers: {
          "Authorization" : `Bearer ${token}`
      },
    });

    if (!response.ok) {
      throw new Error(`Failed to update interface with ID ${id}`);
    }
    const data = await response.json();
    return data.data;
  },

  async getAccessList (interfaceId: string) {
    const token = localStorage.getItem('eco_monitor_user_jwt');

  const response = await fetch(`http://localhost:8000/api/interface/${interfaceId}/access`, {
    headers: {
   'Authorization': `Bearer ${token}`,
    }
  });
  const data = await response.json();

  return data; // Assuming { success, data: [{ username, role }] }
}
,
  async addAccess(interfaceId: string, username: string, accessType: string): Promise<any> {
  const token = localStorage.getItem('eco_monitor_user_jwt');

  const response = await fetch(`http://localhost:8000/api/interface/${interfaceId}/add-access`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
    },
    body: JSON.stringify({ username: username, role: accessType }),
  });

  if (!response.ok) {
    const err = await response.json();
    throw new Error(err.message || `Failed to add access to interface ${interfaceId}`);
  }

  const data = await response.json();
  return data;
},
async searchUsers(query: string): Promise<{ id: string; email: string }[]> {
    const token = localStorage.getItem('eco_monitor_user_jwt');
    const response = await fetch(`http://localhost:8000/api/user/search?q=${query}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      }
    });

    if (!response.ok) {
      throw new Error('Failed to search users');
    }

    const data = await response.json();
    return data.data; // Assuming `data.data` is an array of users with id/email
  }
};

