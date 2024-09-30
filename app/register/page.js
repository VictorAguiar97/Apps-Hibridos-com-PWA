'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { signUp } from '../../public/utils/firebase';

const Register = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [name, setName] = useState('');
  const [error, setError] = useState('');
  const [passwordMatch, setPasswordMatch] = useState(true); 
  const router = useRouter();

  const handleRegister = async (e) => {
    e.preventDefault();
    setError('');

    if (password !== confirmPassword) {
      setError('As senhas não coincidem.');
      return;
    }

    try {
      const user = await signUp(email, password, name);
      console.log('Usuário registrado com sucesso:', user);

      router.push('/home');
    } catch (error) {
      setError('Erro ao registrar o usuário: ' + error.message);
    }
  };

  const handlePasswordChange = (e) => {
    const value = e.target.value;
    setPassword(value);
    setPasswordMatch(value === confirmPassword);
  };

  const handleConfirmPasswordChange = (e) => {
    const value = e.target.value;
    setConfirmPassword(value);
    setPasswordMatch(value === password);
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-blue-500 via-purple-500 to-pink-500 p-6">
      <div className="bg-white shadow-2xl rounded-2xl p-10 w-full max-w-md">
        <h1 className="text-5xl font-extrabold mb-10 text-center text-transparent bg-clip-text bg-gradient-to-r from-blue-500 to-purple-500">
          Registrar
        </h1>
        <form onSubmit={handleRegister} className="space-y-6">
          <div className="relative">
            <input
              type="text"
              placeholder="Nome"
              className="w-full p-4 pr-12 bg-gray-100 border-0 rounded-xl focus:ring-4 focus:ring-blue-300 shadow-md transition-transform transform hover:scale-105 focus:outline-none"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
            <span className="absolute right-4 top-4 text-gray-500 text-sm pointer-events-none">
              🧑
            </span>
          </div>
          <div className="relative">
            <input
              type="email"
              placeholder="Email"
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
              className={`w-full p-4 pr-12 bg-gray-100 border-0 rounded-xl focus:ring-4 shadow-md transition-transform transform hover:scale-105 focus:outline-none ${passwordMatch ? 'ring-green-400' : 'ring-red-400'}`}
              value={password}
              onChange={handlePasswordChange}
              required
            />
            <span className="absolute right-4 top-4 text-gray-500 text-sm pointer-events-none">
              🔒
            </span>
          </div>
          <div className="relative">
            <input
              type="password"
              placeholder="Confirme a Senha"
              className={`w-full p-4 pr-12 bg-gray-100 border-0 rounded-xl focus:ring-4 shadow-md transition-transform transform hover:scale-105 focus:outline-none ${passwordMatch ? 'ring-green-400' : 'ring-red-400'}`}
              value={confirmPassword}
              onChange={handleConfirmPasswordChange}
              required
            />
            <span className="absolute right-4 top-4 text-gray-500 text-sm pointer-events-none">
              🔒
            </span>
          </div>
          <button
            type="submit"
            className={`w-full bg-gradient-to-r from-blue-500 to-purple-500 text-white p-4 rounded-xl font-semibold shadow-lg hover:bg-gradient-to-l hover:scale-105 transition duration-300 ${passwordMatch ? '' : 'opacity-50 cursor-not-allowed'}`}
            disabled={!passwordMatch}
          >
            Registrar
          </button>
        </form>
        {error && <p className="text-red-500 mt-6 text-center">{error}</p>}
      </div>
    </div>
  );
};

export default Register;
