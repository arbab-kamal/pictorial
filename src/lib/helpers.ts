export const getURL = (path: string = '') => {
  // Check if NEXT_PUBLIC_SITE_URL is set and non-empty. Set this to your site URL in production env.
  let url =
    process?.env?.NEXT_PUBLIC_SITE_URL &&
    process.env.NEXT_PUBLIC_SITE_URL.trim() !== ''
      ? process.env.NEXT_PUBLIC_SITE_URL
      : // If not set, check for NEXT_PUBLIC_VERCEL_URL, which is automatically set by Vercel.
        process?.env?.NEXT_PUBLIC_VERCEL_URL &&
          process.env.NEXT_PUBLIC_VERCEL_URL.trim() !== ''
        ? process.env.NEXT_PUBLIC_VERCEL_URL
        : // If neither is set, default to localhost for local development.
          'http://localhost:3000/';

  // Trim the URL and remove trailing slash if exists.
  url = url.replace(/\/+$/, '');
  // Make sure to include `https://` when not localhost.
  url = url.includes('http') ? url : `https://${url}`;
  // Ensure path starts without a slash to avoid double slashes in the final URL.
  path = path.replace(/^\/+/, '');

  // Concatenate the URL and the path.
  return path ? `${url}/${path}` : url;
};

export const toDateTime = (secs: number) => {
  const t = new Date(+0); // Unix epoch start.
  t.setSeconds(secs);
  return t;
};

export const calculateTrialEndUnixTimestamp = (
  trialPeriodDays: number | null | undefined
) => {
  // Check if trialPeriodDays is null, undefined, or less than 2 days
  if (
    trialPeriodDays === null ||
    trialPeriodDays === undefined ||
    trialPeriodDays < 2
  ) {
    return undefined;
  }

  const currentDate = new Date(); // Current date and time
  const trialEnd = new Date(
    currentDate.getTime() + (trialPeriodDays + 1) * 24 * 60 * 60 * 1000
  ); // Add trial days
  return Math.floor(trialEnd.getTime() / 1000); // Convert to Unix timestamp in seconds
};

// the following toastKeyMap is used to map the toast type to the keys used in the redirect path
const toastKeyMap: { [key: string]: string[] } = {
  status: ['status', 'status_description'],
  error: ['error', 'error_description']
};

// This function builds a URL with query parameters for displaying toast notifications
// It's typically used for redirects after operations to show success/error messages
const getToastRedirect = (
  path: string,          // Base path for the redirect (e.g., '/dashboard')
  toastType: string,     // Type of toast ('status' or 'error' based on toastKeyMap)
  toastName: string,     // Main message/title of the toast
  toastDescription: string = '',  // Optional detailed description
  disableButton: boolean = false, // Optional flag to disable UI buttons
  arbitraryParams: string = ''    // Optional additional URL parameters
): string => {
  // Get the appropriate URL parameter keys based on toast type
  // For 'status': ['status', 'status_description']
  // For 'error': ['error', 'error_description']
  const [nameKey, descriptionKey] = toastKeyMap[toastType];

  // Start building the URL with the base path and the main message
  // Example: '/dashboard?status=Success'
  let redirectPath = `${path}?${nameKey}=${encodeURIComponent(toastName)}`;

  // If a description is provided, add it as a query parameter
  // Example: '&status_description=Operation%20completed'
  if (toastDescription) {
    redirectPath += `&${descriptionKey}=${encodeURIComponent(toastDescription)}`;
  }

  // If disableButton is true, add the parameter to disable UI interactions
  // Example: '&disable_button=true'
  if (disableButton) {
    redirectPath += `&disable_button=true`;
  }

  // Add any additional URL parameters passed as a string
  // Example: '&redirect_to=/settings'
  if (arbitraryParams) {
    redirectPath += `&${arbitraryParams}`;
  }

  // Return the complete URL with all parameters
  // Example final URL:
  // '/dashboard?status=Success&status_description=Operation%20completed&disable_button=true&redirect_to=/settings'
  return redirectPath;
};

export const getErrorRedirect = (
  path: string,
  errorName: string,
  errorDescription: string = '',
  disableButton: boolean = false,
  arbitraryParams: string = ''
) =>
  getToastRedirect(
    path,
    'error',
    errorName,
    errorDescription,
    disableButton,
    arbitraryParams
  );

  export const getStatusRedirect = (
    path: string,
    statusName: string,
    statusDescription: string = '',
    disableButton: boolean = false,
    arbitraryParams: string = ''
  ) =>
    getToastRedirect(
      path,
      'status',
      statusName,
      statusDescription,
      disableButton,
      arbitraryParams
    );  