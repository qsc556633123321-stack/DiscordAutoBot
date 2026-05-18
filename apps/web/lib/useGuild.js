'use client';

import { useEffect, useState } from 'react';

export function useGuildId() {
  const [guildId, setGuildId] = useState('');

  useEffect(() => {
    const saved = window.localStorage.getItem('guildId') || '';
    setGuildId(saved);
    function onSelect(event) {
      setGuildId(event.detail);
    }
    window.addEventListener('guild:selected', onSelect);
    return () => window.removeEventListener('guild:selected', onSelect);
  }, []);

  return guildId;
}
