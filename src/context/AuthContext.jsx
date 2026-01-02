import React, { createContext, useContext, useState, useEffect } from 'react';

const AuthContext = createContext(null);

const INITIAL_USERS = [
  { id: 'admin', username: 'admin', password: '123', name: 'Firman', role: 'admin' },
  { id: 'user1', username: 'user1', password: '123', name: 'Tommy', role: 'user' },
  { id: 'user2', username: 'user2', password: '123', name: 'Anggi', role: 'user' },
];

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [usersList, setUsersList] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Load logged in user
    const storedUser = localStorage.getItem('loan_book_user');
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }
    
    // Load users list (for password updates)
    const storedUsersList = localStorage.getItem('loan_book_users_list');
    if (storedUsersList) {
      const list = JSON.parse(storedUsersList);
      const nameMap = { admin: 'Firman', user1: 'Tommy', user2: 'Anggi' };
      const normalized = list.map(u => ({ ...u, name: nameMap[u.id] ?? u.name }));
      setUsersList(normalized);
      localStorage.setItem('loan_book_users_list', JSON.stringify(normalized));
    } else {
      setUsersList(INITIAL_USERS);
      localStorage.setItem('loan_book_users_list', JSON.stringify(INITIAL_USERS));
    }

    setLoading(false);
  }, []);

  const login = (username, password) => {
    const foundUser = usersList.find(u => u.username === username && u.password === password);
    if (foundUser) {
      // Don't store password in user session object
      const { password, ...userWithoutPassword } = foundUser;
      setUser(userWithoutPassword);
      localStorage.setItem('loan_book_user', JSON.stringify(userWithoutPassword));
      return true;
    }
    return false;
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('loan_book_user');
  };

  const changePassword = (userId, newPassword) => {
    const updatedUsers = usersList.map(u => {
      if (u.id === userId) {
        return { ...u, password: newPassword };
      }
      return u;
    });
    setUsersList(updatedUsers);
    localStorage.setItem('loan_book_users_list', JSON.stringify(updatedUsers));
  };

  return (
    <AuthContext.Provider value={{ user, usersList, login, logout, changePassword, loading }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
