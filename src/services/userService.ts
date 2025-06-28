import axios from 'axios';

export const userService = {
  async getSuggestions(query: string) {
    const token = localStorage.getItem('eco_monitor_user_jwt');
    const response = await axios.get(`http://localhost:8000/api/users/search?q=${query}`, {
      headers: {
        "Authorization" : `Bearer ${token}`
      }
    });
    return response.data; // should be an array of usernames
  },
  async getProfile(){
    const token = localStorage.getItem('eco_monitor_user_jwt');
    const response = await axios.get(`http://localhost:8000/api/users/me`, {
      headers: {
        "Authorization" : `Bearer ${token}`
      }
    });
    console.log(response.data);
    
    return response.data;
  }
};
