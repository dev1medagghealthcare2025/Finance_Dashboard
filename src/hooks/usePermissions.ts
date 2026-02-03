import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

interface PagePermission {
  page_name: string;
  can_view: boolean;
  can_edit: boolean;
}

interface UsePermissionsResult {
  permissions: PagePermission[];
  isWebsiteHead: boolean;
  isLoading: boolean;
  canView: (pageName: string) => boolean;
  canEdit: (pageName: string) => boolean;
}

export const usePermissions = (): UsePermissionsResult => {
  const [permissions, setPermissions] = useState<PagePermission[]>([]);
  const [isWebsiteHead, setIsWebsiteHead] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchPermissions = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        if (!session) {
          setIsLoading(false);
          return;
        }

        // Check if user is website_head
        const { data: roleData } = await supabase
          .from('user_roles')
          .select('role')
          .eq('user_id', session.user.id)
          .single();

        if (roleData?.role === 'website_head') {
          setIsWebsiteHead(true);
          setIsLoading(false);
          return;
        }

        // Fetch user's page permissions
        const { data: perms } = await supabase
          .from('page_permissions')
          .select('page_name, can_view, can_edit')
          .eq('user_id', session.user.id);

        setPermissions(perms || []);
      } catch (error) {
        console.error('Error fetching permissions:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchPermissions();

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(() => {
      fetchPermissions();
    });

    return () => subscription.unsubscribe();
  }, []);

  const canView = (pageName: string): boolean => {
    if (isWebsiteHead) return true;
    const perm = permissions.find(p => p.page_name === pageName);
    return perm?.can_view || false;
  };

  const canEdit = (pageName: string): boolean => {
    if (isWebsiteHead) return true;
    const perm = permissions.find(p => p.page_name === pageName);
    return perm?.can_edit || false;
  };

  return {
    permissions,
    isWebsiteHead,
    isLoading,
    canView,
    canEdit,
  };
};
