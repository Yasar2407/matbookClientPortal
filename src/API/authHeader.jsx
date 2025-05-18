export function authHeader() {
    const user = JSON.parse(localStorage.getItem('user'));
    // const subdomain = window.location.hostname.split('.')[0];
  console.log("USER:",user);
  
  
  
    if (user && user.token) {
      return { 
        'Authorization': 'Bearer ' + user.token,
        // 'subdomain':subdomain,
        'x-user-type': 'other'
      };
    } else {
      return {};
    }
    }