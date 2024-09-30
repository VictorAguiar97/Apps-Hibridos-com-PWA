// app/page.js
'use client'

import { useState } from 'react';
import { signIn } from '../public/utils/firebase'; 
import { useAuth } from '../contexts/AuthContext'; 
import { useRouter } from 'next/navigation'; 

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const { user, loading } = useAuth(); 
  const router = useRouter(); 

  const handleLogin = async (event) => {
    event.preventDefault();
    setError('');

    try {
      await signIn(email, password);
      router.push('/home'); 
    } catch (error) {
      console.error("Erro ao fazer login:", error);
      setError('Erro ao fazer login. Verifique suas credenciais.');
      router.push('/home');

    }
  };

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center">Verificando autenticação...</div>;
  }

  if (user) {
    return null; 
    
  }

  return (
    <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-blue-500 via-purple-500 to-pink-500 p-6">
      <div className="bg-white shadow-2xl rounded-2xl p-10 w-full max-w-md">
        <h1 className="text-5xl font-extrabold mb-10 text-center text-transparent bg-clip-text bg-gradient-to-r from-blue-500 to-purple-500">
          Bem-vindo!
        </h1>
        {error && <p className="text-red-500 mb-4 text-center">{error}</p>}
        <form onSubmit={handleLogin} className="space-y-6">
          <div className="relative">
            <input
              type="email"
              placeholder="E-mail"
              className="w-full p-4 pr-12 bg-gray-100 border-0 rounded-xl focus:ring-4 focus:ring-blue-300 shadow-md transition-transform transform hover:scale-105 focus:outline-none"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
            <span className="absolute right-4 top-4 text-gray-500 text-sm pointer-events-none">
              ✉️
            </span>
          </div>
          <div className="relative">
            <input
              type="password"
              placeholder="Senha"
              className="w-full p-4 pr-12 bg-gray-100 border-0 rounded-xl focus:ring-4 focus:ring-blue-300 shadow-md transition-transform transform hover:scale-105 focus:outline-none"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
            <span className="absolute right-4 top-4 text-gray-500 text-sm pointer-events-none">
              🔒
            </span>
          </div>
          <button
            className="w-full bg-gradient-to-r from-blue-500 to-purple-500 text-white p-4 rounded-xl font-semibold shadow-lg hover:bg-gradient-to-l hover:scale-105 transition duration-300"
            type="submit"
          >
            Entrar
          </button>
        </form>
        <p className="mt-8 text-center text-gray-700">
          Não tem uma conta?{' '}
          <a href="/register" className="text-purple-500 font-semibold hover:underline">
            Registre-se
          </a>
        </p>
      </div>
    </div>
  );
}
