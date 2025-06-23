const token = "eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCJ9.eyJkZXZfaWQiOjEsImV4cCI6MTc1MDU4NjA3MX0.oB2qG7aycz_ks4XiVH_8FaDKZabIeLT2zgFenK9VDQJPj48_byz_Oo2ycKX-fshS3Rc6wlF_Xo5GgedQq_coEguHSy6n0YFQfjunkDGbf97_mxfjuoLn2zD65CvvIB_dVZK8TdqDuNVwIIlvdozquwXSokD1fTTVvEyqFHv8-SZSKGlY2QBNEIAPYEuuUpe64BJOBiGM9SMFqmYJjAMn9ZUHYtYv8upUaafvXYxNlQmQRaVlZ1bCTPwB8dDB-nDr0p9sbxmjG7AWS-svyHl8dmG7itZGChwXBondtB8gw-nrvgW-IpaIrnXjJHjjCLKLeS4Ivfj0KBYf9VpGuIEUUw";  // replace with your JWT token
const socket = new WebSocket(`ws://localhost:5003/ws?token=${token}`);

socket.onopen = () => {
  console.log("WebSocket connection established!");
};

socket.onmessage = (event) => {
  const data = JSON.parse(event.data);
  console.log("Received log:", data);
  
  // You can now update your dashboard metrics here (counts, graphs, etc)
};

socket.onerror = (error) => {
  console.error("WebSocket error:", error);
};

socket.onclose = () => {
  console.log("WebSocket connection closed");
};
