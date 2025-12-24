import React, { useState } from 'react';
import { Routes, Route, useNavigate } from 'react-router-dom';
import { PassengerApp } from './features/passenger/PassengerApp';
import { DriverApp } from './features/driver/DriverApp';
import { DriverLogin } from './components/auth/DriverLogin';
import { AdminDashboard } from './features/admin/AdminDashboard';
import { LandingPage } from './components/LandingPage';
import { UserRole, User } from './types';

// Mock current user
const INITIAL_USER: User = {
   id: 'u1',
   name: 'Sarah',
   role: UserRole.GUEST,
   avatarUrl: 'https://picsum.photos/200'
};

const App: React.FC = () => {
   const [user, setUser] = useState<User>(INITIAL_USER);
   const navigate = useNavigate();

   const handleLogin = (role: UserRole) => {
      setUser({ ...user, role });
      if (role === UserRole.PASSENGER) navigate('/passenger');
      else if (role === UserRole.DRIVER) navigate('/driver');
      else if (role === UserRole.ADMIN) navigate('/admin');
   };

   const handleLogout = () => {
      setUser({ ...user, role: UserRole.GUEST });
      navigate('/');
   };

   const handleUserUpdate = (updatedUser: User) => {
      setUser(updatedUser);
   };

   return (
      <Routes>
         <Route path="/" element={<LandingPage onLogin={handleLogin} />} />
         <Route path="/passenger" element={<PassengerApp user={user} onLogout={handleLogout} onLogin={handleUserUpdate} />} />
         <Route path="/driver" element={
            user.role === UserRole.DRIVER && user.name && user.phoneNumber ? (
               <DriverApp user={user} onLogout={handleLogout} onUpdateUser={handleUserUpdate} />
            ) : (
               <DriverLogin onLogin={(loggedInUser) => {
                  handleUserUpdate(loggedInUser);
                  navigate('/driver');
               }} />
            )
         } />
         <Route path="/admin" element={<AdminDashboard />} />
      </Routes>
   );
};

export default App;