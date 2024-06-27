let timeout:any;

export const startSessionTimeout = (logoutCallback:any, timeoutDuration = 15 * 60 * 1000) => {
  clearTimeout(timeout);
  timeout = setTimeout(logoutCallback, timeoutDuration);
};

export const resetSessionTimeout = () => {
  clearTimeout(timeout);
};

export const setupSessionTimeout = (logoutCallback:any) => {
  const handleActivity = () => {
    startSessionTimeout(logoutCallback);
  };

  startSessionTimeout(logoutCallback);

  document.addEventListener('mousemove', handleActivity);
  document.addEventListener('keydown', handleActivity);

  return () => {
    clearTimeout(timeout);
    document.removeEventListener('mousemove', handleActivity);
    document.removeEventListener('keydown', handleActivity);
  };
};
