import React, { useState } from 'react';
import LoginForm from '../components/Auth/LoginForm';
import SignupForm from '../components/Auth/SignupForm';
import { PAYBILL_NUMBER } from '../constants';

const LoginPage = ({ onLogin }) => {
  const [showSignup, setShowSignup] = useState(false);

  return (
    <div className="glass-card" style={{ maxWidth: '480px', margin: '5vh auto', padding: '2rem
