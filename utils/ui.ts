import { Ionicons } from '@expo/vector-icons';
export const getIconAndColor = (status: string) => {
  let statusText = '';
  let statusColor = '#64748b';
  let icon = 'ellipse-outline' as React.ComponentProps<typeof Ionicons>['name'];
  if (status === 'running') {
    statusText = 'In Progress';
    statusColor = '#2563eb';
    icon = 'play-circle';
  } else if (status === 'paused') {
    statusText = 'Paused';
    statusColor = '#f59e42';
    icon = 'pause-circle';
  } else if (status === 'completed') {
    statusText = 'Completed';
    statusColor = '#10b981';
    icon = 'checkmark-circle';
  } else {
    statusText = 'Not Started';
    statusColor = '#64748b';
  }
  return { statusText, statusColor, icon };
};
