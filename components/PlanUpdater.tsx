'use client';

import { useEffect, useRef } from 'react';
import { useAuth } from '@/context/AuthContext';
import { updateUserProfile } from '@/lib/firestore';
import type { UserPlan } from '@/lib/types';

export default function PlanUpdater({ plan, trialEndAt }: { plan: UserPlan, trialEndAt?: number | null }) {
  const { user, refreshProfile } = useAuth();
  const hasRun = useRef(false);

  useEffect(() => {
    if (user && !hasRun.current) {
      hasRun.current = true;
      const update = async () => {
        try {
          await updateUserProfile(user.uid, { 
            plan, 
            ...(trialEndAt ? { trialEndsAt: new Date(trialEndAt * 1000) } : {}) 
          });
          // Rafraîchir le contexte pour mettre à jour le header instantanément
          await refreshProfile();
        } catch (error) {
          console.error('Erreur lors de la mise à jour du plan', error);
        }
      };
      update();
    }
  }, [user, plan, trialEndAt, refreshProfile]);

  return null;
}
