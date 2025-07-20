export const getPastelGradient = (seed) => {
  const pastelGradients = [
    'bg-gradient-to-br from-rose-100 to-pink-200',
    'bg-gradient-to-br from-blue-100 to-indigo-200', 
    'bg-gradient-to-br from-green-100 to-emerald-200',
    'bg-gradient-to-br from-purple-100 to-violet-200',
    'bg-gradient-to-br from-yellow-100 to-amber-200',
    'bg-gradient-to-br from-cyan-100 to-teal-200',
    'bg-gradient-to-br from-orange-100 to-red-200',
    'bg-gradient-to-br from-indigo-100 to-blue-200',
    'bg-gradient-to-br from-emerald-100 to-green-200',
    'bg-gradient-to-br from-violet-100 to-purple-200',
    'bg-gradient-to-br from-amber-100 to-yellow-200',
    'bg-gradient-to-br from-teal-100 to-cyan-200'
  ];
  
  const hashCode = (str) => {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      const char = str.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash;
    }
    return Math.abs(hash);
  };

    const index = hashCode(seed || 'default') % pastelGradients.length;
  return pastelGradients[index];
};