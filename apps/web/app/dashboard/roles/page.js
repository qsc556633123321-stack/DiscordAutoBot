'use client';

import { useEffect, useState } from 'react';
import LoadingSkeleton from '../../../components/LoadingSkeleton';
import RoleManager from '../../../components/RoleManager';
import { apiFetch } from '../../../lib/api';
import { useGuildId } from '../../../lib/useGuild';

export default function RolesPage() {
  const guildId = useGuildId();
  const [roles, setRoles] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!guildId) return;
    setLoading(true);
    apiFetch(`/api/guilds/${guildId}/roles`).then((data) => {
      setRoles(data.roles);
      setLoading(false);
    });
  }, [guildId]);

  return loading ? <LoadingSkeleton rows={6} /> : <RoleManager roles={roles} />;
}
