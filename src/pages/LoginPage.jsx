import React, { useState } from 'react';
import { AiOutlinePhone, AiOutlineLock } from 'react-icons/ai'; 
import { useNavigate } from 'react-router-dom'; 
import loginImage from '../assets/loginLeft.png';
import { useMutation, gql } from '@apollo/client'; 
import { useAuth } from '../AuthContext'; 

const SIGN_IN_MUTATION = gql`
  mutation SignIn($password: String!, $phoneNumber: String!) {
    signIn(password: $password, phoneNumber: $phoneNumber) {
      data {
        id
        email
      }
      tokens {
        access_token
        refresh_token
      }
    }
  }
`;

const LoginPage = () => {
  const [phone, setPhone] = useState('+251911088748'); 
  const [password, setPassword] = useState('Test@123'); 
  const [errorMessage, setErrorMessage] = useState(''); 

  const navigate = useNavigate(); // navigate hook
  const { login } = useAuth(); // Get login function from AuthContext

  const [signIn, { loading, error }] = useMutation(SIGN_IN_MUTATION, {
    onCompleted: (data) => {
      const { access_token, refresh_token } = data.signIn.tokens;
      const email = data.signIn.data.email; // Get the email from response

      // Store tokens and email in local storage
      localStorage.setItem('access_token', access_token);
      localStorage.setItem('refresh_token', refresh_token);
      localStorage.setItem('user_email', email); 

      // Update context
      login(access_token, email); 
      navigate('/dashboard'); 
    },
    onError: (err) => {
      console.error(err);
      setErrorMessage('Login failed');
    },
  });

  const handleLogin = (e) => {
    e.preventDefault();
    // Call the mutation with the phone number and password
    signIn({ variables: { password, phoneNumber: phone } });
  };

  return (
    <div className="flex h-screen">
      <div className="w-7/10">
        <img
          src={loginImage}
          alt="Login page illustration"
          className="w-full h-full object-cover"
        />
      </div>

      <div className="w-3/10 flex items-center justify-center bg-white">
        <form onSubmit={handleLogin} className="w-3/4 max-w-md">
          <h2 className="text-3xl font-bold mb-8">Login</h2>

          <div className="mb-6 relative">
            <AiOutlinePhone className="absolute left-3 top-3 py-5 text-gray-500" />
            <input
              type="tel"
              id="phone"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              className="mt-2 block w-full pl-10 pr-4 py-5 border-gray-500 rounded-3xl shadow-lg text-lg"
              placeholder="Phone Number"
              required
            />
          </div>

          <div className="mb-6 relative">
            <AiOutlineLock className="absolute left-3 py-5 top-3 text-gray-500" />
            <input
              type="password"
              id="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="mt-2 block w-full pl-10 pr-4 py-5 rounded-3xl border-gray-500 shadow-lg text-lg"
              placeholder="Password"
              required
            />
          </div>

          <button
            type="submit"
            className="w-full bg-blue-500 text-white py-4 rounded-3xl text-lg font-semibold"
          >
            {loading ? 'Logging in...' : 'Login'} 
          </button>
          <button
            type="button"
            className="w-full mt-5 bg-white text-gray-400 py-4 rounded-3xl text-lg font-semibold"
          >
            Forgot Password
          </button>
          {errorMessage && <p className="text-red-500 mt-2">{errorMessage}</p>} 
        </form>
      </div>
    </div>
  );
};

export default LoginPage;
